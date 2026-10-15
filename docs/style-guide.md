# Style guide (A-T5)

The archive looks like the show: a 1930s–40s newspaper crossed with Art Deco and a Saturday-morning cartoon. The palette is the show's locked palette, so the site, the stamps and the episodes match. The CSS is [`assets/css/site.css`](../assets/css/site.css); its custom properties at the top are the only place a colour is defined.

## Palette

| Token | Hex | Use |
|---|---|---|
| `--cream` | `#F3E9D2` | Page background (newsprint) |
| `--cream-light` | `#FAF4E6` | Cards, quotes, notes |
| `--navy` | `#14213D` | Body text, rules, borders |
| `--teal` | `#1F6F78` | Links, NAILED IT stamp, accents |
| `--brass` | `#C9A227` | PARTLY RIGHT stamp, decorative borders. **Never text on cream** |
| `--coral` | `#E4572E` | Decoration only: nav underline, DOT's glow. **Never text on cream** |
| `--coral-ink` | `#B23A1A` | Coral for text and for the COMPLETELY BONKERS stamp |

## Contrast (WCAG AA)

Measured with the WCAG 2 formula. AA needs 4.5:1 for body text and 3:1 for large text (bold 18.66 px and up).

| Text on background | Ratio | Allowed for |
|---|---|---|
| navy on cream | 13.2 | Everything |
| teal on cream | 4.8 | Everything |
| teal on cream-light | 5.3 | Everything |
| coral-ink on cream | 5.0 | Everything |
| cream on teal (NAILED IT) | 4.8 | Everything |
| navy on brass (PARTLY RIGHT) | 6.6 | Everything |
| cream on navy (NOT YET) | 13.2 | Everything |
| cream on coral-ink (COMPLETELY BONKERS) | 5.0 | Everything |
| coral on cream | 3.05 | **Nothing.** Brand coral fails AA for text, hence `--coral-ink` |
| brass on cream | 2.0 | **Nothing** |

## Type

- **Display** (masthead, headings, stamps, labels): a geometric sans, uppercase and letter-spaced, for the Deco nameplate feel. System stack `Futura, Century Gothic, Avenir Next, Trebuchet MS`, so no web fonts are loaded.
- **Body**: Georgia and other newspaper serifs.

## Motifs

- **Masthead**: double rule above and below, brass brackets around "The Archive".
- **Verdict stamps**: the four on-screen stamps (NAILED IT teal, PARTLY RIGHT brass, NOT YET navy, COMPLETELY BONKERS coral), slightly rotated with a double border. Always bold and at least 1.2 rem. The word "Verdict:" is read out to screen readers.
- **DOT**: an inline SVG drawn from the character bible (chrome orb, teal eye, antenna, coral glow). Decorative and hidden from screen readers. It bobs gently, and stays still for people who ask for reduced motion.
- **Fiction label**: a brass-edged note wherever Vera, DOT or the newsroom appear.

## Accessibility floor

Skip link, visible focus ring (`--coral-ink`), one `h1` per page, landmarks (`header`, `nav`, `main`, `footer`), no text in images, no horizontal scroll at 320 px, and nothing important that only animation or colour conveys.
