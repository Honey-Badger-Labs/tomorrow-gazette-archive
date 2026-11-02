---
title: Specials
description: Tomorrow Gazette specials and bonus episodes, with their sources and verdicts.
permalink: /specials/
wide: true
---

# Specials

<p class="section-intro">Holiday editions and bonus episodes that sit outside the numbered run. Same rules: real predictions, real sources, one verdict.</p>

<ul class="special-list">
{% for s in site.data.specials %}
  <li class="special-card" id="{{ s.id }}">
    <div class="special-card-art">{% if s.image and site.data.images[s.image] %}{% include picture.html name=s.image alt="" sizes="(min-width: 48rem) 36rem, 100vw" %}{% else %}<div class="episode-card-blank" aria-hidden="true"><img src="{{ '/assets/img/masthead-420.png' | relative_url }}" srcset="{{ '/assets/img/masthead-420.png' | relative_url }} 420w, {{ '/assets/img/masthead-840.png' | relative_url }} 840w" sizes="16rem" width="420" height="124" alt="" loading="lazy"></div>{% endif %}</div>
    <div class="special-card-head">
      <span class="case-meta">{{ s.format }} · <time datetime="{{ s.published | date: '%Y-%m-%d' }}">{{ s.published | date: '%-d %b %Y' }}</time></span>
      <h2 class="special-title">{{ s.title }}</h2>
      {% include verdict-stamp.html verdict=s.verdict %}
    </div>
    {% if s.prediction %}<blockquote class="special-quote"><p>"{{ s.prediction.quote }}"</p><footer>{{ s.prediction.who }}, {{ s.prediction.where }}, {{ s.prediction.when }}</footer></blockquote>{% endif %}
    {% if s.question %}<p>{{ s.question }}</p>{% endif %}
    <p class="special-links">Watch or listen: {% assign first = true %}{% for l in s.links %}{% assign u = l[1] | strip %}{% if u contains 'https://' %}{% unless first %} · {% endunless %}<a href="{{ u }}">{% case l[0] %}{% when 'youtube' %}YouTube{% when 'tiktok' %}TikTok{% when 'spotify' %}Spotify{% else %}{{ l[0] | capitalize }}{% endcase %}</a>{% assign first = false %}{% endif %}{% endfor %}</p>
    <details class="special-sources"><summary>Sources ({{ s.sources.size }})</summary>
      <ol>{% for src in s.sources %}<li><a href="{{ src.url }}">{{ src.title }}</a></li>{% endfor %}</ol>
    </details>
  </li>
{% endfor %}
</ul>

<section aria-labelledby="coming-heading" class="special-coming">
  <h2 id="coming-heading">Coming up</h2>
  <p class="section-intro">Not aired yet. They'll appear above, with sources and a verdict, once they're out.</p>
  <ul>
    <li><strong>Christmas TV special</strong> · Thu 24 Dec 2026</li>
    <li><strong>Christmas podcast special</strong> · Fri 25 Dec 2026</li>
  </ul>
</section>
