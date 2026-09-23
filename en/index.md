---
layout: home
title: Home
description: >-
  This space is dedicated to the study and application of Statistics and Probability. Our aim is to make technical concepts more accessible by promoting understanding through clear content, practical examples and interactive tools.
lang: en
ref: homepage
permalink: /en/
order: 0

hero_title: "Statistics made clear"
hero_lede: "Technical concepts in plain language, with worked examples and interactive tools."
hero_cta_text: "Browse the articles"
hero_cta_url: "#articles"
hero_image: /assets/images/spiral.jpg
hero_slideshow:
  - { src: /assets/images/spiral.jpg,    alt: "Spiral" }
  - { src: /assets/images/dados.png,     alt: "Dice" }
  - { src: /assets/images/office.png,    alt: "Office" }
  - { src: /assets/images/hourglass.png, alt: "Hourglass" }
  - { src: /assets/images/cartas.png,    alt: "Playing cards" }
---

{%- comment -%}
  Card de destaque: sempre a última postagem do blog neste idioma.
{%- endcomment -%}
{%- assign latest = site.posts | where: "lang", page.lang | first -%}
<div class="feature-card feature-card--overlap" id="articles">
  <h2 class="feature-card__title">{{ latest.title }}</h2>
  <p class="feature-card__text">{{ latest.description | default: latest.excerpt | strip_html | truncatewords: 60 }}</p>
  <a class="read-more" href="{{ latest.url | relative_url }}">
    Read more
    <svg aria-hidden="true"><use href="#i-arrow-right"></use></svg>
  </a>
</div>
