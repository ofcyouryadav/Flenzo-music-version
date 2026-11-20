/** @format - flenzo Music Bot — Premium Utils */
const Premium = require("../database/schemas/Premium");

const isPremium = async (userId) => {
  const doc = await Premium.findOne({ userId }).catch(() => null);
  return doc ? doc.isActive() : false;
};

const getPremiumInfo = async (userId) => Premium.findOne({ userId }).catch(() => null);

const grantPremium = async (userId, addedBy, days = null) => {
  const expiresAt = days ? new Date(Date.now() + days * 86400000) : null;
  return Premium.findOneAndUpdate(
    { userId },
    { userId, addedBy, expiresAt, addedAt: new Date() },
    { upsert: true, new: true }
  );
};

const revokePremium = async (userId) => Premium.deleteOne({ userId });

const hasNoPrefix = async (userId) => {
  const doc = await Premium.findOne({ userId }).catch(() => null);
  return doc?.noprefix === true && doc.isActive();
};

const setNoPrefix = async (userId, value) => {
  return Premium.findOneAndUpdate(
    { userId },
    { $set: { noprefix: value } },
    { upsert: true, new: true }
  );
};

module.exports = { isPremium, getPremiumInfo, grantPremium, revokePremium, hasNoPrefix, setNoPrefix };
