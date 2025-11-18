'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BarChart, RatingVisualizer } from '@/components/Charts';

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'analytics' | 'raw'>('analytics');
  const [rawResponses, setRawResponses] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [formId]);

  const loadAnalytics = async () => {
    try {
      const [formResult, analyticsResult] = await Promise.all([
        api.getForm(formId),
        api.getAnalytics(formId),
      ]);
      setForm(formResult.form);
      setQuestions(formResult.questions);
      setAnalytics(analyticsResult.analytics);
      setInsights(analyticsResult.insights);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      alert(error.message || 'Failed to load analytics');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadRawData = async () => {
    try {
      const result = await api.exportResponses(formId);
      setRawResponses(result.responses);
    } catch (error: any) {
      console.error('Failed to load raw data:', error);
      alert(error.message || 'Failed to load raw data');
    }
  };

  const handleExport = async () => {
    try {
      const result = await api.exportResponses(formId);
      const blob = new Blob([JSON.stringify(result.responses, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.title.replace(/\s+/g, '-')}-responses.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Failed to export responses');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!form || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Analytics not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{form.title}</h1>
          <p className="text-gray-600 text-lg mb-6">{form.description}</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {analytics.total_responses}
              </div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {analytics.completion_rate}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {Math.ceil((analytics.average_time || 0) / 60)}m
              </div>
              <div className="text-sm text-gray-600">Avg. Time</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <button
                onClick={handleExport}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                📥 Export Data
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'analytics'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 Analytics View
            </button>
            <button
              onClick={() => {
                setViewMode('raw');
                if (rawResponses.length === 0) {
                  loadRawData();
                }
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                viewMode === 'raw'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📄 Raw Data
            </button>
          </div>
        </div>

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <>
            {/* AI Insights */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-3xl mr-2">🤖</span>
                AI-Generated Insights
              </h2>
              <div className="bg-white rounded-lg p-6">
                <div className="text-gray-800 space-y-3">
                  {insights.split('\n').filter(line => line.trim()).map((line, index) => {
                    // Remove markdown formatting and clean up the line
                    const cleanLine = line.trim().replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/^[\*\-•]\s*/, '');
                    
                    if (!cleanLine) return null;
                    
                    // Check if it's a bullet point
                    if (line.match(/^[\*\-•]/)) {
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-purple-600 font-bold text-xl mt-1">•</span>
                          <p className="text-gray-800 leading-relaxed flex-1">{cleanLine}</p>
                        </div>
                      );
                    }
                    
                    // Regular paragraph
                    return (
                      <p key={index} className="text-gray-800 leading-relaxed">
                        {cleanLine}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Question Analytics */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Question Breakdown</h2>
              
              {analytics.question_analytics.map((qa: any, index: number) => (
                <div key={qa.question_id} className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {index + 1}. {qa.question_text}
                  </h3>

                  {/* Likert/Rating Average */}
                  {qa.average_rating !== undefined && (
                    <RatingVisualizer
                      average={qa.average_rating}
                      maxRating={qa.question_type === 'rating' ? 10 : 5}
                    />
                  )}

                  {/* Response Distribution */}
                  {qa.response_distribution && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-4">Response Distribution</h4>
                      <BarChart
                        data={Object.entries(qa.response_distribution as Record<string, number>)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([answer, count]) => ({
                            label: answer,
                            value: count as number,
                            percentage: ((count as number) / analytics.total_responses) * 100,
                          }))}
                        maxValue={analytics.total_responses}
                      />
                    </div>
                  )}

                  {/* Common Themes */}
                  {qa.common_themes && qa.common_themes.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-700 mb-3">Common Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {qa.common_themes.map((theme: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Raw Data View */}
        {viewMode === 'raw' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Raw Response Data</h2>
            
            {rawResponses.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-600">Loading raw data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rawResponses.map((response: any, idx: number) => {
                  // Convert answers object to array with question details
                  const answerArray = Object.entries(response.answers || {}).map(([questionId, answer]) => {
                    const question = questions.find((q: any) => q.id === questionId);
                    return {
                      questionId,
                      questionText: question?.question_text || 'Unknown Question',
                      questionType: question?.question_type || 'text',
                      answer,
                    };
                  });

                  return (
                    <div key={response.response_id || idx} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Response #{idx + 1}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(response.submitted_at * 1000).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        {answerArray.map((item, answerIdx) => (
                          <div key={item.questionId} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Q{answerIdx + 1}: {item.questionText}
                            </div>
                            <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                              {Array.isArray(item.answer) 
                                ? item.answer.join(', ') 
                                : String(item.answer)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
