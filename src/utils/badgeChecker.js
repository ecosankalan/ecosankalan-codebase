/**
 * utils/badgeChecker.js
 * Checks badge conditions after quiz completion and awards new badges.
 *
 * SRS FR-10: Badge triggers:
 *   - Segregation Master: all 6 category quizzes completed
 *   - Eco Starter: 7-day consecutive quiz streak
 *   (Quiz Starter, Quiz Pro tracked in userQuizProgress — Atishay's schema)
 *
 * Uses $addToSet so duplicate badges can never be awarded.
 * Returns array of newly awarded badge IDs so the controller
 * can tell the frontend to show the badge popup.
 */

const User = require('../models/User');

// Badge ID → condition function
// quizProgress shape: { totalQuizzesTaken, completedCategories[], streak }
const BADGE_CONDITIONS = {
  'Segregation Master': (p) => (p.completedCategories || []).length >= 6,
  'Eco Starter': (p) => (p.streak || 0) >= 7,
};

/**
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {object} quizProgress - current userQuizProgress document
 * @returns {string[]} - array of newly awarded badge IDs (empty if none)
 */
exports.checkAndAward = async (userId, quizProgress) => {
  try {
    const user = await User.findById(userId).select('badgesEarned');
    if (!user) return [];

    const newBadges = [];

    for (const [badgeId, condition] of Object.entries(BADGE_CONDITIONS)) {
      // Only award if condition is met AND user doesn't already have it
      if (condition(quizProgress) && !user.badgesEarned.includes(badgeId)) {
        newBadges.push(badgeId);
      }
    }

    if (newBadges.length > 0) {
      // $addToSet with $each ensures atomicity — no duplicates even on race condition
      await User.findByIdAndUpdate(userId, {
        $addToSet: { badgesEarned: { $each: newBadges } }
      });
    }

    return newBadges;

  } catch (err) {
    console.error('badgeChecker error:', err);
    return []; // never crash the quiz flow because of badge logic
  }
};
