---
layout: post
image: /assets/images/neonatal.avif
title: "Mortalidade infantil no Brasil: neonatal vs. pós-neonatal em cada estado (com Julia e MicroSUS.jl)"
categories: [VISUALIZAÇÃO DE DADOS, JULIA, SAÚDE PÚBLICA]
tags: [Análise de dados]
lang: pt
ref: mortalidade-infantil-neonatal-posneonatal
author: dante-bertuzzi
description: "Como construí, em Julia, um gráfico de barras empilhadas comparando a mortalidade neonatal e pós-neonatal em cada estado brasileiro, usando dados do SIM e do SINASC via MicroSUS.jl."
slug: mortalidade-infantil-brasil-neonatal-pos-neonatal-julia
---

Um óbito no terceiro dia de vida e um óbito no oitavo mês entram na mesma estatística de mortalidade infantil — mas contam histórias muito diferentes. Separei as duas em Julia, estado por estado.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 1.5em 0 2em 0;">
  <img src="/assets/images/mortalidade_infantil_2023.png" alt="Gráfico de barras empilhadas comparando a taxa de mortalidade neonatal e pós-neonatal em cada estado brasileiro em 2023" style="max-width: 900px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
</figure>

A **taxa de mortalidade infantil** — a proporção de nascidos vivos que morrem antes de completar um ano — é um dos indicadores mais usados para medir a qualidade de um sistema de saúde. Mas o número sozinho esconde histórias muito diferentes: um óbito no **terceiro dia** de vida costuma apontar para problemas de gestação, parto e cuidado neonatal; um óbito no **oitavo mês** costuma apontar para infecções, saneamento e acesso continuado a serviços de saúde.

