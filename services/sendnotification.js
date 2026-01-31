import admin from "../config/firebase.js";

export const sendPush = async ({ token, title, body, data = {} }) => {
  if (!token) {
    throw new Error("FCM token is missing");
  }

  const message = {
    token: token.trim(),
    notification: {
      title,
      body,
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)]),
    ),
  };

  return await admin.messaging().send(message);
};

export const sendToTopic = async ({ topic, title, body, data = {} }) => {
  const message = {
    topic,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)]),
    ),
  };

  return await admin.messaging().send(message);
};
