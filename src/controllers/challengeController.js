const Challenge = require('../models/Challenge.js');
const ChallengeProgress = require('../models/ChallengeProgress.js');
const getCloudinary = require('../config/cloudinary');
const { computePointsAwarded, DAY_MS } = require('../services/challengeScoring.js');
const NotificationService = require('../services/notificationService.js');

const nowUTC = () => new Date();

const DAY_START_HOUR_UTC = 7;
const DAY_OFFSET_MS = DAY_START_HOUR_UTC * 60 * 60 * 1000;

const snapToDayStart = (date) => {
  const d = new Date(date);
  d.setUTCHours(DAY_START_HOUR_UTC, 0, 0, 0);
  return d;
};

const durationDaysOf = (challenge) => {
  if (!challenge?.startDate || !challenge?.expiryDate) return 0;
  const start = snapToDayStart(challenge.startDate);
  const expiry = snapToDayStart(challenge.expiryDate);
  return Math.max(1, Math.ceil((expiry - start) / DAY_MS));
};

const unlockAtFor = (challenge, dayIndex) => {
  const start = snapToDayStart(challenge.startDate);
  return new Date(start.getTime() + dayIndex * DAY_MS);
};

const expiresAtFor = (challenge, dayIndex) => {
  const start = snapToDayStart(challenge.startDate);
  return new Date(start.getTime() + (dayIndex + 1) * DAY_MS);
};

const dayIndexForNow = (challenge, now = nowUTC()) => {
  if (!challenge?.startDate || !challenge?.expiryDate) return -1;
  const start = snapToDayStart(challenge.startDate);
  const expiry = snapToDayStart(challenge.expiryDate);
  if (now < start) return -1;
  if (now >= expiry) return durationDaysOf(challenge) - 1;
  return Math.floor((now - start) / DAY_MS);
};

const buildDailySlots = (challenge, now = nowUTC()) => {
  const totalDays = durationDaysOf(challenge);
  const slots = [];
  for (let i = 0; i < totalDays; i += 1) {
    const unlockAt = unlockAtFor(challenge, i);
    const expiresAt = expiresAtFor(challenge, i);
    let status;
    if (now < unlockAt) status = 'locked';
    else if (now >= expiresAt) status = 'expired';
    else status = 'unlocked';
    slots.push({ dayIndex: i, unlockAt, expiresAt, status });
  }
  return slots;
};

const attachUserSubmission = (slots, submissions, viewerId, isAdmin) => {
  const byDay = new Map();
  for (const sub of submissions || []) {
    byDay.set(sub.dayIndex, sub);
  }
  return slots.map((slot) => {
    const sub = byDay.get(slot.dayIndex);
    if (!sub) return { ...slot, submission: null };
    const isOwner = String(sub.userId || '') === String(viewerId || '');
    if (!isOwner && !isAdmin) {
      return {
        ...slot,
        submission: {
          dayIndex: slot.dayIndex,
          submittedAt: sub.submittedAt,
          pointsAwarded: sub.pointsAwarded,
        },
      };
    }
    return {
      ...slot,
      submission: {
        dayIndex: slot.dayIndex,
        submittedAt: sub.submittedAt,
        imageUrl: sub.imageUrl,
        remarks: sub.remarks,
        pointsAwarded: sub.pointsAwarded,
      },
    };
  });
};

const recomputeTotals = (progress, totalDays) => {
  const submittedDays = new Set(
    (progress.dailySubmissions || [])
      .filter((s) => s.submittedAt)
      .map((s) => s.dayIndex)
  );
  progress.totalPoints = (progress.dailySubmissions || []).reduce(
    (sum, s) => sum + (Number.isFinite(s.pointsAwarded) ? s.pointsAwarded : 0),
    0
  );
  progress.allCompleted =
    submittedDays.size >= totalDays &&
    [...Array(totalDays).keys()].every((i) => submittedDays.has(i));
  progress.completedAt = progress.allCompleted && !progress.completedAt ? new Date() : progress.completedAt;
};

