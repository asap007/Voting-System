import { Hono } from 'hono';
import type { Env, SubmitResponseRequest, Response } from '../types';
import { generateId, getCurrentTimestamp, encrypt, generateResponseToken } from '../utils/crypto';

export const responseRoutes = new Hono<{ Bindings: Env }>();

/**
 * Submit a form response
 * POST /responses/submit
 */
responseRoutes.post('/submit', async (c) => {
  try {
    const body = await c.req.json<SubmitResponseRequest>();
    const { form_id, answers, user_fingerprint } = body;

    if (!form_id || !answers) {
      return c.json({ error: 'Form ID and answers are required' }, 400);
    }

    const db = c.env.DB;

    // Get form details
    const form = await db
      .prepare('SELECT is_published, one_response_per_person, is_anonymous FROM forms WHERE id = ?')
      .bind(form_id)
      .first();

    if (!form) {
      return c.json({ error: 'Form not found' }, 404);
    }

    if (!form.is_published) {
      return c.json({ error: 'Form is not published' }, 403);
    }

    // Check one-response-per-person
    let responseToken: string | null = null;
    if (form.one_response_per_person && user_fingerprint) {
      responseToken = await generateResponseToken(form_id, user_fingerprint);

      // Check if already submitted
      const existing = await db
        .prepare('SELECT id FROM responses WHERE response_token = ?')
        .bind(responseToken)
        .first();

      if (existing) {
        return c.json({ error: 'You have already submitted a response to this form' }, 409);
      }
    }

    // Encrypt response data
    const encryptedData = await encrypt(JSON.stringify(answers), c.env.ENCRYPTION_KEY);

    const responseId = generateId('rsp');
    const timestamp = getCurrentTimestamp();

    // Insert response
    await db
      .prepare(
        `INSERT INTO responses (id, form_id, response_token, encrypted_data, user_fingerprint, submitted_at) 
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(responseId, form_id, responseToken, encryptedData, user_fingerprint || null, timestamp)
      .run();

    // Insert individual answers
    for (const [questionId, answer] of Object.entries(answers)) {
      const answerId = generateId('ans');
      const encryptedAnswer = await encrypt(JSON.stringify(answer), c.env.ENCRYPTION_KEY);

      await db
        .prepare(
          'INSERT INTO answers (id, response_id, question_id, encrypted_answer, created_at) VALUES (?, ?, ?, ?, ?)'
        )
        .bind(answerId, responseId, questionId, encryptedAnswer, timestamp)
        .run();
    }

    // Update form response count
    await db
      .prepare('UPDATE forms SET response_count = response_count + 1, updated_at = ? WHERE id = ?')
      .bind(timestamp, form_id)
      .run();

    // Invalidate analytics cache
    await db.prepare('DELETE FROM analytics_cache WHERE form_id = ?').bind(form_id).run();

    return c.json({ message: 'Response submitted successfully', response_id: responseId }, 201);
  } catch (error) {
    console.error('Submit response error:', error);
    return c.json({ error: 'Failed to submit response' }, 500);
  }
});

/**
 * Get response count for a form
 * GET /responses/count/:formId
 */
responseRoutes.get('/count/:formId', async (c) => {
  try {
    const formId = c.req.param('formId');
    const db = c.env.DB;

    const form = await db
      .prepare('SELECT response_count FROM forms WHERE id = ?')
      .bind(formId)
      .first<{ response_count: number }>();

    if (!form) {
      return c.json({ error: 'Form not found' }, 404);
    }

    return c.json({ count: form.response_count });
  } catch (error) {
    console.error('Get response count error:', error);
    return c.json({ error: 'Failed to get response count' }, 500);
  }
});
