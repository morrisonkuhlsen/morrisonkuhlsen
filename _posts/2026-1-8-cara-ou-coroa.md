---
layout: post
title: "Mistérios do cara ou coroa"
categories: [PROBABILIDADE, ESTATÍSTICA, GUIA]
tags: [probabilidade, estatística, bernoulli, binomial, lgn]
lang: pt
ref: cara-ou-coroa
description: "cara-ou-coroa: Binomial, LGN, runs e tempos de espera."
---

## 1) Modelo probabilístico (moeda justa)

Assuma uma moeda justa e lançamentos independentes.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/cointoss.png" alt="Ilustração conceitual de limite (substitua por uma imagem do seu blog, se quiser)." style="max-width: 50%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> A sorte está lançada.
  </figcaption>
</figure>

### Um lançamento

Espaço amostral:

$$
\Omega=\{C,K\}
$$

onde $C$ = cara, $K$ = coroa.

Como é justa:

$$
P(C)=P(K)=\frac12.
$$

---

## 2) Formalizando o cara-ou-coroa como v.a. Bernoulli

Defina, para o $i$-ésimo lançamento:

$$
X_i=
\begin{cases}
1, & \text{se deu cara}\\
0, & \text{se deu coroa}
\end{cases}
$$

Assumindo moeda justa e independência:

$$
X_i \sim \text{i.i.d. Bernoulli}(p),\quad p=\frac12.
$$

Então:

$$
\mathbb{E}[X_i]=p=\frac12,
\qquad
\mathrm{Var}(X_i)=p(1-p)=\frac14.
$$

A proporção de caras em $n$ lançamentos é

$$
\hat p_n=\frac{1}{n}\sum_{i=1}^{n}X_i.
$$

---

## 3) Vários lançamentos: contagem de caras e distribuição Binomial

Considere $n$ lançamentos independentes e defina a v.a.

$$
X=\text{número de caras em }n\text{ lançamentos}.
$$

Então:

$$
X\sim \text{Binomial}(n,p),\quad p=\frac12.
$$

A probabilidade de exatamente $k$ caras é:

$$
P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}.
$$

Como $p=\frac12$:

$$
P(X=k)=\binom{n}{k}\left(\frac12\right)^k\left(\frac12\right)^{n-k}
=\binom{n}{k}\left(\frac12\right)^n
=\frac{\binom{n}{k}}{2^n}.
$$

**Interpretação combinatória:** há $2^n$ sequências equiprováveis; e $\binom{n}{k}$ delas têm exatamente $k$ caras.

---

## 4) Cálculos passo a passo (exemplos)

### Exemplo A — $n=5$: probabilidade de sair exatamente $k=3$ caras

Seja $X$ o número de caras em $n=5$ lançamentos de uma moeda justa. Então $X\sim\mathrm{Bin}(5,\tfrac12)$ e:

$$
P(X=3)=\binom{5}{3}\left(\frac12\right)^3\left(1-\frac12\right)^{5-3}
=\binom{5}{3}\left(\frac12\right)^3\left(\frac12\right)^2
=\binom{5}{3}\left(\frac12\right)^5
=\frac{\binom{5}{3}}{2^5}.
$$

Agora, calcule $\binom{5}{3}$:

$$
\binom{5}{3}=\frac{5!}{3!\,(5-3)!}=\frac{5!}{3!\,2!}.
$$

Expanda os fatoriais:

$$
5!=5\cdot 4\cdot 3\cdot 2\cdot 1,\qquad
3!=3\cdot 2\cdot 1,\qquad
2!=2\cdot 1.
$$

Substituindo:

$$
\binom{5}{3}
=\frac{5\cdot 4\cdot 3\cdot 2\cdot 1}{(3\cdot 2\cdot 1)\,(2\cdot 1)}.
$$

Cancele o fator comum $(3\cdot 2\cdot 1)$:

$$
\binom{5}{3}
=\frac{5\cdot 4\;\cancel{(3\cdot 2\cdot 1)}}{\cancel{(3\cdot 2\cdot 1)}\,(2\cdot 1)}
=\frac{5\cdot 4}{2\cdot 1}.
$$

Efetue as operações:

$$
\binom{5}{3}=\frac{20}{2}=10.
$$

Agora calcule $2^5$:

$$
2^5=2\cdot 2\cdot 2\cdot 2\cdot 2=32.
$$

Substituindo em $P(X=3)$:

