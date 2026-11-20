# 🎵 flenzo Music Bot

<img align="right" src="https://i.ibb.co/bRHnZjrb/1795155314.png" width="260" alt="Flenzo">

> A powerful, feature-rich Discord music bot built with **discord.js v14**, **lavalink-client**, and **Components V2 (CV2)**.
> 
> **Developer:** Yadav  
> **Support:** Dm 'ofcyouryadav' in discord  
> 💸 If you want to donate and help the developer here is the ltc : ``LVUmL7ynaGrDPmH4TGochgowzirhQP9ceE``

<br clear="right">

---

## ✨ Features

- 🎨 **Components V2 (CV2)** — All commands use `ContainerBuilder` + `MessageFlags.IsComponentsV2`
- 🖼️ **Canvas Music Card** — Dynamic color-extracted now-playing cards
- 🎵 **Multi-Source Search** — Spotify, YouTube, YT Music, SoundCloud, Deezer, Apple Music
- 👑 **Premium System** — Per-command `premium: true/false` flag, easy to manage
- 🔒 **Voice Channel Status** — Live "now playing" status in VC
- 🔄 **24/7 Mode** — Bot stays in VC with rotating idle statuses
- 🛡️ **allowedMentions** — All responses protected from `@everyone` / `@here` pings
- ⚡ **Slash + Prefix** — Both command types supported
- 🎛️ **Audio Filters** — Bass boost, Nightcore, 8D, Vaporwave, Karaoke, Tremolo, Vibrato

---

## 📁 Project Structure

```
flenzo-bot/
├── src/
│   ├── index.js                    ← Entry point
│   ├── config.js                   ← All configuration
│   ├── client/
│   │   └── flenzoClient.js          ← Extended Discord client
│   ├── handlers/
│   │   ├── commandHandler.js       ← Prefix command loader
│   │   ├── slashHandler.js         ← Slash command loader + registrar
│   │   └── eventHandler.js         ← Event loader
│   ├── events/
│   │   ├── client/
│   │   │   ├── ready.js
│   │   │   ├── messageCreate.js    ← Prefix handler + premium check
│   │   │   ├── interactionCreate.js← Slash handler + premium check
│   │   │   └── voiceStateUpdate.js
│   │   └── lavalink/
│   │       ├── trackStart.js       ← Canvas card + now playing message
│   │       ├── trackEnd.js
│   │       ├── queueEnd.js
│   │       ├── trackError.js
│   │       ├── nodeReady.js
│   │       ├── nodeDisconnect.js
│   │       └── playerButtons.js    ← Button interaction handler
│   ├── commands/
│   │   ├── music/                  ← All music prefix commands
│   │   ├── owner/                  ← Owner-only commands
│   │   └── info/                   ← Info commands
│   ├── slashCommands/
│   │   └── music/                  ← All music slash commands
│   ├── utils/
│   │   ├── cv2.js                  ← CV2 helpers
│   │   ├── musicCard.js            ← Canvas card generator
│   │   ├── voiceStatus.js          ← Voice channel status manager
│   │   ├── premium.js              ← Premium check helpers
│   │   └── formatTime.js
│   └── database/
│       └── schemas/
│           ├── Premium.js
│           └── Guild.js
├── assets/
│   └── fonts/
│       ├── bold.ttf                ← Add your font here
│       └── regular.ttf             ← Add your font here
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Setup

### 1. Clone & Install

```bash
git clone https://github.com/ofcyouryadav/Flenzo-music-version
cd flenzo-bot
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
TOKEN=your_bot_token
MONGO_URI=your_mongodb_uri
CLIENT_ID=your_bot_client_id
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
```

### 3. Lavalink Setup

Download Lavalink from [github.com/lavalink-devs/Lavalink](https://github.com/lavalink-devs/Lavalink)

Create `application.yml`:
```yaml
server:
  port: 2333
  address: 0.0.0.0
lavalink:
  server:
    password: "youshallnotpass"
    sources:
      youtube: true
      soundcloud: true
      spotify: true
```

Run: `java -jar Lavalink.jar`

### 4. Fonts

Add fonts to `assets/fonts/`:
- `bold.ttf` — Bold font for card title
- `regular.ttf` — Regular font for card details

Any free fonts work (e.g. Montserrat, Poppins, Inter).

### 5. Owner Setup

In `src/config.js`, add your Discord user ID:
```js
owners: ["YOUR_DISCORD_ID"],
```

### 6. Start

```bash
npm start
# or
npm run dev  # with nodemon
```

---

## 🎵 Commands

### Music (Prefix + Slash)

| Command | Premium | Description |
|---------|---------|-------------|
| `play` | ❌ | Play a song by name or URL |
| `search` | ❌ | Search from 6 sources |
| `pause` | ❌ | Pause playback |
| `resume` | ❌ | Resume playback |
| `skip` | ❌ | Skip current song |
| `previous` | ❌ | Play previous song |
| `stop` | ❌ | Stop and disconnect |
| `queue` | ❌ | Show queue |
| `volume` | ❌ | Set volume |
| `loop` | ❌ | Set loop mode |
| `shuffle` | ❌ | Shuffle queue |
| `clear` | ❌ | Clear queue |
| `remove` | ❌ | Remove from queue |
| `autoplay` | ❌ | Toggle autoplay |
| `nowplaying` | 👑 | Show now playing card |
| `seek` | 👑 | Seek to position |
| `filter` | 👑 | Apply audio filters |
| `247` | 👑 | Toggle 24/7 mode |
| `grab` | 👑 | DM song info |

### Info

| Command | Description |
|---------|-------------|
| `help` | Show help menu |
| `ping` | Check latency |
| `stats` | Bot statistics |

### Owner Only

| Command | Description |
|---------|-------------|
| `premium add @user [days] [plan]` | Grant premium |
| `premium remove @user` | Revoke premium |
| `premium info @user` | Check premium status |
| `eval <code>` | Execute JS code |
| `restart` | Restart the bot |

---

## 👑 Premium System

Premium is per-command via the `premium` flag:

```js
module.exports = {
  name: "seek",
  premium: true,  // ← true = requires premium, false = free
  // ...
};
```

**To make a command premium:** Set `premium: true`  
**To remove premium:** Set `premium: false`

Grant premium to a user:
```
.premium add @user 30 pro      → 30 days pro plan
.premium add @user             → Lifetime
.premium remove @user          → Revoke
```

---

## 🎨 CV2 Pattern

Every response uses:
```js
const { cv2 } = require("../../utils/cv2");

// Simple text
message.reply(cv2("Your message here"));

// Custom container
const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");

message.reply({
  components: [
    new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Hello!")
      )
  ],
  flags: MessageFlags.IsComponentsV2,
  allowedMentions: { parse: [] },
});
```

---

## 📝 License

Built by **Yadav** — for support Dm 'ofcyouryadav' in discord

🤝 Use it freely just give a small credit to the developer
