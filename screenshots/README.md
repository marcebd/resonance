# Screenshots

Five screenshots embedded in the project README. Capture from the deployed
production URL (`https://resonance-ruddy.vercel.app`), not localhost — the URL
in the address bar should be the live one. 1440px-wide desktop view, no browser
chrome, no device frame.

## Inventory

| File | Path captured | What it shows | Alt text |
|---|---|---|---|
| `01-landing.png` | `/` | Landing hero, brief input field with placeholder, mouse trail | "Resonance landing page — monospace hero, brief input field, cursor-drawn cyan trail" |
| `02-generation.png` | `/run/<id>` (mid-flight, ideally during reactions stage) | Pipeline stages with first 3 checked, current stage spinning, "X / 30 reactions complete" detail | "Live generation view — three stages complete, reactions in progress at 12 / 30" |
| `03-results-hero.png` | `/results/<showcase-id>` (scrolled to top) | Brief header, recommendation card (black-bordered), top-picks + polarized cards | "Results page hero — recommendation paragraph + top picks + polarized variants side-by-side" |
| `04-matrix.png` | `/results/<showcase-id>` (scrolled to matrix, one cell clicked) | Reaction matrix grid + detail panel below showing a single persona's reaction (ideally bilingual / voice-y) | "Reaction matrix — 5 variants × 6 personas grid with one cell expanded showing the persona's full reaction" |
| `05-transmission.png` | `/results/<showcase-id>` (scrolled to transmission graph) | Hexagonal transmission graph, default threshold, dense-network variant selected | "Social transmission graph — hexagonal layout of 6 personas with directional recommendation arrows" |

## Capture notes

- **Mac**: `Cmd+Shift+4`, then `Space` to select a window (snaps to chrome-free), or drag-select a region.
- **Don't use** screenshot extensions that add browser shadows or device frames.
- For `02-generation.png`, you have to time the capture mid-pipeline — easiest is to start a fresh run, watch the stages advance, capture once reactions are at ~12-18.
- For `04-matrix.png`, click a cell with strong qualitative content (long, voice-y, ideally Spanish/Spanglish) so the detail panel demonstrates voice match.
- For `05-transmission.png`, click each variant button and pick the one with the densest network at the default threshold of 6 — that's the variant most likely to spread socially per the panel.

## After capturing

Drop the files into this directory with the exact names above. The README
references them as `screenshots/01-landing.png`, etc.