Foi para separar essas duas histórias que fiz o gráfico acima em **Julia**, usando o pacote [`MicroSUS.jl`](https://github.com/JuliaHealth/MicroSUS.jl) para baixar e ler diretamente os microdados do SUS. Neste post, mostro o código completo e como interpretar o resultado.

## 1) Neonatal e pós-neonatal: por que separar

A literatura de saúde pública divide o primeiro ano de vida em duas janelas:

- **Neonatal** (0 a 27 dias completos): domina por causas ligadas à gestação e ao parto — prematuridade, malformações congênitas, asfixia, infecções adquiridas no parto. Reflete principalmente a qualidade do **pré-natal e da assistência ao parto**.
- **Pós-neonatal** (28 dias a 11 meses): domina por causas ligadas ao **ambiente** em que a criança vive depois de alta — pneumonia, diarreia, desnutrição, acidentes. Reflete mais **saneamento, renda e acesso continuado** a serviços de saúde.

Um estado pode ter mortalidade infantil total parecida com outro e, ainda assim, apontar para problemas completamente diferentes conforme essa proporção. É esse contraste que o gráfico tenta deixar visível.

## 2) As fontes: SIM e SINASC via MicroSUS.jl

Os dados vêm de dois sistemas do Ministério da Saúde:

- **SIM** (Sistema de Informações sobre Mortalidade): um registro por óbito, com a idade da criança ao morrer.
- **SINASC** (Sistema de Informações sobre Nascidos Vivos): um registro por nascimento vivo, usado como denominador.

Em vez de baixar manualmente os arquivos `.dbc` do DATASUS, usei o [`MicroSUS.jl`](https://github.com/JuliaHealth/MicroSUS.jl), que expõe duas funções simples:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">MicroSUS</span>

<span class="code-variable">caminho</span> <span class="code-operator">=</span> <span class="code-function">baixar</span><span class="code-paren">(</span><span class="code-operator">:</span><span class="code-variable">sim</span>, <span class="code-string">"SP"</span>; <span class="code-variable">ano</span> <span class="code-operator">=</span> <span class="code-number">2023</span><span class="code-paren">)</span>     <span class="code-comment"># baixa (e cacheia) o SIM de SP em 2023</span>
<span class="code-variable">tabela</span>  <span class="code-operator">=</span> <span class="code-function">ler</span><span class="code-paren">(</span><span class="code-variable">caminho</span>; <span class="code-variable">colunas</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-operator">:</span><span class="code-variable">IDADE</span>, <span class="code-operator">:</span><span class="code-variable">CODMUNRES</span><span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

O pacote cuida do cache local (por isso os logs `[ Info: cache: ...DOAC2023.dbc`, um por UF, no meu terminal) e devolve os dados como uma tabela particionada — nada precisa ser materializado inteiro em memória.

## 3) O detalhe que decide tudo: o campo `IDADE` do SIM

A parte mais delicada do código não é estatística, é **decodificação de formato**. No SIM, a idade ao óbito vem em um campo de 3 dígitos: o primeiro dígito é a **unidade**, os outros dois são o **valor**.

| 1º dígito | Unidade  |
|:---------:|----------|
| 0         | minutos  |
| 1         | horas    |
| 2         | dias     |
| 3         | meses    |
| 4         | anos     |
| 9         | ignorada |

Um óbito com `"205"` significa "5 dias" (neonatal); `"302"` significa "2 meses" (pós-neonatal). A fronteira dos 28 dias cai bem no meio da unidade "dias", então a classificação precisa comparar o valor, não só a unidade:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">function</span> <span class="code-function">faixa_obito_infantil</span><span class="code-paren">(</span><span class="code-variable">idade</span><span class="code-operator">::</span><span class="code-function">AbstractString</span><span class="code-paren">)</span>
    <span class="code-variable">t</span> <span class="code-operator">=</span> <span class="code-function">strip</span><span class="code-paren">(</span><span class="code-variable">idade</span><span class="code-paren">)</span>
    <span class="code-paren">(</span><span class="code-function">length</span><span class="code-paren">(</span><span class="code-variable">t</span><span class="code-paren">)</span> <span class="code-operator">!=</span> <span class="code-number">3</span> <span class="code-operator">||</span> <span class="code-operator">!</span><span class="code-function">all</span><span class="code-paren">(</span><span class="code-function">isdigit</span>, <span class="code-variable">t</span><span class="code-paren">)</span><span class="code-paren">)</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">return</span> <span class="code-operator">:</span><span class="code-variable">fora</span>
    <span class="code-variable">u</span> <span class="code-operator">=</span> <span class="code-variable">t</span><span class="code-paren">[</span><span class="code-number">1</span><span class="code-paren">]</span> <span class="code-operator">-</span> <span class="code-string">'0'</span>
    <span class="code-variable">v</span> <span class="code-operator">=</span> <span class="code-number">10</span> <span class="code-operator">*</span> <span class="code-paren">(</span><span class="code-variable">t</span><span class="code-paren">[</span><span class="code-number">2</span><span class="code-paren">]</span> <span class="code-operator">-</span> <span class="code-string">'0'</span><span class="code-paren">)</span> <span class="code-operator">+</span> <span class="code-paren">(</span><span class="code-variable">t</span><span class="code-paren">[</span><span class="code-number">3</span><span class="code-paren">]</span> <span class="code-operator">-</span> <span class="code-string">'0'</span><span class="code-paren">)</span>
    <span class="code-paren">(</span><span class="code-variable">u</span> <span class="code-operator">==</span> <span class="code-number">0</span> <span class="code-operator">||</span> <span class="code-variable">u</span> <span class="code-operator">==</span> <span class="code-number">1</span><span class="code-paren">)</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">return</span> <span class="code-operator">:</span><span class="code-variable">neonatal</span>            <span class="code-comment"># minutos, horas</span>
    <span class="code-variable">u</span> <span class="code-operator">==</span> <span class="code-number">2</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">return</span> <span class="code-variable">v</span> <span class="code-operator">&lt;</span> <span class="code-number">28</span> <span class="code-operator">?</span> <span class="code-operator">:</span><span class="code-variable">neonatal</span> <span class="code-operator">:</span> <span class="code-operator">:</span><span class="code-variable">posneonatal</span>
    <span class="code-variable">u</span> <span class="code-operator">==</span> <span class="code-number">3</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">return</span> <span class="code-variable">v</span> <span class="code-operator">==</span> <span class="code-number">0</span> <span class="code-operator">?</span> <span class="code-operator">:</span><span class="code-variable">neonatal</span> <span class="code-operator">:</span> <span class="code-operator">:</span><span class="code-variable">posneonatal</span>
    <span class="code-keyword">return</span> <span class="code-operator">:</span><span class="code-variable">fora</span>
<span class="code-keyword">end</span>
<span class="code-function">faixa_obito_infantil</span><span class="code-paren">(</span><span class="code-operator">::</span><span class="code-function">Missing</span><span class="code-paren">)</span> <span class="code-operator">=</span> <span class="code-operator">:</span><span class="code-variable">fora</span></code></pre>
  </div>
</div>

Um caso ambíguo de propósito: `"400"` (zero anos completos, sem mais detalhe) é descartado — não dá para saber de que lado dos 28 dias o óbito cai, então incluí-lo enviesaria uma das duas faixas. Fica registrado na nota de rodapé do gráfico.

## 4) Agregando por UF de residência

Com a função de classificação pronta, o resto é contar. Um ponto importante: uso sempre `CODMUNRES` (município de **residência**), não o município de ocorrência do óbito — assim um parto complicado que termina num hospital de referência em outra cidade continua contando para a UF de origem da família.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">function</span> <span class="code-function">coletar</span><span class="code-paren">(</span><span class="code-variable">cfg</span><span class="code-operator">::</span><span class="code-function">Config</span> <span class="code-operator">=</span> <span class="code-function">Config</span><span class="code-paren">(</span><span class="code-paren">)</span><span class="code-paren">)</span>
    <span class="code-variable">neo</span> <span class="code-operator">=</span> <span class="code-function">Dict</span><span class="code-paren">{</span><span class="code-function">String</span>,<span class="code-function">Int</span><span class="code-paren">}</span><span class="code-paren">(</span><span class="code-variable">uf</span> <span class="code-operator">=&gt;</span> <span class="code-number">0</span> <span class="code-keyword">for</span> <span class="code-variable">uf</span> <span class="code-keyword">in</span> <span class="code-variable">UFS</span><span class="code-paren">)</span>
    <span class="code-variable">pos</span> <span class="code-operator">=</span> <span class="code-function">Dict</span><span class="code-paren">{</span><span class="code-function">String</span>,<span class="code-function">Int</span><span class="code-paren">}</span><span class="code-paren">(</span><span class="code-variable">uf</span> <span class="code-operator">=&gt;</span> <span class="code-number">0</span> <span class="code-keyword">for</span> <span class="code-variable">uf</span> <span class="code-keyword">in</span> <span class="code-variable">UFS</span><span class="code-paren">)</span>
    <span class="code-variable">nvs</span> <span class="code-operator">=</span> <span class="code-function">Dict</span><span class="code-paren">{</span><span class="code-function">String</span>,<span class="code-function">Int</span><span class="code-paren">}</span><span class="code-paren">(</span><span class="code-variable">uf</span> <span class="code-operator">=&gt;</span> <span class="code-number">0</span> <span class="code-keyword">for</span> <span class="code-variable">uf</span> <span class="code-keyword">in</span> <span class="code-variable">UFS</span><span class="code-paren">)</span>

    <span class="code-comment"># óbitos infantis (SIM)</span>
    <span class="code-keyword">for</span> <span class="code-variable">uf</span> <span class="code-keyword">in</span> <span class="code-variable">UFS</span>
        <span class="code-variable">caminho</span> <span class="code-operator">=</span> <span class="code-function">baixar</span><span class="code-paren">(</span><span class="code-operator">:</span><span class="code-variable">sim</span>, <span class="code-variable">uf</span>; <span class="code-variable">ano</span> <span class="code-operator">=</span> <span class="code-variable">cfg</span><span class="code-operator">.</span><span class="code-variable">ano</span><span class="code-paren">)</span>
        <span class="code-function">isnothing</span><span class="code-paren">(</span><span class="code-variable">caminho</span><span class="code-paren">)</span> <span class="code-operator">&amp;&amp;</span> <span class="code-paren">(</span><span class="code-function">@warn</span> <span class="code-string">"SIM ausente"</span> <span class="code-variable">uf</span>; <span class="code-keyword">continue</span><span class="code-paren">)</span>

        <span class="code-variable">tabela</span> <span class="code-operator">=</span> <span class="code-function">ler</span><span class="code-paren">(</span><span class="code-variable">caminho</span>; <span class="code-variable">colunas</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-operator">:</span><span class="code-variable">IDADE</span>, <span class="code-operator">:</span><span class="code-variable">CODMUNRES</span><span class="code-paren">]</span>,
                     <span class="code-variable">schema</span> <span class="code-operator">=</span> <span class="code-keyword">nothing</span>, <span class="code-variable">tamanho_lote</span> <span class="code-operator">=</span> <span class="code-variable">cfg</span><span class="code-operator">.</span><span class="code-variable">tamanho_lote</span><span class="code-paren">)</span>

        <span class="code-keyword">for</span> <span class="code-variable">lote</span> <span class="code-keyword">in</span> <span class="code-module">Tables</span><span class="code-operator">.</span><span class="code-function">partitions</span><span class="code-paren">(</span><span class="code-variable">tabela</span><span class="code-paren">)</span>
            <span class="code-variable">idades</span> <span class="code-operator">=</span> <span class="code-module">Tables</span><span class="code-operator">.</span><span class="code-function">getcolumn</span><span class="code-paren">(</span><span class="code-variable">lote</span>, <span class="code-operator">:</span><span class="code-variable">IDADE</span><span class="code-paren">)</span>
            <span class="code-variable">munis</span>  <span class="code-operator">=</span> <span class="code-module">Tables</span><span class="code-operator">.</span><span class="code-function">getcolumn</span><span class="code-paren">(</span><span class="code-variable">lote</span>, <span class="code-operator">:</span><span class="code-variable">CODMUNRES</span><span class="code-paren">)</span>
            <span class="code-keyword">for</span> <span class="code-variable">i</span> <span class="code-keyword">in</span> <span class="code-function">eachindex</span><span class="code-paren">(</span><span class="code-variable">idades</span><span class="code-paren">)</span>
                <span class="code-paren">(</span><span class="code-function">ismissing</span><span class="code-paren">(</span><span class="code-variable">idades</span><span class="code-paren">[</span><span class="code-variable">i</span><span class="code-paren">]</span><span class="code-paren">)</span> <span class="code-operator">||</span> <span class="code-function">ismissing</span><span class="code-paren">(</span><span class="code-variable">munis</span><span class="code-paren">[</span><span class="code-variable">i</span><span class="code-paren">]</span><span class="code-paren">)</span><span class="code-paren">)</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">continue</span>
                <span class="code-variable">faixa</span> <span class="code-operator">=</span> <span class="code-function">faixa_obito_infantil</span><span class="code-paren">(</span><span class="code-function">String</span><span class="code-paren">(</span><span class="code-variable">idades</span><span class="code-paren">[</span><span class="code-variable">i</span><span class="code-paren">]</span><span class="code-paren">)</span><span class="code-paren">)</span>
                <span class="code-variable">faixa</span> <span class="code-operator">===</span> <span class="code-operator">:</span><span class="code-variable">fora</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">continue</span>
                <span class="code-variable">sigla</span> <span class="code-operator">=</span> <span class="code-function">uf_de_codmun</span><span class="code-paren">(</span><span class="code-function">String</span><span class="code-paren">(</span><span class="code-variable">munis</span><span class="code-paren">[</span><span class="code-variable">i</span><span class="code-paren">]</span><span class="code-paren">)</span><span class="code-paren">)</span>
                <span class="code-function">isnothing</span><span class="code-paren">(</span><span class="code-variable">sigla</span><span class="code-paren">)</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">continue</span>
                <span class="code-variable">faixa</span> <span class="code-operator">===</span> <span class="code-operator">:</span><span class="code-variable">neonatal</span> <span class="code-operator">?</span> <span class="code-paren">(</span><span class="code-variable">neo</span><span class="code-paren">[</span><span class="code-variable">sigla</span><span class="code-paren">]</span> <span class="code-operator">+=</span> <span class="code-number">1</span><span class="code-paren">)</span> <span class="code-operator">:</span> <span class="code-paren">(</span><span class="code-variable">pos</span><span class="code-paren">[</span><span class="code-variable">sigla</span><span class="code-paren">]</span> <span class="code-operator">+=</span> <span class="code-number">1</span><span class="code-paren">)</span>
            <span class="code-keyword">end</span>
        <span class="code-keyword">end</span>
    <span class="code-keyword">end</span>

    <span class="code-comment"># nascidos vivos (SINASC)</span>
    <span class="code-keyword">for</span> <span class="code-variable">uf</span> <span class="code-keyword">in</span> <span class="code-variable">UFS</span>
        <span class="code-variable">caminho</span> <span class="code-operator">=</span> <span class="code-function">baixar</span><span class="code-paren">(</span><span class="code-operator">:</span><span class="code-variable">sinasc</span>, <span class="code-variable">uf</span>; <span class="code-variable">ano</span> <span class="code-operator">=</span> <span class="code-variable">cfg</span><span class="code-operator">.</span><span class="code-variable">ano</span><span class="code-paren">)</span>
        <span class="code-function">isnothing</span><span class="code-paren">(</span><span class="code-variable">caminho</span><span class="code-paren">)</span> <span class="code-operator">&amp;&amp;</span> <span class="code-paren">(</span><span class="code-function">@warn</span> <span class="code-string">"SINASC ausente"</span> <span class="code-variable">uf</span>; <span class="code-keyword">continue</span><span class="code-paren">)</span>
        <span class="code-variable">tabela</span> <span class="code-operator">=</span> <span class="code-function">ler</span><span class="code-paren">(</span><span class="code-variable">caminho</span>; <span class="code-variable">colunas</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-operator">:</span><span class="code-variable">CODMUNRES</span><span class="code-paren">]</span>,
                     <span class="code-variable">schema</span> <span class="code-operator">=</span> <span class="code-keyword">nothing</span>, <span class="code-variable">tamanho_lote</span> <span class="code-operator">=</span> <span class="code-variable">cfg</span><span class="code-operator">.</span><span class="code-variable">tamanho_lote</span><span class="code-paren">)</span>
        <span class="code-keyword">for</span> <span class="code-variable">lote</span> <span class="code-keyword">in</span> <span class="code-module">Tables</span><span class="code-operator">.</span><span class="code-function">partitions</span><span class="code-paren">(</span><span class="code-variable">tabela</span><span class="code-paren">)</span>
            <span class="code-keyword">for</span> <span class="code-variable">m</span> <span class="code-keyword">in</span> <span class="code-module">Tables</span><span class="code-operator">.</span><span class="code-function">getcolumn</span><span class="code-paren">(</span><span class="code-variable">lote</span>, <span class="code-operator">:</span><span class="code-variable">CODMUNRES</span><span class="code-paren">)</span>
                <span class="code-function">ismissing</span><span class="code-paren">(</span><span class="code-variable">m</span><span class="code-paren">)</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">continue</span>
                <span class="code-variable">sigla</span> <span class="code-operator">=</span> <span class="code-function">uf_de_codmun</span><span class="code-paren">(</span><span class="code-function">String</span><span class="code-paren">(</span><span class="code-variable">m</span><span class="code-paren">)</span><span class="code-paren">)</span>
                <span class="code-function">isnothing</span><span class="code-paren">(</span><span class="code-variable">sigla</span><span class="code-paren">)</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">continue</span>
                <span class="code-variable">nvs</span><span class="code-paren">[</span><span class="code-variable">sigla</span><span class="code-paren">]</span> <span class="code-operator">+=</span> <span class="code-number">1</span>
            <span class="code-keyword">end</span>
        <span class="code-keyword">end</span>
    <span class="code-keyword">end</span>

    <span class="code-variable">resultado</span> <span class="code-operator">=</span> <span class="code-function">Dict</span><span class="code-paren">{</span><span class="code-function">String</span>,<span class="code-function">NamedTuple</span><span class="code-paren">}</span><span class="code-paren">(</span><span class="code-paren">)</span>
    <span class="code-keyword">for</span> <span class="code-variable">uf</span> <span class="code-keyword">in</span> <span class="code-variable">UFS</span>
        <span class="code-variable">nv</span> <span class="code-operator">=</span> <span class="code-variable">nvs</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span>
        <span class="code-variable">nv</span> <span class="code-operator">&gt;</span> <span class="code-variable">cfg</span><span class="code-operator">.</span><span class="code-variable">minimo_nascimentos</span> <span class="code-operator">||</span> <span class="code-keyword">continue</span>
        <span class="code-variable">resultado</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span> <span class="code-operator">=</span> <span class="code-paren">(</span><span class="code-variable">neo</span> <span class="code-operator">=</span> <span class="code-variable">neo</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span>, <span class="code-variable">pos</span> <span class="code-operator">=</span> <span class="code-variable">pos</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span>, <span class="code-variable">nascimentos</span> <span class="code-operator">=</span> <span class="code-variable">nv</span>,
                         <span class="code-variable">taxa_neo</span> <span class="code-operator">=</span> <span class="code-variable">neo</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span> <span class="code-operator">/</span> <span class="code-variable">nv</span>, <span class="code-variable">taxa_pos</span> <span class="code-operator">=</span> <span class="code-variable">pos</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span> <span class="code-operator">/</span> <span class="code-variable">nv</span><span class="code-paren">)</span>
    <span class="code-keyword">end</span>
    <span class="code-keyword">return</span> <span class="code-variable">resultado</span>
<span class="code-keyword">end</span></code></pre>
  </div>
</div>

Repare que peço explicitamente `schema = nothing` na leitura do SIM: isso faz o `IDADE` chegar como texto cru (`"205"`, `"302"`...), em vez de já convertido para anos — a conversão automática do `MicroSUS.jl` perderia justamente a granularidade fina que a fronteira dos 28 dias exige.

## 5) A figura: barras empilhadas com `CairoMakie`

Para a visualização, escolhi barras horizontais empilhadas — uma linha por estado, ordenadas pela taxa total decrescente, com a fatia neonatal (lilás) e pós-neonatal (rosa) uma ao lado da outra em cada barra.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">function</span> <span class="code-function">grafico_mortalidade</span><span class="code-paren">(</span><span class="code-variable">dados</span><span class="code-operator">::</span><span class="code-function">AbstractDict</span>, <span class="code-variable">cfg</span><span class="code-operator">::</span><span class="code-function">Config</span> <span class="code-operator">=</span> <span class="code-function">Config</span><span class="code-paren">(</span><span class="code-paren">)</span><span class="code-paren">)</span>
    <span class="code-variable">ufs</span> <span class="code-operator">=</span> <span class="code-function">sort</span><span class="code-paren">(</span><span class="code-function">collect</span><span class="code-paren">(</span><span class="code-function">keys</span><span class="code-paren">(</span><span class="code-variable">dados</span><span class="code-paren">)</span><span class="code-paren">)</span>;
               <span class="code-variable">by</span> <span class="code-operator">=</span> <span class="code-variable">uf</span> <span class="code-operator">-&gt;</span> <span class="code-operator">-</span><span class="code-paren">(</span><span class="code-variable">dados</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span><span class="code-operator">.</span><span class="code-variable">taxa_neo</span> <span class="code-operator">+</span> <span class="code-variable">dados</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span><span class="code-operator">.</span><span class="code-variable">taxa_pos</span><span class="code-paren">)</span><span class="code-paren">)</span>
    <span class="code-variable">n</span>     <span class="code-operator">=</span> <span class="code-function">length</span><span class="code-paren">(</span><span class="code-variable">ufs</span><span class="code-paren">)</span>
    <span class="code-variable">nomes</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">UF_NOME</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span> <span class="code-keyword">for</span> <span class="code-variable">uf</span> <span class="code-keyword">in</span> <span class="code-variable">ufs</span><span class="code-paren">]</span>
    <span class="code-variable">tneo</span>  <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">dados</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span><span class="code-operator">.</span><span class="code-variable">taxa_neo</span> <span class="code-keyword">for</span> <span class="code-variable">uf</span> <span class="code-keyword">in</span> <span class="code-variable">ufs</span><span class="code-paren">]</span>
    <span class="code-variable">tpos</span>  <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">dados</span><span class="code-paren">[</span><span class="code-variable">uf</span><span class="code-paren">]</span><span class="code-operator">.</span><span class="code-variable">taxa_pos</span> <span class="code-keyword">for</span> <span class="code-variable">uf</span> <span class="code-keyword">in</span> <span class="code-variable">ufs</span><span class="code-paren">]</span>
    <span class="code-variable">ys</span>    <span class="code-operator">=</span> <span class="code-function">collect</span><span class="code-paren">(</span><span class="code-variable">n</span><span class="code-operator">:</span><span class="code-operator">-</span><span class="code-number">1</span><span class="code-operator">:</span><span class="code-number">1</span><span class="code-paren">)</span>   <span class="code-comment"># decrescente: o primeiro da lista fica no topo</span>

    <span class="code-variable">ax</span> <span class="code-operator">=</span> <span class="code-function">Axis</span><span class="code-paren">(</span><span class="code-variable">fig</span><span class="code-paren">[</span><span class="code-number">3</span>, <span class="code-number">1</span><span class="code-paren">]</span>; <span class="code-variable">yticks</span> <span class="code-operator">=</span> <span class="code-paren">(</span><span class="code-variable">ys</span>, <span class="code-variable">nomes</span><span class="code-paren">)</span><span class="code-paren">)</span>          <span class="code-comment"># eixo com só os rótulos das UFs</span>
    <span class="code-function">barplot!</span><span class="code-paren">(</span><span class="code-variable">ax</span>, <span class="code-variable">ys</span>, <span class="code-variable">tneo</span>; <span class="code-variable">direction</span> <span class="code-operator">=</span> <span class="code-operator">:</span><span class="code-variable">x</span>, <span class="code-variable">color</span> <span class="code-operator">=</span> <span class="code-variable">BAR_NEO</span>, <span class="code-variable">width</span> <span class="code-operator">=</span> <span class="code-number">0.72</span><span class="code-paren">)</span>
    <span class="code-function">barplot!</span><span class="code-paren">(</span><span class="code-variable">ax</span>, <span class="code-variable">ys</span>, <span class="code-variable">tneo</span> <span class="code-operator">.+</span> <span class="code-variable">tpos</span>; <span class="code-variable">direction</span> <span class="code-operator">=</span> <span class="code-operator">:</span><span class="code-variable">x</span>, <span class="code-variable">fillto</span> <span class="code-operator">=</span> <span class="code-variable">tneo</span>,
             <span class="code-variable">color</span> <span class="code-operator">=</span> <span class="code-variable">BAR_POS</span>, <span class="code-variable">width</span> <span class="code-operator">=</span> <span class="code-number">0.72</span><span class="code-paren">)</span>
    <span class="code-comment"># rótulos, cabeçalhos de coluna e rodapé omitidos por brevidade</span>
<span class="code-keyword">end</span></code></pre>
  </div>
</div>

Alguns detalhes que valeram a pena registrar como comentário no próprio script:

- **Ordenação manual do eixo Y.** Em vez de confiar em `yreversed`, gero as posições já na ordem decrescente (`n:-1:1`) — mais previsível quando a figura também usa `limits!` explícito.
- **Coluna única no layout.** Com duas colunas e `Label`s em `tellwidth = false`, as larguras ficam indeterminadas e o texto vaza da figura. Uma coluna só, com quebras de linha manuais, resolve.
- **Formatação pt-BR sem zeros à direita.** Uma função `pct` pequena transforma `0.0068` em `"0,68%"` e `0.0100` em `"1%"`, sem o zero decorativo.
- **Logo com fallback.** A logo é baixada uma vez para o `tempdir()`; se a rede falhar, a figura não quebra — só cai para uma assinatura em texto.

## 6) O resultado no terminal

Antes da figura, o script imprime o ranking bruto, útil para conferir os números que vão para o gráfico:

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>Roraima              neo  1.366%  pós  1.023%   (nv = 13105)
Amapá                neo  1.189%  pós  0.904%   (nv = 12948)
Sergipe              neo  1.193%  pós  0.655%   (nv = 29005)
Amazonas             neo  1.011%  pós  0.698%   (nv = 70453)
Acre                 neo  1.002%  pós  0.691%   (nv = 14473)
Pará                 neo  1.009%  pós  0.495%   (nv = 126152)
Piauí                neo  0.928%  pós  0.567%   (nv = 42144)
Maranhão             neo  0.976%  pós  0.508%   (nv = 97205)
Bahia                neo  1.056%  pós  0.425%   (nv = 170314)
Mato Grosso          neo  0.924%  pós  0.480%   (nv = 58553)
Alagoas              neo  0.885%  pós  0.471%   (nv = 46543)
Mato Grosso do Sul   neo  0.825%  pós  0.529%   (nv = 40233)
Rio de Janeiro       neo  0.898%  pós  0.448%   (nv = 176145)
Pernambuco           neo  0.844%  pós  0.477%   (nv = 116175)
Paraíba              neo  0.854%  pós  0.442%   (nv = 51531)
Tocantins            neo  0.843%  pós  0.428%   (nv = 23145)
Goiás                neo  0.842%  pós  0.404%   (nv = 91822)
Rondônia             neo  0.727%  pós  0.497%   (nv = 23921)
Ceará                neo  0.837%  pós  0.335%   (nv = 111091)
Espírito Santo       neo  0.776%  pós  0.383%   (nv = 52187)
São Paulo            neo  0.787%  pós  0.349%   (nv = 503910)
Minas Gerais         neo  0.792%  pós  0.336%   (nv = 233918)
Rio Grande do Norte  neo  0.751%  pós  0.365%   (nv = 39440)
Distrito Federal     neo  0.776%  pós  0.309%   (nv = 35551)
Paraná               neo  0.750%  pós  0.330%   (nv = 139836)
Rio Grande do Sul    neo  0.682%  pós  0.286%   (nv = 120974)
Santa Catarina       neo  0.629%  pós  0.278%   (nv = 96802)</code></pre>
  </div>
</div>

## 7) Lendo o gráfico

Alguns padrões saltam aos olhos:

- **O Norte e o Nordeste ocupam o topo em quase todas as posições.** Roraima, Amapá, Sergipe, Amazonas e Acre têm as cinco maiores taxas totais — e são também os cinco únicos estados com pós-neonatal acima de 0,6%, a fatia mais associada a condições de vida e acesso continuado a serviços de saúde.
- **A fatia neonatal domina em praticamente todo o país.** Mesmo nos estados do Sul, com as menores taxas totais (Rio Grande do Sul e Santa Catarina fecham a lista), a parte neonatal segue maior que a pós-neonatal — sinal de que os ganhos dos últimos anos vieram mais de reduzir mortes evitáveis depois do primeiro mês do que de resolver a raiz perinatal.
- **A proporção entre as duas fatias varia mais do que o total.** Bahia (neo 1,06% / pós 0,43%) e Rio de Janeiro (neo 0,90% / pós 0,45%) têm pós-neonatal quase idêntico — a diferença na taxa total entre os dois vem quase inteiramente da fatia neonatal, sugerindo que o gargalo da Bahia está mais concentrado no início da vida do que no restante do primeiro ano.
- **Distrito Federal quebra o padrão regional**, com taxa total baixa (comparável a Paraná e Rio Grande do Norte) apesar de estar fora do Sul/Sudeste — reflexo, provavelmente, de renda e estrutura de saúde concentradas na capital federal.

## 8) Limitações

- **Atribuição por UF de residência**, não de ocorrência — o objetivo é medir o resultado para a família, não a carga do hospital.
- **Óbitos com idade registrada só como `"0 anos"`** (sem indicar dias/meses) foram descartados — não é possível saber de que lado da fronteira dos 28 dias eles caem, e incluí-los arbitrariamente distorceria a comparação entre as duas fatias.
- **Um único ano (2023).** Taxas de mortalidade infantil sofrem flutuação amostral, especialmente em UFs menores (Roraima, Amapá, Acre têm poucos nascimentos): comparações estado a estado ficam mais confiáveis olhando para uma série de anos, não um único corte.

## 9) Código-fonte

O script completo — configuração, cores, dicionários de UF, classificação de idade, agregação e montagem da figura — está reproduzido nas seções acima. Ele depende de:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Pkg</span>
<span class="code-module">Pkg</span><span class="code-operator">.</span><span class="code-function">add</span><span class="code-paren">(</span><span class="code-paren">[</span><span class="code-string">"MicroSUS"</span>, <span class="code-string">"CairoMakie"</span>, <span class="code-string">"Tables"</span><span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

## Referências

**Pacotes Julia:**
- [MicroSUS.jl](https://github.com/JuliaHealth/MicroSUS.jl) — leitura de microdados do DATASUS direto em Julia.
- [CairoMakie.jl](https://docs.makie.org/stable/) — biblioteca de visualização.

**Fontes dos dados:**
- Ministério da Saúde — SIM (Sistema de Informações sobre Mortalidade) e SINASC (Sistema de Informações sobre Nascidos Vivos), ano de referência 2023.

---

### Nota Importante sobre os Dados e a Análise

**Todos os dados utilizados nesta análise são de domínio público**, extraídos dos sistemas SIM e SINASC do Ministério da Saúde do Brasil, via `MicroSUS.jl`.

Esta análise foi realizada de forma **independente**, com propósitos puramente **educacionais e de demonstração tecnológica**. Os resultados, visualizações e conclusões aqui apresentados **não representam um comunicado oficial** de qualquer órgão governamental, seja municipal, estadual ou federal. O autor não possui vínculo nem recebeu financiamento de nenhuma entidade pública para a realização deste trabalho.

O objetivo deste artigo é estritamente didático: demonstrar o processo de coleta, classificação e visualização de dados de saúde pública utilizando a linguagem Julia. As informações não devem ser utilizadas como base para a tomada de decisões de políticas públicas, alocação de recursos ou avaliações de gestão. O autor não se responsabiliza por quaisquer interpretações, usos ou consequências derivadas da leitura deste material.

---

<style>
.share-buttons {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #444;
  text-align: center;
}
.share-buttons-title {
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 1.1em;
}
.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  margin: 5px;
  border-radius: 50%;
  text-decoration: none;
  background-color: transparent;
  color: #333 !important;
  font-size: 24px;
  border: none;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}
.share-btn:hover {
  color: #000 !important;
  transform: scale(1.1);
}
</style>

<div class="share-buttons">
  <p class="share-buttons-title">Gostou deste artigo? Compartilhe!</p>
  <a href="https://api.whatsapp.com/send?text={{ page.title | url_encode }}%20-%20{{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp" title="Compartilhar no WhatsApp"><i class="bi bi-whatsapp"></i></a>
  <a href="https://www.facebook.com/sharer/sharer.php?u={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn facebook" title="Compartilhar no Facebook"><i class="bi bi-facebook"></i></a>
  <a href="https://www.linkedin.com/shareArticle?mini=true&url={{ site.url }}{{ page.url }}&title={{ page.title | url_encode }}&summary={{ page.description | url_encode }}" target="_blank" rel="noopener noreferrer" class="share-btn linkedin" title="Compartilhar no LinkedIn"><i class="bi bi-linkedin"></i></a>
  <a href="https://x.com/intent/tweet?text={{ page.title | url_encode }}&url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn twitter-x" title="Compartilhar no X"><i class="bi bi-twitter-x"></i></a>
  <button id="copy-link-btn" class="share-btn copy-link" title="Copiar Link"><i class="bi bi-link-45deg"></i></button>
</div>

<script>
document.getElementById('copy-link-btn').addEventListener('click', function() {
  navigator.clipboard.writeText(window.location.href).then(function() {
    const button = this;
    const originalContent = button.innerHTML;
    button.innerHTML = 'Copiado!';
    button.style.fontSize = '12px';
    button.style.fontWeight = 'bold';
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.style.fontSize = '';
      button.style.fontWeight = '';
    }, 2000);
  }.bind(this), function(err) {
    console.error('Erro ao copiar o link: ', err);
  });
});
</script>

<!-- Fim do artigo -->
