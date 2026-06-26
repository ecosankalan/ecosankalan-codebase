const express = require('express');
const { protect } = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const ChallengeProgress = require('../models/ChallengeProgress');
const { issueReward } = require('../services/rewardEngine');

const router = express.Router();

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const startOfCurrentWeekIST = (now = new Date()) => {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const day = ist.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  ist.setUTCDate(ist.getUTCDate() - diffToMonday);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
};

const endOfWeekIST = (weekStartDate) =>
  new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1000);

const initialProgress = (challenge) =>
  challenge.tasks.map((task, taskIndex) => ({
    taskIndex,
    currentCount: 0,
    completed: false,
  }));

router.use(protect);

router.get('/active', async (req, res) => {
  try {
    const weekStartDate = startOfCurrentWeekIST();
    const challenges = await Challenge.find({ isActive: true, weekStartDate }).lean();
    const progressRows = await ChallengeProgress.find({
      userId: req.user.userId,
      weekStartDate,
      challengeId: { $in: challenges.map((challenge) => challenge._id) },
    }).lean();

    const progressByChallenge = new Map(
      progressRows.map((progress) => [String(progress.challengeId), progress])
    );

    res.status(200).json(challenges.map((challenge) => ({
      ...challenge,
      progress: progressByChallenge.get(String(challenge._id)) || {
        taskProgress: initialProgress(challenge),
        allCompleted: false,
        rewardIssued: false,
      },
      deadline: endOfWeekIST(weekStartDate),
    })));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load active challenges' });
  }
});

router.post('/:id/progress', async (req, res) => {
  try {
    const { action, category, count = 1 } = req.body;
    const incrementBy = Number(count);
    const weekStartDate = startOfCurrentWeekIST();
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      isActive: true,
      weekStartDate,
    });

    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    if (!action || !Number.isFinite(incrementBy) || incrementBy <= 0) {
      return res.status(400).json({ success: false, message: 'action and positive count are required' });
    }

    let progress = await ChallengeProgress.findOne({
      userId: req.user.userId,
      challengeId: challenge._id,
      weekStartDate,
    });

    if (!progress) {
      progress = await ChallengeProgress.create({
        userId: req.user.userId,
        challengeId: challenge._id,
        weekStartDate,
        taskProgress: initialProgress(challenge),
      });
    }

    challenge.tasks.forEach((task, taskIndex) => {
      const categoryMatches = !task.category || !category || task.category === category;
      if (task.action === action && categoryMatches) {
        const taskProgress = progress.taskProgress.find((item) => item.taskIndex === taskIndex);
        taskProgress.currentCount = Math.min(task.targetCount, taskProgress.currentCount + incrementBy);
        taskProgress.completed = taskProgress.currentCount >= task.targetCount;
      }
    });

    progress.allCompleted = progress.taskProgress.every((item) => item.completed);
    if (progress.allCompleted && !progress.completedAt) progress.completedAt = new Date();
    await progress.save();

    let reward = null;
    if (progress.allCompleted && !progress.rewardIssued) {
      reward = await issueReward(req.user.userId, challenge._id, weekStartDate);
      progress = await ChallengeProgress.findById(progress._id);
    }

    res.status(200).json({ progress, reward });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update challenge progress' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const currentWeek = startOfCurrentWeekIST();
    const start = new Date(currentWeek.getTime() - 7 * 7 * 24 * 60 * 60 * 1000);
    const progressRows = await ChallengeProgress.find({
      userId: req.user.userId,
      weekStartDate: { $gte: start, $lte: currentWeek },
    }).populate('challengeId', 'title tasks').sort({ weekStartDate: -1 }).lean();

    const grouped = new Map();
    progressRows.forEach((progress) => {
      const key = progress.weekStartDate.toISOString();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push({
        challengeTitle: progress.challengeId?.title || 'Challenge',
        status: progress.allCompleted ? 'completed' : 'missed',
        rewardReceived: progress.rewardIssued,
        progressAtEnd: progress.taskProgress,
      });
    });

    res.status(200).json(
      Array.from(grouped.entries())
        .slice(0, 8)
        .map(([weekStartDate, challenges]) => ({ weekStartDate, challenges }))
    );
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load challenge history' });
  }
});

module.exports = router;
