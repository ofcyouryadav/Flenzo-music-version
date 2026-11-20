/** @format - flenzo — Blacklist (owner only) */
const { cv2 } = require("../../utils/cv2");
const mongoose = require("mongoose");
const blSchema = new mongoose.Schema({ userId: { type: String, unique: true } });
const Blacklist = mongoose.models.flenzoBlacklist || mongoose.model("flenzoBlacklist", blSchema);

module.exports = {
  name: "blacklist", aliases: ["bl"],
  description: "Blacklist a user from using the bot",
  category: "owner", cooldown: 0, premium: false, ownerOnly: true,
  async execute(client, message, args) {
    const sub = (args[0] || "").toLowerCase();
    const target = message.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);

    if (sub === "add") {
      if (!target) return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Mention a user.**`)).catch(() => { });
      if (client.isOwner(target.id)) return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Can't blacklist an owner.**`)).catch(() => { });
      await Blacklist.findOneAndUpdate({ userId: target.id }, { userId: target.id }, { upsert: true });
      client.blacklist = client.blacklist || new Set();
      client.blacklist.add(target.id);
      return message.reply(cv2(`<a:karma_TICK:1484879254306164826> **${target.tag} blacklisted.**`)).catch(() => { });
    }
    if (sub === "remove") {
      if (!target) return message.reply(cv2(`<a:karma_wrong_time:1484885465944559616> **Mention a user.**`)).catch(() => { });
      await Blacklist.deleteOne({ userId: target.id });
      client.blacklist?.delete(target.id);
      return message.reply(cv2(`<a:karma_TICK:1484879254306164826> **${target.tag} removed from blacklist.**`)).catch(() => { });
    }
    if (sub === "list") {
      const list = await Blacklist.find();
      return message.reply(cv2(
        `**Blacklisted Users — ${list.length}**\n${list.map((b, i) => `> \`${i + 1}.\` <@${b.userId}> \`${b.userId}\``).join("\n") || "> None"}`
      )).catch(() => { });
    }
    return message.reply(cv2(`**Usage:** \`.blacklist add/remove/list @user\``)).catch(() => { });
  },
};

