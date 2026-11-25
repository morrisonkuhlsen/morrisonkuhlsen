---
layout: page
title: Amostragem
lang: pt
ref: amostragem
parent: inferencia-estatistica
permalink: /pt/inferencia-estatistica/amostragem
order: 3
mathjax: true
description: "Amostragem aleatória simples, sistemática, estratificada e por conglomerados, viés, tamanho da amostra e alocação, com simulações e código em Julia."
---

**Amostragem** é a escolha de uma parte da população (a **amostra**) para, a partir dela, tirar conclusões sobre a população inteira. Uma amostra bem escolhida permite estimar médias, proporções e outras quantidades com precisão conhecida, gastando muito menos que um censo. Uma amostra mal escolhida dá respostas erradas, e aumentar o seu tamanho não resolve.

Para que a inferência a partir da amostra seja válida, três coisas importam:

1. **Representatividade:** a amostra precisa refletir a população nas características que importam para o estudo. Uma amostra com viés distorce as estimativas, qualquer que seja o seu tamanho (seção 4).
2. **Sorteio com probabilidades conhecidas** (nos métodos probabilísticos): cada elemento da população tem uma probabilidade conhecida e maior que zero de entrar na amostra. É isso que permite calcular margens de erro.
3. **Tamanho adequado:** o erro padrão da média é $\sigma/\sqrt{n}$, então a precisão cresce com a raiz quadrada de $n$. Com $n = 100$, o erro padrão é $\sigma/10$; com $n = 400$, é $\sigma/20$. Quadruplicar a amostra corta o erro padrão pela metade.

![Ilustração com a palavra "Sampling": doze bonecos num retângulo rotulado "Population", uma seta e cinco bonecos num círculo rotulado "Sample"]({{ site.baseurl }}/assets/images/amostragem.avif){:style="max-width: 400px; display: block; margin: 0 auto;"}
<div class="image-caption" style="text-align: center;">Figura 1: Da população (population) à amostra (sample).</div>

## 1. Por que Amostrar?

- **Custo e tempo:** um censo costuma ser caro e lento demais.
- **Testes destrutivos:** quando medir destrói o item (resistência de materiais, vida útil de um produto), não dá para testar tudo.
- **Populações grandes:** com milhões de elementos, a amostra é o único caminho viável.
- **Controle de qualidade:** em vez de inspecionar toda a produção, usam-se planos de amostragem padronizados; no Brasil, a norma ABNT NBR 5426 (1985) traz planos para inspeção por atributos.
- **Qualidade dos dados:** com menos elementos, dá para medir mais coisas e com mais cuidado em cada um.

## 2. Conceitos Fundamentais

- **População** (tamanho $N$): o conjunto completo de elementos de interesse.
- **Amostra** (tamanho $n$): a parte da população que é efetivamente observada.
- **Parâmetro:** um número que descreve a população, como a média $\mu$, o desvio padrão $\sigma$ ou a proporção $p$. Em geral é desconhecido.
- **Estatística:** um número calculado na amostra, como a média amostral $\bar{x}$, o desvio padrão amostral $s$ ou a proporção amostral $\hat{p}$. É usado para estimar o parâmetro.
- **Cadastro amostral** (em inglês, *sampling frame*): a lista de elementos da qual a amostra é sorteada. Se o cadastro deixa de fora parte da população, a amostra herda esse **viés de cobertura**, mesmo com sorteio perfeito.
- **Erro amostral:** a diferença entre a estatística e o parâmetro que acontece só porque se observou uma parte da população. Para a média de uma amostra aleatória simples, $\bar{X}$ acerta $\mu$ em média ($E[\bar{X}] = \mu$): o erro amostral não tem direção, e diminui com $n$ maior.
- **Fração amostral:** $f = n/N$, a fração da população que entra na amostra. Quando $f$ é pequena (a regra de bolso usual é $f < 0{,}05$), a população pode ser tratada como infinita nas fórmulas.
- **Viés:** um erro sistemático, que empurra as estimativas sempre para o mesmo lado. Ao contrário do erro amostral, **não diminui** com $n$ maior: só se corrige no desenho da pesquisa.

