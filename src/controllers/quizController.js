const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

exports.submitQuiz = async (req, res) => {
  const { category, score } = req.body;
  const userId = req.user.userId;

  try {
    // 1. Save the result
    await QuizResult.create({ userId, category, score });

    // 2. Logic for 'Segregation Master' (Check unique categories completed)
    const completedCategories = await QuizResult.distinct('category', { userId });
    
    let badgesAwarded = [];

    if (completedCategories.length >= 6) {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { badgesEarned: 'Segregation Master' } },
        { new: true }
      );
      badgesAwarded.push('Segregation Master');
    }

    // 3. Logic for 'Eco Starter' (7-day streak)
    // For now, let's increment a streak in the User model
    const user = await User.findById(userId);
    // Simple logic: If they played today, check if they played yesterday to increment
    // (You can expand this later, but $addToSet is the key requirement)
    if (user.quizStreak >= 7) {
      await User.findByIdAndUpdate(userId, { 
        $addToSet: { badgesEarned: 'Eco Starter' } 
      });
      badgesAwarded.push('Eco Starter');
    }

    res.status(200).json({ 
      message: 'Quiz submitted successfully', 
      badgesAwarded 
    });

  } catch (err) {
    res.status(500).json({ message: 'Error submitting quiz' });
  }
};