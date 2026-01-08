---
layout: post
title: "16 apostas de 15 números tem a mesma probabilidade de 1 aposta de 16 números na Lotofácil?"
categories: [MATEMÁTICA, GUIA]
tags: [probabilidade, combinatória, lotofácil, loterias]
lang: pt
ref: lotofacil-16v15
description: "Demonstração completa (na mão) de que 16 jogos de 15 números têm a mesma chance de 1 jogo de 16 números para acertar 15 na Lotofácil."
---

Resposta curta e direta, Sim! — **para acertar os 15 números (faixa principal)**, **16 apostas simples de 15 números** têm a **mesma probabilidade** que **1 aposta de 16 números** na Lotofácil, **desde que** você esteja efetivamente fazendo **16 jogos distintos**, mas por quê ambas tem a mesma probabilidade?

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/duvida.png" alt="Ilustração conceitual de limite (substitua por uma imagem do seu blog, se quiser)." style="max-width: 50%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura:</strong> Dúvida boa é a que vira pergunta.
  </figcaption>
</figure>

A seguir vai a demonstração **à mão**, completa.

---

## 1) Modelo do sorteio (Lotofácil)

- Existem **25** números no volante.
- O sorteio seleciona **15** números.

Logo, o espaço amostral (todos os conjuntos possíveis sorteados) é

$$
\Omega=\{D\subset\{1,\dots,25\}:|D|=15\},
\qquad |\Omega|=\binom{25}{15}
$$

---

## 2) Cálculo de $\binom{25}{15}$ “na mão”

Usando $\binom{25}{15}=\binom{25}{10}$,

$$
\binom{25}{15}=\binom{25}{10}
=\frac{25\cdot 24\cdot 23\cdot 22\cdot 21\cdot 20\cdot 19\cdot 18\cdot 17\cdot 16}{10\cdot 9\cdot 8\cdot 7\cdot 6\cdot 5\cdot 4\cdot 3\cdot 2\cdot 1}
$$

Agora vou calcular como produto de frações “arrumadas”, garantindo inteiros a cada passo:

$$
\binom{25}{10}
=\frac{25}{1}\cdot\frac{24}{2}\cdot\frac{23}{3}\cdot\frac{22}{4}\cdot\frac{21}{5}\cdot\frac{20}{6}\cdot\frac{19}{7}\cdot\frac{18}{8}\cdot\frac{17}{9}\cdot\frac{16}{10}
$$

Passo a passo:

1. $25$
2. $25\cdot\frac{24}{2}=25\cdot 12=300$
3. $300\cdot\frac{23}{3}=100\cdot 23=2300$
4. $2300\cdot\frac{22}{4}=2300\cdot\frac{11}{2}=1150\cdot 11=12650$
5. $12650\cdot\frac{21}{5}=2530\cdot 21=53130$
6. $53130\cdot\frac{20}{6}=53130\cdot\frac{10}{3}=17710\cdot 10=177100$
7. $177100\cdot\frac{19}{7}=25300\cdot 19=480700$
8. $480700\cdot\frac{18}{8}=480700\cdot\frac{9}{4}=120175\cdot 9=1{,}081{,}575$
9. $1{,}081{,}575\cdot\frac{17}{9}=120{,}175\cdot 17=2{,}042{,}975$
10. $2{,}042{,}975\cdot\frac{16}{10}=2{,}042{,}975\cdot\frac{8}{5}=408{,}595\cdot 8=3{,}268{,}760$

Portanto,

$$
\boxed{\binom{25}{15}=3{.}268{.}760}
$$

---

## 3) Probabilidade de 1 aposta simples (15 números) acertar 15

Uma aposta simples escolhe um conjunto $A$ com $A=15$. Você acerta 15 se $D=A$. Assim,

$$
\mathbb{P}(\text{15 acertos com 1 jogo})
=\frac{1}{\binom{25}{15}}
=\frac{1}{3{.}268{.}760}
\approx 3{.}059264\times 10^{-7}
$$

---

## 4) Probabilidade de 16 apostas de 15 números (16 jogos distintos) acertarem 15

Se você tem 16 jogos **distintos** $A_1,\dots,A_{16}$, então o sorteio $D$ só pode ser igual a **no máximo um** deles (não dá para $D$ ser dois conjuntos diferentes ao mesmo tempo). Logo,

$$
\mathbb{P}(\text{15 acertos em pelo menos 1 dos 16 jogos})
=\frac{16}{\binom{25}{15}}
=\frac{16}{3{.}268{.}760}
\approx 4{.}8948225\times 10^{-6}
$$

Em “odds” (aprox.):

$$
\frac{1}{\mathbb{P}}=\frac{\binom{25}{15}}{16}=\frac{3{.}268{.}760}{16}=204{.}297{.}5\ \approx\ 204{.}298.
$$

isto é, cerca de **1 em 204.298**.

> **Observação importante:** se entre os 16 jogos houver repetição (jogos iguais), a chance cai. No geral, se houver apenas $k$ jogos **distintos**, então a chance vira $\dfrac{k}{\binom{25}{15}}$.

---

## 5) Probabilidade de 1 aposta de 16 números acertar 15

Uma aposta de 16 números escolhe um conjunto $B$ com $B=16$. Para fazer **15 acertos**, é necessário que os **15 sorteados** estejam contidos em $B$, isto é:

$$
D\subset B
$$

Fixe um sorteio $D$. Quantos conjuntos $B$ de tamanho 16 contêm $D$?  
Você precisa adicionar **1** número extra dentre os $25-15=10$ números que **não** saíram:

$$
\#\{B:|B|=16,\ D\subset B\}=\binom{10}{1}=10
$$

E o total de possíveis $B$ é $\binom{25}{16}$. Logo,

$$
\mathbb{P}(\text{15 acertos com aposta de 16})
=\frac{\binom{10}{1}}{\binom{25}{16}}
=\frac{10}{\binom{25}{16}}
$$

Agora relaciono $\binom{25}{16}$ com $\binom{25}{15}$:

$$
\binom{25}{16}
=\binom{25}{15}\cdot\frac{25-15}{16}
=\binom{25}{15}\cdot\frac{10}{16}
$$

Substituindo:

$$
\frac{10}{\binom{25}{16}}
=\frac{10}{\binom{25}{15}\cdot(10/16)}
=\frac{16}{\binom{25}{15}}
$$

Portanto,

$$
\boxed{\mathbb{P}(\text{15 acertos com 16 números})=\mathbb{P}(\text{15 acertos com 16 jogos de 15})}
$$

Numericamente. como $\binom{25}{16}=2{.}042{.}975$.

$$
\mathbb{P}=\frac{10}{2{.}042{.}975}\approx 4{.}8948225\times 10^{-6}
\approx \text{1 em }204{.}298
$$

---

## Conclusão (objetiva)

**Sim.** Para a **faixa de 15 acertos**, **16 apostas de 15 números (distintas)** dão **a mesma chance** que **1 aposta de 16 números**, porque a aposta de 16 números equivale a considerar **todas as $\binom{16}{15}=16$** combinações de 15 dentro daqueles 16 números — e isso resulta exatamente em $\dfrac{16}{\binom{25}{15}}$.

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
