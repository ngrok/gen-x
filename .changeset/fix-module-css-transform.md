---
"@ngrok/gen-x": patch
---

Fixed mode transforms incorrectly converting multi-part extensions like `.module.css` to `-module.css`. Export keys now preserve the full extension while transforming only the basename (e.g., `FancyButton.module.css` → `./fancy-button.module.css` with kebab-case mode)