$$
P(X=3)=\frac{\binom{5}{3}}{2^5}=\frac{10}{32}.
$$

Simplifique a fração (dividindo por $2$):

$$
\frac{10}{32}=\frac{10\div 2}{32\div 2}=\frac{5}{16}.
$$

Converta para decimal:

$$
\frac{5}{16}
=\frac{50}{160}
=0{,}3125.
$$

Logo,

$$
P(X=3)=\frac{10}{32}=\frac{5}{16}=0{,}3125.
$$


### Exemplo B — $n=3$: probabilidade de “pelo menos uma cara”

Defina o evento:

$$
A=\{\text{pelo menos uma cara}\}.
$$

Use o complementar:

$$
A^c=\{\text{nenhuma cara}\}=\{\text{todas coroa}\}.
$$

Como os lançamentos são independentes e $P(\text{coroa})=\frac12$:

$$
P(A^c)=\left(\frac12\right)^3.
$$

Calcule:

$$
\left(\frac12\right)^3
=\frac12\cdot\frac12\cdot\frac12
=\frac{1\cdot 1\cdot 1}{2\cdot 2\cdot 2}
=\frac{1}{8}.
$$

Então:

$$
P(A)=1-P(A^c)=1-\left(\frac12\right)^3=1-\frac18.
$$

Escreva $1$ com denominador $8$:

$$
1=\frac{8}{8}.
$$

Subtraia:

$$
1-\frac18=\frac{8}{8}-\frac{1}{8}=\frac{7}{8}.
$$

Converta para decimal:

$$
\frac{7}{8}=0{,}875.
$$

Logo,

$$
P(A)=1-P(A^c)=1-\left(\frac12\right)^3
=1-\frac18=\frac78=0{,}875.
$$


### Exemplo C — probabilidade de “todas caras” em $n$ lançamentos

(1) Argumento por contagem de sequências (como no enunciado)

Em $n$ lançamentos, existem $2^n$ sequências possíveis (cada lançamento tem 2 resultados).
A sequência “todas caras” é única: “$CCCC\ldots C$”. Portanto:

$$
P(\text{todas caras})=\frac{1}{2^n}=\left(\frac12\right)^n.
$$

(2) Argumento por independência (produto)

Seja $C_i=\{\text{cara no lançamento }i\}$. Então:

$$
P(\text{todas caras})
=P(C_1\cap C_2\cap\cdots\cap C_n).
$$

Como os lançamentos são independentes:

$$
P(C_1\cap\cdots\cap C_n)=\prod_{i=1}^{n}P(C_i).
$$

E, para moeda justa, $P(C_i)=\frac12$ para todo $i$, logo:

$$
P(\text{todas caras})=\prod_{i=1}^{n}\frac12=\left(\frac12\right)^n.
$$

Por exemplo, em $n=10$:

$$
\left(\frac12\right)^{10}=\frac{1}{2^{10}}.
$$

Calcule $2^{10}$:

$$
2^{10}=2\cdot 2\cdot 2\cdot 2\cdot 2\cdot 2\cdot 2\cdot 2\cdot 2\cdot 2.
$$

Agrupe como $(2^5)(2^5)$:

$$
2^{10}=(2^5)(2^5)=32\cdot 32=1024.
$$

Então:

$$
\left(\frac12\right)^{10}=\frac{1}{1024}.
$$

Em decimal:

$$
\frac{1}{1024}=0{,}0009765625\approx 0{,}0009766.
$$


## 5) Fenômeno observado: por que a frequência “tende” a $1/2$, mas não fica exatamente $1/2$?

Considere a proporção amostral de caras:

$$
\hat p=\frac{X}{n}.
$$

### Valor esperado e variância

Para $X\sim \text{Bin}(n,\tfrac12)$:

$$
\mathbb{E}[X]=np=\frac{n}{2},
\qquad
\mathrm{Var}(X)=np(1-p)=n\cdot\frac12\cdot\frac12=\frac{n}{4}.
$$

Então:

$$
\mathbb{E}[\hat p]=\mathbb{E}\!\left[\frac{X}{n}\right]
=\frac{1}{n}\mathbb{E}[X]=\frac12,
$$

$$
\mathrm{Var}(\hat p)=\mathrm{Var}\!\left(\frac{X}{n}\right)
=\frac{1}{n^2}\mathrm{Var}(X)=\frac{1}{n^2}\cdot\frac{n}{4}
=\frac{1}{4n}.
$$

Logo o desvio-padrão de $\hat p$ é

