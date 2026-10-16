---
title: The future, according to the past
description: Real predictions from the past, checked against what actually happened. Every Tomorrow Gazette episode with its sources and its verdict.
---

<section class="hero">
  <p class="kicker">Archive edition</p>
  <h1>The future, according to the past.</h1>
  <p class="lede">People have always predicted the future. We check how they did. Tomorrow Gazette finds the real predictions, checks what actually happened, and stamps a verdict on each one. This archive keeps every episode with its sources, so you can check our working.</p>
</section>

<section aria-labelledby="verdicts-heading" class="verdict-key">
  <h2 id="verdicts-heading">Four verdicts</h2>
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
  <ul class="episode-list">
    {% for episode in latest limit: 6 %}{% include episode-card.html episode=episode %}{% endfor %}
  </ul>
  <p><a href="{{ '/episodes/' | relative_url }}">All episodes</a></p>
  {% else %}
  {% include empty-archive.html %}
  {% endif %}
</section>

<section aria-labelledby="cast-heading" class="cast">
  <h2 id="cast-heading">Your guides</h2>
  <div class="cast-grid">
    <div class="cast-card">
      <h3>Vera Tomorrow</h3>
      <p class="cast-role">Chief Correspondent</p>
      <p>A newsreader from the golden age of newsreels who is certain the future will be magnificent. She reads each prediction exactly as it was written.</p>
    </div>
    <div class="cast-card cast-card-dot">
      {% include dot.html %}
      <div>
        <h3>DOT</h3>
        <p class="cast-role">Digital Observation &amp; Truth-engine</p>
        <p>A floating chrome fact-checker. DOT was built to establish the truth, and reality keeps making that complicated.</p>
      </div>
    </div>
  </div>
  <p class="fiction-tag">Fiction label: Vera and DOT are AI-generated characters. The predictions they report are real.</p>
</section>
