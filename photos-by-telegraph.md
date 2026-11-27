---
title: Photos by Telegraph
description: A collage of Tomorrow Gazette studio portraits, episode throwbacks and special dispatches. Every picture of Vera and DOT is AI-generated.
permalink: /photos-by-telegraph/
stylesheet: /assets/css/photos-by-telegraph.css
script: /assets/js/photos-by-telegraph.js
wide: true
image: /assets/img/telegraph-flying-roadster-1280.jpg
---

<section class="telegraph-hero" aria-labelledby="telegraph-heading">
  <p class="kicker">The picture desk</p>
  <h1 id="telegraph-heading">Photos by Telegraph</h1>
  <p class="lede">{{ site.data.photos_by_telegraph.intro }}</p>
</section>

{% for group in site.data.photos_by_telegraph.groups %}
<section class="telegraph-group" aria-labelledby="{{ group.id }}-heading" id="{{ group.id }}">
  <h2 id="{{ group.id }}-heading">{{ group.title }}</h2>
  <p class="section-intro">{{ group.intro }}</p>
  <ul class="telegraph-grid">
    {% for photo in group.photos %}
    {% assign img = site.data.images[photo.image] %}
    {% assign maxw = img.widths | last %}
    <li class="telegraph-card telegraph-{{ photo.shape }}">
      <a class="telegraph-thumb" href="#lb-{{ photo.id }}" id="thumb-{{ photo.id }}">
        {% include picture.html name=photo.image sizes="(min-width: 66rem) 22rem, (min-width: 40rem) 45vw, 100vw" %}
        <span class="telegraph-slug">{{ photo.slug }}</span>
      </a>
      <p class="telegraph-caption">{{ photo.caption }}{% if photo.href %} <a href="{{ photo.href | relative_url }}">Read the episode</a>.{% endif %}</p>
    </li>
    {% endfor %}
  </ul>
</section>
{% endfor %}

{% for group in site.data.photos_by_telegraph.groups %}
{% for photo in group.photos %}
{% assign img = site.data.images[photo.image] %}
{% assign maxw = img.widths | last %}
<div class="telegraph-lightbox" id="lb-{{ photo.id }}" role="dialog" aria-modal="true" aria-labelledby="lb-{{ photo.id }}-title">
  <a class="telegraph-lightbox-backdrop" href="#thumb-{{ photo.id }}" aria-label="Close photograph"></a>
  <figure class="telegraph-lightbox-frame">
    <p class="telegraph-lightbox-kicker" id="lb-{{ photo.id }}-title">Photo by Telegraph · {{ photo.slug }}</p>
    <img src="{{ '/assets/img/' | append: photo.image | append: '-' | append: maxw | append: '.jpg' | relative_url }}" width="{{ img.width }}" height="{{ img.height }}" alt="{{ img.alt | escape }}">
    <figcaption>{{ photo.caption }}{% if photo.href %} <a href="{{ photo.href | relative_url }}">Read the episode</a>.{% endif %}</figcaption>
    <a class="telegraph-lightbox-close" href="#thumb-{{ photo.id }}">Close</a>
  </figure>
</div>
{% endfor %}
{% endfor %}

<p class="fiction-note">Vera Tomorrow, DOT and every picture of them are AI-generated. The predictions behind the episode throwbacks are real and sourced on each episode page.</p>
