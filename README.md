# URC Games 2026 Pickleball

Phone/iPad scoring and an adaptive court monitor for November 28–29, 2026. The host's adult and junior posters supply the fixtures. The organizer confirmed the junior final at **1:30 PM Sunday**, best-of-three semifinals/finals, win by two with no cap, and traditional scoring by default.

## Event and rules

The original Adult/Youth fixture has 23 doubles teams: 18 adult (17+) and five junior (11–13). Their original fixture has 37 opening matches and 18 playoffs, 55 total. Mixed Doubles adds 13 teams and 33 matches; see the import notes below. Each adult team plays three opening matches; each junior team plays all four opponents. Adult top 16 and junior top four advance. Adult round of 16 and quarterfinals use one game to 15. Opening matches use one game to 11; semifinals and finals are best of three to 11.

Admin > Setup selects traditional or rally scoring. This setting applies to unstarted matches; a started match keeps its scoring mode. Traditional scoring opens at 0–0–2: only the serving side scores, with first/second servers and side-outs tracked automatically. Tap **+ Rally won** for the team that won the rally, including rallies that change service without awarding a point. Tap **− Correct** to remove that side's last current-game rally and replay service/score. For a wrong-team entry, correct it before recording the right winner. Rally mode awards a point on every rally and uses a single server per service turn. Source: [USA Pickleball official rules](https://usapickleball.org/docs/rules/USAP-Official-Rulebook.pdf).

The scorer selects the coin toss winner, first serving team, first server and receiver at match start. Review scores before starting another game or confirming the result. Match details preserve rally and correction history. Service tracking reflects recorded rallies; it cannot detect an on-court positioning error.

## Game day

- Viewers need no login: `/` has schedule, standings and brackets; `/matches/1` shows match details.
- `/scorekeeper` signs in court1, court2 or court3. Passwords are server environment values, with no fallback passwords in source.
- Each scorer may select **any ready unplayed match**, regardless of its scheduled court. Starting it assigns it to that scorer's court. An occupied court or player already playing is blocked. Signing in on a new device transfers that court's session.
- Cancel an accidental start before scoring, or ask Admin to reset/reopen a match with a reason. Demo reset clears all scoring; download a backup first.
- Admin > Rankings confirms each division's full seed order. To open playoffs before round robin ends, select the override and enter a reason. Existing results remain intact. Later results do not change confirmed seeds. Started playoff matches protect the bracket from incompatible reseeding.
- `/display` fits all three courts together on a landscape monitor, including 1024×768. It shows only configured courts and resizes when courts are added. The base fixture starts with Courts 1–2; the host has enabled Court 3 in the live database. Admin > Scorers can add extra physical courts (up to eight) with a chosen username and password, or update an existing court’s credentials. Adding a court updates scoring, scheduling, filters and the monitor. Usernames are unique and case-insensitive; passwords need at least six characters. Passwords are hashed with salted scrypt in PostgreSQL and never returned by dashboard APIs. Changing credentials ends that court’s current session. The original Court 1–2 credentials remain in server environment configuration until overridden in Admin.

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

For Vercel, configure DATABASE_URL, ADMIN_PASSWORD, AUTH_SECRET (32+ random characters), and COURT1_PASSWORD and COURT2_PASSWORD. Quote passwords containing `#` in local env files. Run `npm run event:db` to create the EventDocument table if missing. Production refuses local-file fallback. The linked GitHub main branch deploys to the existing Vercel project.

PostgreSQL writes lock the event row in a transaction. Match versions reject stale updates, request IDs prevent duplicate taps, and server authorization controls all mutations. Views poll every 10 seconds; scorers every three seconds, pausing hidden tabs. Offline scoring is disabled until the saved state can be refreshed. Dashboard queries omit bulky histories inside PostgreSQL; details load one match.

## Badminton archive and backups

Pickleball uses a separate EventDocument key, `urc-pickleball-2026`. The completed badminton event remains under `urc-2026`; switching the active app does not rewrite its results. Legacy badminton fixtures and regression tests remain in source.

