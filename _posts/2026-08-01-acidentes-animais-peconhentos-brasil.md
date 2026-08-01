---
layout: post
image: /assets/images/animais.avif
title: "Quem pica mais não é quem mais mata: acidentes por animais peçonhentos no Brasil (Julia + MicroSUS.jl)"
categories: [VISUALIZAÇÃO DE DADOS, JULIA, SAÚDE PÚBLICA]
tags: [Análise de dados]
lang: pt
ref: acidentes-animais-peconhentos-brasil
author: dante-bertuzzi
description: "Uso Julia e o pacote MicroSUS.jl para analisar dez anos de notificações do Sinan sobre acidentes com animais peçonhentos no Brasil: ranking por letalidade, sazonalidade nacional e regional, e a relação com clima."
slug: acidentes-por-animais-peconhentos-no-brasil-sazonalidade-clima-julia
---

Escorpião pica muito mais do que mata; serpente mata muito mais do que pica. Usei dez anos de notificações do Sinan, em Julia, para separar as duas histórias — e depois testei se o calendário desses acidentes é explicado por temperatura, por chuva, ou por nenhuma das duas isoladamente.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 1.5em 0 2em 0;">
  <img src="/assets/images/ranking_peconhentos_2023.png" alt="Gráfico de barras comparando notificações e letalidade por tipo de animal peçonhento no Brasil em 2023" style="max-width: 900px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
</figure>

