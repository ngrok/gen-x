---
"@ngrok/gen-x": patch
---

Preserve `exports` key position when updating `package.json`. Previously, gen-x always deleted and re-appended the `exports` field, moving it to the end of the file on every run. Now, if `exports` already exists, it is updated in-place so its position relative to other keys is unchanged.
