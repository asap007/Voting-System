import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Question, QuestionType, ConditionalLogic } from '../types';
import { generateId } from './crypto';

export interface AIFormGenerationResult {
  title: string;
  description: string;
  questions: Omit<Question, 'id' | 'form_id' | 'created_at'>[];
  estimated_time: number;
}

/**
 * Generate a form using Gemini AI based on natural language prompt
 */
export async function generateFormWithAI(
  prompt: string,
  apiKey: string
): Promise<AIFormGenerationResult> {
  try {
    console.log('AI: Starting form generation');
    console.log('AI: API Key length:', apiKey?.length || 0);
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash for fast, cost-effective form generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('AI: Model initialized (gemini-2.5-flash)');

  const systemPrompt = `You are an expert form designer. Generate a smart, engaging form based on the user's request.

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no code blocks, no explanations - just pure JSON.

Requirements:
1. Create 5-12 questions based on the context
2. Use varied question types: text, textarea, likert (1-5 scale), multiple_choice, checkboxes, rating (1-10), yes_no
3. Add conditional logic where appropriate (e.g., follow-up questions based on previous answers)
4. Make questions conversational and engaging
5. Estimate completion time in seconds
6. Keep forms under 3 minutes unless explicitly asked otherwise

Question types:
- text: Short text input
- textarea: Long text input
- likert: 1-5 agreement scale (Strongly Disagree to Strongly Agree)
- multiple_choice: Single selection from options
- checkboxes: Multiple selections from options
- rating: 1-10 rating scale
- yes_no: Simple yes/no question

Conditional logic format:
{
  "show_if_question_id": "question_id_to_check",
  "show_if_answer": "answer_value_or_array",
  "operator": "equals" | "contains" | "greater_than" | "less_than"
}

User request: ${prompt}

Generate a form with this EXACT JSON structure:
{
  "title": "Form title",
  "description": "Brief description",
  "estimated_time": 120,
  "questions": [
    {
      "question_text": "Question text",
      "question_type": "likert",
      "options": ["option1", "option2"],
      "is_required": true,
      "order_index": 0,
      "conditional_logic": null
    }
  ]
}`;

    console.log('AI: Sending request to Gemini');
    const result = await model.generateContent(systemPrompt);
    console.log('AI: Received response from Gemini');
    const response = result.response;
    const text = response.text();
    console.log('AI: Response text length:', text.length);
  
  // Clean the response to extract JSON
  let jsonText = text.trim();
  
  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
    try {
      const parsed = JSON.parse(jsonText);
      console.log('AI: Successfully parsed JSON');
      return parsed as AIFormGenerationResult;
    } catch (parseError) {
      console.error('AI: Failed to parse JSON:', parseError);
      console.error('AI: Raw response:', text);
      
      // Fallback: Generate a basic form
      console.log('AI: Using fallback form');
      return {
      title: 'Feedback Form',
      description: 'Please provide your feedback',
      estimated_time: 120,
      questions: [
        {
          question_text: 'How would you rate your overall experience?',
          question_type: 'likert' as QuestionType,
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          is_required: true,
          order_index: 0,
          conditional_logic: undefined
        },
        {
          question_text: 'What did you like most?',
          question_type: 'textarea' as QuestionType,
          options: undefined,
          is_required: true,
          order_index: 1,
          conditional_logic: undefined
        },
        {
          question_text: 'What could be improved?',
          question_type: 'textarea' as QuestionType,
          options: undefined,
          is_required: true,
          order_index: 2,
          conditional_logic: undefined
        }
      ]
    };
    }
  } catch (error) {
    console.error('AI: Error in generateFormWithAI:', error);
    console.error('AI: Error message:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Generate AI insights from form responses
 */
export async function generateAnalyticsInsights(
  formTitle: string,
  analyticsData: any,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Use gemini-2.5-flash for fast analytics processing
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Analyze this form response data and provide 3-5 key insights in a clear, actionable format.

Form: ${formTitle}
Response Data: ${JSON.stringify(analyticsData, null, 2)}

IMPORTANT: Format your response as a bulleted list. Start each insight with a bullet point (•).

Format each insight as:
• [Percentage/Number] [observation] — [actionable recommendation]

Examples:
• 73% found the pace too fast — Consider slowing down Lecture 5 on recursion
• 45% requested more practice problems — Add weekly problem sets
• Average rating of 2.5/5 on lab effectiveness — Review and redesign lab content to better reinforce lecture material

Focus on:
1. Major trends and patterns from the data
2. Outliers or concerning feedback that needs attention
3. Specific, actionable recommendations based on the numbers
4. Sentiment analysis of any open-ended responses

Provide 3-5 concise, data-driven insights with specific recommendations.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Extract key themes from open-ended responses
 */
export async function extractThemes(
  responses: string[],
  apiKey: string
): Promise<string[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Use gemini-2.5-flash for fast theme extraction
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Extract 5-10 key themes or topics from these responses. Return ONLY a JSON array of strings, no other text.

Responses:
${responses.join('\n---\n')}

Return format: ["theme1", "theme2", "theme3"]`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text().trim();
  
  try {
    let jsonText = text;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse themes:', text);
    return [];
  }
}