## 3. Métodos de Amostragem

Os métodos **probabilísticos** (3.1 a 3.4) sorteiam os elementos com probabilidades conhecidas e permitem calcular margens de erro. Os **não probabilísticos** (3.5 a 3.8) não fazem isso: servem para estudos exploratórios, mas não dão base para margem de erro.

### 3.1 Amostragem aleatória simples (AAS)

**Como funciona:** todo subconjunto de $n$ elementos da população tem a mesma chance de ser a amostra; em particular, cada elemento tem a mesma probabilidade $n/N$ de ser escolhido. O sorteio é feito com uma lista completa e números aleatórios.

**Vantagens:** simples de entender e de analisar; é a referência para as fórmulas de margem de erro. **Desvantagens:** exige a lista completa da população, e pode ficar cara se os elementos estiverem espalhados.

**Exemplo:** uma turma tem 10 alunos (A a J) e queremos sortear 3. Numeramos os alunos de 1 a 10 e sorteamos 3 números diferentes; se saírem 2, 7 e 9, a amostra é B, G e I. No computador, com a semente fixa abaixo, o sorteio dá F, G e J:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, StatsBase

alunos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
Random.seed!(123)                                # semente fixa: o sorteio se repete
amostra = sample(alunos, 3; replace=false)      # 3 alunos, sem reposição
println("Amostra selecionada: ", amostra)</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Amostra selecionada: ["F", "G", "J"]</div>
</div>

### 3.2 Amostragem sistemática

**Como funciona:** com a população numa lista, calcula-se o intervalo $k = N/n$, sorteia-se um ponto de partida entre 1 e $k$ e escolhe-se um elemento a cada $k$.

**Vantagens:** mais simples de executar que a AAS, sobretudo em listas longas ou em linha de produção. **Desvantagens:** se a lista tiver um padrão que se repete com período parecido com $k$ (por exemplo, uma escala de turnos), a amostra pode cair sempre no mesmo tipo de elemento.

**Exemplo:** 20 funcionários, amostra de 5. O intervalo é $k = 20/5 = 4$; sorteando o início 3, escolhem-se as posições 3, 7, 11, 15 e 19.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random

N, n = 20, 5
k = N ÷ n                     # intervalo de seleção: 20 ÷ 5 = 4
Random.seed!(42)
inicio = rand(1:k)            # ponto de partida sorteado entre 1 e k
posicoes = inicio .+ k .* (0:n-1)
println("Início = ", inicio, "   posições: ", collect(posicoes))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Início = 3 &nbsp; posições: [3, 7, 11, 15, 19]</div>
</div>

### 3.3 Amostragem estratificada

**Como funciona:** a população é dividida em **estratos**, grupos que não se sobrepõem e que são, de preferência, homogêneos por dentro (curso, região, faixa de renda). Sorteia-se uma amostra aleatória dentro de cada estrato. O número de elementos por estrato pode ser proporcional ao tamanho do estrato ou seguir outra regra (seção 6).

**Vantagens:** garante que todos os estratos apareçam na amostra e, quando os estratos são diferentes entre si, dá estimativas mais precisas que a AAS com o mesmo $n$. **Desvantagens:** exige saber, de antemão, a que estrato pertence cada elemento.

**Exemplo:** 100 alunos, 60 do curso A e 40 do curso B; amostra de 10. Com alocação proporcional: $10 \cdot \frac{60}{100} = 6$ alunos do curso A e $10 \cdot \frac{40}{100} = 4$ do curso B, sorteados dentro de cada curso.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, StatsBase

curso_A = ["A$i" for i in 1:60]
curso_B = ["B$i" for i in 1:40]
Random.seed!(7)
amostra = vcat(sample(curso_A, 6; replace=false),    # 60% de 10
               sample(curso_B, 4; replace=false))    # 40% de 10
