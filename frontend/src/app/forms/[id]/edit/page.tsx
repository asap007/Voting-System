'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable state
  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [editableQuestions, setEditableQuestions] = useState<any[]>([]);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const result = await api.getForm(formId);
      setForm(result.form);
      setQuestions(result.questions);
      setEditableTitle(result.form.title);
      setEditableDescription(result.form.description || '');
      setEditableQuestions(result.questions);
    } catch (error: any) {
      alert(error.message || 'Failed to load form');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this form? Once published, it will be available for responses.')) {
      return;
    }

    setPublishing(true);
    try {
      await api.publishForm(formId);
      alert('Form published successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Failed to publish form');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteForm(formId);
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Failed to delete form');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!editableTitle.trim()) {
      alert('Form title is required');
      return;
    }

    setSaving(true);
    try {
      await api.updateForm(formId, {
        title: editableTitle,
        description: editableDescription,
        questions: editableQuestions.map((q, index) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          is_required: q.is_required,
          conditional_question_id: q.conditional_question_id,
          conditional_answer: q.conditional_answer,
        })),
      });
      
      // Reload form to get updated data
      await loadForm();
      setIsEditing(false);
      alert('Form saved successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditableTitle(form.title);
    setEditableDescription(form.description || '');
    setEditableQuestions(questions);
    setIsEditing(false);
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...editableQuestions];
    updated[index].question_text = text;
    setEditableQuestions(updated);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...editableQuestions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options[optionIndex] = value;
      setEditableQuestions(updated);
    }
  };

  const copyFormLink = () => {
    const link = `${window.location.origin}/f/${formId}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading form...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Form not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            {!form.is_published && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                ✏️ Edit Form
              </button>
            )}
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {form.is_published ? (
                  <button
                    onClick={copyFormLink}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Copy Form Link
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {publishing ? 'Publishing...' : 'Publish Form'}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Form Info */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="text-3xl font-bold text-gray-900 mb-2 w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Form title"
                  />
                  <textarea
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    className="text-gray-600 text-lg w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 mt-2"
                    placeholder="Form description (optional)"
                    rows={2}
                  />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
                  {form.description && (
                    <p className="text-gray-600 text-lg">{form.description}</p>
                  )}
                </>
              )}
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                form.is_published
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {form.is_published ? 'Published' : 'Draft'}
            </span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600 mt-4 pt-4 border-t">
            <div>
              <span className="font-semibold">Questions:</span> {questions.length}
            </div>
            <div>
              <span className="font-semibold">Est. Time:</span> {Math.ceil((form.estimated_time || 120) / 60)} min
            </div>
            <div>
              <span className="font-semibold">Responses:</span> {form.response_count}
            </div>
            {form.is_anonymous && (
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Anonymous
              </div>
            )}
            {form.one_response_per_person && (
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                One Response Per Person
              </div>
            )}
          </div>
        </div>

        {/* AI Prompt Used */}
        {form.ai_prompt && (
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">AI Prompt Used:</h2>
            <p className="text-blue-800 italic">"{form.ai_prompt}"</p>
          </div>
        )}

        {/* Form Preview */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Edit Questions' : 'Form Preview'}
          </h2>
          
          <div className="space-y-8">
            {(isEditing ? editableQuestions : questions)
              .sort((a, b) => a.order_index - b.order_index)
              .map((question, index) => (
                <div key={question.id} className="pb-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start space-x-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="mb-4">
                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={question.question_text}
                              onChange={(e) => updateQuestionText(index, e.target.value)}
                              className="block w-full text-gray-900 font-medium text-lg border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                              rows={2}
                              placeholder="Question text"
                            />
                            <div className="text-sm text-gray-600">
                              Type: <span className="font-semibold text-gray-800">{question.question_type}</span>
                            </div>
                          </div>
                        ) : (
                          <label className="block text-gray-900 font-medium text-lg mb-3">
                            {question.question_text}
                            {question.is_required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                        )}
                        
                        {/* Preview/Edit based on question type */}
                        {question.question_type === 'text' && (
                          <input
                            type="text"
                            disabled
                            placeholder="Short answer text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                        )}
                        
                        {question.question_type === 'textarea' && (
                          <textarea
                            disabled
                            placeholder="Long answer text"
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 resize-none"
                          />
                        )}
                        
                        {question.question_type === 'rating' && (
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <button
                                key={num}
                                disabled
                                className="w-10 h-10 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-semibold"
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {question.question_type === 'likert' && (
                          <div className="space-y-2">
                            {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'].map((option, idx) => (
                              <label key={idx} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed">
                                <input type="radio" disabled className="w-4 h-4" />
                                <span className="text-gray-600">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.question_type === 'multiple_choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option: string, idx: number) => (
                              <label key={idx} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed">
                                <input type="radio" disabled className="w-4 h-4" />
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateQuestionOption(index, idx, e.target.value)}
                                    className="flex-1 text-gray-900 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                  />
                                ) : (
                                  <span className="text-gray-600">{option}</span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.question_type === 'checkboxes' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option: string, idx: number) => (
                              <label key={idx} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed">
                                <input type="checkbox" disabled className="w-4 h-4 rounded" />
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateQuestionOption(index, idx, e.target.value)}
                                    className="flex-1 text-gray-900 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                  />
                                ) : (
                                  <span className="text-gray-600">{option}</span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.question_type === 'yes_no' && (
                          <div className="flex space-x-4">
                            <button
                              disabled
                              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-semibold"
                            >
                              Yes
                            </button>
                            <button
                              disabled
                              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-semibold"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {question.conditional_logic && (
                        <div className="mt-3 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg inline-block">
                          ⚡ Conditional question - shows based on previous answer
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 font-semibold"
          >
            ← Back to Dashboard
          </Link>
          
          {form.is_published ? (
            <div className="flex space-x-4">
              <Link
                href={`/f/${formId}`}
                target="_blank"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Preview Form
              </Link>
              <Link
                href={`/forms/${formId}/analytics`}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                View Analytics
              </Link>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link
                href={`/f/${formId}`}
                target="_blank"
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Preview Draft
              </Link>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50"
              >
                {publishing ? 'Publishing...' : 'Publish Form'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
