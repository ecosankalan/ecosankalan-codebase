const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const uploadChallengeProof = require('../middleware/uploadChallengeProof');
const challengeController = require('../controllers/challengeController');

const router = express.Router();

router.post('/', protect, authorize('admin'), challengeController.createChallenge);
router.put('/:id', protect, authorize('admin'), challengeController.updateChallenge);
router.delete('/:id', protect, authorize('admin'), challengeController.deleteChallenge);
router.get('/admin', protect, authorize('admin'), challengeController.getAdminChallenges);

router.post('/:id/join', protect, challengeController.joinChallenge);
router.get('/active', protect, challengeController.getActiveChallenges);
router.get('/:id', protect, challengeController.getChallengeById);
router.post(
  '/:id/submit',
  protect,
  uploadChallengeProof,
  challengeController.submitTask
);
router.get('/:id/leaderboard', protect, challengeController.getLeaderboard);

module.exports = router;
