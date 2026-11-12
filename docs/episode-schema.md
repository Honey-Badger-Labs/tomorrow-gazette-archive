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
| `video.update_youtube`, `video.update_tiktok`, `video.podcast_youtube` | no | Published URLs for a follow-up update Short and the podcast edition (YouTube/TikTok hosts only) |
| `podcast_spotify` | no | The Spotify link for the podcast edition (the show page until an episode link exists) |
| `prediction` | yes | `quote` (word for word), `who`, `when`, `where`, and `source` (an id from `sources`) |
| `since` | no | What has happened since: a list of `fact` + `sources` (a list of ids). Every fact needs at least one source |
| `verdict` | yes | Exactly one of `NAILED IT`, `PARTLY RIGHT`, `NOT YET`, `COMPLETELY BONKERS` |
| `verdict_reason` | yes | One or two sentences: why this verdict |
| `sources` | yes | A list of `id` (e.g. `S1`), `title`, `url` (https) and `accessed` (`YYYY-MM-DD`). Ids are unique on the page |
| `open_questions` | no | A list of points we couldn't confirm, written as questions |
| `still` | no | The episode's key still: `image:`, a name from `_data/images.yml`. Shown on the episode card and at the top of the page. Without it, the site uses the episode's entry in `_data/episode_stills.yml`, if any. Only our own AI-made stills; never photos of real people or brands |
| `journey` | no | Its stop on the [Journey Through Tomorrow](../journey.html) page: `motif` (a dot picture named in `assets/js/journey-shapes.js`; default `sunburst`), `label` (the short name under the slider, 16 characters at most; default the title) and `since` (which `since` fact to show as "what happened", 1 = first; default 1). Checked by `tools/check_journey.rb` |
| `fiction_note` | no | Extra fiction labelling for this episode. The standard AI and fiction note is always shown |

Source ids are per page, so `S1` on one episode has nothing to do with `S1` on another. Use the ids from the episode's claims table in the production repo so the two can be compared.

Each aired episode can also have a claims file with its verdict history: see [claims-schema.md](claims-schema.md).

## Journey Through Tomorrow

Every published episode, and every special in `_data/specials.yml` that has a `prediction`, is a stop on `/journey/`, in the order the predictions were made. Nothing needs adding by hand: the page is built from the same files. A stop only appears once it has aired when the site is built: an episode's `publish_date` at `air_time` (`_config.yml`, 18:00 SAST), a special's `published` time. Specials name their "what happened" line in `journey.fact`, with `journey.source` giving its position in `sources` (1 = first), plus the same optional `motif` and `label`.

Add a new motif to `assets/js/journey-shapes.js` in the same change as the episode that uses it, so no picture hints at a story before it airs.
