---
layout: post
title: "Frequências Históricas na Mega-Sena"
categories: [PROBABILIDADE, ESTATÍSTICA]
lang: pt
tags: [matemática, probabilidade, mega-sena]
ref: porcentagens
description: "Frequências Históricas na Mega-Sena"
---

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Por que, ao longo do histórico completo dos sorteios da Mega-Sena, alguns números apresentam frequências observadas significativamente superiores às de outros, apesar da hipótese de equiprobabilidade?</p>
</div>

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/mega-sena.png" alt="Fluxograma de decisão para escolher entre Teste Z e Teste t." style="max-width: 50%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> Na Mega-Sena, “a sorte está lançada”: o jogo está feito e, a partir daqui, só resta acompanhar o sorteio — porque a decisão é sem volta… e a estatística é quem conta a história.
  </figcaption>
</figure>

### Resposta (visão geral)

Porque **aleatoriedade real gera ruído**: mesmo que o processo seja justo, as frequências **não ficam iguais** no finito — elas apenas **tendem** a se aproximar no longo prazo (Lei dos Grandes Números). E como você observa **60 números ao mesmo tempo**, é esperado que alguns apareçam como “campeões” e outros como “lanternas” (efeito dos extremos).

---

## O modelo probabilístico correto (com notação)

Em cada sorteio, saem **6 números distintos** dentre 60.

Fixe um número $$k\in\{1,\dots,60\}$$ e defina a variável indicadora:

$$
I_{n,k}=
\begin{cases}
1, & \text{se o número }k\text{ saiu no sorteio }n\\
0, & \text{caso contrário}
\end{cases}
$$

A contagem total de aparições de $$k$$ em $$N$$ sorteios é:

$$
X_k=\sum_{n=1}^{N} I_{n,k}
$$

Em um sorteio, a probabilidade de $$k$$ aparecer é:

$$
P(I_{n,k}=1)=\frac{6}{60}=\frac{1}{10}=0{,}1
$$

Assumindo sorteios independentes, então:

$$
X_k \sim \text{Binomial}(N,\,p)\quad\text{com }p=0{,}1
$$

---

## Frequência esperada × frequência observada

A esperança é:

$$
\mathbb{E}[X_k]=Np
$$

Logo, a **frequência esperada** por número é:

$$
E = N\cdot 0{,}1=\frac{N}{10}
$$

Mas isso é uma **média**, não uma obrigação.

---

## Variância e desvio padrão (o “motor” das diferenças)

Para a binomial:

$$
\mathrm{Var}(X_k)=Np(1-p)
$$

$$
\sigma=\sqrt{Np(1-p)}=\sqrt{N\cdot 0{,}1\cdot 0{,}9}=\sqrt{0{,}09N}
$$

**Moral importante:**
- o desvio **absoluto** típico cresce como $$\sqrt{N}$$;
- o desvio **relativo** (em %) cai como $$1/\sqrt{N}$$.

---

## Exemplo numérico completo (um número específico)

Considere $$N=2500$$ sorteios.

$$
E=\frac{N}{10}=\frac{2500}{10}=250
$$

$$
\sigma=\sqrt{2500\cdot0{,}1\cdot0{,}9}=\sqrt{225}=15
$$

Interpretação:
- $$250$$ é o “alvo” médio;
- variações de $$1\sigma\approx 15$$ são **comuns**;
- $$2\sigma\approx 30$$ ainda é bem plausível.

Então ver algo como $$220$$ ou $$280$$ é totalmente compatível com um processo justo.

---

## Exemplo 1: “um número saiu 290 vezes em 2500 sorteios — é suspeito?”

Vamos estimar $$P(X_k\ge 290)$$ sob $$X_k\sim\text{Bin}(2500,0{,}1)$$.

Use aproximação normal com correção de continuidade:

$$
Z=\frac{X_k-\mu}{\sigma},\quad \mu=250,\ \sigma=15
$$

Queremos $$P(X_k\ge 290)\approx P\big(X_k\ge 289{,}5\big)$$:

$$
z=\frac{289{,}5-250}{15}=\frac{39{,}5}{15}\approx 2{,}633
$$

Da tabela normal, $$P(Z\ge 2{,}63)\approx 0{,}0042$$ (cerca de **0,42%**).

**Conclusão:** para **um número específico**, isso é raro, mas não impossível.