Toda a análise abaixo foi feita com o pacote [`MicroSUS.jl`](https://github.com/dantebertuzzi/MicroSUS.jl), que baixa e lê os microdados do Sinan direto do DATASUS, e `CairoMakie` para as figuras. São cinco scripts encadeados: ranking, sazonalidade nacional, sazonalidade por região, clima e correlações. Neste post mostro os quatro gráficos que eles produzem e como interpreto cada um.

## 1) A fonte: Sinan — Animais Peçonhentos

Toda notificação de acidente com animal peçonhento no Brasil entra no **Sinan** (Sistema de Informação de Agravos de Notificação), módulo `ANIM`. O campo que identifica o tipo de animal chama `TP_ACIDENT` — não `TP_ACIDENTE`: nomes de campo em DBF têm no máximo 10 caracteres, e é fácil errar esse detalhe na primeira tentativa.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">MicroSUS</span>

<span class="code-variable">caminho</span> <span class="code-operator">=</span> <span class="code-function">baixar_sinan</span><span class="code-paren">(</span><span class="code-operator">:</span><span class="code-variable">acidente_animais</span>; <span class="code-variable">ano</span> <span class="code-operator">=</span> <span class="code-number">2023</span><span class="code-paren">)</span>
<span class="code-variable">tab</span>     <span class="code-operator">=</span> <span class="code-function">ler</span><span class="code-paren">(</span><span class="code-variable">caminho</span>; <span class="code-variable">colunas</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-operator">:</span><span class="code-variable">TP_ACIDENT</span>, <span class="code-operator">:</span><span class="code-variable">EVOLUCAO</span>, <span class="code-operator">:</span><span class="code-variable">DT_OBITO</span><span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Cada registro traz o tipo de animal (`"1"` a `"6"` — serpente, aranha, escorpião, lagarta, abelha, outros) e o desfecho (`EVOLUCAO`). Um detalhe que muda o resultado: `EVOLUCAO == "2"` é óbito **pelo próprio agravo**; `"3"` é óbito por outra causa, e não deve entrar na letalidade — misturar os dois infla o número artificialmente.

## 2) Ranking 2023: quem pica mais não é quem mais mata

A figura do topo do post resume 352.954 notificações de 2023. Duas colunas contam histórias opostas:

- **Escorpião domina em volume** — 208.349 notificações, quase 59% do total — mas tem a **menor letalidade da lista** depois da lagarta: 5,6 óbitos por 10 mil casos (117 óbitos).
- **Serpente é rara e letal**: só 33.661 notificações (menos que aranha ou abelha), mas a **maior letalidade**, 38,9 por 10 mil casos — quase 7× a do escorpião — totalizando 131 óbitos, o maior número absoluto.
- **Abelha fica no meio**: 34.648 casos e letalidade de 34,1 por 10 mil, próxima da serpente. Picadas múltiplas e reação anafilática pesam mais do que o veneno em si de uma picada isolada.
- **Aranha, com 44.925 casos, tem letalidade baixa** (7,8 por 10 mil) — a maioria dos acidentes por aranha no Brasil (gênero *Phoneutrius*, *Loxosceles*) causa quadros dolorosos, mas raramente fatais.

Duas ressalvas que ficam registradas no rodapé da própria figura e no script:

- **A espécie do escorpião não é registrada no Sinan.** A ficha tem campo para gênero de serpente e de aranha, mas nada equivalente para escorpião — *Tityus serrulatus*, a espécie mais perigosa, fica indistinguível de outras nos microdados.
- **Óbitos são subnotificados.** Contando só `EVOLUCAO == "2"`, o escorpião fecha 2023 com 117 óbitos no Sinan — contra 134 publicados pelo Ministério da Saúde por outras vias. A ficha costuma ser encerrada no atendimento inicial e nem sempre é atualizada com o desfecho final; o script conta à parte os casos "sem evolução" e os com `DT_OBITO` preenchida mas sem a flag, exatamente para dimensionar esse buraco.

## 3) Sazonalidade nacional: dez anos, um perfil por animal

Ranking e letalidade são um retrato de um único ano. Para ver o **padrão que se repete**, processei dez anos de arquivos (2014–2023), extraindo o mês dos primeiros sintomas (`DT_SIN_PRI`) de cada notificação.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 1.5em 0 2em 0;">
  <img src="/assets/images/sazonalidade_peconhentos.png" alt="Seis painéis mostrando a distribuição mensal média de notificações por tipo de animal peçonhento, Brasil, 2014 a 2023" style="max-width: 900px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
</figure>

Cada painel soma 100% ao longo do ano — é a única forma de comparar escorpião (1,4 milhão de casos na década) com lagarta (49,6 mil) na mesma escala. A faixa sombreada é ±1 desvio-padrão **entre os anos**: mostra se aquele mês é estável ou instável de um ano para o outro.

- **Escorpião é o mais estável de todos**: a curva quase não sai da faixa entre 7% e 10% ao mês, com um pico discreto em outubro (9,8%). Isso é coerente com a espécie de maior peso no total ser generalista e presente o ano todo em áreas urbanas.
- **Lagarta é disparada a mais sazonal**: pico de 18,5% em fevereiro (mais que o dobro da distribuição uniforme de 8,3%) e um vale profundo entre agosto e setembro. Faz sentido — lagartas urticantes (*Lonomia* e parentes) têm ciclo de vida e emergência de larvas concentrados em poucos meses.
- **Serpente pica mais no início do ano** (pico de 11,2% em março) e menos no inverno (vale em agosto) — período de maior atividade e deslocamento dos animais, que coincide com chuva e temperatura mais altas na maior parte do país.
- **Aranha e abelha têm o mesmo formato**: pico em janeiro (12,0% e 10,6%) e vale em junho–agosto, com recuperação suave no fim do ano.

## 4) Um país, cinco calendários: a sazonalidade quebra por região

A média nacional esconde um problema: o regime de chuvas do Norte não tem nada a ver com o do Sul, e as espécies dominantes mudam de bioma. Refiz a mesma normalização, mas cruzando **quatro animais × cinco regiões**, e sobrepus a faixa climática (temperatura e chuva mensal, via NASA POWER) na mesma escala de coluna.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 1.5em 0 2em 0;">
  <img src="/assets/images/sazonalidade_peconhentos_regioes_clima.png" alt="Matriz de dezesseis painéis cruzando quatro animais peçonhentos com cinco regiões do Brasil, mais uma linha de clima com temperatura e chuva mensal por região" style="max-width: 1100px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
</figure>

O contraste mais claro é **Norte/Nordeste versus Sul**:

- No **Norte e no Nordeste**, todos os quatro animais têm curvas quase achatadas — a linha mal sai da faixa de ±1–2 pontos ao redor da distribuição uniforme. A faixa climática mostra por quê: nessas regiões a temperatura oscila pouco ao longo do ano (a linha vermelha é quase reta), então não há um "inverno" que derrube a atividade dos animais.
- No **Sul**, o oposto: todos os quatro animais desabam no meio do ano e disparam no verão. Abelha chega a 15,7% em janeiro e cai para menos de 5% em julho–agosto — o painel mais sazonal da matriz inteira depois da lagarta nacional. A faixa de temperatura do Sul é a que mais cai no inverno entre as cinco regiões, o que bate com a queda de atividade de animais ectotérmicos (serpente, aranha, escorpião) e com menos exposição humana ao ar livre.
- **Centro-Oeste e Sudeste picam mais tarde**: o pico de escorpião nessas duas regiões cai em outubro (10,3% e 10,5%), diferente do Sul, que pica em dezembro (12,9%) — um mês e meio de defasagem entre regiões que, à primeira vista, pareceriam ter "o mesmo verão".
- O número discreto no canto inferior direito de cada painel é o total de casos daquela célula — vale olhar antes de comparar duas curvas: Aranha·Centro-Oeste, por exemplo, tem só 10.407 casos na década, contra 179.337 de Aranha·Sul, então a primeira curva é naturalmente mais ruidosa.

## 5) Temperatura ou chuva? O que sobra depois de descontar uma da outra

Correlação simples entre o perfil mensal de acidentes e o de clima é fácil de calcular e fácil de interpretar errado: no ciclo anual brasileiro, temperatura e chuva sobem e descem **juntas** em boa parte do país, então um r_temp alto pode ser só reflexo de um r_chuva igualmente alto (ou vice-versa). A pergunta que interessa é outra: *sobra sinal de uma variável depois de descontar linearmente a outra?*

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-comment"># correlação entre x (acidentes) e y controlando o efeito linear de z</span>
<span class="code-keyword">function</span> <span class="code-function">parcial</span><span class="code-paren">(</span><span class="code-variable">r_xy</span><span class="code-operator">::</span><span class="code-function">Real</span>, <span class="code-variable">r_xz</span><span class="code-operator">::</span><span class="code-function">Real</span>, <span class="code-variable">r_yz</span><span class="code-operator">::</span><span class="code-function">Real</span><span class="code-paren">)</span>
    <span class="code-variable">den</span> <span class="code-operator">=</span> <span class="code-function">sqrt</span><span class="code-paren">(</span><span class="code-paren">(</span><span class="code-number">1</span> <span class="code-operator">-</span> <span class="code-variable">r_xz</span><span class="code-operator">^</span><span class="code-number">2</span><span class="code-paren">)</span> <span class="code-operator">*</span> <span class="code-paren">(</span><span class="code-number">1</span> <span class="code-operator">-</span> <span class="code-variable">r_yz</span><span class="code-operator">^</span><span class="code-number">2</span><span class="code-paren">)</span><span class="code-paren">)</span>
    <span class="code-variable">den</span> <span class="code-operator">&lt;</span> <span class="code-number">1e-6</span> <span class="code-operator">&amp;&amp;</span> <span class="code-keyword">return</span> <span class="code-variable">NaN</span>   <span class="code-comment"># instável perto de |r| = 1: melhor não fingir precisão</span>
    <span class="code-keyword">return</span> <span class="code-paren">(</span><span class="code-variable">r_xy</span> <span class="code-operator">-</span> <span class="code-variable">r_xz</span> <span class="code-operator">*</span> <span class="code-variable">r_yz</span><span class="code-paren">)</span> <span class="code-operator">/</span> <span class="code-variable">den</span>
<span class="code-keyword">end</span></code></pre>
  </div>
</div>

<figure style="display: flex; flex-direction: column; align-items: center; margin: 1.5em 0 2em 0;">
  <img src="/assets/images/correlacao_peconhentos_clima.png" alt="Heatmap com correlação de Pearson entre o perfil mensal de acidentes e o clima, incluindo correlações parciais controlando temperatura e chuva" style="max-width: 900px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
</figure>

Algumas linhas do heatmap mostram exatamente o que a correlação parcial serve para revelar:

- **Serpente · Sul é o caso mais limpo**: r_temp = 0,99, e a parcial "temperatura controlando chuva" continua em 0,98 — quase não muda. Já a parcial "chuva controlando temperatura" desaba para −0,14. A conclusão é direta: quem move a sazonalidade de acidentes com serpente no Sul é a **temperatura**, não a chuva — a chuva só parecia relevante (r simples de 0,56) porque acompanha a temperatura na mesma janela do ano.
- **Abelha · Nordeste é o oposto**: r_temp = 0,26 (fraco) e r_chuva = −0,74 (forte). Ao controlar, a parcial de temperatura despenca para −0,03 — ou seja, o sinal fraco de temperatura não sobrevive sozinho — enquanto a parcial de chuva continua forte, em −0,71. Aqui é a **chuva** que explica o calendário, não a temperatura.
- **Aranha · Norte mostra um caso de confundimento clássico**: a correlação simples com chuva é positiva (0,37), mas a parcial "chuva controlando temperatura" **inverte de sinal**, para −0,52. A temperatura (r = −0,89, quase inalterada na parcial, −0,90) é o verdadeiro fator; o efeito aparente da chuva era uma sombra da temperatura, e desaparece — na verdade se inverte — assim que ela é descontada.
- **A colinearidade entre temperatura e chuva varia muito por região**: Sudeste tem a maior (0,86), seguida do Sul (0,58); Centro-Oeste (0,35) e Nordeste (−0,37) têm as menores, e é justamente nessas duas regiões que as correlações simples e parciais mais se parecem — há menos confundimento a desfazer.

O próprio script marca esse gráfico como **descritivo, não inferencial**: são só 12 pontos por correlação (um por mês), e meses vizinhos são autocorrelacionados — qualquer p-valor nominal calculado em cima disso seria otimista. A leitura correta é "a forma do ciclo anual" e não um teste de hipótese.

## 6) Limitações

- **Espécie de escorpião não existe no Sinan.** O campo registra gênero para serpente (`ANI_SERPEN`) e aranha (`ANI_ARANHA`), mas nada equivalente para escorpião — *Tityus serrulatus* fica misturado com espécies menos perigosas.
- **Óbitos são subnotificados.** A ficha do Sinan é fechada no atendimento e nem sempre atualizada com o desfecho — a letalidade calculada aqui é um piso, não o número real.
- **Região de residência ≠ região de ocorrência.** Quase sempre coincidem para acidentes com peçonhentos, mas não é garantido — alguém picado em viagem pode aparecer na estatística da UF onde mora, não da UF onde o acidente ocorreu.
- **Temperatura e chuva são colineares** em boa parte do ciclo anual brasileiro, principalmente no Sudeste — correlações simples ali não separam causa nenhuma, daí a necessidade das parciais.
- **Clima modelado, não observado.** Os dados vêm da reanálise NASA POWER (MERRA-2), pontos de amostragem cobrindo o território, não estações meteorológicas nas capitais — é o preço de uma cobertura uniforme sem token de acesso.

## Referências

**Pacotes Julia:**
- [MicroSUS.jl](https://github.com/dantebertuzzi/MicroSUS.jl) — leitura de microdados do DATASUS direto em Julia.
- [CairoMakie.jl](https://docs.makie.org/stable/) — biblioteca de visualização.

**Fontes dos dados:**
- Ministério da Saúde — Sinan/Animais Peçonhentos, anos de 2014 a 2023.
- [NASA POWER](https://power.larc.nasa.gov/) (MERRA-2) — reanálise climática mensal de temperatura e precipitação.

---

### Nota Importante sobre os Dados e a Análise

**Todos os dados utilizados nesta análise são de domínio público**, extraídos do Sinan (Sistema de Informação de Agravos de Notificação) do Ministério da Saúde do Brasil, via `MicroSUS.jl`, e da reanálise climática pública NASA POWER.

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
