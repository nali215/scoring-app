# URC Southwest Badminton 2026

A phone/iPad scoring app and a dedicated three-court monitor display for November 26, 2026.

## Source and event setup

The event starts as an unpublished draft: 21 teams, 36 opening matches, 17 knockouts, three courts. data/urc-2026.json follows the workbook's **MASTER SCHEDULE**, including match 39 on Court 1, match 40 on Court 2, and match 41 on Court 3. Posters provide visual direction only. Source team numbers are stable IDs, not playoff rankings. Registration contact details are not imported.

Enter the venue, review player identities, and confirm the rules before publishing. The source has one game to 21 for opening rounds and best of three to 21 for knockouts. Win-by-two and a 30-point cap are proposed editable defaults. Suggested rankings use wins, point difference, then points scored; an organizer must resolve remaining ties and confirm seeds.

Player identity keys link the same player across divisions to prevent concurrent matches. Review short-name aliases before play. Sohil.M and Sohil.P remain distinct.

## Run locally

Requires Node.js 22.9+ and npm.

```sh
npm install
npm run setup:local
npm run dev
```

Setup creates a private ignored .env.local and prints a generated organizer password. It never overwrites existing configuration. If already configured, ADMIN_PASSWORD is in that file.

Three scorer accounts are configured by local setup as requested:
- court1 / Court1!
- court2 / Court2!
- court3 / Court3!

Passwords are server environment values, never client-side checks. Viewers need no account. Each scorer account is restricted to its own court. Signing in transfers that court's session to the new device and invalidates the old session. Organizers can assign a scorer name, disable a court account, or end an active session.

Routes:
- / — view-only schedule, court status, standings and knockouts
- /admin — organizer dashboard
- /scorekeeper — scorer sign-in
- /display — full-screen, three-court monitor board
- /matches/1 — match detail and rally history (match numbers 1–53)

Local storage uses .data/event.json with a process-shared lock and atomic replacement. It survives restarts. Use one host with persistent disk; separate hosts must share PostgreSQL, not separate files.

## Hosting

Set DATABASE_URL, ADMIN_PASSWORD, AUTH_SECRET (32+ random characters), COURT1_PASSWORD, COURT2_PASSWORD, and COURT3_PASSWORD. The requested scorer passwords must be configured explicitly; the server has no fallback passwords.

```sh
npm run event:db
npm run build
```

event:db creates EventDocument if missing without resetting data. It loads .env.local if present and otherwise uses normal hosting environment variables. Hosted scoring uses PostgreSQL transactions and row locks. Vercel refuses local-file fallback. Database connectivity and multi-device operation must be verified on the actual hosting environment before event day. This change does not deploy the app.

Local production-mode preview is supported with ALLOW_LOCAL_STORAGE=true:
```sh
npm run build
npm start
```

## Game-day workflow

1. Organizer reviews Setup, enters venue, checks in teams, and assigns scorer names.
2. Publish the reviewed event. Players use the public schedule; scorers sign in with their assigned court account.
3. Select an eligible match. Choose the first serving team, first server, and first receiver.
4. Tap + for the rally-winning team. The app updates the score, server, receiver, and service court automatically.
5. For a wrong-team entry, tap − on that team, then + on the correct team. − removes that team's most recent current-game point and recalculates service. Scores cannot go below zero.
6. At game completion, review the score. For another game, choose its first server and receiver and tap Start game. At match completion, confirm the final result.
7. Viewers can open any match to see the first serve, every recorded rally, service changes, and corrections. Earlier log entries are retained as originally recorded.
8. After round robin, finalize each division's complete ranking. Men's top eight advance; rank nine is eliminated. Confirmed winners advance automatically.
9. Finals run in master-schedule order: Legends, Men's, Mixed, consecutively on Court 1.

Doubles service tracking follows the service-court/order model in BWF Laws 11.1–11.4: even scores serve from the right, odd from the left; a serving-side win swaps that pair's service courts, while a receiving-side win transfers service without swapping either pair. This is a guide to the recorded match, not detection of on-court service errors. Source: https://system.bwfbadminton.com/documents/folder_1_81/Statutes/CHAPTER-4---RULES-OF-THE-GAME/Section%204.1-%20Laws%20of%20Badminton%20-%2019052018A.pdf

## Monitor and mobile use

/display uses the full viewport and always shows three courts together on landscape monitors. Scores, teams, and server are large; dashboard navigation and setup controls are omitted. Tested target sizes include 1024×768 and 1280×720. Use browser full-screen mode for the largest available area. Before play, each court shows its next scheduled match.

Phone schedules use cards rather than sideways tables. Scorer controls are large touch targets. The app polls every three seconds. On a network failure, scoring is disabled until the saved state is refreshed. It does not queue offline points.

## Corrections and safeguards

Only organizers can reopen confirmed results, with a reason. Then use the scorer's −/+ controls on the current game and reconfirm. A correction is rejected if it would imply rallies after a game should already have ended; remove the most recent winning point first. Review each game before starting the next one, because normal score corrections target the current game.

Started downstream playoff matches protect the bracket. Correct downstream results first. Round-robin result corrections require clearing seeds; clearing seeds is blocked after knockouts start. Reopening an unconsumed knockout result clears its downstream winner assignment.

Schedule edits are allowed only before play starts. Overlap checks use 20-minute opening matches and 40-minute knockouts. TBA times remain TBA. Shared-player and court conflicts are checked again when starting a match.

Stale score updates are rejected by match version, and request IDs deduplicate repeats. API authorization is enforced server-side. Organizer sessions expire; scorer sessions expire and are revocable. Retired prototype roster/live-score endpoints return 410.

## Backup and recovery

Download Backup from Admin regularly. It contains the complete event and audit log but clears device sessions. Credentials remain in server configuration, not backups.

To restore locally, stop all app processes, preserve the current .data/event.json separately, validate the backup's schema and event identity, and copy the backup to .data/event.json. Restart and have scorers sign in again. For hosting, use database backups and a controlled restore.

A killed local process can leave .data/event.lock. Stop all app processes before removing only that stale lock directory. Preserve event.json. Never remove an active writer's lock.

## Checks and scope

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

Coverage includes source counts/assignments, all 53 matches, seeding, service rotation, wrong-team corrections, authorization, session transfer, persistence, concurrency, and revocation.

This workflow is scoped to the supplied URC event. It does not implement general tournament creation, player registration/payments, walkover adjudication, or offline score syncing.