---

## Exemplo 2 (crucial): “ok, mas eu olho 60 números!”

Aqui entra o **efeito dos extremos**.

Se, grosso modo, tratarmos “cada número ter $$P(X_k\ge 290)\approx 0{,}0042$$” como eventos independentes (é uma aproximação), então a chance de **existir pelo menos um** número com $$\ge 290$$ aparições é:

$$
P(\max_k X_k\ge 290)\approx 1-(1-0{,}0042)^{60}
$$

Aproximando $$(1-a)^{60}\approx e^{-60a}$$:

$$
1-e^{-60\cdot0{,}0042}=1-e^{-0{,}252}\approx 1-0{,}777\approx 0{,}223
$$

Ou seja, **~22%** de chance de aparecer “um número muito frequente” nesse nível **em algum** dos 60.

**Isso explica por que sempre existem “top 10 mais sorteados”.**

---

## Exemplo 3: “e o outro extremo? um número com 220 aparições”

Agora $$P(X_k\le 220)\approx P(X_k\le 220{,}5)$$:

$$
z=\frac{220{,}5-250}{15}=\frac{-29{,}5}{15}\approx -1{,}967
$$

$$
P(Z\le -1{,}97)\approx 0{,}0245\quad(\text{cerca de 2,45%})
$$

Para **algum** número entre os 60:

$$
P(\min_k X_k\le 220)\approx 1-(1-0{,}0245)^{60}\approx 1-e^{-1{,}47}\approx 0{,}77
$$

Ou seja: **~77%** de chance de existir pelo menos um número “bem frio” ($$\le 220$$) num histórico de 2500 sorteios.

---

## Exemplo 4: repetição de números entre dois sorteios seguidos (sem mistério)

Muita gente estranha “número repetido do sorteio anterior”. Mas é bem comum.

A probabilidade de **não repetir nenhum** número de um sorteio para o próximo é:

$$
P(\text{sem repetição})=\frac{\binom{54}{6}}{\binom{60}{6}}
$$

Porque, fixado o 1º sorteio (6 números), para o próximo não repetir nenhum, ele precisa escolher os 6 dentre os 54 restantes.

Numericamente, $$\binom{54}{6}/\binom{60}{6}\approx 0{,}516$$.

Logo:

$$
P(\text{repetir pelo menos 1})=1-0{,}516\approx 0{,}484
$$

**Quase metade** das transições entre sorteios têm **ao menos um número repetido** do sorteio anterior — e isso é exatamente o que a aleatoriedade prevê.

Se $$N=2500$$, existem $$N-1=2499$$ “pares consecutivos”, então o número esperado de transições com repetição é:

$$
2499\cdot 0{,}484 \approx 1210
$$

---

## Psicologia dos padrões (por que isso “parece” estranho)

Nosso cérebro:
- odeia ruído;
- ama narrativas (“esse número é viciado”, “esse está atrasado”);
- supervaloriza extremos e sequências curtas.

Aleatoriedade real parece “imperfeita” para a intuição humana.

---

## Testes estatísticos (o que faz sentido testar)

Você pode testar:

- **Uniformidade** (se alguns números aparecem demais);
- **Independência** (se há “memória” entre sorteios);
- **Runs / agrupamentos** (padrões sequenciais além do esperado);
- **Pares / trincas** (com cautela: explosão de comparações).

Um detalhe: quanto mais coisas você testa, maior a chance de achar “algo estranho” por puro acaso (múltiplas comparações). Correções como Bonferroni/FDR são importantes quando você sai testando “tudo”.

---

<div style="border-left: 4px solid #2196F3; padding: 1em; background-color: #e3f2fd; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Sob a hipótese de equiprobabilidade, selecionar números historicamente mais frequentes implica vantagem probabilística?</p>
</div>

### Resposta curta

Não. A probabilidade do próximo sorteio **não muda** por causa do histórico.

---

## Justificativa rigorosa (com independência)

Para um número fixo $$k$$, defina $$X_n=\{k\text{ sai no sorteio }n\}$$.

Independência significa:

$$
P(X_{n+1}\mid X_1,\dots,X_n)=P(X_{n+1})
$$

E como:

$$
P(X_{n+1})=\frac{6}{60}=\frac{1}{10}
$$

Então, mesmo que $$k$$ tenha sido “quente” no passado:

