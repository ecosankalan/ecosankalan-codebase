const User = require("../models/User");

const {
  sendMulticastNotification,
  pruneInvalidTokens,
} = require("./notification.js");

class NotificationService {

  static async challengeCreated(challenge) {

    const tokens = await this.getAllTokens();

    const result = await sendMulticastNotification({
      tokens,
      title: "New Challenge is live🔥",
      body: `${challenge.title} is now live!`,
      data: {
        type: "challenge",
        challengeId: challenge._id.toString(),
        url: `/challenge/${challenge._id}`,
      },
    });

    await pruneInvalidTokens(result?.invalidTokens);

    return result;

  }

  static async quizCreated(quiz) {

    const tokens = await this.getAllTokens();

    return sendMulticastNotification({
      tokens,
      title: "📝 New Quiz",
      body: `${quiz.title} is now available.`,
      data: {
        type: "quiz",
        quizId: quiz._id.toString(),
        url: `/quiz/${quiz._id}`,
      },
    });

  }

  static async rewardEarned(user, reward) {

    if (!user.fcmTokens?.length) return;

    return sendMulticastNotification({
      tokens: user.fcmTokens.map(t => t.token),
      title: "🎉 Reward Unlocked",
      body: `You earned ${reward.points} Green Points!`,
      data: {
        type: "reward",
        rewardId: reward._id.toString(),
      },
    });

  }

  static async levelUnlocked(user, level) {

    if (!user.fcmTokens?.length) return;

    return sendMulticastNotification({
      tokens: user.fcmTokens.map(t => t.token),
      title: "🚀 Level Up!",
      body: `Congratulations! You reached Level ${level}.`,
      data: {
        type: "level",
        level: level.toString(),
      },
    });

  }

  static async getAllTokens() {

    const users = await User.find(
      {},
      {
        fcmTokens: 1,
      }
    );

    return users.flatMap(user =>
      (user.fcmTokens || []).map(t => t.token)
    );

  }

}

module.exports = NotificationService;