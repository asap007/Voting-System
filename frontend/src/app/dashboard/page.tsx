'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userResult, formsResult] = await Promise.all([
        api.getCurrentUser(),
        api.getForms(),
      ]);
      setUser(userResult.user);
      setForms(formsResult.forms);
    } catch (error) {
      console.error('Failed to load data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!aiPrompt.trim()) return;

    setCreating(true);
    try {
      const result = await api.generateForm(aiPrompt);
      router.push(`/forms/${result.form.id}/edit`);
    } catch (error: any) {
      alert(error.message || 'Failed to create form');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      api.clearToken();
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VoteHub AI
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Create Form Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Create a New Form with AI</h2>
            <p className="mb-6 text-blue-100">
              Describe what feedback you need, and our AI will generate a smart form for you
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              + Create Form
            </button>
          </div>
        </div>

        {/* Forms List */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Forms</h2>
          {forms.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-600 text-lg">No forms yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <div key={form.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{form.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        form.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {form.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{form.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>{form.response_count} responses</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(form.created_at)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/forms/${form.id}/edit`}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </Link>
                    {form.is_published && (
                      <Link
                        href={`/forms/${form.id}/analytics`}
                        className="flex-1 px-4 py-2 bg-green-500 text-white text-center rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Analytics
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Create Form with AI</h2>
            <p className="text-gray-600 mb-6">
              Describe what feedback you need. Be specific about the topic, audience, and any
              particular questions you want answered.
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[150px] resize-none mb-4 text-gray-900"
              placeholder="Example: Create an anonymous feedback form for my Data Structures course. Ask about lecture pace, clarity of explanations, difficulty of lab assignments, and what resources students need. Keep it under 2 minutes."
            />
            <div className="flex space-x-4">
              <button
                onClick={handleCreateForm}
                disabled={creating || !aiPrompt.trim()}
                className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Generating...' : 'Generate Form'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setAiPrompt('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
