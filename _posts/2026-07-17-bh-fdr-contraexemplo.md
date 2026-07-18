---
layout: post
image: /assets/images/news.avif
title: "IA derruba uma conjectura de 20 anos: o método de Benjamini-Hochberg pode falhar em controlar a taxa de descoberta falsa"
categories: [ESTATÍSTICA, PROBABILIDADE]
lang: pt
tags: [News]
ref: bh-fdr-contraexemplo
author: dante-bertuzzi
description: "Um dos métodos mais usados da estatística moderna acaba de ser refutado num caso importante. Explico, passo a passo, o que é o procedimento de Benjamini-Hochberg, o que é a taxa de descoberta falsa, qual conjectura de 20 anos caiu — e o papel que a IA (GPT-5.6 Pro) teve na prova."
mathjax: true
---

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <h4 style="margin-top: 0;">A pergunta</h4>
  <p>O <strong>procedimento de Benjamini-Hochberg (BH)</strong> — o padrão mundial para controlar falsos positivos quando fazemos milhares de testes ao mesmo tempo — <strong>sempre</strong> mantém a taxa de descoberta falsa abaixo do nível prometido, mesmo quando os testes são correlacionados e bilaterais? Por vinte anos, quase todo mundo apostou que <strong>sim</strong>. Um preprint de julho de 2026, escrito com ajuda de IA, mostrou que a resposta é <strong>não</strong>.</p>
</div>

---

## 1) O problema: testar milhares de hipóteses de uma vez

Imagine um estudo de genômica que mede a associação de **20.000 genes** com uma doença. Para cada gene, você faz um teste de hipótese:

$$
H_i:\ \text{o gene } i \text{ não tem efeito} \qquad (\mu_i = 0).
$$

Cada teste devolve um **p-valor** $P_i$. Se você usar o critério clássico "rejeito quando $P_i \le 0{,}05$", tem um problema grave: mesmo que **nenhum** gene tenha efeito, cerca de $5\%$ dos 20.000 testes darão p-valor abaixo de $0{,}05$ **por puro acaso**. Isso são **mil falsos positivos**.

Testar muitas hipóteses simultaneamente exige, portanto, uma forma de controlar a quantidade de erros. É aí que entra a **taxa de descoberta falsa**.

---

## 2) O que é a taxa de descoberta falsa (FDR)

Suponha que, ao final, você **rejeitou** $R$ hipóteses (fez $R$ "descobertas"). Dessas, $V$ eram na verdade **verdadeiras** (falsos positivos). Definimos a **proporção de descobertas falsas** (FDP):

$$
\text{FDP} = \frac{V}{\max(R,\,1)}.
$$

Ou seja: **que fração das minhas descobertas era lixo?** O $\max(R,1)$ no denominador serve só para evitar divisão por zero quando não há nenhuma rejeição.

Como $V$ e $R$ são aleatórios, olhamos para a **média** dessa proporção. Essa média é a **taxa de descoberta falsa**:

$$
\boxed{\ \text{FDR} = \mathbb{E}\!\left[\frac{V}{\max(R,1)}\right].\ }
$$

> **Interpretação:** a FDR é a fração *esperada* de falsos positivos entre tudo o que você anunciou como descoberta. Um bom método garante, por exemplo, $\text{FDR} \le 0{,}05$ — no máximo $5\%$ das descobertas são falsas, em média.

Introduzida por **Benjamini e Hochberg em 1995**, a FDR revolucionou a estatística aplicada. Emmanuel Candès (Stanford) já chamou a dupla FDR/BH de **"um dos dois desenvolvimentos mais importantes da estatística depois de 1950"** (o outro sendo a redução de James-Stein). O artigo original passou de **130 mil citações**.

---

## 3) Como funciona o procedimento de Benjamini-Hochberg

O procedimento é uma receita simples. Você escolhe um nível $\alpha$ (digamos $\alpha = 0{,}05$) e faz:

1. **Ordene** os $m$ p-valores do menor para o maior:
   $$
   P_{(1)} \le P_{(2)} \le \cdots \le P_{(m)}.
   $$
2. Para cada posição $r$, compare $P_{(r)}$ com o **valor crítico**
   $$
   t_r = \frac{\alpha\, r}{m}.
   $$
