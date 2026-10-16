# Backlog

Task IDs use the prefix `A-T` (Archive Task). Keep tasks small: a few hours each. Update the status row in your PR.

## Phase 1: one page per episode

| ID | Task | Lane | Depends on | Status |
|---|---|---|---|---|
| A-T1 | **Choose the static site generator.** Compare plain Jekyll (GitHub Pages builds it natively, no build step to maintain, Markdown + front matter per episode) with Astro (more design control, needs an Actions build). Recommendation to test: **Jekyll**, because the site is mostly Markdown pages and it keeps the toolchain smallest. Write the choice to `docs/decisions.md` and put it in Decisions for Jakes. | Claude | none | Review |
| A-T2 | **Site skeleton.** Home page, episode index, about page (openly AI, fiction labelling, sources policy), 404. Works locally with one command. | Claude | A-T1 | Review |
| A-T3 | **Pages deploy workflow.** GitHub Actions deploy to Pages on merge to `main`; PR builds must pass. | Claude | A-T2 | Review |
| A-T4 | **Link-check CI.** Check all links on every PR (e.g. lychee). Document any excluded URL with a reason. | Claude | A-T2 | Review |
| A-T5 | **Style guide.** Retro-futurist look: palette, type, motifs (newsprint, mid-century broadcast), accessible contrast (WCAG AA). Save as `docs/style-guide.md` plus the CSS. | ChatGPT | A-T1 | Review (built by Claude; Quill has no repo access, see PR) |
| A-T6 | **Episode page template.** Front-matter fields: number, title, publish date, video link, summary, verdict, sources (title + URL + accessed date), fiction note. Layout that shows sources and verdict clearly. | ChatGPT | A-T1 | Review (built by Claude; Quill has no repo access, see PR) |
| A-T7 | **E1 page.** First real episode page using A-T6, from published info only, every claim sourced. Jakes supplies or confirms the facts. | ChatGPT | A-T6 | Review |
| A-T8 | **Front-matter check.** CI fails if an episode page is missing a required field or has a claim without a source. | Claude | A-T3, A-T6 | Review |

## Phase 2: Prediction Exchange (parked)

Points-only, no money. Not started until Phase 1 is live and Jakes says go. Ideas only; don't build.
