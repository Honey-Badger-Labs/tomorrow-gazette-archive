# Claims files: the living archive (A-T10)

Every prediction we check stays **open**. When the news moves (a new flying-car demo, a robot that finally ships), we re-check it and log the result, even if the verdict doesn't change. The episode page shows the log as a **Verdict history** timeline, and the episode card shows "Still open · Last checked …".

One file per aired episode: `_data/claims/<episode file name>.yml`, e.g. `_data/claims/e1-flying-car.yml` for `_episodes/e1-flying-car.md`. `tools/check_claims.rb` enforces everything below and fails the build otherwise. CI runs it in the "Check episode pages" step (`ruby tools/check_episodes.rb` checks both), and its tests run with the episode-check tests.

**Same rule as episode pages: nothing before air.** A claims file needs a published episode page with a `publish_date` that has passed, and no history entry can be dated in the future. Seeds for upcoming episodes stay in the private production repo until air day, then land in the same PR as the episode page.

## Fields

| Field | Required | What goes in it |
|---|---|---|
| `episode` | yes | The episode number. Must match the episode page |
| `claims` | yes | A list of predictions. The **first** is the episode's own prediction, and its `verdict` must match the episode page's `verdict`. Change both in the same PR |
| `claims[].id` | yes | `C1`, `C2`… Unique in the file |
| `claims[].claim` | yes | The prediction, word for word |
| `claims[].who` | yes | Who said it, where and when |
| `claims[].status` | yes | `open` (we still re-check it every week) or `closed` (settled for good) |
| `claims[].verdict` | yes | The current verdict: one of `NAILED IT`, `PARTLY RIGHT`, `NOT YET`, `COMPLETELY BONKERS`. Must match the latest history entry |
| `claims[].watch` | no | What the weekly check looks for, in plain words |
| `claims[].history` | yes | Dated entries, **oldest first**. The first is the day the episode aired |
| `history[].date` | yes | `YYYY-MM-DD`, not in the future |
| `history[].verdict` | yes | The verdict after this check (often unchanged) |
| `history[].change` | yes | One line: what happened, e.g. "Re-checked after X. Verdict unchanged." |
| `history[].note` | no | One to three sentences of detail. Every fact in it must be in its sources |
| `history[].sources` | yes | At least one `title` + `url` (https) |
| `history[].video` | no | The published update Short (YouTube or TikTok URL), added once it has aired |

A `TODO-` placeholder anywhere fails the check, as on episode pages.

## Changing a verdict

1. Add a history entry with the new verdict, the date and the sources.
2. Set the claim's `verdict` to match.
3. If it's the episode's prediction (`C1`), update the episode page's `verdict` and `verdict_reason` too.
4. Jakes approves the PR, as for any public change.