3. Encontre o **maior** $r$ tal que $P_{(r)} \le t_r$. Chame-o de $R$.
4. **Rejeite** as $R$ hipóteses com os menores p-valores.

Geometricamente: você desenha os p-valores ordenados como uma escadinha crescente e traça a reta $t = \dfrac{\alpha\,r}{m}$. O procedimento procura o **cruzamento mais à direita** entre a escadinha e a reta. Tudo à esquerda desse cruzamento é rejeitado.

<div style="border-left: 4px solid #2196F3; padding: 0.5em 1em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>A pergunta central de duas décadas:</strong> essa receita garante que
  $$
  \text{FDR} \le \alpha
  $$
  <em>sempre</em> — para qualquer número de testes, qualquer estrutura de correlação e qualquer $\alpha$?
</div>

---

## 4) Onde já se sabia que o BH funciona

Benjamini e Hochberg provaram, em 1995, um resultado forte **quando os testes são independentes**:

$$
\text{FDR} \le \pi_0\,\alpha \le \alpha, \qquad \pi_0 = \frac{\#\{\text{hipóteses nulas verdadeiras}\}}{m}.
$$

Ou seja, sob independência o BH não só respeita o nível $\alpha$ como fica com uma folga (o fator $\pi_0 \le 1$).

Depois, **Benjamini e Yekutieli (2001)** estenderam a garantia para uma forma de **dependência positiva** chamada PRDS (positive regression dependence on subsets). E mostraram que, sob **dependência totalmente arbitrária**, o controle ainda vale se você for mais conservador, trocando $\alpha$ por $\alpha / H_m$, onde $H_m = 1 + \frac12 + \cdots + \frac1m$ é o número harmônico.

Tudo muito bem — mas essas garantias deixaram **um buraco** bem no meio do caminho.

---

## 5) O buraco: testes bilaterais correlacionados

Na prática, dois ingredientes aparecem juntos o tempo todo:

- **Correlação.** Genes vizinhos, variantes genéticas em desequilíbrio de ligação, pixels de uma imagem astronômica — os testes quase nunca são independentes.
- **Testes bilaterais.** Muitas vezes não sabemos a *direção* do efeito de antemão, então testamos $\mu_i = 0$ contra $\mu_i \ne 0$, sensíveis a efeitos positivos **e** negativos.

O p-valor bilateral de um dado gaussiano $X_i$ é

$$
P_i = 2\,\overline{\Phi}\big(|X_i|\big), \qquad \overline{\Phi} = 1 - \Phi,
$$

onde $\Phi$ é a função de distribuição da normal padrão. O detalhe crucial está no **módulo** $|X_i|$:

$$
\{P_i \le t\} \;=\; \{X_i \ge c\}\ \cup\ \{X_i \le -c\}.
$$

O teste bilateral **dobra as duas caudas**. E aqui está a raiz do problema: quando os dados são correlacionados, essas duas caudas empurram as outras coordenadas em **direções opostas**. Os argumentos elegantes de monotonicidade que fazem o PRDS funcionar no caso *unilateral* **simplesmente não se transferem** para o vetor "dobrado".

Por isso a pergunta ficou em aberto. E não por falta de tentativa: **Reiner-Benaim (2007)**, **Kim e van de Wiel (2008)**, **Benjamini (2010)**, **Sarkar (2023)**, **Sarkar e Zhang (2025)** e outros acumularam evidência teórica e simulações que apontavam todas para o mesmo lado — o BH *parecia* controlar a FDR em qualquer estrutura de correlação gaussiana. Benjamini (2010) chegou a descrever a evidência como *"simuteórica"*. Sarkar (2023) escreveu que provar a conjectura era "uma tarefa urgente e importante".

Ninguém provou. E, como se descobriu agora, ninguém *poderia* — porque ela é **falsa**.

---

## 6) O contraexemplo: um modelo de fatores com três blocos

O preprint de **Edgar Dobriban** (Wharton, UPenn) constrói um exemplo explícito onde o BH falha. A ideia é criar um **fator latente comum** $Z$ (uma normal padrão escondida) que correlaciona todos os testes, e distribuir as hipóteses em **três blocos** com pesos exatos.

Sejam $Z$, $(\varepsilon_i)$, $(\eta_j)$, $(\xi_k)$ normais padrão independentes. Para um inteiro $N$:

$$
\begin{aligned}
\text{Bloco 0 (nulos, } 96N \text{ testes):}\quad
X^{(0)}_i &= \tfrac{3}{10}Z + \tfrac{\sqrt{91}}{10}\,\varepsilon_i, \\[6pt]
\text{Bloco 1 (sinais, } N \text{ testes):}\quad
X^{(1)}_j &= \tfrac{12}{5} - \tfrac{3}{10}Z + \tfrac{\sqrt{91}}{10}\,\eta_j, \\[6pt]
\text{Bloco 2 (sinais, } 3N \text{ testes):}\quad
X^{(2)}_k &= \tfrac{22}{5} - \tfrac{18}{25}Z + \tfrac{\sqrt{301}}{25}\,\xi_k.
\end{aligned}
$$

As proporções dos blocos são exatamente $0{,}96$, $0{,}01$ e $0{,}03$. Repare no truque:

- O **bloco nulo** se move **junto** com o fator $Z$ (carga $+\tfrac{3}{10}$).
- Os **blocos de sinal** se movem **contra** $Z$ (cargas negativas), em duas intensidades diferentes.

As cargas foram escolhidas a dedo para que cada variável tenha variância exatamente $1$ (é uma matriz de **correlação**), e para que cada nulo verdadeiro seja marginalmente $N(0,1)$ — ou seja, seus p-valores são individualmente válidos e uniformes. Nada de trapaça no nível de cada teste isolado; o estrago está na **estrutura conjunta**.

O que acontece é o seguinte: para uma faixa de valores do fator latente $Z$ (com probabilidade positiva), os blocos de sinal **aumentam o número de rejeições** do BH no exato momento em que a distribuição condicional dos nulos tem **caudas mais pesadas**. Essas duas coisas conspiram para empurrar a proporção de falsas descobertas um pouquinho acima de $\alpha$.

---

## 7) O resultado

<div style="border-left: 4px solid #f44336; padding: 1em; background-color: #ffebee; margin: 1em 0; border-radius: 4px;">
  <strong>Teorema (Dobriban, 2026).</strong> No modelo acima, no nível nominal $\alpha = 0{,}01$, para todo $N$ suficientemente grande, o procedimento de Benjamini-Hochberg satisfaz
  $$
  \text{FDR} \;>\; 0{,}0104 \;>\; \alpha.
  $$
  <em>Logo, a conjectura é falsa.</em>
</div>

Não é uma violação enorme — o FDR estoura o alvo em cerca de $4\%$ (relativo). Mas a violação é **real e rigorosamente demonstrada**. E isso é o que importa: para derrubar um "sempre vale", basta **um** contraexemplo.

O que torna a prova incomum é o *como*. Ela combina duas coisas que raramente andam juntas na área:

1. **Análise assintótica clássica** — a representação do BH como o cruzamento entre a CDF empírica dos p-valores e a reta $t/\alpha$ (à la Genovese-Wasserman). Condicionando no fator $Z$, cada bloco vira um processo empírico independente.
2. **Um certificado numérico rigoroso** — em vez de confiar em ponto flutuante, a desigualdade final é verificada com **aritmética de intervalos** (biblioteca Arb, aritmética de bolas com arredondamento para fora). Todos os parâmetros do modelo são racionais exatos; cada cauda gaussiana é uma "bola" que **contém provadamente** o valor real. Uma desigualdade só é aceita quando a bola inteira cai do lado certo do zero.

Ou seja: não é "o computador calculou e deu maior". É uma **prova**, com garantias matemáticas em cada passo numérico. Para reforçar, simulações de Monte Carlo (com $m = 20.000$ testes) também mostram a FDR ficando significativamente acima do nível nominal — cerca de $3{,}5$ desvios-padrão acima de $\alpha$.

---

## 8) O papel da inteligência artificial

Aqui está o detalhe que chamou atenção de todos: **a prova foi obtida por um modelo de IA**, o GPT-5.6 Pro. Segundo o autor:

- O modelo recebeu **apenas a definição matemática** do procedimento BH e foi pedido diretamente para **provar ou refutar** a conjectura.
- Após cerca de **90 minutos de raciocínio**, produziu a prova, o exemplo específico e o código do certificado numérico — **numa única tentativa**.
- O autor então **conferiu manualmente** todo o argumento e o certificado, e escreveu a versão final editando o rascunho.

Vale o contraste que o próprio autor relata: com a geração anterior do modelo, ele **não** conseguiu resolver o problema mesmo iterando com múltiplos agentes em paralelo por cerca de **20 horas**. O salto de capacidade entre versões foi concreto.

Isso coloca o trabalho numa linha crescente de problemas em aberto que cientistas resolveram **com assistência de IA** — não como substituta do matemático, mas como uma ferramenta que propõe construções e o especialista verifica.

---

## 9) O que muda na prática?

Se você usa BH no dia a dia (e, se trabalha com dados de alto rendimento, provavelmente usa), **não precisa entrar em pânico**. Alguns pontos de calibração:

- **A importância é principalmente conceitual.** Fecha-se, com um "não", a pergunta mais central que ainda restava em aberto sobre FDR/BH. Isso é grande para a teoria.
- **A violação é pequena.** No exemplo, $0{,}0104$ contra $0{,}01$. Buscas numéricas em modelos parecidos também encontraram violações pequenas. Ainda não se sabe se existe um **limite universal** para o quanto a FDR pode estourar.
- **O exemplo usa muitos testes.** A construção precisa de $m$ grande. Continua em aberto se o BH é garantido para números **menores** de testes — e, se não for, quão grande é o problema em função de $m$.
- **As garantias conservadoras seguem intactas.** Se você precisa de controle rigoroso sob dependência arbitrária, a versão Benjamini-Yekutieli (com o fator $H_m$) e outros métodos "ajustados para dependência" continuam válidos.

Em resumo: o BH continua sendo uma ferramenta excelente e amplamente justificada. O que caiu foi a crença de que ele é **infalível** no caso gaussiano bilateral correlacionado.

---

## 10) Comentário final

Há duas histórias entrelaçadas aqui. A primeira é estatística: uma conjectura que resistiu vinte anos, sustentada por montanhas de simulações e intuição, revelou-se falsa por um mecanismo sutil — as duas caudas de um teste bilateral, sob correlação, quebram a monotonicidade que fazia tudo funcionar. A segunda é sobre método científico: um modelo de linguagem, dada apenas a definição do problema, produziu uma construção original e um certificado verificável que um especialista humano então validou.

Nenhuma das duas substitui a outra. A prova só entrou na literatura porque **foi conferida linha a linha**. Mas o fato de a construção ter surgido de uma conversa de 90 minutos diz algo sobre o momento que estamos vivendo.

<div style="border-left: 4px solid #2196F3; padding: 1em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>Fontes:</strong> Edgar Dobriban, <em>"The Benjamini-Hochberg Procedure Can Fail to Control the FDR for Correlated Two-Sided Gaussian Tests"</em> (preprint, julho de 2026). Base histórica: Benjamini &amp; Hochberg (1995), Benjamini &amp; Yekutieli (2001), Benjamini (2010), Sarkar (2023).
</div>

---

## Referência rápida (para revisar em 30 segundos)

<div style="border-left: 4px solid #2196F3; padding: 0.5em; background-color: #e3f2fd; margin: 1em 0;">
  <strong>Checklist</strong>
  <ul>
    <li><strong>FDR</strong> = fração esperada de falsos positivos entre as descobertas: $\text{FDR} = \mathbb{E}\!\left[\frac{V}{\max(R,1)}\right]$.</li>
    <li><strong>Procedimento BH:</strong> ordene os p-valores e rejeite até o maior $r$ com $P_{(r)} \le \frac{\alpha r}{m}$.</li>
    <li><strong>Sabia-se controlar:</strong> sob independência ($\text{FDR} \le \pi_0\alpha$) e sob dependência positiva PRDS.</li>
    <li><strong>Buraco aberto por 20 anos:</strong> testes gaussianos <strong>bilaterais correlacionados</strong>.</li>
    <li><strong>Novidade (2026):</strong> Dobriban construiu um modelo de fatores onde, com $\alpha = 0{,}01$, prova-se $\text{FDR} > 0{,}0104 > \alpha$. A conjectura é <strong>falsa</strong>.</li>
    <li><strong>Como:</strong> análise assintótica + certificado de aritmética de intervalos (Arb). Prova obtida com <strong>GPT-5.6 Pro</strong> e verificada pelo autor.</li>
    <li><strong>Impacto:</strong> conceitual e grande; violação numérica pequena; implicações práticas ainda em estudo.</li>
  </ul>
</div>

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
