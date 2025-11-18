'use client';

import { useState } from 'react';
import type { Question } from '@/types';

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  isLast: boolean;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  onNext,
  isLast,
}: QuestionRendererProps) {
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (question.is_required && !value) {
      setError('This question is required');
      return;
    }
    setError('');
    onNext();
  };

  const renderInput = () => {
    switch (question.question_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Type your answer..."
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors min-h-[120px] resize-none"
            placeholder="Type your answer..."
          />
        );

      case 'likert':
        const likertLabels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
        return (
          <div className="space-y-3">
            {likertLabels.map((label, index) => (
              <button
                key={index}
                onClick={() => onChange(index + 1)}
                className={`w-full px-6 py-4 text-left rounded-lg border-2 transition-all ${
                  value === index + 1
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                    : 'border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{label}</span>
                  <span className="text-sm text-gray-500">{index + 1}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => onChange(num)}
                className={`w-12 h-12 rounded-full text-lg font-semibold transition-all ${
                  value === num
                    ? 'bg-blue-500 text-white scale-110 shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => onChange(option)}
                className={`w-full px-6 py-4 text-left rounded-lg border-2 transition-all ${
                  value === option
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                    : 'border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{option}</span>
              </button>
            ))}
          </div>
        );

      case 'checkboxes':
        const selectedValues = value || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const isSelected = selectedValues.includes(option);
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedValues.filter((v: string) => v !== option));
                    } else {
                      onChange([...selectedValues, option]);
                    }
                  }}
                  className={`w-full px-6 py-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                      : 'border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 mr-3 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                      }`}
                    >
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex space-x-4">
            {['Yes', 'No'].map((option) => (
              <button
                key={option}
                onClick={() => onChange(option)}
                className={`flex-1 px-8 py-6 text-xl font-semibold rounded-lg border-2 transition-all ${
                  value === option
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                    : 'border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {question.question_text}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </h2>
      </div>

      {renderInput()}

      {error && (
        <p className="mt-3 text-red-500 text-sm animate-shake">{error}</p>
      )}

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          className="w-full sm:w-auto px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
        >
          {isLast ? 'Submit' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
