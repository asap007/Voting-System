import { Hono } from 'hono';
import type { Env, Form, Question, CreateFormRequest, CreateFormResponse } from '../types';
import { generateId, getCurrentTimestamp } from '../utils/crypto';
import { generateFormWithAI } from '../utils/ai';

export const formRoutes = new Hono<{ Bindings: Env }>();

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
 * Create a new form using AI
 * POST /forms/generate
 */
formRoutes.post('/generate', async (c) => {
  try {
    const userId = await authenticateUser(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json<CreateFormRequest>();
    const { ai_prompt, is_anonymous = true, one_response_per_person = true } = body;

    if (!ai_prompt) {
      return c.json({ error: 'AI prompt is required' }, 400);
    }

    // Generate form with AI
    console.log('Generating form with AI, prompt:', ai_prompt);
    console.log('Gemini API Key exists:', !!c.env.GEMINI_API_KEY);
    const aiResult = await generateFormWithAI(ai_prompt, c.env.GEMINI_API_KEY);
    console.log('AI result:', JSON.stringify(aiResult));

    const db = c.env.DB;
    const formId = generateId('frm');
    const timestamp = getCurrentTimestamp();

    // Create form
    await db
      .prepare(
        `INSERT INTO forms (id, user_id, title, description, ai_prompt, is_anonymous, is_published, 
         one_response_per_person, estimated_time, response_count, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        formId,
        userId,
        aiResult.title,
        aiResult.description,
        ai_prompt,
        is_anonymous ? 1 : 0,
        0, // draft by default
        one_response_per_person ? 1 : 0,
        aiResult.estimated_time,
        0,
        timestamp,
        timestamp
      )
      .run();

    // Create questions
    const questions: Question[] = [];
    for (const q of aiResult.questions) {
      const questionId = generateId('qst');
      await db
        .prepare(
          `INSERT INTO questions (id, form_id, question_text, question_type, options, 
           is_required, order_index, conditional_logic, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          questionId,
          formId,
          q.question_text,
          q.question_type,
          q.options ? JSON.stringify(q.options) : null,
          q.is_required ? 1 : 0,
          q.order_index,
          q.conditional_logic ? JSON.stringify(q.conditional_logic) : null,
          timestamp
        )
        .run();

      questions.push({
        id: questionId,
        form_id: formId,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        is_required: q.is_required,
        order_index: q.order_index,
        conditional_logic: q.conditional_logic,
        created_at: timestamp,
      });
    }

    const form: Form = {
      id: formId,
      user_id: userId,
      title: aiResult.title,
      description: aiResult.description,
      ai_prompt,
      is_anonymous,
      is_published: false,
      one_response_per_person,
      estimated_time: aiResult.estimated_time,
      response_count: 0,
      created_at: timestamp,
      updated_at: timestamp,
    };

    return c.json<CreateFormResponse>({ form, questions }, 201);
  } catch (error) {
    console.error('Form generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    return c.json({ 
      error: 'Failed to generate form',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

/**
 * Get user's forms
 * GET /forms
 */
formRoutes.get('/', async (c) => {
  try {
    const userId = await authenticateUser(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const db = c.env.DB;
    const forms = await db
      .prepare('SELECT * FROM forms WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<Form>();

    return c.json({ forms: forms.results || [] });
  } catch (error) {
    console.error('Get forms error:', error);
    return c.json({ error: 'Failed to get forms' }, 500);
  }
});

/**
 * Get a specific form with questions
 * GET /forms/:id
 */
formRoutes.get('/:id', async (c) => {
  try {
    const formId = c.req.param('id');
    const db = c.env.DB;

    const form = await db
      .prepare('SELECT * FROM forms WHERE id = ?')
      .bind(formId)
      .first<Form>();

    if (!form) {
      return c.json({ error: 'Form not found' }, 404);
    }

    // Get questions
    const questions = await db
      .prepare('SELECT * FROM questions WHERE form_id = ? ORDER BY order_index')
      .bind(formId)
      .all<Question>();

    // Parse JSON fields
    const parsedQuestions = (questions.results || []).map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options as any) : undefined,
      conditional_logic: q.conditional_logic ? JSON.parse(q.conditional_logic as any) : undefined,
      is_required: Boolean(q.is_required),
    }));

    return c.json({
      form: {
        ...form,
        is_anonymous: Boolean(form.is_anonymous),
        is_published: Boolean(form.is_published),
        one_response_per_person: Boolean(form.one_response_per_person),
      },
      questions: parsedQuestions,
    });
  } catch (error) {
    console.error('Get form error:', error);
    return c.json({ error: 'Failed to get form' }, 500);
  }
});

/**
 * Update a form (unpublished forms only)
 * PUT /forms/:id
 */
formRoutes.put('/:id', async (c) => {
  try {
    const userId = await authenticateUser(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formId = c.req.param('id');
    const body = await c.req.json<{
      title?: string;
      description?: string;
      is_anonymous?: boolean;
      one_response_per_person?: boolean;
      questions?: Array<{
        id: string;
        question_text: string;
        question_type: string;
        options?: string[];
        is_required?: boolean;
        conditional_question_id?: string | null;
        conditional_answer?: string | null;
      }>;
    }>();

    const db = c.env.DB;

    // Verify ownership and that form is not published
    const form = await db
      .prepare('SELECT user_id, is_published FROM forms WHERE id = ?')
      .bind(formId)
      .first<{ user_id: string; is_published: number }>();

    if (!form) {
      return c.json({ error: 'Form not found' }, 404);
    }

    if (form.user_id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    if (form.is_published === 1) {
      return c.json({ error: 'Cannot edit published forms' }, 400);
    }

    const timestamp = getCurrentTimestamp();

    // Update form metadata
    if (body.title !== undefined || body.description !== undefined || 
        body.is_anonymous !== undefined || body.one_response_per_person !== undefined) {
      
      const updates: string[] = [];
      const values: any[] = [];

      if (body.title !== undefined) {
        updates.push('title = ?');
        values.push(body.title);
      }
      if (body.description !== undefined) {
        updates.push('description = ?');
        values.push(body.description);
      }
      if (body.is_anonymous !== undefined) {
        updates.push('is_anonymous = ?');
        values.push(body.is_anonymous ? 1 : 0);
      }
      if (body.one_response_per_person !== undefined) {
        updates.push('one_response_per_person = ?');
        values.push(body.one_response_per_person ? 1 : 0);
      }

      updates.push('updated_at = ?');
      values.push(timestamp);
      values.push(formId);

      await db
        .prepare(`UPDATE forms SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run();
    }

    // Update questions
    if (body.questions && body.questions.length > 0) {
      for (let i = 0; i < body.questions.length; i++) {
        const question = body.questions[i];
        
        await db
          .prepare(
            `UPDATE questions 
             SET question_text = ?, 
                 question_type = ?, 
                 options = ?, 
                 is_required = ?,
                 conditional_question_id = ?,
                 conditional_answer = ?,
                 order_index = ?
             WHERE id = ? AND form_id = ?`
          )
          .bind(
            question.question_text,
            question.question_type,
            question.options ? JSON.stringify(question.options) : null,
            question.is_required ? 1 : 0,
            question.conditional_question_id || null,
            question.conditional_answer || null,
            i,
            question.id,
            formId
          )
          .run();
      }
    }

    return c.json({ message: 'Form updated successfully' });
  } catch (error) {
    console.error('Update form error:', error);
    return c.json({ error: 'Failed to update form' }, 500);
  }
});

/**
 * Publish a form
 * PUT /forms/:id/publish
 */
formRoutes.put('/:id/publish', async (c) => {
  try {
    const userId = await authenticateUser(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formId = c.req.param('id');
    const db = c.env.DB;

    // Verify ownership
    const form = await db
      .prepare('SELECT user_id FROM forms WHERE id = ?')
      .bind(formId)
      .first<{ user_id: string }>();

    if (!form) {
      return c.json({ error: 'Form not found' }, 404);
    }

    if (form.user_id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Publish form
    await db
      .prepare('UPDATE forms SET is_published = 1, updated_at = ? WHERE id = ?')
      .bind(getCurrentTimestamp(), formId)
      .run();

    return c.json({ message: 'Form published successfully' });
  } catch (error) {
    console.error('Publish form error:', error);
    return c.json({ error: 'Failed to publish form' }, 500);
  }
});

/**
 * Delete a form
 * DELETE /forms/:id
 */
formRoutes.delete('/:id', async (c) => {
  try {
    const userId = await authenticateUser(c);
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formId = c.req.param('id');
    const db = c.env.DB;

    // Verify ownership
    const form = await db
      .prepare('SELECT user_id FROM forms WHERE id = ?')
      .bind(formId)
      .first<{ user_id: string }>();

    if (!form) {
      return c.json({ error: 'Form not found' }, 404);
    }

    if (form.user_id !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Delete form (cascade will handle questions, responses, etc.)
    await db.prepare('DELETE FROM forms WHERE id = ?').bind(formId).run();

    return c.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Delete form error:', error);
    return c.json({ error: 'Failed to delete form' }, 500);
  }
});
