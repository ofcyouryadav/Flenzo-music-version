/** @format - flenzo Music Bot — Premium Schema */
const mongoose = require("mongoose");

const premiumSchema = new mongoose.Schema({
  userId:    { type: String, required: true, unique: true },
  expiresAt: { type: Date, default: null },
  addedBy:   { type: String, default: null },
  addedAt:   { type: Date, default: Date.now },
  noprefix:  { type: Boolean, default: false },
});

premiumSchema.methods.isActive = function () {
  if (!this.expiresAt) return true;
  return new Date() < this.expiresAt;
};

module.exports = mongoose.model("flenzoPremium", premiumSchema);