$$
\mathrm{sd}(\hat p)=\sqrt{\frac{1}{4n}}=\frac{1}{2\sqrt{n}}.
$$

Leitura estatística: a “distância típica” de $\hat p$ até $1/2$ é da ordem de $1/\sqrt{n}$. Ou seja, conforme $n$ cresce, a proporção se concentra em torno de $0{,}5$, mas sempre com flutuações.

---

## 6) Lei dos Grandes Números (LGN): onde entra?

### LGN fraca (convergência em probabilidade)

$$
\hat p_n \xrightarrow{P} \frac12
\quad \text{quando } n\to\infty.
$$

Isto significa:

$$
\forall\,\varepsilon>0,\quad
P\!\left(\left|\hat p_n-\frac12\right|>\varepsilon\right)\to 0.
$$

### LGN forte (quase certamente)

$$
\hat p_n \xrightarrow{a.s.} \frac12.
$$

Ou seja, com probabilidade 1, a sequência de médias amostrais de fato converge para $1/2$.

Leitura prática: quanto mais você lança, mais a frequência de caras “gruda” em torno de 50%.

---

## 7) Uma demonstração curta “de lousa” (via Chebyshev)

Primeiro, calcule a variância de $\hat p_n$.

Como $X_i$ são independentes:

$$
\mathrm{Var}\!\left(\sum_{i=1}^{n}X_i\right)
=\sum_{i=1}^{n}\mathrm{Var}(X_i)
=n\cdot\frac14=\frac{n}{4}.
$$

Logo,

$$
\mathrm{Var}(\hat p_n)
=\mathrm{Var}\!\left(\frac{1}{n}\sum_{i=1}^{n}X_i\right)
=\frac{1}{n^2}\mathrm{Var}\!\left(\sum_{i=1}^{n}X_i\right)
=\frac{1}{n^2}\cdot\frac{n}{4}
=\frac{1}{4n}.
$$

Agora, pela desigualdade de Chebyshev:

$$
P\!\left(\left|\hat p_n-\mathbb{E}[\hat p_n]\right|\ge\varepsilon\right)
\le \frac{\mathrm{Var}(\hat p_n)}{\varepsilon^2}.
$$

Mas $\mathbb{E}[\hat p_n]=1/2$. Então:

$$
P\!\left(\left|\hat p_n-\frac12\right|\ge\varepsilon\right)
\le \frac{1}{4n\varepsilon^2}\xrightarrow[n\to\infty]{}0.
$$

Isso já prova a LGN fraca aqui.

---

## 8) Por que isso NÃO contradiz sequências longas?

Sequências longas (runs) são eventos “locais” (padrões consecutivos).

A LGN é sobre um evento “global”: o comportamento da média $\hat p_n$.

Você pode ter uma sequência de, digamos, 15 caras seguidas e ainda assim, ao longo de milhares de lançamentos, a proporção total de caras ficar muito perto de $0{,}5$. A LGN não diz “não haverá runs”; ela diz “o saldo médio estabiliza”.

Uma forma de ver a coexistência:

- Runs existem e até ficam maiores com $n$ (tipicamente $\sim \log_2 n$).
- Mas a flutuação de $\hat p_n$ encolhe em escala $\sim n^{-1/2}$.

---

## 9) Por que aparecem “sequências” (várias caras seguidas)?

Mesmo com independência, sequências longas não são anomalia: elas fazem parte da variabilidade natural.

Importante: independência significa

$$
P(\text{cara no próximo}\mid \text{muitas caras antes})
=P(\text{cara})=\frac12.
$$

Ou seja, após 5 caras seguidas, a chance de cara continua $1/2$.

A intuição de que “agora tem que vir coroa” é a **falácia do jogador**.

---

## 10) (Curiosidade) “Dar exatamente 50% de caras” não é tão provável quanto parece

Se $X\sim \text{Bin}(n,\tfrac12)$, então

$$
P(X=k)=\frac{\binom{n}{k}}{2^n}.
$$

Para $n$ par, a probabilidade de empatar ($X=n/2$) é

$$
P\!\left(X=\frac{n}{2}\right)=\frac{\binom{n}{n/2}}{2^n}
\approx \sqrt{\frac{2}{\pi n}}
\quad \text{(aprox. normal / Stirling)}.
$$

Ex.: $n=100$:

$$
P(X=50)\approx \sqrt{\frac{2}{\pi\cdot 100}}
\approx 0{,}0798,
$$

