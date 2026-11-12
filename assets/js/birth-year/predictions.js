---
# Publishes _data/birth_year_predictions.json (generated outside this repo; public entries only).
layout: null
sitemap: false
---
window.TG_PREDICTIONS = {{ site.data.birth_year_predictions | jsonify }};
