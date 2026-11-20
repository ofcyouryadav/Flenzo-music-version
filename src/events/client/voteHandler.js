/** @format
 * flenzo Music Bot — top.gg Vote Webhook Handler
 * Developer: Yadav
 */

const express        = require("express");
const { sendVoteLog } = require("../../utils/voteLogger");

const PORT = 3000;

module.exports = {
  name: "voteHandler",

  execute(client) {
    const app = express();
    app.use(express.json());

    app.post("/vote", async (req, res) => {
      const { user, type } = req.body;

      if (type === "test") {
        console.log("[VoteHandler] Test vote received.");
        return res.status(200).json({ success: true });
      }

      if (!user) return res.status(400).json({ error: "No user ID" });

      res.status(200).json({ success: true });

      await sendVoteLog(client, user);

      // DM the voter
      try {
        const member = await client.users.fetch(user).catch(() => null);
        if (member) {
          await member.send([
            `### 💜 Thanks for voting for flenzo!`,
            ``,
            `> You can vote again in **12 hours**.`,
            `> Your support means a lot — thank you!`,
            ``,
            `-# Vote again: https://top.gg/bot/${client.user.id}/vote`,
          ].join("\n")).catch(() => {});
        }
      } catch {}
    });

    app.listen(PORT, () => {
      console.log(`[VoteHandler] Listening on port ${PORT}`);
    });
  },
};