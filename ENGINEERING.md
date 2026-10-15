# Engineering guidelines (Honey-Badger-Labs)

How we write and change code in this repo. Based on Robert C. Martin's *Clean Code*, cut down for a small static website.

**Guidelines, not rules.** Apply the idea behind each one and use judgement. Working, readable, no repeated logic, nothing extra.

## 1. Meaningful names
- Names say what a thing is for: `episode.html`, `sources-list`, `verdict`, not `layout2`, `box`, `tmp`.
- Use the show's own words (episode, verdict, source, prediction) so code and content read the same.
- If a number needs explaining, give it a name.

## 2. Small, focused pieces
- One layout or include per job. One script per job.
- Split a file when it does two unrelated things, not before.

## 3. No duplication
- Each fact lives in one place: an episode's data in its own front matter, site settings in one config file.
- Generate lists (episode index, source lists); don't hand-copy them.

## 4. Explicit error handling
- Checks fail loudly, with a message saying what's wrong and how to fix it, and exit non-zero.
- Document every exception (e.g. each URL excluded from link checks) with its reason.
- Never spend money inside an automated check.

## 5. CI checks
- Every PR runs the build and link check. Keep them fast and runnable locally with one command.
- A red check is work now. Fix the cause; don't disable or loosen a check to go green. If a check is wrong, change it in its own commit and say why.

## 6. Keep it simple and accessible
- Plain HTML and CSS first; add JavaScript only when a page needs it.
- Readable on a phone, accessible contrast, alt text on images.
- Keep dependencies few and pinned.

## 7. Leave it cleaner than you found it
- Fix small things nearby (a dead link, an unclear name) inside your change. Propose bigger rewrites separately.
- Re-read your own diff and run the checks before you push.

*Source: Robert C. Martin, Clean Code: A Handbook of Agile Software Craftsmanship (2008).*