println("Amostra estratificada: ", amostra)</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Amostra estratificada: ["A15", "A44", "A50", "A30", "A57", "A9", "B36", "B34", "B16", "B11"]</div>
</div>

### 3.4 Amostragem por conglomerados

**Como funciona:** a população já está dividida em grupos naturais, os **conglomerados** (bairros, escolas, lotes). Sorteiam-se alguns conglomerados e observam-se todos os elementos deles (ou uma amostra dentro deles, na amostragem em dois estágios).

**Vantagens:** barata quando a população está espalhada, e não exige uma lista de todos os elementos, só a dos conglomerados. **Desvantagens:** os elementos de um mesmo conglomerado costumam ser parecidos entre si, então, para o mesmo $n$, a precisão em geral é menor que a da AAS. O ideal é que cada conglomerado seja variado por dentro, como uma miniatura da população.

**Exemplo:** 5 bairros com 100 casas cada; sorteiam-se 2 bairros e entrevistam-se as 100 casas de cada um.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, StatsBase

bairros = ["B1", "B2", "B3", "B4", "B5"]
Random.seed!(21)
sorteados = sample(bairros, 2; replace=false)
println("Bairros sorteados: ", sorteados, " → entrevistar as 100 casas de cada um")</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Bairros sorteados: ["B1", "B3"] → entrevistar as 100 casas de cada um</div>
</div>

### 3.5 Amostragem por conveniência

Formada por quem está mais fácil de alcançar: as 10 primeiras pessoas que passam num shopping, os alunos da turma do próprio pesquisador. É rápida e barata, útil para testar um questionário, mas quem está acessível costuma ser diferente do resto da população, e não há como medir esse viés.

### 3.6 Amostragem por cotas

O pesquisador recebe cotas a cumprir (por exemplo, tantas mulheres e tantos homens, em tais faixas de idade) e entrevista quem encontrar até completá-las. As cotas fazem a composição da amostra lembrar a da população nas variáveis escolhidas, mas a escolha dentro de cada cota não é sorteada, e pode haver viés em tudo o que não foi controlado.

### 3.7 Amostragem intencional (por julgamento)

Um especialista escolhe os elementos que considera mais adequados, como as 5 empresas líderes de um setor para um estudo de caso. É útil quando o interesse está justamente nesses casos, mas os resultados não se generalizam para a população.

### 3.8 Amostragem bola de neve

Os primeiros participantes indicam outros, que indicam outros, e assim por diante. Serve para alcançar populações difíceis de listar (grupos pequenos ou pouco visíveis), mas a amostra tende a se concentrar nas redes de contato dos primeiros participantes.

### 3.9 Comparação

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 700px;">
  <thead style="background: #e3f2fd;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px; text-align:left;">Método</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Tipo</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Precisa de lista de todos?</th>
      <th style="border: 1px solid #bbb; padding: 8px; text-align:left;">Melhor uso</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Aleatória simples</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Probabilístico</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Sim</td><td style="border: 1px solid #bbb; padding: 8px;">Referência; populações acessíveis e com lista</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Sistemática</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Probabilístico</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Sim (ordenada)</td><td style="border: 1px solid #bbb; padding: 8px;">Listas longas sem padrões periódicos</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Estratificada</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Probabilístico</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Sim, com o estrato de cada um</td><td style="border: 1px solid #bbb; padding: 8px;">Populações com grupos diferentes entre si</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Conglomerados</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Probabilístico</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Só dos conglomerados</td><td style="border: 1px solid #bbb; padding: 8px;">Populações espalhadas geograficamente</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Conveniência</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Não probabilístico</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Não</td><td style="border: 1px solid #bbb; padding: 8px;">Testes de questionário, estudos piloto</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Cotas</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Não probabilístico</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Não</td><td style="border: 1px solid #bbb; padding: 8px;">Pesquisas rápidas de mercado e opinião</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Intencional</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Não probabilístico</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Não</td><td style="border: 1px solid #bbb; padding: 8px;">Estudos de caso</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Bola de neve</strong></td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Não probabilístico</td><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">Não</td><td style="border: 1px solid #bbb; padding: 8px;">Populações difíceis de alcançar</td></tr>
  </tbody>
