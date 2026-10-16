---
title: Home
---

# Tomorrow Gazette

*The future, according to the past.*

Tomorrow Gazette is a comedy news show about real predictions from the past. Each episode Vera Tomorrow reads one out, checks what actually happened, and her sidekick DOT gives a verdict.

This archive keeps every episode with its sources and its verdict, so you can check our working.

## Latest episodes

{% assign latest = site.episodes | sort: "number" | reverse %}
{% if latest.size > 0 %}
<ul class="episode-list">
{% for episode in latest limit: 5 %}
  <li><a href="{{ episode.url | relative_url }}">E{{ episode.number }}: {{ episode.title }}</a>{% if episode.verdict %} · <span class="verdict">{{ episode.verdict }}</span>{% endif %}</li>
{% endfor %}
</ul>
[All episodes]({{ '/episodes/' | relative_url }})
{% else %}
No episodes are published yet. Each one appears here after it airs.
{% endif %}
