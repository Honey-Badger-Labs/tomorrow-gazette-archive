# Your Birth-Year Front Page

`/birth-year/`: type a year and get a Tomorrow Gazette front page with a real, sourced prediction from that year (or the nearest one), what actually happened, and Dot's verdict. You can save or share it as a 1080 × 1350 or 1080 × 1920 card.

**Status: verdicts approved; soft launch.** Jakes Olivier approved all the public verdicts on 12 Nov 2026, including the close calls and the Gates 2015 (pandemic) and IPCC 2018 (climate) cards. The 5 aired stories show the verdicts given on air; the other 102 show Dot's approved verdict. There is no draft label on the page or the share cards.

For now the page is reachable at `/birth-year/` but is not in the navigation, sets `noindex`, and is left out of the sitemap. Linking it from the site and letting search engines index it is a separate decision for Jakes. Setting `show_proposed: false` in `birth-year.html` shows only the 5 aired stories (the flag name is historical: it means "show the historical, non-aired cards").

| File | Job |
|---|---|
| `birth-year.html` | The page (front matter: `noindex`, `sitemap`, `show_proposed`) |
| `_data/birth_year_predictions.json` | The public predictions (107 on 12 Nov 2026, one for 96 of the 111 years from 1916 to 2026, plus a few older extras), one place (generated outside this repo by the newsroom's data build, which re-checks every quote against the pages it was taken from) |
| `assets/js/birth-year/predictions.js` | Publishes that data to the page |
| `assets/js/birth-year/birth-year.js` | Year lookup, page, buttons |
| `assets/js/birth-year/card.js` | Draws the share cards on a canvas (same-origin fonts and masthead only) |
| `assets/css/birth-year.css` | Page styles, using the site's palette from `site.css` |

Approved verdicts, with the review notes: [birth-year-verdicts-for-review.md](birth-year-verdicts-for-review.md).

Typing a year shows that year's main entry (`primary`); other entries from the same year are one click away. A year with no entry shows the nearest year, with a note saying so.

Stories that haven't aired yet are not in this file at all. They are added on the first rebuild after their air date, so after each episode airs, rebuild the data and copy it here again, then let the site rebuild. Internal editor notes are stripped from this copy.

The page makes no third-party requests and loads no trackers.