$$
P(k\text{ sair no próximo})=\frac{1}{10}
$$

**Exemplo explícito:** “10 saiu 300 vezes e 47 saiu 230 vezes”
$$
P(10\ \text{no próximo})=P(47\ \text{no próximo})=\frac{1}{10}
$$

---

## Falácia do jogador (em uma linha)

“Está atrasado” ou “está quente” não altera urna nenhuma.  
Urna não tem memória.

---

## ÚNICA coisa que pode mudar: valor esperado do prêmio (divisão)

A chance de acertar é a mesma, mas o **quanto você recebe se ganhar** pode mudar, porque números “populares” são mais escolhidos.

Modelo simples:
- $$p$$ = probabilidade de você ganhar;
- $$J$$ = jackpot;
- $$W$$ = número de ganhadores (incluindo você), no caso de haver ganhador.

Se $$W$$ fosse “mais ou menos fixo”, uma aproximação do valor esperado seria:

$$
\mathbb{E}[\text{retorno}] \approx p\cdot \frac{J}{\mathbb{E}[W]}
$$

**Exemplo didático (fácil de ver a ideia):**
- mesma probabilidade de ganhar $$p$$ (não muda);
- mas se com números populares você costuma dividir com $$\mathbb{E}[W]=5$$,
- e com números impopulares $$\mathbb{E}[W]=2$$,

então:

$$
\frac{J/2}{J/5}=2{,}5
$$

Ou seja: **o retorno esperado (quando ganha) pode ser maior** escolhendo combinações menos óbvias — embora a probabilidade de ganhar continue igual.

**Heurísticas para reduzir chance de dividir:**
- evitar datas (1–31);
- evitar padrões “bonitos” (sequências, colunas, diagonais);
- evitar múltiplos de 5, “desenhos” no volante, etc.

---

<div style="border-left: 4px solid #4CAF50; padding: 0.5em; background-color: #e8f5e9; margin: 1em 0;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Mediante a análise do histórico integral e testes de aderência, é possível inferir vieses sistemáticos ou intervenções no mecanismo de sorteio?</p>
</div>

### Resposta curta

Dá para **testar compatibilidade** com um modelo justo e detectar **anomalias grandes**, mas não dá para “provar justiça absoluta” só com frequências.

---

## O que a estatística consegue (formalizando)

Hipótese nula:

$$
H_0:\ \text{sorteios justos, equiprováveis e independentes}
$$

Se os dados contradisserem fortemente $$H_0$$, você tem **evidência contra** o modelo.

Se não contradisserem, você tem **compatibilidade** com o modelo — compatível \(\neq\) prova absoluta.

---

## Exemplo técnico 1: quão grande teria que ser um viés para “aparecer” em $$N=2500$$?

Sob $$H_0$$, para um número $$k$$:

$$
X_k\sim\text{Bin}(2500,0{,}1),\quad \mu=250,\ \sigma=15
$$

Suponha um viés pequeno: $$p=0{,}11$$ (em vez de $$0{,}10$$).

A nova média seria:

$$
\mu_1=N\cdot 0{,}11=275
$$

Diferença em relação ao justo:

$$
\Delta = 275-250=25
$$

Em unidades de desvio padrão:

$$
z=\frac{\Delta}{\sigma}=\frac{25}{15}\approx 1{,}67
$$

Isso **não é** um “alarme forte” (especialmente lembrando que você olha **60 números**).

---

## Exemplo técnico 2: quantos sorteios para um viés de 0,01 virar um “3σ”?

Queremos:

$$
N(0{,}11-0{,}10)=3\sqrt{N\cdot0{,}1\cdot0{,}9}
$$

$$
0{,}01N = 3\sqrt{0{,}09N}=3\cdot 0{,}3\sqrt{N}=0{,}9\sqrt{N}
$$

Dividindo por $$\sqrt{N}$$:

$$
0{,}01\sqrt{N}=0{,}9 \ \Rightarrow\ \sqrt{N}=90 \ \Rightarrow\ N=8100
$$

Ou seja: para detectar com folga um viés de apenas **1 ponto percentual** em um número, você precisa de milhares e milhares de sorteios — e ainda tem o fator “60 números testados”.

---

## Exemplo de teste qui-quadrado (didático, em classes)

Para evitar listar 60 categorias, agrupe números em 6 classes:
- 1–10, 11–20, ..., 51–60 (cada classe tem 10 números)

