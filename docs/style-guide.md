# Style guide (A-T5, studio look A-T9)

The archive should feel like being in the Tomorrow Gazette studio: a 1930s–40s newspaper crossed with Art Deco and a Saturday-morning cartoon, with the show's own masthead, fonts, stamps and stills. The palette is the show's locked palette, so the site, the stamps and the episodes match. The CSS is [`assets/css/site.css`](../assets/css/site.css); its custom properties at the top are the only place a colour is defined.

**Light only.** Cream newsprint is the look. There is no dark theme, and `color-scheme: light` stops browsers inventing one.

## Palette

| Token | Hex | Use |
|---|---|---|
| `--cream` | `#F3E9D2` | Page background (newsprint) |
| `--cream-light` | `#FAF4E6` | Cards, quotes, notes, stamp paper |
| `--navy` | `#14213D` | Body text, rules, borders, card shadows, NOT YET stamp |
| `--charcoal` | `#22201E` | The masthead's GAZETTE band (inside the logo image) |
| `--teal` | `#1F6F78` | Links, labels, NAILED IT stamp |
| `--teal-deep` | `#1A5A62` | Buttons, picture backgrounds while they load |
| `--brass` | `#C9A227` | Frames round pictures, rules under headings. **Never text** |
| `--brass-ink` | `#7A5C00` | Brass for text: the PARTLY RIGHT stamp, the footer tagline |
| `--coral` | `#E4572E` | Decoration only: nav underline, ON AIR glow. **Never text on cream** |
| `--coral-ink` | `#B23A1A` | Coral for text: kickers, roles, the ON AIR sign, COMPLETELY BONKERS stamp |

## Contrast (WCAG AA)

Measured with the WCAG 2 formula, and every page is checked with [axe-core](https://github.com/dequelabs/axe-core) (WCAG 2.1 A and AA rules) at desktop and phone sizes: no violations. AA needs 4.5:1 for body text and 3:1 for large text.

| Text on background | Ratio | Allowed for |
|---|---|---|
| navy on cream | 13.2 | Everything |
| navy on cream-light | 14.6 | Everything |
| teal on cream | 4.8 | Everything |
| teal on cream-light (NAILED IT stamp) | 5.3 | Everything |
| brass-ink on cream-light (PARTLY RIGHT stamp) | 5.7 | Everything |
| brass-ink on cream | 5.2 | Everything |
| coral-ink on cream-light (COMPLETELY BONKERS stamp) | 5.5 | Everything |
| cream-light on teal-deep (buttons) | 7.1 | Everything |
| cream-light on coral-ink (ON AIR) | 5.5 | Everything |
| cream-light on navy (captions) | 14.6 | Everything |
| coral on cream | 3.05 | **Nothing.** Brand coral fails AA for text, hence `--coral-ink` |
| brass on cream | 2.0 | **Nothing**, hence `--brass-ink` |

## Type

The show's own faces, self-hosted in [`assets/fonts/`](../assets/fonts/README.md) (SIL Open Font License), about 70 KB in total.

- **Limelight**, the masthead's TOMORROW face: page titles, section headings, episode titles, names.
- **Courier Prime Bold**, the masthead tagline's typewriter face: datelines, kickers, labels, buttons, nav. Uppercase and letter-spaced.
- **Anton**, the face of the on-screen verdict stamps: verdict stamps only.
- **Body**: Georgia and other newspaper serifs (system fonts, nothing to load).

## Pictures

- **Only our own AI-made stills** of Vera, DOT, the studio set and the episodes' illustrations. Never photos, and never realistic pictures of real people or brands.
- Made by [`tools/make_images.py`](../tools/make_images.py) from the production stills: WebP first with a JPEG fallback, two or three widths, **each file under 200 KB**. Flat transparent artwork (masthead, sunburst) is an indexed PNG.
- Shown with [`_includes/picture.html`](../_includes/picture.html): `srcset`/`sizes`, width and height set (no layout jump), and `loading="lazy"` except the one picture at the top of a page.
- Every picture is listed in [`_data/images.yml`](../_data/images.yml) with its alt text. Alt text says what the picture shows. A picture right next to the name it shows (an avatar beside "Vera Tomorrow") uses `alt=""` so screen readers don't hear the name twice.
- An episode's key still is set in its front matter (`still:`) or in [`_data/episode_stills.yml`](../_data/episode_stills.yml).

## Motifs

- **Masthead**: the show's nameplate image (TOMORROW / GAZETTE, alt text "Tomorrow Gazette") between double rules, "Est. in an unpredicted future" above, brass brackets round "The Archive". The logo is the one image with text in it.
- **Studio window**: the home page's two-shot of Vera and DOT in a brass frame with a rounded top, an ON AIR sign and the masthead's brass sunburst faint behind it.
- **Portholes**: round brass-rimmed frames for Vera and DOT, like the studio's porthole window.
- **Verdict stamps**: the on-screen rubber stamp: Anton, ink-coloured double border, tilted, on stamp paper (NAILED IT teal, PARTLY RIGHT brass-ink, NOT YET navy, COMPLETELY BONKERS coral-ink). DOT's verdict on an episode page is the large stamp beside DOT. The word "Verdict:" is read out to screen readers.
- **Cards**: cream-light with a navy border and a solid navy drop shadow, like a printed cut-out.
- **Headings**: Limelight with a coral star and a brass double rule.
- **Fiction label**: a brass-edged note wherever Vera, DOT or the newsroom appear, saying the pictures are AI-made.

## Accessibility floor

Skip link, visible focus ring (`--coral-ink`), one `h1` per page, landmarks (`header`, `nav`, `main`, `footer`), alt text on every meaningful picture, no text in images except the logo, no horizontal scroll at 320 px, nothing important that only animation or colour conveys, and hover movement switched off for people who ask for reduced motion.
