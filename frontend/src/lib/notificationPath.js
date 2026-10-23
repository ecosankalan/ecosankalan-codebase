/**
 * lib/notificationPath.js
 * Maps an FCM notification `data` payload to an in-app route.
 * Shared by the bell dropdown and the foreground system-notification
 * click handler so the two mappings can't drift.
 */
export default function notificationPath(data) {
  if (!data) return null;

  switch (data.type) {
    case 'challenge':
      return data.challengeId ? `/challenge/${data.challengeId}` : null;
    case 'quiz':
      return data.quizId ? `/quiz/${data.quizId}` : null;
    case 'reward':
      return '/rewards';
    case 'level':
      return '/profile';
    default:
      return null;
  }
}
