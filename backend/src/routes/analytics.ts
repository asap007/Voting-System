import { Hono } from 'hono';
import type { Env, AnalyticsData, QuestionAnalytics } from '../types';
import { getCurrentTimestamp, decrypt } from '../utils/crypto';
import { generateAnalyticsInsights, extractThemes } from '../utils/ai';

export const analyticsRoutes = new Hono<{ Bindings: Env }>();

/**
 * Middleware to authenticate user
 */
async function authenticateUser(c: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const db = c.env.DB;

  const session = await db
    .prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?')
    .bind(token)
    .first();

  if (!session || getCurrentTimestamp() > (session as any).expires_at) {
    return null;
  }

  return (session as any).user_id;
}

/**
 * Get analytics for a form
 * GET /analytics/:formId
 */
analyticsRoutes.get('/:formId', async (c) => {
  try {
    const userId = await authenticateUser(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formId = c.req.param('formId');
    const db = c.env.DB;

    // Verify ownership
    const form = await db
      .prepare('SELECT user_id, title FROM forms WHERE id = ?')
      .bind(formId)
      .first();

    if (!form) {
      return c.json({ error: 'Form not found' }, 404);
    }

    if ((form as any).user_id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Check cache
    const cache = await db
      .prepare('SELECT analytics_data, ai_insights, generated_at FROM analytics_cache WHERE form_id = ?')
      .bind(formId)
      .first();

    // Cache valid for 5 minutes
    if (cache && getCurrentTimestamp() - (cache as any).generated_at < 300) {
      return c.json({
        analytics: JSON.parse((cache as any).analytics_data),
        insights: (cache as any).ai_insights,
        cached: true,
      });
    }

    // Get questions
    const questions = await db
      .prepare('SELECT * FROM questions WHERE form_id = ? ORDER BY order_index')
      .bind(formId)
      .all();

    // Get responses
    const responses = await db
      .prepare('SELECT * FROM responses WHERE form_id = ?')
      .bind(formId)
      .all();

    const totalResponses = (responses.results || []).length;

    if (totalResponses === 0) {
      return c.json({
        analytics: {
          total_responses: 0,
          completion_rate: 0,
          average_time: 0,
          question_analytics: [],
        },
        insights: 'No responses yet',
      });
    }

    // Decrypt and analyze responses
    const decryptedResponses = [];
    for (const response of responses.results || []) {
      try {
        const decrypted = await decrypt((response as any).encrypted_data, c.env.ENCRYPTION_KEY);
        decryptedResponses.push(JSON.parse(decrypted));
      } catch (error) {
        console.error('Failed to decrypt response:', error);
      }
    }

    // Analyze each question
    const questionAnalytics: QuestionAnalytics[] = [];
    for (const question of questions.results || []) {
      const q = question as any;
      const answers = decryptedResponses.map((r) => r[q.id]).filter(Boolean);

      const analytics: QuestionAnalytics = {
        question_id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
      };

      if (q.question_type === 'likert' || q.question_type === 'rating') {
        // Calculate average
        const numericAnswers = answers.filter((a) => typeof a === 'number');
        if (numericAnswers.length > 0) {
          analytics.average_rating =
            numericAnswers.reduce((sum, a) => sum + a, 0) / numericAnswers.length;
        }

        // Distribution
        const distribution: Record<string, number> = {};
        answers.forEach((a) => {
          const key = String(a);
          distribution[key] = (distribution[key] || 0) + 1;
        });
        analytics.response_distribution = distribution;
      } else if (q.question_type === 'multiple_choice' || q.question_type === 'yes_no') {
        // Distribution
        const distribution: Record<string, number> = {};
        answers.forEach((a) => {
          const key = String(a);
          distribution[key] = (distribution[key] || 0) + 1;
        });
        analytics.response_distribution = distribution;
      } else if (q.question_type === 'checkboxes') {
        // Flatten checkbox arrays and count
        const distribution: Record<string, number> = {};
        answers.forEach((a) => {
          if (Array.isArray(a)) {
            a.forEach((item) => {
              distribution[item] = (distribution[item] || 0) + 1;
            });
          }
        });
        analytics.response_distribution = distribution;
      } else if (q.question_type === 'text' || q.question_type === 'textarea') {
        // Extract themes from open-ended responses
        const textAnswers = answers.filter((a) => typeof a === 'string' && a.trim().length > 0);
        if (textAnswers.length > 0) {
          try {
            const themes = await extractThemes(textAnswers, c.env.GEMINI_API_KEY);
            analytics.common_themes = themes;
          } catch (error) {
            console.error('Failed to extract themes:', error);
          }
        }
      }

      questionAnalytics.push(analytics);
    }

    const analyticsData: AnalyticsData = {
      total_responses: totalResponses,
      completion_rate: 100, // All submitted responses are complete
      average_time: 0, // Would need to track submission time
      question_analytics: questionAnalytics,
    };

    // Generate AI insights
    let insights = '';
    try {
      insights = await generateAnalyticsInsights((form as any).title, analyticsData, c.env.GEMINI_API_KEY);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      insights = 'Unable to generate insights at this time';
    }

    // Cache results
    const cacheId = `cache_${formId}_${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO analytics_cache (id, form_id, analytics_data, ai_insights, generated_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(cacheId, formId, JSON.stringify(analyticsData), insights, getCurrentTimestamp())
      .run();

    return c.json({
      analytics: analyticsData,
      insights,
      cached: false,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return c.json({ error: 'Failed to get analytics' }, 500);
  }
});

/**
 * Export responses as JSON (decrypted for form owner)
 * GET /analytics/:formId/export
 */
analyticsRoutes.get('/:formId/export', async (c) => {
  try {
    const userId = await authenticateUser(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formId = c.req.param('formId');
    const db = c.env.DB;

    // Verify ownership
    const form = await db
      .prepare('SELECT user_id FROM forms WHERE id = ?')
      .bind(formId)
      .first();

    if (!form || (form as any).user_id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Get responses
    const responses = await db
      .prepare('SELECT id, encrypted_data, submitted_at FROM responses WHERE form_id = ?')
      .bind(formId)
      .all();

    const exportData = [];
    for (const response of responses.results || []) {
      try {
        const decrypted = await decrypt((response as any).encrypted_data, c.env.ENCRYPTION_KEY);
        exportData.push({
          response_id: (response as any).id,
          submitted_at: (response as any).submitted_at,
          answers: JSON.parse(decrypted),
        });
      } catch (error) {
        console.error('Failed to decrypt response:', error);
      }
    }

    return c.json({ responses: exportData });
  } catch (error) {
    console.error('Export error:', error);
    return c.json({ error: 'Failed to export responses' }, 500);
  }
});
