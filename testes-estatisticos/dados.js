---
layout: null
---
{%- assign formulas = site.data.standalone | where: "lang", "pt" | where_exp: "a", "a.url contains '/formulas/'" -%}
/* Gerado pelo Jekyll a partir de _data/testes_estatisticos.yml: edite lá.
 * `formulas` vem de _data/standalone.yml e dá o título de cada fórmula
 * citada em `page` ou `veja`. */
window.CATALOGO = {{ site.data.testes_estatisticos | jsonify }};
window.CATALOGO.formulas = {{ formulas | jsonify }};