ou seja, ~8% apenas. “Perto de 50” é comum; “exatamente 50” nem tanto.

---

## 11) Sequências longas (“runs”) são esperadas: o maior bloco cresce como $\log_2 n$

Uma heurística clássica:

o número “esperado” de ocorrências de uma sequência de $k$ caras em $n$ lançamentos é da ordem de

$$
\approx \frac{n}{2^k}.
$$

Quando $\frac{n}{2^k}\approx 1$, você “começa a esperar” ver ao menos uma vez:

$$
2^k\approx n \;\Rightarrow\; k\approx \log_2 n.
$$

Exemplos:

- $n=1000$: $\log_2(1000)\approx 9{,}97$ $\Rightarrow$ é bem normal aparecer uma sequência máxima de ~10 caras.
- $n=1\,000\,000$: $\log_2(10^6)\approx 19{,}93$ $\Rightarrow$ sequências máximas de ~20 são esperadas.

Moral: runs longos não indicam “viciada” automaticamente.

---

## 12) Probabilidade de sair 100 caras seguidas (em 100 lançamentos)

Existe exatamente 1 sequência “$CCCC\ldots C$” entre as $2^{100}$ sequências possíveis de 100 lançamentos. Logo,

$$
P(100\ \text{caras em 100 lançamentos})
=\left(\frac12\right)^{100}
=\frac{1}{2^{100}}.
$$

Como

$$
2^{100}=1267650600228229401496703205376,
$$

temos

$$
P=\frac{1}{1267650600228229401496703205376}
\approx 7{,}8886\times 10^{-31}.
$$

**Observação importante:** se você lançar para sempre, a probabilidade de em algum momento aparecer uma sequência de 100 caras é 1 (quase certamente). O que é gigantesco é o tempo de espera típico.

---

## 13) “Tentando sem parar”: tempo esperado até aparecer uma sequência de 100 caras (sem reiniciar)

Defina $T$ = número de lançamentos até ocorrer pela primeira vez uma sequência de $k=100$ caras consecutivas.

Para moeda justa, um resultado clássico:

$$
\mathbb{E}[T]=2^{k+1}-2.
$$

Para $k=100$:

$$
\mathbb{E}[T]=2^{101}-2.
$$

Como

$$
2^{101}=2535301200456458802993406410752,
$$

segue:

$$
\mathbb{E}[T]=2535301200456458802993406410750
\approx 2{,}5353\times 10^{30}\ \text{lançamentos}.
$$

### Convertendo para tempo (depende da taxa de lançamentos)

Se você faz $r$ lançamentos por segundo, então

$$
\mathbb{E}[\text{tempo}]=\frac{2^{101}-2}{r}\ \text{segundos}.
$$

Usando $1$ ano $\approx 365{,}25\times 24\times 3600 = 31557600$ s:

- $r=1$ lançamento/s:

$$
\approx \frac{2{,}5353\times 10^{30}}{3{,}15576\times 10^7}
\approx 8{,}0339\times 10^{22}\ \text{anos}.
$$

- $r=10$ lançamentos/s: $\approx 8{,}0339\times 10^{21}$ anos  
- $r=100$ lançamentos/s: $\approx 8{,}0339\times 10^{20}$ anos

Por que $\mathbb{E}[T]$ é da ordem de $2^{101}$ (e não $2^{100}$)?

Porque “sem parar” permite janelas sobrepostas e estados parciais (você pode estar com 37 caras seguidas “em andamento”). A teoria de tempos de espera para runs leva ao fator $\approx 2$ a mais:

$$
\mathbb{E}[T]\approx 2\cdot 2^{100}.
$$

### Exemplo rápido: $k=10$

Se você lança sem parar e espera a primeira ocorrência de $k=10$ caras consecutivas:

$$
\mathbb{E}[T]=2^{11}-2=2048-2=2046\ \text{lançamentos}.
$$

Isso é uma forma elegante de ver “o preço” de exigir padrão muito específico.

---

## 14) (Mais avançada) Lei do Arco-Seno: “ficar na frente” costuma ser extremo

Considere o passeio aleatório

$$
S_n=\#\text{caras}-\#\text{coroas}.
$$

Um fato contraintuitivo: a fração do tempo em que $S_n>0$ (mais caras do que coroas) tende a ter distribuição em “U” (muito perto de 0% ou 100% é mais provável do que perto de 50%). Isso é a **lei do arco-seno** para passeios aleatórios.

É um ótimo antídoto contra intuições lineares.

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
