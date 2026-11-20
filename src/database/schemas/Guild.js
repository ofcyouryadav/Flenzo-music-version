/** @format - flenzo Music Bot — Guild Schema */
const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  guildId:      { type: String, required: true, unique: true },
  prefix:       { type: String, default: "." },
  djRole:       { type: String, default: null },
  volume:       { type: Number, default: 100 },
  is247:        { type: Boolean, default: false },
  textId:       { type: String, default: null },
  voiceId:      { type: String, default: null },
  noprefix:     { type: Boolean, default: false },  // guild-wide noprefix
  logChannel:   { type: String, default: null },
});

module.exports = mongoose.model("flenzoGuild", guildSchema);

