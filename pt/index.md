---
layout: home
title: Início
description: Este espaço é dedicado ao estudo e à aplicação de Estatística e Probabilidade. Nosso objetivo é tornar conceitos técnicos mais acessíveis, promovendo o entendimento por meio de conteúdos claros, exemplos práticos e ferramentas interativas.
lang: pt
ref: homepage
permalink: /
order: 0
mathjax: true

hero_title: "Estatística que se entende"
hero_lede: "Conceitos técnicos em linguagem clara, com exemplos práticos e ferramentas interativas."
hero_cta_text: "Ver os artigos"
hero_cta_url: "#artigos"
hero_image: /assets/images/spiral.jpg
hero_slideshow:
  - { src: /assets/images/spiral.jpg,          alt: "Espiral" }
  - { src: /assets/images/dados.png,           alt: "Dados" }
  - { src: /assets/images/office.png,          alt: "Escritório" }
  - { src: /assets/images/hourglass.png,       alt: "Ampulheta" }
  - { src: /assets/images/cartas.png,          alt: "Cartas de baralho" }
  - { src: /assets/images/mkh-background.png,  alt: "" }
  - { src: /assets/images/mkh-background-2.png, alt: "" }
---

{%- comment -%}
  Card de destaque: sempre a última postagem do blog neste idioma.
{%- endcomment -%}
{%- assign latest = site.posts | where: "lang", page.lang | first -%}
<div class="feature-card feature-card--overlap" id="artigos">
  <h2 class="feature-card__title">{{ latest.title }}</h2>
  <p class="feature-card__text">{{ latest.description | default: latest.excerpt | strip_html | truncatewords: 60 }}</p>
  <a class="read-more" href="{{ latest.url | relative_url }}">
    Leia mais
    <svg aria-hidden="true"><use href="#i-arrow-right"></use></svg>
  </a>
</div>
