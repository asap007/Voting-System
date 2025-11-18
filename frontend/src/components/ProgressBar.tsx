'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  estimatedTime?: number;
}

export default function ProgressBar({ current, total, estimatedTime }: ProgressBarProps) {
  const [recentResponses, setRecentResponses] = useState(0);
  const percentage = Math.round((current / total) * 100);

  useEffect(() => {
    // Simulate recent responses counter
    const randomCount = Math.floor(Math.random() * 15) + 3;
    setRecentResponses(randomCount);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <span>
          Question {current} of {total}
        </span>
        <div className="flex items-center space-x-4">
          {estimatedTime && (
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              ~{Math.ceil(estimatedTime / 60)} min
            </span>
          )}
          <span className="flex items-center text-green-600 animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            {recentResponses} responses in last 10 min
          </span>
        </div>
      </div>
    </div>
  );
}