</table>
</div>

## 4. Erros em Pesquisas por Amostra

Todo resultado de pesquisa por amostra está sujeito a dois tipos de erro, de natureza bem diferente.

**Erro amostral:** a variação que existe porque cada amostra é uma parte diferente da população. Nas amostras probabilísticas, ele é **medido** pela margem de erro e **diminui** com $n$ maior.

**Erros não amostrais:** não diminuem com $n$ maior, e por isso são os mais perigosos:

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 620px;">
  <thead style="background: #ffebee;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">Tipo</th>
      <th style="border: 1px solid #bbb; padding: 8px;">O que é</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Como reduzir</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Cobertura</strong></td><td style="border: 1px solid #bbb; padding: 8px;">O cadastro deixa de fora parte da população</td><td style="border: 1px solid #bbb; padding: 8px;">Atualizar o cadastro; combinar fontes</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Não resposta</strong></td><td style="border: 1px solid #bbb; padding: 8px;">Parte dos sorteados não responde, e quem não responde é diferente de quem responde</td><td style="border: 1px solid #bbb; padding: 8px;">Novas tentativas de contato; comparar o perfil de quem respondeu com o da população</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Mensuração</strong></td><td style="border: 1px solid #bbb; padding: 8px;">Pergunta mal formulada, instrumento descalibrado, entrevistador que induz a resposta</td><td style="border: 1px solid #bbb; padding: 8px;">Testar o questionário antes; treinar entrevistadores</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px;"><strong>Processamento</strong></td><td style="border: 1px solid #bbb; padding: 8px;">Erros de digitação, codificação ou análise</td><td style="border: 1px solid #bbb; padding: 8px;">Validação automática; conferência dupla</td></tr>
  </tbody>
</table>
</div>

**Simulação: o viés não diminui com $n$.** Numa população ilustrativa de 100.000 pessoas, a proporção que apoia uma proposta é cerca de 0,46. Um sorteio na população inteira acerta perto disso com qualquer $n$. Um sorteio feito num cadastro que tem todo o grupo mais favorável à proposta, mas só 20% do outro grupo, erra sempre para o mesmo lado, perto de 0,61, com $n$ = 100, 1.000 ou 10.000:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, Statistics, StatsBase

# População ilustrativa de 100.000 pessoas: grupo 1 (40%) com 70% de apoio a uma
# proposta, grupo 2 (60%) com 30% de apoio. Proporção verdadeira: 0,4·0,7 + 0,6·0,3 = 0,46.
Random.seed!(123)
grupo = vcat(fill(1, 40_000), fill(2, 60_000))
apoia = [g == 1 ? rand() &lt; 0.7 : rand() &lt; 0.3 for g in grupo]
println("Proporção verdadeira: ", round(mean(apoia), digits=4))

# Cadastro com viés: contém todo o grupo 1 e só 20% do grupo 2
no_cadastro = [g == 1 || rand() &lt; 0.2 for g in grupo]
cadastro = findall(no_cadastro)

for n in (100, 1_000, 10_000)
    boa = mean(apoia[sample(1:length(apoia), n; replace=false)])   # sorteio na população inteira
    ruim = mean(apoia[sample(cadastro, n; replace=false)])         # sorteio no cadastro com viés
    println("n = ", rpad(n, 6), "  AAS da população: ", round(boa, digits=3),
            "   AAS do cadastro com viés: ", round(ruim, digits=3))
