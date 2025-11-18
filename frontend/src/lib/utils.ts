/**
 * Generate a browser fingerprint for anonymous tracking
 */
export function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return 'unknown';
  
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('VoteHub', 2, 2);
  
  const canvasData = canvas.toDataURL();
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvasFingerprint: canvasData.slice(0, 100),
  };
  
  return btoa(JSON.stringify(fingerprint));
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format seconds to minutes/seconds
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0
    ? `${minutes} min ${remainingSeconds} sec`
    : `${minutes} min`;
}

/**
 * Validate form answers against questions
 */
export function validateAnswers(
  answers: Record<string, any>,
  questions: any[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const question of questions) {
    if (question.is_required && !answers[question.id]) {
      errors.push(`${question.question_text} is required`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a question should be shown based on conditional logic
 */
export function shouldShowQuestion(
  question: any,
  answers: Record<string, any>
): boolean {
  if (!question.conditional_logic) return true;
  
  const { show_if_question_id, show_if_answer, operator } = question.conditional_logic;
  const previousAnswer = answers[show_if_question_id];
  
  if (previousAnswer === undefined) return false;
  
  switch (operator) {
    case 'equals':
      return previousAnswer === show_if_answer;
    case 'contains':
      if (Array.isArray(previousAnswer)) {
        return previousAnswer.some((a) =>
          Array.isArray(show_if_answer)
            ? show_if_answer.includes(a)
            : a === show_if_answer
        );
      }
      return previousAnswer === show_if_answer;
    case 'greater_than':
      return Number(previousAnswer) > Number(show_if_answer);
    case 'less_than':
      return Number(previousAnswer) < Number(show_if_answer);
    default:
      return true;
  }
}