Em um sorteio de 6 números, a quantidade esperada em cada classe é:

$$
6\cdot \frac{10}{60}=1
$$

Em $$N=2500$$, o total de números sorteados é $$6N=15000$$.  
Logo, a frequência esperada por classe é:

$$
E=\frac{15000}{6}=2500
$$

Suponha observações (exemplo):

- Classe 1: 2600  
- Classe 2: 2450  
- Classe 3: 2520  
- Classe 4: 2400  
- Classe 5: 2520  
- Classe 6: 2510  

O qui-quadrado é:

$$
\chi^2=\sum_{i=1}^{6}\frac{(O_i-E)^2}{E}
$$

Calculando termo a termo:

$$
\frac{(2600-2500)^2}{2500}=\frac{10000}{2500}=4
$$

$$
\frac{(2450-2500)^2}{2500}=\frac{2500}{2500}=1
$$

$$
\frac{(2520-2500)^2}{2500}=\frac{400}{2500}=0{,}16
$$

$$
\frac{(2400-2500)^2}{2500}=\frac{10000}{2500}=4
$$

$$
\frac{(2520-2500)^2}{2500}=0{,}16
$$

$$
\frac{(2510-2500)^2}{2500}=\frac{100}{2500}=0{,}04
$$

Somando:

$$
\chi^2=4+1+0{,}16+4+0{,}16+0{,}04=9{,}36
$$

Graus de liberdade: $$6-1=5$$.  
Esse valor não é “absurdo”; é o tipo de variação que pode acontecer por ruído.

---

## Limitações (o que não dá para prometer)

Mesmo que vários testes deem “ok”:
- pode haver viés **muito pequeno** (abaixo do poder do teste);
- pode haver manipulação **adaptativa** (mais difícil de flagrar só por frequências);
- múltiplos testes aumentam falsos positivos se você não corrigir.

Sinais realmente fortes costumam ser coisas como:
- desvios repetidos de **5–6σ**,
- padrões persistentes e sistemáticos por muito tempo,
- $$p$$-valores extremamente pequenos *e robustos a correções*.

Além da estatística, confiança real envolve:
- auditorias,
- transparência do procedimento,
- controles físicos e redundâncias.

---

<div style="border-left: 4px solid #ff9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Se eu marcar <strong>20 números</strong> em uma única aposta, qual é a probabilidade de acertar a <strong>Sena</strong> (6 acertos)? E o que significa “1 em x”: isso garante <strong>100%</strong> de chance após x apostas?</p>
</div>


Em um sorteio, existem $$\binom{60}{6}$$ combinações possíveis de 6 números.  
Quando você marca 20 números, você “cobre” $$\binom{20}{6}$$ combinações de 6 números.

Logo, a probabilidade de acertar a **Sena** com uma aposta de 20 números é:

$$
\begin{aligned}
p_{20}
&=\frac{\binom{20}{6}}{\binom{60}{6}}
\end{aligned}
$$

Agora calculemos cada combinação.

**1) Calculando $$\binom{20}{6}$$**

$$
\begin{aligned}
\binom{20}{6}
&=\frac{20!}{6!\,14!} \\
&=\frac{20\cdot19\cdot18\cdot17\cdot16\cdot15}{6\cdot5\cdot4\cdot3\cdot2\cdot1} \\
&=\frac{(20/5)\cdot19\cdot(18/6)\cdot17\cdot(16/4)\cdot(15/3)}{2\cdot1} \\
&=\frac{4\cdot19\cdot3\cdot17\cdot4\cdot5}{2} \\
&=\frac{77520}{2} \\
&=38760
\end{aligned}
$$

**2) Calculando $$\binom{60}{6}$$**

$$
\begin{aligned}
\binom{60}{6}
&=\frac{60!}{6!\,54!} \\
&=\frac{60\cdot59\cdot58\cdot57\cdot56\cdot55}{6\cdot5\cdot4\cdot3\cdot2\cdot1} \\
&=\left(\frac{60}{6}\right)\cdot59\cdot\left(\frac{58}{2}\right)\cdot\left(\frac{57}{3}\right)\cdot\left(\frac{56}{4}\right)\cdot\left(\frac{55}{5}\right) \\
&=10\cdot59\cdot29\cdot19\cdot14\cdot11 \\
&=590\cdot29\cdot19\cdot14\cdot11 \\
&=17110\cdot19\cdot14\cdot11 \\
&=325090\cdot14\cdot11 \\
&=4551260\cdot11 \\
&=50063860
\end{aligned}
$$

