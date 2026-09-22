---
layout: post
image: /assets/images/orca.avif
title: "Cinquenta anos contando orcas: a demografia das residentes do sul em nove gráficos"
categories: [VISUALIZAÇÃO DE DADOS, JULIA, ESTATÍSTICA]
tags: [Análise de dados, Análise de sobrevivência]
lang: pt
ref: orcas-residentes-do-sul
author: dante-bertuzzi
description: "Analiso em Julia a base demográfica da NOAA sobre as orcas residentes do sul: 227 indivíduos, 1976–2025. Curvas de Kaplan–Meier por sexo, pirâmide etária, fecundidade, intervalo entre partos e sobrevivência ao primeiro ano — com o que os números mostram e o que eles não conseguem dizer."
mathjax: true
slug: orcas-residentes-do-sul-demografia-julia-kaplan-meier
---

Existe uma população de animais selvagens no mundo em que **cada indivíduo tem nome, data de nascimento e árvore genealógica**. São as orcas residentes do sul (*Southern Resident killer whales*), os três grupos familiares — chamados pods J, K e L — que circulam entre o estreito de Georgia, o mar de Salish e a costa de Washington e da Colúmbia Britânica.

Desde 1976 elas são fotografadas e recenseadas uma por uma, todo ano. O resultado é raríssimo em ecologia: não uma amostra, não uma estimativa por captura-recaptura, mas **o censo completo**, com data de nascimento e de morte de praticamente todos os indivíduos ao longo de cinco décadas.

