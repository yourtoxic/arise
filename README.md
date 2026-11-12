# ARISE

A productivity, discipline and activity app for Linux, styled like a game "System" interface.
Turn real tasks into quests, earn XP, level up, and recover fairly when you miss a deadline.

> **Unofficial fan project.** ARISE is inspired by the anime and manhwa *Solo Leveling*.
> It is not affiliated with or endorsed by its creators or publishers.
> All rights to *Solo Leveling* belong to their owners. No official art, music or logos are included.

<!-- Add a screenshot: put it at docs/screenshot.png, then uncomment -->
<!-- ![ARISE dashboard](docs/screenshot.png) -->

## Why ARISE

- Rewards consistency and real progress, not busyness
- Fair penalties: capped, visible, reversible, never harmful
- Easy restart after a bad day, no shaming
- Everything stays on your computer. No account, no tracking

## Features

| Area | What it does |
| --- | --- |
| Dashboard | Rank badge, level, XP bar, HP / MP / Stamina, five stats, daily quests, system messages |
| Quests | Priority, due time, repeat daily or weekly, subtasks, "Start for 5 min" button |
| Calendar | Month view, per-day details, add quests to any day, rest days marked |
| Status | 7-day planned vs cleared chart, focus chart, activity log, XP ledger |
| Skills | Learning tracker with session logs and revision reminders |
| Shadow Army | Focus timer ("dungeon"), unlocks shadow soldiers by total focus time. Each gives a small passive bonus |
| Puzzle | Dual N-Back, Nonograms (pixel art collection), Sudoku / Killer / Wordoku, Logic Grid, Block Puzzle. Daily challenges, saved progress, capped XP |
| Inventory | Badges for milestones |
| AI Coach | Optional. Breaks a task into steps, reviews your week. Suggestions only |
| Profile | Name, goal, avatar, rank title, lifetime totals |
| Guide | In-app instructions |
| Settings | Penalty config, rest days, reminders, data export and import |

### Fair penalty system

1. Deadline passes, then a grace period (default 30 min)
2. Neutral message: "Task overdue, choose your next step"
3. You choose: done late, reschedule, drop, or not done with an optional reason
4. Illness and emergency reasons give no penalty
5. At most one penalty per task, with daily and weekly XP caps
6. Every penalty comes with a recovery step. Finish it and the penalty is resolved
7. Wrong penalty? Appeal it. The reversal is logged

Penalties only ever cost XP and add a recovery task. Nothing else. All values are configurable.

### Stats and meters

- **HP**: discipline. Drops with penalties this week
- **MP**: focus minutes today out of 60
- **Stamina**: workout and water logged today
- **STR / AGI / INT / VIT / PER**: workouts, habits, quests and skills, water and recoveries, focus

Activity and wellness numbers are manual personal tracking, not medical advice.

## Install

### Download (recommended)

Get the latest build from the [Releases](../../releases) page.

**AppImage** (updates itself):
```bash
mkdir -p ~/Applications
mv ~/Downloads/ARISE-*.AppImage ~/Applications/
chmod +x ~/Applications/ARISE-*.AppImage
~/Applications/ARISE-*.AppImage
```
If it does not start: `sudo apt install libfuse2t64` (Ubuntu 24.04 and newer) or `libfuse2` (older).

**Debian package** (Ubuntu, Debian and derivatives):
```bash
sudo dpkg -i ~/Downloads/arise_*_amd64.deb
sudo apt -f install   # only if dependencies are missing
```
The package fixes the Chromium sandbox permission automatically after install.

### Build from source

Requirements: Node.js 20+ and npm, Git.

```bash
git clone https://github.com/yourtoxic/arise.git
cd arise
npm install
npm start
```

If you see a `chrome-sandbox` error when running from source:
```bash
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

Build packages:
```bash
npm run build:deb               # .deb only
npx electron-builder --linux    # AppImage and .deb, per package.json
```
Output goes to `dist/`.

## Your data

- Stored locally in `~/.config/arise/arise.json`
- Back up with Settings, then Export data. Restore with Import data
- Updating the app never deletes your data

## AI coach (optional)

- Off until you add your own Anthropic API key
- Data is sent only when you press a coach button: quest titles, priorities, due dates and counts
- The key is stored in `~/.config/arise/arise-key.json` with owner-only permissions. It is **plain text**, so use a key with a spending limit
- The coach never changes your quests on its own. You approve every change
- Skip it and the app works fully offline

## Project layout

```
main.js            Electron main process, file storage, AI coach request
preload.js         Safe bridge between main and page
renderer/
  index.html       Page shell
  style.css        Design system
  app.js           All screens and logic
build/             Icon and install scripts
```

## Contributing

Contributions are welcome. Small, focused pull requests are easiest to review.

1. Fork the repo and create a branch: `git checkout -b feature-name`
2. Make your change and test it with `npm start`
3. Check syntax: `node --check renderer/app.js`
4. Commit with a clear message and open a pull request

Guidelines:

- Keep the penalty system non-harmful: no shaming, no real-world punishments
- Do not rename existing saved fields. Add new fields with defaults so old saves keep working
- Do not add official *Solo Leveling* assets
- No telemetry or network calls without clear opt-in

Ideas: sound effects, bundled font, translations (Bangla and others), more activity types, accessibility improvements.

## Releasing (maintainers)

```bash
npm version minor        # or patch for small fixes
git push --follow-tags
```
GitHub Actions builds the packages and publishes a Release. The AppImage updates itself from it.

## License

[MIT](LICENSE) for the code in this repository. This does not cover *Solo Leveling* or any of its characters, names or artwork.