end</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Proporção verdadeira: 0.4597</div>
  <div>n = 100 &nbsp; &nbsp; AAS da população: 0.46 &nbsp; AAS do cadastro com viés: 0.61</div>
  <div>n = 1000 &nbsp; &nbsp;AAS da população: 0.462 &nbsp; AAS do cadastro com viés: 0.617</div>
  <div>n = 10000 &nbsp; AAS da população: 0.458 &nbsp; AAS do cadastro com viés: 0.61</div>
</div>

<div style="border-left: 4px solid #e53935; padding: 0.5em 1em; background-color: #ffebee; margin: 0.75em 0;">
<strong>Caso histórico, o Literary Digest (1936):</strong> a revista enviou cédulas a milhões de pessoas, recebeu milhões de respostas e previu a derrota de Franklin Roosevelt na eleição presidencial americana, que ele venceu com folga. O tamanho da amostra não salvou a previsão. A explicação clássica é o viés de cobertura (as listas usadas favoreciam eleitores mais ricos); Squire (1988), com dados de uma pesquisa de 1937, concluiu que a não resposta também pesou: quem devolveu a cédula era diferente de quem não devolveu.
</div>

## 5. Tamanho da Amostra

As fórmulas desta seção supõem **amostragem aleatória simples**; a dedução delas está em [Intervalos de Confiança]({{ '/pt/inferencia-estatistica/intervalos-confianca' | relative_url }}). Em todas, $z_{\alpha/2}$ é o valor crítico da normal padrão (1,96 para 95% de confiança) e $E$ é a margem de erro máxima desejada. O resultado é sempre arredondado **para cima**.

### 5.1 Proporção

$$n = \frac{z_{\alpha/2}^2\; p^{\ast}(1-p^{\ast})}{E^2}$$

onde $p^{\ast}$ é uma estimativa prévia da proporção (de uma pesquisa anterior, por exemplo). Sem estimativa, use $p^{\ast} = 0{,}5$, que dá o maior $n$ possível.

**Exemplo 1** (números ilustrativos): uma fábrica quer estimar a proporção de peças defeituosas com margem de 3 pontos percentuais e 95% de confiança; de lotes anteriores, espera cerca de 10% de defeitos.

$$n = \frac{1{,}96^2 \cdot 0{,}10 \cdot 0{,}90}{0{,}03^2} = \frac{3{,}8416 \cdot 0{,}09}{0{,}0009} = \frac{0{,}345744}{0{,}0009} \approx 384{,}16$$

Arredondando para cima: **385 peças**. (Com o valor crítico sem arredondar, 1,959964, dá 384,15, e a resposta é a mesma.)

**Exemplo 2** (números ilustrativos): uma pesquisa eleitoral quer margem de 2 pontos percentuais e 95% de confiança; pesquisas anteriores indicam intenção de voto perto de 40% para o candidato.

$$n = \frac{1{,}96^2 \cdot 0{,}40 \cdot 0{,}60}{0{,}02^2} = \frac{3{,}8416 \cdot 0{,}24}{0{,}0004} = \frac{0{,}921984}{0{,}0004} = 2304{,}96$$

Arredondando: **2.305 eleitores**. Repare no custo da precisão: passar de 3 para 2 pontos de margem multiplica o $n$ por $(3/2)^2 = 2{,}25$ (para o mesmo $p^{\ast}$).

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

z = quantile(Normal(), 0.975)            # 95% de confiança

n_amostra(p, E) = z^2 * p * (1 - p) / E^2

for (nome, p, E) in (("Peças defeituosas", 0.10, 0.03), ("Intenção de voto", 0.40, 0.02))
    n = n_amostra(p, E)
    println(rpad(nome, 18), " n = ", round(n, digits=2), " → ", ceil(Int, n))
end</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Peças defeituosas &nbsp;n = 384.15 → 385</div>
  <div>Intenção de voto &nbsp; n = 2304.88 → 2305</div>
</div>

### 5.2 Média

Com $\sigma$ conhecido (ou estimado com segurança de um estudo anterior):

$$n = \left(\frac{z_{\alpha/2}\;\sigma}{E}\right)^2$$