Peguei essa base — publicada pela NOAA no repositório [`noaa-nwfsc/srkw-status`](https://github.com/noaa-nwfsc/srkw-status) — e analisei em Julia. Este post mostra os nove gráficos que saíram, o que cada um diz e, no fim, o que eles honestamente não conseguem dizer.

<style>
/* Figuras e legendas deste post — o tema não define estilo de figcaption. */
.orca-post figure { text-align: center; margin: 2.2em auto; max-width: 1000px; }
.orca-post figure img { width: 100%; height: auto; border-radius: 10px; box-shadow: 0 8px 24px rgba(15, 23, 42, .12); }
.orca-post figcaption { margin-top: 0.75em; font-size: 0.88rem; color: var(--mk-ink-soft); line-height: 1.5; text-align: left; }
[data-theme="dark"] .orca-post figcaption { color: #a9b4c2 !important; }

/* Tabelas numéricas deste post. */
.orca-table { overflow-x: auto; margin: 1.6em 0; }
.orca-table table { border-collapse: collapse; width: 100%; }
.orca-table th, .orca-table td { padding: 0.45em 0.9em; border-bottom: 1px solid rgba(128,128,128,.22); text-align: left; vertical-align: top; }
.orca-table thead th { border-bottom: 2px solid rgba(128,128,128,.45); }
.orca-table td + td, .orca-table th + th { white-space: nowrap; }

.orca-key { border-left: 4px solid #2a78d6; background: rgba(42,120,214,.06); padding: 0.9em 1.2em; margin: 1.8em 0; border-radius: 0 8px 8px 0; }
</style>

<div class="orca-post" markdown="1">

---

## 1. A base de dados

O arquivo `orca.csv` tem uma linha por indivíduo e as colunas essenciais são poucas:

<div class="orca-table" markdown="1">

| Coluna | O que é |
|---|---|
| `animal` | identificador do indivíduo (`J002`, `L025`, `K021`…) |
| `birth` | ano de nascimento |
| `death` | ano da morte — `NA` se o animal está vivo |
| `pod` | pod e matrilinha de origem |
| `matriline` | matrilinha (a fêmea mais velha da linhagem) |
| `mom` | identificador da mãe, quando conhecida |
| `sexF1M2` | 1 = fêmea, 2 = macho, `NA` = indeterminado |

</div>

São **227 indivíduos**, com nascimentos registrados de 1910 a 2025: **151 óbitos** e **76 animais vivos**. Por sexo: 105 fêmeas, 91 machos e 31 sem sexo determinado — quase todos filhotes que morreram antes de ser possível sexá-los. Por pod: J com 66 registros, K com 44 e L com 117, distribuídos em 20 matrilinhas.

Duas observações metodológicas antes de qualquer gráfico:

1. **As análises começam em 1976.** O censo sistemático por foto-identificação — a técnica de reconhecer cada animal pela mancha branca atrás da nadadeira dorsal, a *saddle patch*, criada por Michael Bigg nos anos 1970 — só passa a ser confiável a partir daí. Antes disso os registros existem, mas são reconstruções retrospectivas.
2. **A resolução temporal é o ano, não o dia.** A base guarda o ano de nascimento e o ano de morte. Isso significa que "sobreviveu ao primeiro ano" aqui quer dizer, literalmente, "não morreu no mesmo ano-calendário em que nasceu" — o que é ligeiramente diferente de sobreviver 12 meses.

---

## 2. Cinquenta anos e nenhum ganho líquido

<figure>
  <img src="/assets/images/orca-01-censo.png" alt="Gráfico de linha do número de orcas residentes do sul vivas ao fim de cada ano entre 1976 e 2025, com 71 em 1976, pico de 94 em 1993, mínimo de 72 em 2021 e 76 em 2025" />
  <figcaption>
    <strong>Figura 1:</strong> indivíduos vivos ao fim de cada ano. As duas linhas verticais marcam o fim das capturas para aquários (1976) e a inclusão da população na lista de espécies ameaçadas dos Estados Unidos (2005).
  </figcaption>
</figure>

A população tinha **71 indivíduos em 1976**, subiu até um **pico de 94 em 1993**, despencou, oscilou, e chegou a **2025 com 76** — um mínimo recente de **72 em 2021**. São **19,1% abaixo do pico**, e apenas cinco animais a mais do que meio século atrás.

Vale separar a série em dois regimes e ajustar uma regressão log-linear em cada um (o coeficiente angular de $\log N$ contra o ano estima a taxa de crescimento instantânea $r$, e $\lambda = e^{r}$ é o multiplicador anual da população):

<div class="orca-table" markdown="1">

| Período | $r$ (por ano) | $\lambda$ | Crescimento | $p$ | $R^2$ |
|---|---|---|---|---|---|
| 1976–1993 | $+0{,}0111$ | $1{,}0111$ | $+1{,}11\%$/ano | $0{,}00082$ | $0{,}51$ |
| 1993–2025 | $-0{,}0064$ | $0{,}9937$ | $-0{,}63\%$/ano | $5{,}4 \times 10^{-8}$ | $0{,}62$ |

</div>

<div class="orca-key" markdown="1">
Os dois períodos têm sinais opostos e ambos são estatisticamente significativos. Depois do fim das capturas para aquários, a população cresceu por dezessete anos a pouco mais de 1% ao ano. Desde 1993 ela **encolhe de forma consistente**, a cerca de 0,63% ao ano, e essa tendência explica 62% da variância — não é ruído.
</div>

Um detalhe que engana: o $\lambda$ médio geométrico de toda a série é $1{,}0014$ (desvio-padrão dos $\lambda$ anuais: $0{,}0422$). Olhado assim, de 1976 a 2025, o crescimento parece nulo-mas-positivo. É a média de dois regimes opostos, e não descreve nenhum dos dois.

---

## 3. O declínio está inteiramente no pod L

<figure>
  <img src="/assets/images/orca-02-pods.png" alt="Três linhas mostrando o número de indivíduos vivos nos pods J, K e L entre 1976 e 2025; L cai de 40 para 34, J sobe de 16 para 27 e K permanece em 15" />
  <figcaption>
    <strong>Figura 2:</strong> a série da Figura 1 desagregada pelos três pods. As três trajetórias são qualitativamente diferentes.
  </figcaption>
</figure>

Somar os três pods esconde o essencial:

<div class="orca-table" markdown="1">

| Pod | 1976 | Pico | 2025 |
|---|---|---|---|
| J | 16 | 30 | **27** |
| K | 15 | 21 | **15** |
| L | 40 | 57 | **34** |

</div>

O pod **J cresceu 69%** no período. O **K está exatamente onde começou**, quinze animais em 1976 e quinze em 2025 — depois de ter chegado a 21. E o **L, que era o maior dos três com 40 indivíduos, perdeu 15% e está 23 abaixo do próprio pico**.

Toda a queda líquida da população desde 1993 está concentrada no pod L. Isso importa porque os pods não são unidades intercambiáveis: são grupos matrilineares, com dialetos vocais próprios e áreas de forrageio parcialmente distintas. Concentrar as perdas num único pod não é equivalente a espalhá-las pelos três.

---

## 4. Nascimentos e mortes quase se anulam

<figure>
  <img src="/assets/images/orca-03-nascimentos-mortes.png" alt="Gráfico de barras divergente com nascimentos para cima e mortes para baixo, ano a ano de 1976 a 2025, e abaixo as médias móveis de cinco anos das duas séries" />
  <figcaption>
    <strong>Figura 3:</strong> acima, nascimentos (azul, para cima) e mortes (vermelho, para baixo) por ano. Abaixo, as médias móveis centradas de cinco anos das duas séries — a partir de meados dos anos 2010 as duas linhas se cruzam e não voltam a se inverter.
  </figcaption>
</figure>

Entre 1976 e 2025 foram **153 nascimentos** (média de 3,06/ano) contra **147 mortes** (2,94/ano). Saldo acumulado de cinquenta anos: **+6 animais**.

A tendência linear dos nascimentos é de $-0{,}0213$ por ano, com $p = 0{,}302$ — ou seja, **não é significativa**. A série de nascimentos é ruidosa demais para que uma reta ajustada em cinquenta pontos anuais detecte alguma coisa. Isso é honesto e vale registrar: quem quiser afirmar que "os nascimentos estão caindo" não consegue sustentar isso com uma regressão simples.

O que se sustenta é o **balanço da última década**: 1,70 nascimentos por ano contra 2,60 mortes por ano. Uma população que perde quase um animal por ano não se recupera por acaso.

---

## 5. A pirâmide etária: onde estão os machos velhos?

<figure>
  <img src="/assets/images/orca-04-piramide.png" alt="Pirâmide etária dos 76 indivíduos vivos em 2025, com fêmeas à esquerda e machos à direita em classes quinquenais; barras masculinas concentradas entre 10 e 24 anos e ausentes acima de 35" />
  <figcaption>
    <strong>Figura 4:</strong> estrutura etária dos 76 animais vivos em 2025. À esquerda, fêmeas (o tom mais claro são os indivíduos de sexo indeterminado); à direita, machos.
  </figcaption>
</figure>

Dos 76 vivos: **45 fêmeas, 30 machos e 1 de sexo indeterminado**.

O gráfico mostra uma assimetria brutal. Os machos vivos se concentram entre 10 e 24 anos e **o mais velho tem 34 anos**. Não existe nenhum macho vivo acima dos 35. Do lado das fêmeas, oito passam dos 42 anos e a mais velha da população — **L025**, registrada como nascida em 1928 — tem 97 anos na base.

Essa não é uma peculiaridade desta população. É o padrão do *Orcinus orca*: fêmeas vivem muito mais que machos, e é sobre essa assimetria que se apoia toda a literatura da menopausa em cetáceos (voltarei a ela na seção 8).

---

## 6. Kaplan–Meier: a fêmea sobrevive o dobro

Sobrevivência é o tipo de pergunta que não se responde com média. Dos 227 animais, 76 estão **vivos** — o tempo de vida deles não é conhecido, só se sabe que é *pelo menos* o valor atual. Ignorá-los enviesa tudo para baixo; incluir a idade atual como se fosse idade final enviesa também. O tratamento correto é a **censura à direita**, e o estimador padrão é o de Kaplan–Meier.

<figure>
  <img src="/assets/images/orca-05-kaplan-meier.png" alt="Curvas de sobrevivência de Kaplan–Meier por sexo com intervalos de confiança de 95%: fêmeas com mediana de 51 anos e machos com mediana de 24 anos" />
  <figcaption>
    <strong>Figura 5:</strong> curvas de Kaplan–Meier por sexo, com bandas de confiança de 95% construídas na escala $\log(-\log S)$ com variância de Greenwood. Censura à direita em 2025 para os 76 animais vivos.
  </figcaption>
</figure>

<div class="orca-key" markdown="1">
**Mediana de sobrevivência: 51 anos para fêmeas, 24 anos para machos.** Teste log-rank: $\chi^2(1) = 49{,}93$, $p < 0{,}00001$.
</div>

Um $\chi^2$ de quase 50 com um grau de liberdade é enorme. As bandas de confiança das duas curvas não chegam nem perto de se tocar na região das medianas. A diferença entre os sexos é o achado mais robusto de toda esta análise.

Repare também na **forma** das curvas. Ambas caem rápido nos primeiros anos — a mortalidade infantil domina o começo —, depois a curva das fêmeas achata num platô longo, enquanto a dos machos continua descendo em ritmo constante. São dois regimes de mortalidade diferentes, não a mesma curva deslocada.

---

## 7. A cauda longa da longevidade é quase toda feminina

<figure>
  <img src="/assets/images/orca-06-idade-morte.png" alt="Gráficos de violino e boxplot da idade na morte de fêmeas e machos, com pontos individuais sobrepostos; fêmeas com mediana 45 anos e máximo 106, machos com mediana 23 e máximo 59" />
  <figcaption>
    <strong>Figura 6:</strong> distribuição da idade na morte dos 121 indivíduos de sexo conhecido com óbito registrado. Este gráfico <em>não</em> inclui os 76 vivos — é a distribuição observada, não a distribuição de sobrevivência da Figura 5.
  </figcaption>
</figure>

<div class="orca-table" markdown="1">

| | $n$ | Mediana | Média | Máximo |
|---|---|---|---|---|
| Fêmeas | 60 | 45 anos | 41,1 | **106** |
| Machos | 61 | 23 anos | 21,5 | **59** |

</div>

A mediana das fêmeas é praticamente o dobro da dos machos, coerente com a Figura 5. Mas o que salta aos olhos é a **assimetria das distribuições**: a dos machos é compacta e termina em 59 anos; a das fêmeas tem uma cauda longa que se estica até os 106.

Uma ressalva importante, e vou insistir nela na seção de limitações: esse máximo de 106 anos é do animal **J002**, conhecida como *Granny*, com nascimento registrado em 1911 na base. **Essa idade é contestada.** A estimativa original de 1911 vinha de supor que o macho J001 era filho dela; testes genéticos posteriores mostraram que não era, e análises bioquímicas sugeriram uma faixa bem mais baixa, entre 60 e 80 anos. O número está na base porque a base preserva a estimativa histórica, não porque esteja resolvido.

---

## 8. Reprodução: quando e a que intervalo

<figure>
  <img src="/assets/images/orca-07-reproducao.png" alt="Dois histogramas lado a lado: idade da mãe no parto, com mediana de 23 anos e faixa de 10 a 45; e intervalo entre partos sucessivos da mesma mãe, com mediana de 5 anos" />
  <figcaption>
    <strong>Figura 7:</strong> à esquerda, idade materna nos 184 nascimentos com mãe identificada. À direita, os 115 intervalos entre partos consecutivos da mesma fêmea.
  </figcaption>
</figure>

Cruzando a coluna `mom` com o ano de nascimento de cada mãe, chego a **184 filhotes de 69 mães diferentes**:

- **Idade materna ao parto:** mediana de **23 anos** (média 24,3; quartis 17 e 30; faixa observada de 10 a 45).
- **Intervalo entre partos:** mediana de **5 anos** (média 5,7; quartis 3 e 7; observados de 2 a 20 anos, $n = 115$).
- **Filhotes por mãe:** mediana de 2, máximo de 7.

O limite superior da idade materna — 45 anos — é a assinatura demográfica da **menopausa**. As orcas são uma das pouquíssimas espécies não humanas com vida pós-reprodutiva longa: a fêmea para de parir por volta dos 40 e pode viver mais três, quatro décadas. Nesta base, oito fêmeas vivas já passaram dos 42 anos.

Por que uma fêmea deixaria de reproduzir tendo décadas de vida pela frente? A literatura convergiu para duas explicações complementares, ambas testadas nesta mesma população: fêmeas velhas que reproduzem ao mesmo tempo que as filhas têm filhotes com mortalidade muito maior — é o **conflito reprodutivo intergeracional** de Croft et al. (2017) — e avós pós-reprodutivas aumentam mensuravelmente a sobrevivência dos netos, sobretudo em anos de salmão escasso (Nattrass et al., 2019). Parar de parir e passar a cuidar é, nas contas, a estratégia com maior retorno.

O intervalo mediano de 5 anos entre partos, combinado com uma janela reprodutiva de aproximadamente 30 anos, coloca o teto biológico da população num patamar baixíssimo. Não existe cenário de recuperação rápida para um animal com essa história de vida — mesmo em condições ideais, a resposta demográfica leva décadas.

---

## 9. A fecundidade caiu pela metade

Este é, para mim, o gráfico mais preocupante do conjunto.

<figure>
  <img src="/assets/images/orca-08-fecundidade.png" alt="Acima, nascimentos por fêmea em idade reprodutiva em média móvel de cinco anos, caindo de 0,121 para 0,063; abaixo, número de fêmeas de 10 a 42 anos, que varia pouco ao longo da série" />
  <figcaption>
    <strong>Figura 8:</strong> acima, a taxa de fecundidade — nascimentos divididos pelo número de fêmeas em idade reprodutiva (10 a 42 anos), em média móvel de cinco anos. Abaixo, o denominador dessa razão, mostrado separadamente.
  </figcaption>
</figure>

Contar nascimentos brutos não basta: se há menos fêmeas férteis, é natural que nasçam menos filhotes. A medida que importa é a **fecundidade** — nascimentos por fêmea em idade reprodutiva por ano.

<div class="orca-table" markdown="1">

| Período | Fecundidade |
|---|---|
| 1976–2015 | $0{,}1212$ filhote/fêmea-ano |
| 2016–2025 | $0{,}0627$ filhote/fêmea-ano |

</div>

A taxa recente é **52% da histórica**. Para testar se isso pode ser flutuação amostral, tomei a fecundidade histórica como taxa de referência e perguntei quantos nascimentos seriam esperados na última década dado o número de fêmeas férteis observado ano a ano. O modelo natural é o de Poisson:

<div class="orca-key" markdown="1">
**17 nascimentos observados** contra **32,2 esperados** sob a taxa histórica — $p = 0{,}0050$.
</div>

E o painel inferior da figura fecha o argumento: o número de fêmeas de 10 a 42 anos era 34 no pico (1997) e é 28 hoje. Caiu 18%, não 50%. **O denominador quase não mudou; quem caiu foi a taxa.**

Isso é exatamente o que a literatura previa. Ward, Holmes e Balcomb (2009) mostraram que a fecundidade destas orcas acompanha a abundância de salmão-real (*Chinook*) do ano anterior. Wasser et al. (2017), medindo hormônios em amostras fecais coletadas por cães farejadores, encontraram falha em até dois terços das gestações entre 2007 e 2014, com marcadores de estresse nutricional sete vezes mais altos nas fêmeas que perderam a gestação. A queda que aparece aqui como um número — 0,121 para 0,063 — é, do lado biológico, gestação que não chega ao fim.

---

## 10. Sobrevivência ao primeiro ano: sem sinal claro

<figure>
  <img src="/assets/images/orca-09-sobrevivencia.png" alt="Proporção de filhotes que sobreviveram ao primeiro ano por década de nascimento, com intervalos de confiança de Wilson de 95%; valores entre 80% e 92% com intervalos amplos e sobrepostos" />
  <figcaption>
    <strong>Figura 9:</strong> proporção de filhotes que passaram do ano-calendário em que nasceram, por década de nascimento, com intervalos de confiança de Wilson de 95%.
  </figcaption>
</figure>

<div class="orca-table" markdown="1">

| Coorte | $n$ | Sobreviveram | Proporção | IC 95% |
|---|---|---|---|---|
| 1970 | 35 | 32 | 91,4% | [77,6%; 97,0%] |
| 1980 | 28 | 24 | 85,7% | [68,5%; 94,3%] |
| 1990 | 37 | 34 | 91,9% | [78,7%; 97,2%] |
| 2000 | 35 | 28 | 80,0% | [64,1%; 90,0%] |
| 2010 | 26 | 21 | 80,8% | [62,1%; 91,5%] |
| 2020 | 10 | 8 | 80,0% | [49,0%; 94,3%] |

</div>

A proporção global é de **86,0%** ($n = 171$). Há uma aparente queda das coortes dos anos 1970–1990 (85–92%) para as dos anos 2000–2020 (80%), mas **os intervalos de confiança se sobrepõem em cheio** — com trinta e poucos filhotes por década não dá para distinguir 80% de 92%.

Usei o intervalo de Wilson e não o de Wald justamente por isso: com $n$ pequeno e $p$ perto de 1, o intervalo de Wald produz limites acima de 100% e cobertura ruim. O de Wilson resolve os dois problemas.

A leitura correta desta figura é *ausência de evidência*, não evidência de ausência. E ela contrasta de forma interessante com a Figura 8: a queda de fecundidade é detectável estatisticamente; a queda na sobrevivência de filhotes, não. O gargalo aparente está antes do nascimento, não depois.

---

## 11. O que estes números não dizem

Uma análise honesta precisa da lista das coisas que ela não consegue sustentar.

- **Nada aqui é causal.** Não há uma única variável ambiental nesta base — nem salmão, nem ruído de embarcação, nem PCB. As explicações causais que citei vêm de outros estudos, com outros desenhos. O que fiz aqui é descrever a demografia.
- **Idades antigas são estimativas, não observações.** Animais já adultos no início do censo tiveram a idade retrocalculada. O caso de J002 (106 anos) é o exemplo extremo e contestado, e ele puxa sozinho a média e o máximo das fêmeas. Sem ele, o máximo feminino observado cai para 59 anos.
- **A resolução anual comprime os primeiros meses.** Um filhote que nasce em novembro e morre em janeiro conta como tendo sobrevivido ao primeiro ano; um que nasce em fevereiro e morre em dezembro, não. Isso adiciona ruído à Figura 9 numa direção difícil de prever.
- **Filhotes que morrem muito cedo podem nunca entrar na base.** Se um natimorto ou um recém-nascido morre antes de ser fotografado, ele não vira uma linha do CSV. A fecundidade calculada aqui é, portanto, um piso — e a mortalidade neonatal real, mais alta que a medida.
- **O ano de 2025 é parcial.** A base é um instantâneo; o censo oficial ainda pode ser revisado. O valor de 76 deve ser lido como provisório.
- **31 indivíduos não têm sexo determinado** e ficam fora das análises por sexo. Como são majoritariamente animais que morreram cedo, sua exclusão tende a inflar levemente as duas curvas de Kaplan–Meier.
- **A janela reprodutiva de 10 a 42 anos é uma convenção.** Ela vem da literatura de história de vida da espécie, mas é um corte rígido aplicado a um processo gradual — deslocá-la em dois anos muda o denominador da fecundidade.

---

## 12. Métodos

Toda a análise está num único script Julia, com `CSV.jl` e `DataFrames.jl` para os dados e `CairoMakie.jl` para as figuras. Os procedimentos estatísticos foram implementados diretamente, sem pacote de sobrevivência:

- **Regressão log-linear** por mínimos quadrados ordinários sobre $\log N_t$, com erro-padrão, estatística $t$ e $p$-valor por distribuição $t$ de Student com $n-2$ graus de liberdade.
- **Kaplan–Meier** com censura à direita em 2025. Intervalos de confiança construídos na escala $\log(-\log S)$ com variância de Greenwood, que garante limites dentro de $[0, 1]$ — ao contrário do intervalo simétrico ingênuo.
- **Teste log-rank** de duas amostras, com a estatística $(O_1 - E_1)^2 / V$ comparada a uma $\chi^2$ com um grau de liberdade.
- **Intervalo de Wilson** para as proporções de sobrevivência por coorte.
- **Teste de Poisson bicaudal** para a contagem de nascimentos da última década contra o esperado sob a taxa histórica.

As figuras usam paleta categórica verificada para os principais tipos de daltonismo (azul, laranja e água), e cada uma é gerada duas vezes, em português e em inglês, a partir do mesmo código.

---

## Em uma frase

<div class="orca-key" markdown="1">
Cinquenta anos de censo completo mostram uma população que cresceu até 1993 e encolhe desde então a 0,63% ao ano; a queda está concentrada no pod L, a diferença de sobrevivência entre os sexos é gritante (medianas de 51 e 24 anos) e o sinal mais forte de deterioração recente está na fecundidade, que caiu à metade sem que o número de fêmeas férteis tenha caído junto.
</div>

---

## Referências

---

**Fonte dos dados**

- NOAA Northwest Fisheries Science Center — *SRKW-Status: repositório de código e dados para projeções populacionais das orcas residentes do sul* (pacote `kwdemog`, arquivo `orca.csv`). Licença GPL-3.0; conteúdo produzido por servidores do governo dos EUA em domínio público (17 U.S.C. §105).
  <https://github.com/noaa-nwfsc/srkw-status>

- Center for Whale Research — *Orca Survey*: censo anual por foto-identificação da população residente do sul, conduzido desde 1976.
  <https://www.whaleresearch.com/orcasurvey>

**Demografia e história de vida**

- Olesiuk, P. F.; Bigg, M. A.; Ellis, G. M. — *Life history and population dynamics of resident killer whales (Orcinus orca) in the coastal waters of British Columbia and Washington State*. Report of the International Whaling Commission, Special Issue 12, 209–243, 1990. (Tábuas de vida de referência para a espécie.)

- Ford, J. K. B.; Ellis, G. M.; Olesiuk, P. F.; Balcomb, K. C. — *Linking killer whale survival and prey abundance: food limitation in the oceans' apex predator?* Biology Letters, 6(1), 139–142, 2010. DOI: 10.1098/rsbl.2009.0468.
  <https://royalsocietypublishing.org/doi/10.1098/rsbl.2009.0468>

- Ward, E. J.; Holmes, E. E.; Balcomb, K. C. — *Quantifying the effects of prey abundance on killer whale reproduction*. Journal of Applied Ecology, 46(3), 632–640, 2009. DOI: 10.1111/j.1365-2664.2009.01647.x.
  <https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/j.1365-2664.2009.01647.x>

- Wasser, S. K. et al. — *Population growth is limited by nutritional impacts on pregnancy success in endangered Southern Resident killer whales (Orcinus orca)*. PLOS ONE, 12(6), e0179824, 2017. DOI: 10.1371/journal.pone.0179824.
  <https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0179824>

- Lacy, R. C. et al. — *Evaluating anthropogenic threats to endangered killer whales to inform effective recovery plans*. Scientific Reports, 7, 14119, 2017. DOI: 10.1038/s41598-017-14471-0. (Análise de viabilidade populacional: sem crescimento projetado nas condições atuais.)
  <https://www.nature.com/articles/s41598-017-14471-0>

**Menopausa e vida pós-reprodutiva**

- Croft, D. P. et al. — *Reproductive Conflict and the Evolution of Menopause in Killer Whales*. Current Biology, 27(2), 298–304, 2017. DOI: 10.1016/j.cub.2016.12.015.
  <https://www.cell.com/current-biology/fulltext/S0960-9822(16)31462-2>

- Nattrass, S. et al. — *Postreproductive killer whale grandmothers improve the survival of their grandoffspring*. PNAS, 116(52), 26669–26673, 2019. DOI: 10.1073/pnas.1903844116.
  <https://www.pnas.org/doi/10.1073/pnas.1903844116>

- Weiss, M. N. et al. — *Costly lifetime maternal investment in killer whales*. Current Biology, 33(4), 744–748, 2023. DOI: 10.1016/j.cub.2022.12.057. (O custo reprodutivo de criar filhos machos ao longo de toda a vida.)
  <https://www.cell.com/current-biology/fulltext/S0960-9822(22)01994-7>

**Status legal e histórico de capturas**

- NOAA Fisheries — *Listing of Southern Resident Killer Whale Under the ESA*. Designação como *endangered* em 18 de novembro de 2005 (70 FR 69903).
  <https://www.fisheries.noaa.gov/action/listing-southern-resident-killer-whale-under-esa>

- NOAA Fisheries — *Southern Resident Killer Whales (Orcinus orca) 5-Year Review*, 2021.
  <https://media.fisheries.noaa.gov/2022-01/srkw-5-year-review-2021.pdf>

- Bigg, M. A.; Wolman, A. A. — *Live-capture killer whale (Orcinus orca) fishery, British Columbia and Washington, 1962–73*. Journal of the Fisheries Research Board of Canada, 32(7), 1213–1221, 1975. (As capturas para aquários que precedem o início da série.)

**Métodos estatísticos**

- Kaplan, E. L.; Meier, P. — *Nonparametric Estimation from Incomplete Observations*. Journal of the American Statistical Association, 53(282), 457–481, 1958. DOI: 10.1080/01621459.1958.10501452.

- Greenwood, M. — *The natural duration of cancer*. Reports on Public Health and Medical Subjects, 33, 1–26, 1926. (A fórmula da variância usada nas bandas de confiança.)

- Mantel, N. — *Evaluation of survival data and two new rank order statistics arising in its consideration*. Cancer Chemotherapy Reports, 50(3), 163–170, 1966. (Teste log-rank.)

- Wilson, E. B. — *Probable Inference, the Law of Succession, and Statistical Inference*. Journal of the American Statistical Association, 22(158), 209–212, 1927. DOI: 10.1080/01621459.1927.10502953.

- Brown, L. D.; Cai, T. T.; DasGupta, A. — *Interval Estimation for a Binomial Proportion*. Statistical Science, 16(2), 101–133, 2001. (Por que o intervalo de Wald é ruim e o de Wilson é preferível.)

**Ferramentas**

- [CairoMakie.jl](https://docs.makie.org/stable/explanations/backends/cairomakie) — backend usado para gerar as nove figuras.
- [DataFrames.jl](https://dataframes.juliadata.org/stable/) e [CSV.jl](https://csv.juliadata.org/stable/) — manipulação e leitura dos dados.
- [Distributions.jl](https://juliastats.org/Distributions.jl/stable/) — distribuições $t$, $\chi^2$, normal e Poisson usadas nos testes.

---

### Nota sobre os dados e a análise

**Todos os dados utilizados nesta análise são públicos**, obtidos do repositório `noaa-nwfsc/srkw-status` da NOAA Northwest Fisheries Science Center, que arquiva o censo demográfico conduzido em parceria com o Center for Whale Research.

Esta análise foi realizada de forma **independente**, com propósitos **educacionais e de demonstração técnica**. Os resultados, visualizações e conclusões aqui apresentados **não representam um comunicado oficial** da NOAA, do Center for Whale Research ou de qualquer outra instituição. O autor não possui vínculo com essas organizações nem recebeu financiamento para este trabalho.

O objetivo do artigo é didático: demonstrar análise de sobrevivência, estimação de proporções com intervalos apropriados e visualização de dados demográficos em Julia. As informações não devem ser usadas como base para decisões de manejo, política de conservação ou avaliação de programas. Para dados oficiais e atualizados sobre o status da população, consulte a [NOAA Fisheries](https://www.fisheries.noaa.gov/species/southern-resident-killer-whale) e o [Center for Whale Research](https://www.whaleresearch.com/).

</div>

---

## Compartilhe este artigo

<!-- Fim do artigo -->
