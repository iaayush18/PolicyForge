const crypto = require('crypto');

const getUserSecret = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing");
  }

  return crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(userId.toString())
    .digest('hex');
};

module.exports = { getUserSecret };