exports.createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      taskTemplate,
      startDate,
      expiryDate,
    } = req.body;

    if (!title || !description || !startDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'title, description, startDate, and expiryDate are required',
      });
    }

    if (!taskTemplate || typeof taskTemplate !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'taskTemplate is required',
      });
    }

    if (!taskTemplate.description || !taskTemplate.description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'taskTemplate.description is required',
      });
    }

    const start = snapToDayStart(new Date(startDate));
    const expiry = snapToDayStart(new Date(expiryDate));

    if (Number.isNaN(start.getTime()) || Number.isNaN(expiry.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate or expiryDate',
      });
    }

    if (expiry <= start) {
      return res.status(400).json({
        success: false,
        message: 'expiryDate must be after startDate',
      });
    }

    const durationDays = Math.ceil((expiry - start) / DAY_MS);
    if (durationDays < 1 || durationDays > Challenge.MAX_DURATION_DAYS) {
      return res.status(400).json({
        success: false,
        message: `Challenge duration must be 1..${Challenge.MAX_DURATION_DAYS} days`,
      });
    }

    const pointsConfig = taskTemplate.pointsConfig || {};
    const maxPoints = Number(pointsConfig.maxPoints ?? 100);
    const minPoints = Number(pointsConfig.minPoints ?? 10);
    if (!Number.isFinite(maxPoints) || maxPoints < 0) {
      return res.status(400).json({
        success: false,
        message: 'pointsConfig.maxPoints must be ≥ 0',
      });
    }
    if (!Number.isFinite(minPoints) || minPoints < 0) {
      return res.status(400).json({
        success: false,
        message: 'pointsConfig.minPoints must be ≥ 0',
      });
    }
    if (minPoints > maxPoints) {
      return res.status(400).json({
        success: false,
        message: 'pointsConfig.minPoints must be ≤ maxPoints',
      });
    }

    const challenge = await Challenge.create({
      title,
      description,
      taskTemplate: {
        description: taskTemplate.description,
        action: taskTemplate.action || 'daily_task',
        category: taskTemplate.category || null,
        imageRequired: taskTemplate.imageRequired !== false,
        targetCount: Number(taskTemplate.targetCount) || 1,
        pointsConfig: {
          maxPoints,
          minPoints,
          decayType: 'linear',
        },
      },
      startDate: start,
      expiryDate: expiry,
    });

    try {
      await NotificationService.challengeCreated(challenge);
    } catch (notifyErr) {
      console.log('Notification failed (challenge created):', notifyErr?.message);
    }

    res.status(201).json({ success: true, challenge });
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors)[0]?.message || 'Invalid challenge data',
      });
    }
    console.log('Error creating challenge:', err);
    res.status(500).json({ success: false, message: 'Failed to create challenge' });
  }
};

exports.updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ['title', 'description', 'startDate', 'expiryDate', 'isActive'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (req.body.taskTemplate && typeof req.body.taskTemplate === 'object') {
      const tt = req.body.taskTemplate;
      updates.taskTemplate = {
        description: tt.description,
        action: tt.action || 'daily_task',
        category: tt.category || null,
        imageRequired: tt.imageRequired !== false,
        targetCount: Number(tt.targetCount) || 1,
        pointsConfig: {
          maxPoints: Number(tt.pointsConfig?.maxPoints ?? 100),
          minPoints: Number(tt.pointsConfig?.minPoints ?? 10),
          decayType: 'linear',
        },
      };
    }

    if (updates.startDate) updates.startDate = snapToDayStart(new Date(updates.startDate));
    if (updates.expiryDate) updates.expiryDate = snapToDayStart(new Date(updates.expiryDate));

    if (updates.startDate && updates.expiryDate && updates.expiryDate <= updates.startDate) {
      return res.status(400).json({
        success: false,
        message: 'expiryDate must be after startDate',
      });
    }

    const challenge = await Challenge.findByIdAndUpdate(id, { $set: updates }, {
      new: true,
      runValidators: true,
    });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.status(200).json({ success: true, challenge });
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors)[0]?.message || 'Invalid challenge data',
      });
    }
    res.status(500).json({ success: false, message: 'Failed to update challenge' });
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    res.status(200).json({ success: true, message: 'Challenge deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete challenge' });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const now = nowUTC();
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    if (!challenge.isActive) {
      return res.status(400).json({ success: false, message: 'Challenge is not active' });
    }
    if (now > challenge.expiryDate) {
      return res.status(400).json({ success: false, message: 'Challenge has already ended' });
    }

    const existing = await ChallengeProgress.findOne({
      userId: req.user.userId,
      challengeId: challenge._id,
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already joined this challenge' });
    }

    const progress = await ChallengeProgress.create({
      userId: req.user.userId,
      challengeId: challenge._id,
      joinedAt: now,
      dailySubmissions: [],
    });

    res.status(201).json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to join challenge' });
  }
};