Before conversion, a full custom-format PostgreSQL dump and a readable JSON export of every public table were saved locally with SHA-256 files. The badminton event contains 20 teams and 51 confirmed matches. Preserve these private backups outside Git.

For routine pickleball backup, use Admin's Download backup. This includes event results/history and clears device sessions. Custom court password hashes are included in private backups; keep them secure. Admin credentials and fallback court passwords stay in environment configuration. For a database restore, first back up the current database and restore into a separate database, validate both event keys and counts, then deliberately switch the database connection. Do not restore the old full dump over live pickleball results. The custom dump is inspectable with `pg_restore --list`; restoring schema/data needs a compatible PostgreSQL server and credentials. The readable export has tables containing `{row: ...}` entries, including EventDocument id/data.

This app does not implement registration, payments, automatic walkovers, or offline synchronization.

## Mixed Doubles addition — November 28

The separate import in `lib/mixed-pickleball.ts` appends the host PDF without rewriting Adult or Youth matches. It adds 13 teams (Groups A and B), 26 pool games and seven knockouts on Saturday, November 28. Each team plays four pool games. Source: `URC Mix double Nov 2026.pdf`, three pages; date confirmed by the organizer. Total active event: 36 teams and 88 matches.

Mixed pool: one to 11, cap 17; quarters: one to 15, cap 21; semifinals/final: best of three to 11, cap 17. Win by two until the cap; reaching the cap wins by one. These per-match rules take priority over the global Adult/Youth cap and do not alter their scoring. Mixed final is Saturday at 3 PM; existing Adult/Youth finals remain Sunday.

Mixed suggested standings follow wins, head-to-head wins when every team in the tied wins cohort has played all others, point difference, points scored, then the combined wins of the four scheduled opponents. Head-to-head is skipped for cross-group ties. Any remaining tie needs a physical draw and organizer seed confirmation; alphabetical display order is only a stable presentation fallback. Top eight overall qualify. The bracket is 1–8, 4–5, 3–6, 2–7; the first two quarters feed SF1 and the latter two SF2.

Mixed pool times overlap the existing Saturday schedule. Planned overlaps are advisory; actual court/player concurrency is enforced when starting matches. Each court may select any ready game. Unambiguous first names link to existing player identities, including the full junior identities. The host confirmed the two Mixed Arifs are different people, and Mixed Adil is different from Adult Aadil. Remaining ambiguous Adult/Mixed Arif or Abid links can be reviewed in Admin. Existing player identities and results are preserved by the import.

## Admin entry of past and current scores

Admin > Results accepts direct scores for scheduled, live, awaiting-confirmation or confirmed matches with known teams. Choose Completed match to enter every game and confirm the result immediately. Choose In progress to enter completed games followed by the current partial game, then select the actual serving team, server, receiver, service court and service turn. Review the entry and confirm it on the page. Refresh open scorer/display pages after loading this update.

Every change requires a reason and the match version seen when editing. Scores must be valid terminal results under the stage target, win-by rule and cap; extra games after the series has already been won are rejected. Current entries cannot already be winning scores. A live entry must not conflict with another active court or player. Completed past results can be entered even while that physical court is occupied.

Current-score entry creates an explicit service/score checkpoint. Only actual rallies recorded after it are replayed by +/−. Editing the checkpoint itself requires Admin > Results. No missing earlier rallies, coin tosses or opening servers are invented. For later games of a match with incomplete opening history, the scorer explicitly chooses the first serving team. Old real history remains visible; previous games, rallies and checkpoints are kept in private score archives and backups. Dashboard/detail APIs strip replay archives before transfer.

An admin must explicitly retain confirmed playoff seeds when changing a pool result after seeding. Statistics update without silently reseeding. A playoff winner change, or resumption that removes a winner, is blocked if a dependent match has started. Scores may be corrected with the same winner after downstream play. For a winner change, correct the dependent bracket first. No production results are changed merely by deploying this feature.
