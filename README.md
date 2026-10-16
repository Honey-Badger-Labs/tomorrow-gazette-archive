# Tomorrow Gazette Archive

The public archive for **Tomorrow Gazette**, a retro-futurist news show about the future, presented by Vera and DOT. Every episode, its sources and its verdict, in one searchable place. Published with GitHub Pages.

## Phases

| Phase | What | Status |
|---|---|---|
| 1 | One page per episode: summary, sources, verdict | Building (see [collab/BACKLOG.md](collab/BACKLOG.md)) |
| 2 | Prediction Exchange: a **points-only** community forecasting game. No money, no betting, no prizes with cash value. | Parked until Phase 1 ships |

## Principles

- **Sourced, not guessed.** Every factual claim links to its source.
- **Fiction is labelled.** Anything imagined (2126 broadcasts, letters from the future, the crew) is clearly marked as fiction.
- **Openly AI.** Tomorrow Gazette is made with AI tools, and says so.

## Run it locally

Needs Ruby 3 and Bundler. [lychee](https://github.com/lycheeverse/lychee#installation) for the link check.

```bash
bundle install
bundle exec jekyll serve          # http://localhost:4000/tomorrow-gazette-archive/
tools/check.sh                    # everything CI checks: episode check + tests, build, links
```

| Path | |
|---|---|
| `_episodes/` | One Markdown file per **published** episode; its data lives in front matter ([fields](docs/episode-schema.md)) |
| `_layouts/`, `_includes/`, `assets/css/` | Page layouts, shared pieces (verdict stamp, DOT, citations) and styles ([style guide](docs/style-guide.md)) |
| `tools/check_episodes.rb` | Fails the build if an episode is a draft, lacks a field, or makes a claim without a source |
| `index.md`, `episodes/`, `about.md`, `404.html` | The site's pages |
| `.github/workflows/site.yml` | Episode check, build and link check on every PR and every Monday; deploy to Pages from `main` |
| `docs/decisions.md` | Why the site is built the way it is (AD1: Jekyll) |

## How work happens here

Read [AGENTS.md](AGENTS.md), [collab/WORKING-AGREEMENT.md](collab/WORKING-AGREEMENT.md) and [ENGINEERING.md](ENGINEERING.md).

This is a public repo. Production files live elsewhere and do not belong here.