exports.getActiveChallenges = async (req, res) => {
  try {
    const now = nowUTC();
    const challenges = await Challenge.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gte: now },
    }).lean({ virtuals: true });

    const progressRows = await ChallengeProgress.find({
      userId: req.user.userId,
      challengeId: { $in: challenges.map((c) => c._id) },
    }).lean();

    const progressByChallenge = new Map(
      progressRows.map((p) => [String(p.challengeId), p])
    );

    res.status(200).json(
      challenges.map((challenge) => {
        const durationDays = durationDaysOf(challenge);
        const todayIndex = dayIndexForNow(challenge, now);
        const progress = progressByChallenge.get(String(challenge._id)) || null;
        const submissions = progress?.dailySubmissions || [];
        return {
          ...challenge,
          durationDays,
          dayIndexToday: todayIndex >= 0 && todayIndex < durationDays ? todayIndex : null,
          joined: !!progress,
          userProgress: progress
            ? {
                totalPoints: progress.totalPoints || 0,
                allCompleted: !!progress.allCompleted,
                completedAt: progress.completedAt || null,
                submittedDays: submissions
                  .filter((s) => s.submittedAt)
                  .map((s) => s.dayIndex),
              }
            : null,
        };
      })
    );
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load active challenges' });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const now = nowUTC();
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    let progress = await ChallengeProgress.findOne({
      userId: req.user.userId,
      challengeId: challenge._id,
    });

    if (!progress) {
      progress = await ChallengeProgress.create({
        userId: req.user.userId,
        challengeId: challenge._id,
        joinedAt: now,
        dailySubmissions: [],
      });
    }

    const totalDays = durationDaysOf(challenge);
    const slots = buildDailySlots(challenge, now);
    const slotsWithSubmission = attachUserSubmission(
      slots,
      progress.dailySubmissions,
      req.user.userId,
      req.user.role === 'admin'
    );

    const todayIndex = dayIndexForNow(challenge, now);

    res.status(200).json({
      ...challenge.toObject({ virtuals: true }),
      durationDays: totalDays,
      dayIndexToday: todayIndex >= 0 && todayIndex < totalDays ? todayIndex : null,
      joined: true,
      joinedAt: progress.joinedAt,
      totalPoints: progress.totalPoints,
      allCompleted: progress.allCompleted,
      completedAt: progress.completedAt,
      dailySlots: slotsWithSubmission,
    });
  } catch (err) {
    console.log('getChallengeById error:', err);
    res.status(500).json({ success: false, message: 'Failed to load challenge' });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const now = nowUTC();
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      isActive: true,
    });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const dayIndex = Number(req.body.dayIndex);
    if (!Number.isInteger(dayIndex) || dayIndex < 0) {
      return res.status(400).json({ success: false, message: 'dayIndex is required (non-negative integer)' });
    }

    const totalDays = durationDaysOf(challenge);
    if (dayIndex >= totalDays) {
      return res.status(400).json({ success: false, message: `dayIndex must be < ${totalDays}` });
    }

    const unlockAt = unlockAtFor(challenge, dayIndex);
    const expiresAt = expiresAtFor(challenge, dayIndex);

    if (now < unlockAt) {
      return res.status(400).json({
        success: false,
        message: 'This task is not unlocked yet',
      });
    }
    if (now >= expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'The 24h submission window has closed',
      });
    }

    const imageRequired = challenge.taskTemplate?.imageRequired !== false;
    const remarks = (req.body.remarks || '').toString().trim().slice(0, 500) || null;

    if (!req.file) {
      if (imageRequired) {
        return res.status(400).json({
          success: false,
          message: 'Image proof is required for this task',
        });
      }
    }

    let progress = await ChallengeProgress.findOne({
      userId: req.user.userId,
      challengeId: challenge._id,
    });

    if (!progress) {
      progress = await ChallengeProgress.create({
        userId: req.user.userId,
        challengeId: challenge._id,
        joinedAt: now,
        dailySubmissions: [],
      });
    }

    const alreadySubmitted = (progress.dailySubmissions || []).some(
      (s) => s.dayIndex === dayIndex && s.submittedAt
    );
    if (alreadySubmitted) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted today\'s task',
      });
    }

    let imageUrl = null;
    let imagePublicId = null;
    if (req.file) {
      try {
        const cloudinary = getCloudinary();
        const base64Image = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
        const folder =
          process.env.CLOUDINARY_CHALLENGE_FOLDER ||
          `ecosankalan/challenge-proofs/${challenge._id}/${req.user.userId}`;
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder,
          public_id: `day_${dayIndex}_${Date.now()}`,
          overwrite: true,
          invalidate: true,
          resource_type: 'image',
          transformation: [
            { width: 1280, height: 1280, crop: 'limit', fetch_format: 'auto', quality: 'auto' },
          ],
        });
        imageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      } catch (uploadErr) {
        console.log('Cloudinary upload failed:', uploadErr?.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload proof image',
        });
      }
    }

    const pointsConfig = challenge.taskTemplate?.pointsConfig || {};
    const pointsAwarded = computePointsAwarded({
      maxPoints: pointsConfig.maxPoints ?? 100,
      minPoints: pointsConfig.minPoints ?? 10,
      unlockAt,
      submittedAt: now,
    });

    progress.dailySubmissions.push({
      dayIndex,
      submittedAt: now,
      imageUrl,
      imagePublicId,
      remarks,
      pointsAwarded,
    });

    recomputeTotals(progress, totalDays);
    await progress.save();

    res.status(201).json({
      success: true,
      progress: {
        dayIndex,
        submittedAt: now,
        imageUrl,
        remarks,
        pointsAwarded,
      },
      totalPoints: progress.totalPoints,
      allCompleted: progress.allCompleted,
    });
  } catch (err) {
    console.log('submitTask error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit task' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).lean();
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const rows = await ChallengeProgress.find({ challengeId: challenge._id })
      .populate('userId', 'name avatarUrl')
      .sort({ totalPoints: -1, joinedAt: 1, _id: 1 })
      .lean();

    const cleaned = rows.map((r, idx) => ({
      rank: idx + 1,
      userId: r.userId?._id || r.userId,
      name: r.userId?.name || 'Anonymous',
      avatarUrl: r.userId?.avatarUrl || null,
      totalPoints: r.totalPoints || 0,
      joinedAt: r.joinedAt,
      allCompleted: !!r.allCompleted,
    }));

    const top10 = cleaned.slice(0, 10);
    const meIndex = cleaned.findIndex(
      (row) => String(row.userId) === String(req.user.userId)
    );
    const currentUser = meIndex >= 0 ? cleaned[meIndex] : null;

    res.status(200).json({ top10, currentUser, total: cleaned.length });
  } catch (err) {
    console.log('getLeaderboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load leaderboard' });
  }
};

exports.getAdminChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .sort({ startDate: -1, createdAt: -1 })
      .lean({ virtuals: true });
    res.status(200).json(challenges);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load challenges' });
  }
};

exports._helpers = {
  durationDaysOf,
  dayIndexForNow,
  unlockAtFor,
  expiresAtFor,
  buildDailySlots,
  attachUserSubmission,
  recomputeTotals,
};
