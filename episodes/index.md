---
title: Episodes
permalink: /episodes/
---

# Episodes

{% assign episodes = site.episodes | sort: "number" %}
{% if episodes.size > 0 %}
<ul class="episode-list">
{% for episode in episodes %}
  <li>
    <a href="{{ episode.url | relative_url }}">E{{ episode.number }}: {{ episode.title }}</a>
    {% if episode.verdict %} · <span class="verdict">{{ episode.verdict }}</span>{% endif %}
    {% if episode.publish_date %} · <time datetime="{{ episode.publish_date | date: '%Y-%m-%d' }}">{{ episode.publish_date | date: '%-d %B %Y' }}</time>{% endif %}
  </li>
{% endfor %}
</ul>
{% else %}
No episodes are published yet. Each one appears here after it airs.
{% endif %}
