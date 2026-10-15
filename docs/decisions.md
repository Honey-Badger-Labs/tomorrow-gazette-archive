# Decisions: Tomorrow Gazette Archive

Status values: **Proposed**, **Active**, **Superseded** (link to the replacement), **Revisit** (trigger noted).
Add new decisions at the bottom with the next `AD` number.

| ID | Date | Decision | Why | Decided by | Status |
|---|---|---|---|---|---|
| AD1 | 2026-10-15 | **Jekyll, through the `github-pages` gem (v232, Jekyll 3.10)**, built and deployed by GitHub Actions (`actions/jekyll-build-pages`). Episodes are a Jekyll collection: one Markdown file per episode in `_episodes/`, with its data in front matter. | Most of the site is Markdown pages with a little structured data, which is what Jekyll does natively. The Pages build action uses the same pinned versions as the gem, so a local build matches the live site. There's no Node toolchain or lockfile churn to maintain. Astro would give more design control, but this site doesn't need any it can't get from CSS and Liquid layouts. | Claude (A-T1), for Jakes | Proposed |

## AD1 notes

**Options compared (A-T1):**

| | Jekyll (`github-pages` gem) | Astro |
|---|---|---|
| Build | Pages' own action; same versions as local | Node + npm build in Actions |
| Content | Markdown + front matter per episode | Markdown/MDX + content collections with a typed schema |
| Dependencies | One gem, pinned | Astro plus its npm tree |
| Design control | Layouts, includes, CSS | Components, scoped CSS, islands |
| Search (later) | Generate a JSON index with Liquid; small client-side script | Same, or a search integration |
| Who can edit | Anyone who can edit Markdown on GitHub | Same, but previews need Node |

**Known limits, and what we'd do about them:**

- The `github-pages` gem pins Jekyll 3.10 and an allow-list of plugins. That's enough for a Markdown archive. If we need a plugin outside the list, keep the Actions build but switch to a plain `jekyll` Gemfile. Record that as a new decision.
- Front-matter validation isn't built in. A-T8 adds a CI check for it.
- **Revisit** if Phase 2 (Prediction Exchange) is ever approved: it needs interactive state that a static generator doesn't provide, whichever one we pick.