**3) Probabilidade final**

$$
\begin{aligned}
p_{20}
&=\frac{38760}{50063860} \\
&=\frac{102}{131747} \\
&\approx 0{,}000774211 \\
&\approx 0{,}0774211\% 
\end{aligned}
$$

Forma “1 em x”:

$$
\begin{aligned}
\frac{1}{p_{20}}
&=\frac{131747}{102} \\
&\approx 1291{,}64
\end{aligned}
$$

Então, aproximadamente, é **1 em 1292**.

**Importante:** “1 em 1292” **não** significa que em 1292 tentativas você ganha com 100% de certeza.  
Significa “em média, 1 acerto a cada 1292 apostas” (expectativa).

A chance de ganhar **pelo menos uma vez** em $$x$$ apostas é:

$$
\begin{aligned}
P(\ge 1\ \text{ganho em }x)
&=1-(1-p_{20})^x
\end{aligned}
$$

Se você fizer $$x\approx \frac{1}{p_{20}}$$ apostas, então:

$$
\begin{aligned}
P(\ge 1)
&=1-(1-p_{20})^{1/p_{20}} \\
&\approx 1-e^{-1} \\
&\approx 1-0{,}3679 \\
&\approx 0{,}6321
\end{aligned}
$$

Ou seja: **~63%**, não 100%.

---

<div style="border-left: 4px solid #ff9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Se eu fizer <strong>duas</strong> apostas de 20 números, a probabilidade de ganhar a Sena é simplesmente <strong>somar</strong> as probabilidades?</p>
</div>


Se cada aposta tem probabilidade $$p_{20}$$ de acertar a Sena, então a forma correta é usar o **complemento**:

- “Ganhar pelo menos uma vez” = 1 − “não ganhar em nenhuma”.

$$
\begin{aligned}
P(\ge 1\ \text{ganho em 2 apostas})
&=1-P(\text{perder as 2}) \\
&=1-(1-p_{20})^2 \\
&=1-\big(1-2p_{20}+p_{20}^2\big) \\
&=2p_{20}-p_{20}^2
\end{aligned}
$$

Como $$p_{20}$$ é pequeno, $$p_{20}^2$$ é menor ainda, então **aproxima** bem somar:
$$2p_{20}-p_{20}^2 \approx 2p_{20}.$$
Mas **não é exatamente** “só somar”.

Agora colocando os valores:

$$
\begin{aligned}
p_{20}
&=\frac{102}{131747}\approx 0{,}000774211 \\
P(\ge 1\ \text{em 2})
&=1-(1-0{,}000774211)^2 \\
&\approx 0{,}001547823 \\
&\approx 0{,}1547823\%
\end{aligned}
$$

Forma “1 em x” (aproximada):

$$
\begin{aligned}
\frac{1}{0{,}001547823}
&\approx 646{,}07
\end{aligned}
$$

Então é cerca de **1 em 646**.

---
<div style="border-left: 4px solid #ff9800; padding: 1em; background-color: #fff3e0; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">Pergunta</h4>
  <p>Nesta semana, viralizou a notícia de um grupo de Cachoeira Dourada (GO) que reuniu cerca de <strong>R$ 13 milhões</strong> e registrou <strong>57 jogos de 20 números</strong> na Mega da Virada. Se eu fizer <strong>57 apostas de 20 números</strong> (uma vez cada), qual é a probabilidade de acertar a <strong>Sena</strong> <em>pelo menos uma vez</em>? E como interpretar esse resultado?</p>
  <p style="margin: 0.5em 0 0 0; font-size: 0.9em; color: #555;"><em>Contexto:</em> caso noticiado pelo InfoMoney em 29/12/2025.</p>
</div>


**Observação importante:**
- o cálculo abaixo assume que as 57 apostas funcionam como **57 tentativas** (isto é, apostas “separadas”);
- se você repetir exatamente a **mesma** aposta 57 vezes, a chance **não** multiplica: continua sendo a chance de uma única aposta.

---

#### 1) Probabilidade de acertar a Sena com **uma** aposta de 20 números

