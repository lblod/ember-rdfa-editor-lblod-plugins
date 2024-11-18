---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

Adjustments to `lmb-plugin`:
- Rework `fetchMandatees` queries into `fetchElectees`
  * Fetches all electees for a certain legislation period + all non-elected people with a mandate
  * Replace `Mandatee` model by simpler `Electee` model
- Adjust UI components to reflect the `Mandatee` to `Electee` change
