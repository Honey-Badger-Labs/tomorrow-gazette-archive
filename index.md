---
title: The future, according to the past
description: Real predictions from the past, checked against what actually happened. Every Tomorrow Gazette episode with its sources and its verdict.
wide: true
---

<section class="hero" aria-labelledby="hero-heading">
  <figure class="studio-window">
    {% include picture.html name="studio-twoshot" eager=true sizes="(min-width: 66rem) 64rem, 100vw" %}
    <span class="on-air" aria-hidden="true">On air</span>
    <figcaption>Vera Tomorrow and DOT at the news desk. Both are AI-generated characters.</figcaption>
  </figure>
  <div class="hero-copy">
    <p class="kicker">Tonight's edition</p>
    <h1 id="hero-heading">The future, according to the past.</h1>
    <p class="lede">People have always predicted the future. We check how they did. Tomorrow Gazette finds the real predictions, checks what actually happened, and stamps a verdict on each one. This archive keeps every episode with its sources, so you can check our working.</p>
    <p class="hero-actions"><a class="button" href="{{ '/episodes/' | relative_url }}">Browse the episodes</a> <a class="button button-quiet" href="#studio">Meet the studio</a> <a class="button button-quiet" href="{{ site.join.url }}">Join the {{ site.join.name }}</a></p>
  </div>
</section>

<section aria-labelledby="verdicts-heading" class="verdict-key">
  <h2 id="verdicts-heading">Four verdicts</h2>
  <p class="section-intro">DOT stamps one of these on every prediction.</p>
  <ul>
    <li>{% include verdict-stamp.html verdict="NAILED IT" %}<p>It happened, more or less as promised.</p></li>
    <li>{% include verdict-stamp.html verdict="PARTLY RIGHT" %}<p>Some of it came true. The rest is still in the post.</p></li>
    <li>{% include verdict-stamp.html verdict="NOT YET" %}<p>It hasn't happened. Ask again later.</p></li>
    <li>{% include verdict-stamp.html verdict="COMPLETELY BONKERS" %}<p>Not even close.</p></li>
  </ul>
</section>

<section aria-labelledby="latest-heading">
  <h2 id="latest-heading">Latest episodes</h2>
  {% assign latest = site.episodes | sort: "number" | reverse %}
  {% if latest.size > 0 %}
  <ul class="episode-list episode-list-lead">
    {% for episode in latest limit: 6 %}{% include episode-card.html episode=episode %}{% endfor %}
  </ul>
  <p><a href="{{ '/episodes/' | relative_url }}">All episodes</a></p>
  {% else %}
  {% include empty-archive.html %}
  {% endif %}
</section>

<section aria-labelledby="podcast-heading">
  <h2 id="podcast-heading">The Tomorrow Gazette Wireless</h2>
  <p class="section-intro">Prefer to listen? Vera and DOT read each edition on our podcast, with the same sources and the same verdicts.</p>
  <p class="hero-actions"><a class="button" href="https://open.spotify.com/show/72zRmWLYLObaiEHp2V1CfW">Listen on Spotify</a></p>
</section>

{% include studio.html %}
