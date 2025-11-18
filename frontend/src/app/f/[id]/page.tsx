'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import QuestionRenderer from '@/components/QuestionRenderer';
import ProgressBar from '@/components/ProgressBar';
import { shouldShowQuestion, generateFingerprint } from '@/lib/utils';

export default function FormSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadForm();
    checkOwnership();
  }, [formId]);

  const loadForm = async () => {
    try {
      const result = await api.getForm(formId);
      setForm(result.form);
      setQuestions(result.questions);
    } catch (error: any) {
      setError(error.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    try {
      const user = await api.getCurrentUser();
      const formResult = await api.getForm(formId);
      if (user.user && formResult.form.user_id === user.user.id) {
        setIsOwner(true);
      }
    } catch (error) {
      // User is not logged in or not the owner
      setIsOwner(false);
    }
  };

  const visibleQuestions = questions.filter((q) => shouldShowQuestion(q, answers));
  const currentQuestion = visibleQuestions[currentIndex];

  const handleNext = () => {
    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fingerprint = form.one_response_per_person ? generateFingerprint() : undefined;
      await api.submitResponse(formId, answers, fingerprint);
      setSubmitted(true);
    } catch (error: any) {
      alert(error.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-xl text-gray-600">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!form.is_published) {
    // Allow owners to preview unpublished forms
    if (!isOwner) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h1>
            <p className="text-gray-600">This form is not published yet.</p>
          </div>
        </div>
      );
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-xl text-gray-600 mb-2">Your response has been submitted.</p>
          <p className="text-gray-500">Your feedback is valuable and appreciated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      {/* Draft Banner for Unpublished Forms */}
      {!form.is_published && isOwner && (
        <div className="max-w-2xl mx-auto mb-4">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800">Draft Preview Mode</p>
                <p className="text-sm text-yellow-700">This form is not published yet. Only you can see this preview.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Button for Owner */}
      {isOwner && (
        <div className="max-w-2xl mx-auto mb-4">
          <Link
            href={`/forms/${formId}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            ✏️ Edit Form
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{form.title}</h1>
        {form.description && <p className="text-gray-600 text-lg">{form.description}</p>}
        {form.is_anonymous && (
          <p className="mt-4 text-sm text-green-600 font-medium">
            🔒 This form is anonymous
          </p>
        )}
      </div>

      {/* Progress */}
      <ProgressBar
        current={currentIndex + 1}
        total={visibleQuestions.length}
        estimatedTime={form.estimated_time}
      />

      {/* Question */}
      <div className="mt-8">
        {currentQuestion && (
          <QuestionRenderer
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) =>
              setAnswers({ ...answers, [currentQuestion.id]: value })
            }
            onNext={handleNext}
            isLast={currentIndex === visibleQuestions.length - 1}
          />
        )}
      </div>

      {/* Back Button */}
      {currentIndex > 0 && (
        <div className="max-w-2xl mx-auto mt-6">
          <button
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Submitting your response...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
