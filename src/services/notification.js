const { messaging } = require("../config/firebase.js");
const User = require("../models/User");

const INVALID_TOKEN_ERRORS = [
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/not-authorized",
];

const sendNotification = async ({ token, title, body, data = {} }) => {
  const message = {
    token,
    notification: { title, body },
    data,
  };

  const response = await messaging.send(message);
  return response;
};

const sendMulticastNotification = async ({
  tokens,
  title,
  body,
  data = {},
}) => {

  if (!tokens.length) return { successCount: 0, failureCount: 0, invalidTokens: [] };

  const message = {
    tokens,
    notification: { title, body },
    data,
  };
 

  const response = await messaging.sendEachForMulticast(message);
  const invalidTokens = [];
  console.dir(response.responses, { depth: null });
  if (response.responses) {
    response.responses.forEach((resp, idx) => {
     
      if (
        resp.error &&
        INVALID_TOKEN_ERRORS.includes(resp.error.code)
      ) {
        invalidTokens.push(tokens[idx]);
      }
    });
  }

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    invalidTokens,
  };
};

const sendToTopic = async ({ topic, title, body, data = {} }) => {
  const message = {
    topic,
    notification: { title, body },
    data,
  };

  const response = await messaging.send(message);
  return response;
};

const pruneInvalidTokens = async (invalidTokens = []) => {
  if (!invalidTokens.length) return;

  await User.updateMany(
    { "fcmTokens.token": { $in: invalidTokens } },
    { $pull: { fcmTokens: { token: { $in: invalidTokens } } } }
  );
};

const subscribeToTopic = async ({ tokens, topic }) => {
  const response = await messaging.subscribeToTopic(tokens, topic);
  return response;
};

const unsubscribeFromTopic = async ({ tokens, topic }) => {
  const response = await messaging.unsubscribeFromTopic(tokens, topic);
  return response;
};

module.exports = {
  sendNotification,
  sendMulticastNotification,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  pruneInvalidTokens,
};