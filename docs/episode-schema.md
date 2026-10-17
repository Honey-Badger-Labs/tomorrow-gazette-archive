# Episode page fields (A-T6)

One file per **published** episode in `_episodes/`, named `e<number>-<slug>.md`, e.g. `e3-mail-by-missile.md`. The page is built from its front matter; the body can stay empty. `tools/check_episodes.rb` enforces everything marked *required* and fails the build otherwise (A-T8). Copy [`test/fixtures/valid/e1-test-episode.md`](../test/fixtures/valid/e1-test-episode.md) as a starting point.

**Only add an episode after it has aired and Jakes has approved the public copy.** Drafts, scripts, prompts and production notes stay in the private production repo.

| Field | Required | What goes in it |
|---|---|---|
| `number` | yes | Episode number, a whole number. Unique |
| `title` | yes | The episode's public title |
| `status` | yes | Always `published`. Anything else fails the check |
| `publish_date` | yes | The date it aired, `YYYY-MM-DD`. Can't be in the future |
| `description` | yes | One or two sentences: the summary shown in the episode list, search results and link previews |
| `video` | yes | `youtube:` and/or `tiktok:`, the published URLs (https). A `TODO-` placeholder here, or in any other field, fails the check |
| `prediction` | yes | `quote` (word for word), `who`, `when`, `where`, and `source` (an id from `sources`) |
| `since` | no | What has happened since: a list of `fact` + `sources` (a list of ids). Every fact needs at least one source |
| `verdict` | yes | Exactly one of `NAILED IT`, `PARTLY RIGHT`, `NOT YET`, `COMPLETELY BONKERS` |
| `verdict_reason` | yes | One or two sentences: why this verdict |
| `sources` | yes | A list of `id` (e.g. `S1`), `title`, `url` (https) and `accessed` (`YYYY-MM-DD`). Ids are unique on the page |
| `open_questions` | no | A list of points we couldn't confirm, written as questions |
| `fiction_note` | no | Extra fiction labelling for this episode. The standard AI and fiction note is always shown |

Source ids are per page, so `S1` on one episode has nothing to do with `S1` on another. Use the ids from the episode's claims table in the production repo so the two can be compared.
