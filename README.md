# URC Games 2026 Pickleball

Phone/iPad scoring and a three-court monitor for November 28–29, 2026. The host's adult and junior posters supply the fixtures. The organizer confirmed the junior final at **1:30 PM Sunday**, best-of-three semifinals/finals, win by two with no cap, and traditional scoring by default.

## Event and rules

23 doubles teams: 18 adult (17+) and five junior (11–13). There are 37 opening matches and 18 playoffs, 55 total. Each adult team plays three opening matches; each junior team plays all four opponents. Adult top 16 and junior top four advance. Adult round of 16 and quarterfinals use one game to 15. Opening matches use one game to 11; semifinals and finals are best of three to 11.

Admin > Setup selects traditional or rally scoring. This setting applies to unstarted matches; a started match keeps its scoring mode. Traditional scoring opens at 0–0–2: only the serving side scores, with first/second servers and side-outs tracked automatically. Tap **+ Rally won** for the team that won the rally, including rallies that change service without awarding a point. Tap **− Correct** to remove that side's last current-game rally and replay service/score. For a wrong-team entry, correct it before recording the right winner. Rally mode awards a point on every rally and uses a single server per service turn. Source: [USA Pickleball official rules](https://usapickleball.org/docs/rules/USAP-Official-Rulebook.pdf).

The scorer selects the coin toss winner, first serving team, first server and receiver at match start. Review scores before starting another game or confirming the result. Match details preserve rally and correction history. Service tracking reflects recorded rallies; it cannot detect an on-court positioning error.

## Game day

- Viewers need no login: `/` has schedule, standings and brackets; `/matches/1` shows match details.
- `/scorekeeper` signs in court1, court2 or court3. Passwords are server environment values, with no fallback passwords in source.
- Each scorer may select **any ready unplayed match**, regardless of its scheduled court. Starting it assigns it to that scorer's court. An occupied court or player already playing is blocked. Signing in on a new device transfers that court's session.
- Cancel an accidental start before scoring, or ask Admin to reset/reopen a match with a reason. Demo reset clears all scoring; download a backup first.
- Admin > Rankings confirms each division's full seed order. To open playoffs before round robin ends, select the override and enter a reason. Existing results remain intact. Later results do not change confirmed seeds. Started playoff matches protect the bracket from incompatible reseeding.
- `/display` fits all three courts together on a landscape monitor, including 1024×768. Court 3 is available for flexible assignment even though the posters plan Courts 1–2.

**Schedule conflict:** Sunday's junior final and adult semifinal are both planned on Court 1 at 1:30 PM. The confirmed junior time is preserved. The host should move one match to another free court or delay it. Planned time clashes are advisory; actual simultaneous court/player conflicts are enforced at match start.

Player identity keys prevent simultaneous play across teams. The posters contain several people called Arif and Abid; ambiguous duplicates have separate team-specific identity keys because some play simultaneously. Admin should review these identities before play. Display names can be corrected without changing scores; identity keys lock after a team's first match.

## Run and verify

Requires Node.js 22.9+ and npm.

```sh
npm ci
npm run setup:local
npm run dev
npm test
npm run lint
npm run build
```

Setup creates an ignored private `.env.local`, generates an admin password, and configures the requested court passwords. Existing configuration is preserved. Never commit passwords or database URLs.

Local storage uses `.data/event.json`, a shared lock and atomic file replacement. On crash recovery, stop all app processes before removing a stale `.data/event.lock`; preserve event.json. Separate hosts must share PostgreSQL.

For Vercel, configure DATABASE_URL, ADMIN_PASSWORD, AUTH_SECRET (32+ random characters), and COURT1_PASSWORD through COURT3_PASSWORD. Quote passwords containing `#` in local env files. Run `npm run event:db` to create the EventDocument table if missing. Production refuses local-file fallback. The linked GitHub main branch deploys to the existing Vercel project.

PostgreSQL writes lock the event row in a transaction. Match versions reject stale updates, request IDs prevent duplicate taps, and server authorization controls all mutations. Views poll every 10 seconds; scorers every three seconds, pausing hidden tabs. Offline scoring is disabled until the saved state can be refreshed. Dashboard queries omit bulky histories inside PostgreSQL; details load one match.

## Badminton archive and backups

Pickleball uses a separate EventDocument key, `urc-pickleball-2026`. The completed badminton event remains under `urc-2026`; switching the active app does not rewrite its results. Legacy badminton fixtures and regression tests remain in source.

Before conversion, a full custom-format PostgreSQL dump and a readable JSON export of every public table were saved locally with SHA-256 files. The badminton event contains 20 teams and 51 confirmed matches. Preserve these private backups outside Git.

For routine pickleball backup, use Admin's Download backup. This includes event results/history and clears device sessions; passwords stay in environment configuration. For a database restore, first back up the current database and restore into a separate database, validate both event keys and counts, then deliberately switch the database connection. Do not restore the old full dump over live pickleball results. The custom dump is inspectable with `pg_restore --list`; restoring schema/data needs a compatible PostgreSQL server and credentials. The readable export has tables containing `{row: ...}` entries, including EventDocument id/data.

This app does not implement registration, payments, automatic walkovers, or offline synchronization.