Uma aposta de 20 números “cobre” todas as combinações de 6 dezenas dentro desses 20 números.

Logo:

$$
\begin{aligned}
p_{20}
&=\frac{\binom{20}{6}}{\binom{60}{6}}
\end{aligned}
$$

Como já calculado:

$$
\begin{aligned}
\binom{20}{6}&=38760\\
\binom{60}{6}&=50063860
\end{aligned}
$$

Então:

$$
\begin{aligned}
p_{20}
&=\frac{38760}{50063860}\\
&=\frac{102}{131747}\\
&\approx 0{,}000774211\\
&\approx 0{,}0774211\%
\end{aligned}
$$

---

#### 2) Probabilidade de ganhar **pelo menos uma vez** com 57 apostas

É mais fácil calcular pelo complemento:

- “ganhar pelo menos uma vez” = 1 − “perder todas as 57”.

$$
\begin{aligned}
P(\ge 1\ \text{Sena em 57})
&=1-P(\text{perder as 57})\\
&=1-(1-p_{20})^{57}
\end{aligned}
$$

Substituindo $$p_{20}\approx 0{,}000774211$$:

$$
\begin{aligned}
P(\ge 1)
&=1-(1-0{,}000774211)^{57}\\
&=1-(0{,}999225789)^{57}\\
&\approx 0{,}043186828\\
&\approx 4{,}3186828\%
\end{aligned}
$$

Uma leitura do tipo “1 em x” (só como referência):

$$
\begin{aligned}
\frac{1}{0{,}043186828}
&\approx 23{,}16
\end{aligned}
$$

Ou seja: aproximadamente **1 em 23** para acertar **ao menos uma Sena**, nesse cenário.

---

#### 3) Interpretação correta (por que não vira “certeza”)

Mesmo gastando muito, **4,32%** ainda significa que, na maioria das vezes, **não** sai a Sena:

$$
\begin{aligned}
P(\text{não ganhar em 57})
&=(1-p_{20})^{57}\\
&\approx 1-0{,}043186828\\
&\approx 0{,}956813172\\
&\approx 95{,}68\%
\end{aligned}
$$

Portanto:
- **não** existe “garantia”;
- existe uma chance **maior**, mas ainda **baixa** para o prêmio principal.

---

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>Referência rápida</strong>
  <ul>
    <li>Probabilidade teórica de um número específico sair em um sorteio: <strong>\(6/60=1/10\)</strong></li>
    <li>Contagem de um número em \(N\) sorteios (modelo): <strong>\(X_k\sim\text{Bin}(N,0{,}1)\)</strong></li>
    <li>Frequência esperada: <strong>\(\mathbb{E}[X_k]=N/10\)</strong></li>
    <li>Desvio padrão: <strong>\(\sigma=\sqrt{0{,}09N}\)</strong></li>
    <li>Probabilidade de pelo menos 1 repetição entre dois sorteios seguidos: <strong>\(1-\binom{54}{6}/\binom{60}{6}\approx 0{,}484\)</strong></li>
    <li>Probabilidade de acertar a Sena com 20 números em uma aposta: <strong>\(p_{20}=\binom{20}{6}/\binom{60}{6}=\frac{102}{131747}\approx 0{,}0774\%\)</strong></li>
  </ul>
</div>


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
  color: #333 !important; /* Cor do ícone (cinza escuro) */
  font-size: 24px;
  border: none;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}
.share-btn:hover {
  color: #000 !important; /* Cor do ícone ao passar o mouse */
  transform: scale(1.1);
}
</style>

<div class="share-buttons">
  <p class="share-buttons-title">Gostou deste artigo? Compartilhe!</p>
  <a href="https://api.whatsapp.com/send?text={{ page.title | url_encode }}%20-%20{{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp" title="Compartilhar no WhatsApp"><i class="bi bi-whatsapp"></i></a>
  <a href="https://www.facebook.com/sharer/sharer.php?u={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn facebook" title="Compartilhar no Facebook"><i class="bi bi-facebook"></i></a>
  <a href="https://www.linkedin.com/shareArticle?mini=true&url={{ site.url }}{{ page.url }}&title={{ page.title | url_encode }}&summary={{ page.description | url_encode }}" target="_blank" rel="noopener noreferrer" class="share-btn linkedin" title="Compartilhar no LinkedIn"><i class="bi bi-linkedin"></i></a>
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