Quando $\sigma$ só é conhecido por uma estimativa $s$ de um estudo piloto, o valor crítico passa a ser o da t de Student, $t_{\alpha/2;\,n-1}$, que depende do próprio $n$. Procura-se então o **menor $n$** que satisfaz

$$\left(\frac{t_{\alpha/2;\,n-1}\cdot s}{E}\right)^2 \leq n$$

Não adianta só repetir a conta "até convergir": no exemplo abaixo ($s = 2{,}4$, $E = 0{,}8$, 95%), a repetição fica alternando entre 37 e 38 para sempre. Testando os dois valores: com $n = 37$, $t_{0{,}025;\,36} = 2{,}0281$ e $(2{,}0281 \cdot 2{,}4/0{,}8)^2 \approx 37{,}02$, que passa de 37, então 37 não basta; com $n = 38$, $t_{0{,}025;\,37} = 2{,}0262$ e $(2{,}0262 \cdot 3)^2 \approx 36{,}95 \leq 38$. A resposta é **$n = 38$**.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

# n para a média com σ desconhecido: o valor crítico t depende do próprio n.
# Procura o menor n tal que t(n−1) · s / √n ≤ E, isto é, (t · s / E)² ≤ n.
function n_media_t(s, E; α=0.05)
    n = 2
    while (quantile(TDist(n - 1), 1 - α/2) * s / E)^2 &gt; n
        n += 1
    end
    return n
end

s, E = 2.4, 0.8
n = n_media_t(s, E)
for m in (n - 1, n)
    t = quantile(TDist(m - 1), 0.975)
    println("n = ", m, ": t = ", round(t, digits=4), "   (t·s/E)² = ", round((t * s / E)^2, digits=2))
end
println("n necessário = ", n)</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>n = 37: t = 2.0281 &nbsp; (t·s/E)² = 37.02</div>
  <div>n = 38: t = 2.0262 &nbsp; (t·s/E)² = 36.95</div>
  <div>n necessário = 38</div>
</div>

### 5.3 População finita

Quando a amostra é uma fração considerável da população, a correção para população finita reduz o $n$ necessário:

$$n = \frac{n_0}{1 + \dfrac{n_0 - 1}{N}}, \qquad n_0 = \frac{z_{\alpha/2}^2\, p^{\ast}(1-p^{\ast})}{E^2}$$

Multiplicando em cima e embaixo por $N E^2$, a mesma fórmula fica:

$$n = \frac{N\, z_{\alpha/2}^2\, p^{\ast}(1-p^{\ast})}{E^2 (N-1) + z_{\alpha/2}^2\, p^{\ast}(1-p^{\ast})}$$

**Exemplo:** $N = 5.000$, 95% de confiança, $E = 0{,}05$, $p^{\ast} = 0{,}5$.

1. Numerador: $5000 \cdot 1{,}96^2 \cdot 0{,}5 \cdot 0{,}5 = 5000 \cdot 3{,}8416 \cdot 0{,}25 = 4802$.
2. Denominador: $0{,}05^2 \cdot 4999 + 3{,}8416 \cdot 0{,}25 = 0{,}0025 \cdot 4999 + 0{,}9604 = 12{,}4975 + 0{,}9604 = 13{,}4579$.
3. Divisão: $n = \frac{4802}{13{,}4579} \approx 356{,}82$.

Arredondando: **357**, contra 385 sem a correção.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Distributions

N = 5000                         # tamanho da população
z = quantile(Normal(), 0.975)
p, E = 0.5, 0.05

n0 = z^2 * p * (1 - p) / E^2     # população infinita
n = n0 / (1 + (n0 - 1) / N)      # correção para população finita

println("n0 = ", round(n0, digits=2), "   n corrigido = ", round(n, digits=2), " → ", ceil(Int, n))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>n0 = 384.15 &nbsp; n corrigido = 356.8 → 357</div>
</div>

## 6. Alocação na Amostra Estratificada

