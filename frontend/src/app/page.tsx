import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VoteHub AI
          </div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create Smart Forms with
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}AI Magic
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Skip the boring form builder. Just describe what you need, and our AI generates
            contextually smart, engaging forms with analytics in seconds.
          </p>

          <div className="flex justify-center space-x-4 mb-16">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Create Your First Form
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-white text-blue-500 text-lg font-semibold rounded-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors shadow-lg"
            >
              View Demo
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Generation</h3>
              <p className="text-gray-600">
                Describe your feedback needs in plain English. Our AI creates the perfect form
                with smart question types and conditional logic.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Conversational Forms</h3>
              <p className="text-gray-600">
                One question at a time with beautiful animations. More engaging than boring
                traditional forms.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Smart Analytics</h3>
              <p className="text-gray-600">
                AI-generated insights, sentiment analysis, and beautiful visualizations. Export
                reports with one click.
              </p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-8">Perfect For</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-2">📚 Educators</h3>
                <p>Course feedback, mid-semester surveys, student engagement polls</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-2">💼 Teams</h3>
                <p>Employee feedback, project retrospectives, team health checks</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-2">🎯 Event Organizers</h3>
                <p>Post-event surveys, attendee satisfaction, improvement ideas</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-2">🚀 Product Teams</h3>
                <p>User research, feature requests, beta testing feedback</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>© 2025 VoteHub AI. Built with Next.js, Cloudflare Workers & Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}
