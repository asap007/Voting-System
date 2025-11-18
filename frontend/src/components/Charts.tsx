'use client';

interface BarChartProps {
  data: { label: string; value: number; percentage: number }[];
  maxValue: number;
}

export function BarChart({ data, maxValue }: BarChartProps) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500',
  ];

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-32 text-sm text-gray-700 font-medium truncate" title={item.label}>
            {item.label}
          </div>
          <div className="flex-1">
            <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`absolute h-full ${colors[index % colors.length]} transition-all duration-500 flex items-center justify-end px-3`}
                style={{ width: `${item.percentage}%` }}
              >
                {item.percentage > 15 && (
                  <span className="text-white font-semibold text-sm">
                    {item.value} ({item.percentage.toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
          {item.percentage <= 15 && (
            <div className="w-24 text-sm text-gray-600 font-medium text-right">
              {item.value} ({item.percentage.toFixed(0)}%)
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
}

export function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* Pie Chart */}
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const offset = cumulativePercentage;
            cumulativePercentage += percentage;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={`${percentage * 2.51327} ${251.327 - percentage * 2.51327}`}
                strokeDashoffset={-offset * 2.51327}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-600">
                  {item.value} responses ({percentage}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RatingVisualizerProps {
  average: number;
  maxRating: number;
}

export function RatingVisualizer({ average, maxRating }: RatingVisualizerProps) {
  const percentage = (average / maxRating) * 100;
  
  let color = 'bg-red-500';
  let emoji = '😞';
  
  if (percentage >= 80) {
    color = 'bg-green-500';
    emoji = '😊';
  } else if (percentage >= 60) {
    color = 'bg-blue-500';
    emoji = '🙂';
  } else if (percentage >= 40) {
    color = 'bg-yellow-500';
    emoji = '😐';
  } else {
    color = 'bg-red-500';
    emoji = '😞';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-5xl">{emoji}</span>
        <div className="flex-1">
          <div className="text-4xl font-bold text-gray-900">
            {average.toFixed(2)} <span className="text-2xl text-gray-500">/ {maxRating}</span>
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
      </div>
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute h-full ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>1</span>
        <span>{Math.floor(maxRating / 2)}</span>
        <span>{maxRating}</span>
      </div>
    </div>
  );
}