Com o tamanho total $n$ decidido, é preciso dividi-lo entre os estratos. Seja $N_h$ o tamanho do estrato $h$ na população e $n_h$ o número de elementos sorteados nele.

**Alocação proporcional:** cada estrato recebe uma parte de $n$ proporcional ao seu tamanho,

$$n_h = n \cdot \frac{N_h}{N}$$

**Alocação de Neyman (ótima):** leva em conta também o desvio padrão $\sigma_h$ de cada estrato, e dá mais amostra aos estratos mais variáveis,

$$n_h = n \cdot \frac{N_h\, \sigma_h}{\sum_i N_i\, \sigma_i}$$

Para um $n$ fixo e custo igual por elemento, é a alocação que torna mínima a variância da média estratificada.

**Exemplo** (números ilustrativos): uma universidade com 10.000 alunos, 6.000 de Exatas e 4.000 de Humanas; amostra de $n = 400$. Um estudo piloto indicou desvio padrão das notas de 10 em Exatas e 20 em Humanas.

- **Proporcional:** $n_A = 400 \cdot \frac{6000}{10000} = 240$ e $n_B = 400 \cdot \frac{4000}{10000} = 160$.
- **Neyman:** o denominador é $6000 \cdot 10 + 4000 \cdot 20 = 60.000 + 80.000 = 140.000$; então $n_A = 400 \cdot \frac{60.000}{140.000} \approx 171{,}43$ e $n_B = 400 \cdot \frac{80.000}{140.000} \approx 228{,}57$, arredondados para **171 e 229** (somando 400). Humanas, mais variável, recebe mais amostra mesmo sendo o estrato menor.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>n = 400
N = [6000, 4000]                 # tamanhos dos estratos (Exatas, Humanas)
σ = [10, 20]                     # desvios padrão de um estudo piloto

proporcional = n .* N ./ sum(N)
neyman = n .* (N .* σ) ./ sum(N .* σ)

println("Proporcional: ", proporcional)
println("Neyman:       ", round.(neyman, digits=2), " → ", round.(Int, neyman))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Proporcional: [240.0, 160.0]</div>
  <div>Neyman: &nbsp; &nbsp; &nbsp; [171.43, 228.57] → [171, 229]</div>
</div>

**Simulação: quanto a estratificação ganha.** Numa população ilustrativa com esses dois estratos (médias 50 e 80, desvios padrão 10 e 20), sorteamos 5.000 amostras de 400 com cada método e medimos o desvio padrão das 5.000 estimativas da média:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random, Statistics, StatsBase

# População ilustrativa: estrato A com 6.000 notas (média 50, desvio padrão 10)
# e estrato B com 4.000 notas (média 80, desvio padrão 20)
Random.seed!(123)
A = 50 .+ 10 .* randn(6000)
B = 80 .+ 20 .* randn(4000)
pop = vcat(A, B)
μ = mean(pop)

# Estimador estratificado: média de cada estrato, ponderada pelo tamanho do estrato
estrat(nA, nB) = (6000 * mean(sample(A, nA; replace=false)) +
                  4000 * mean(sample(B, nB; replace=false))) / 10_000

repeticoes = 5_000
aas = [mean(sample(pop, 400; replace=false)) for _ in 1:repeticoes]
prop = [estrat(240, 160) for _ in 1:repeticoes]       # alocação proporcional
neyman = [estrat(171, 229) for _ in 1:repeticoes]     # alocação de Neyman

println("Média da população = ", round(μ, digits=3))
println("Desvio padrão da estimativa, n = 400:")
println("  aleatória simples      ", round(std(aas), digits=3))
println("  estratificada (prop.)  ", round(std(prop), digits=3))
println("  estratificada (Neyman) ", round(std(neyman), digits=3))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Média da população = 61.955</div>
  <div>Desvio padrão da estimativa, n = 400:</div>
  <div> &nbsp;aleatória simples &nbsp; &nbsp; &nbsp;1.02</div>
  <div> &nbsp;estratificada (prop.) &nbsp;0.722</div>
  <div> &nbsp;estratificada (Neyman) 0.684</div>
</div>

A estratificada proporcional erra cerca de 30% menos que a AAS (0,722 contra 1,020), e a de Neyman um pouco menos ainda (0,684). O ganho vem de os estratos terem médias bem diferentes (50 e 80): a AAS ainda varia na proporção de cada curso que sorteia, e a estratificada não.

## 7. Como Escolher o Método

<div style="overflow-x:auto; margin: 1em 0;">
<table style="border-collapse: collapse; margin: 0 auto; min-width: 680px;">
  <thead style="background: #e8f5e9;">
    <tr>
      <th style="border: 1px solid #bbb; padding: 8px;">#</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Pergunta</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Se sim</th>
      <th style="border: 1px solid #bbb; padding: 8px;">Se não</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">1</td><td style="border: 1px solid #bbb; padding: 8px;">O objetivo é só explorar ou testar um questionário?</td><td style="border: 1px solid #bbb; padding: 8px;">Conveniência pode bastar (sem margem de erro)</td><td style="border: 1px solid #bbb; padding: 8px;">Use um método probabilístico: vá para 2</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">2</td><td style="border: 1px solid #bbb; padding: 8px;">Existe uma lista completa e atualizada da população?</td><td style="border: 1px solid #bbb; padding: 8px;">Vá para 3</td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Conglomerados</strong> (basta a lista dos grupos)</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">3</td><td style="border: 1px solid #bbb; padding: 8px;">A população é espalhada e visitar cada elemento é caro?</td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Conglomerados</strong> (ou em dois estágios)</td><td style="border: 1px solid #bbb; padding: 8px;">Vá para 4</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">4</td><td style="border: 1px solid #bbb; padding: 8px;">Há grupos conhecidos, diferentes entre si, que importam para o estudo?</td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Estratificada</strong></td><td style="border: 1px solid #bbb; padding: 8px;">Vá para 5</td></tr>
    <tr><td style="border: 1px solid #bbb; padding: 8px; text-align:center;">5</td><td style="border: 1px solid #bbb; padding: 8px;">A lista é longa e sem padrões periódicos?</td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Sistemática</strong></td><td style="border: 1px solid #bbb; padding: 8px;"><strong>Aleatória simples</strong></td></tr>
  </tbody>
</table>
</div>

<div style="border-left: 4px solid #4CAF50; padding: 0.5em 1em; background-color: #e8f5e9; margin: 0.75em 0;">
<strong>Em resumo:</strong> sempre que possível, use um método probabilístico; só ele permite calcular margens de erro e intervalos de confiança. Uma amostra pequena e bem sorteada vale mais que uma enorme e com viés. E as fórmulas de margem de erro desta página e de <a href="{{ '/pt/inferencia-estatistica/intervalos-confianca' | relative_url }}">Intervalos de Confiança</a> valem para a amostragem aleatória simples; desenhos estratificados ou por conglomerados têm fórmulas próprias.
</div>

## 🎧 Podcast: Amostragem

Um episódio em áudio, do próprio site, sobre os métodos de amostragem desta página:

<div style="margin-top: 1em;">
  <iframe title="Podcast sobre amostragem" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2192924015&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>
</div>

## Referências

1. Bolfarine, H.; Bussab, W. O. (2005). *Elementos de Amostragem*. Blucher.
2. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
3. Cochran, W. G. (1977). *Sampling Techniques*. 3rd ed. Wiley.
4. Lohr, S. L. (2009). *Sampling: Design and Analysis*. 2nd ed. Brooks/Cole.
5. Squire, P. (1988). Why the 1936 Literary Digest Poll Failed. *Public Opinion Quarterly*, 52(1), 125–133. DOI: [10.1086/269085](https://doi.org/10.1086/269085).
6. Triola, M. F. (2024). *Introdução à Estatística*. 14. ed. LTC.
