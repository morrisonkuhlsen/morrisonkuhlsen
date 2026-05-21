---
layout: post
image: /assets/images/julia1.avif
title: "O que é Julia e primeiros comandos"
categories: [JULIA, PROGRAMAÇÃO CIENTÍFICA]
tags: [Análise de dados]
lang: pt
ref: julia-parte-1
author: dante-bertuzzi
mathjax: true
description: "Aprenda o que é a linguagem Julia, por que ela é usada em estatística e programação científica, e escreva seus primeiros comandos passo a passo."
slug: julia-parte-1-o-que-e-julia-primeiros-comandos
---

## 1. Antes dos primeiros comandos: o que torna Julia diferente?

---

Antes de escrever nosso primeiro comando, é importante entender uma coisa:

> Julia não é apenas “mais uma linguagem de programação”.  
> Ela foi pensada especialmente para matemática, estatística, ciência de dados, simulações e computação científica.

Isso significa que muitas escolhas da linguagem foram feitas para facilitar a vida de quem trabalha com números, fórmulas, tabelas, vetores, matrizes, gráficos e modelos matemáticos.

Em outras linguagens, às vezes precisamos escolher entre:

- código fácil de escrever;
- código rápido de executar.

Julia tenta juntar os dois mundos:

> uma sintaxe clara e próxima da matemática, mas com desempenho alto.

<div class="mk-box mk-box-info">
  <strong>Ideia central:</strong><br>
  Julia foi criada para permitir que você escreva código científico de forma simples, expressiva e rápida.
</div>

<style>
/* ==========================================================
   ESTILO DO POST — APRENDENDO JULIA DO ZERO
   Tudo foi escopado em .mk-julia-post para não afetar o TOC.
   ========================================================== */

.mk-julia-post {
  --mk-bg-code: #1d1d2f;
  --mk-bg-code-2: #181829;
  --mk-text-code: #edf1ff;
  --mk-comment: #70748f;
  --mk-pink: #ff6f91;
  --mk-orange: #ff9f6e;
  --mk-green: #a6f3a1;
  --mk-purple: #c792ea;
  --mk-blue: #8be9fd;
  --mk-muted: #a7abc8;
  --mk-border: rgba(255,255,255,.08);
  --mk-card-bg: #f8fafc;
  --mk-card-border: #e5e7eb;
  --mk-note-bg: #fff7ed;
  --mk-note-border: #fb923c;
  --mk-tip-bg: #ecfdf5;
  --mk-tip-border: #10b981;
  --mk-alert-bg: #fff1f2;
  --mk-alert-border: #f43f5e;
  --mk-info-bg: #eff6ff;
  --mk-info-border: #3b82f6;
}

/* Caixas de destaque */
.mk-julia-post .mk-box {
  border-radius: 14px;
  padding: 1.05rem 1.15rem;
  margin: 1.25rem 0;
  border-left: 5px solid;
  box-shadow: 0 6px 18px rgba(15, 23, 42, .06);
}

.mk-julia-post .mk-box p:last-child {
  margin-bottom: 0;
}

.mk-julia-post .mk-box-note {
  background: var(--mk-note-bg);
  border-left-color: var(--mk-note-border);
}

.mk-julia-post .mk-box-tip {
  background: var(--mk-tip-bg);
  border-left-color: var(--mk-tip-border);
}

.mk-julia-post .mk-box-alert {
  background: var(--mk-alert-bg);
  border-left-color: var(--mk-alert-border);
}

.mk-julia-post .mk-box-info {
  background: var(--mk-info-bg);
  border-left-color: var(--mk-info-border);
}

/* Tabelas HTML */
.mk-julia-post .mk-table-wrap {
  overflow-x: auto;
  margin: 1.4rem 0;
  border-radius: 14px;
  border: 1px solid var(--mk-card-border);
  box-shadow: 0 8px 22px rgba(15, 23, 42, .06);
}

.mk-julia-post .mk-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: .96rem;
}

.mk-julia-post .mk-table th {
  background: #172033;
  color: #f8fafc;
  text-align: left;
  padding: .85rem;
  border: 1px solid #26334d;
}

.mk-julia-post .mk-table td {
  padding: .85rem;
  border: 1px solid #e5e7eb;
  vertical-align: top;
}

.mk-julia-post .mk-table tr:nth-child(even) td {
  background: #f8fafc;
}

/* Cartão de metadados SEO */
.mk-julia-post .mk-seo-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  margin: 1.5rem 0;
}

/* Compartilhamento */
.mk-julia-post .share-buttons {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #444;
  text-align: center;
}

.mk-julia-post .share-buttons-title {
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 1.1em;
}

.mk-julia-post .share-btn {
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
  transition: color .2s, transform .2s;
}

.mk-julia-post .share-btn:hover {
  color: #000 !important;
  transform: scale(1.1);
}

/* Modo escuro */
.dark-mode .mk-julia-post .mk-table,
.dark-mode .mk-julia-post .mk-table td {
  background: #161616;
  color: #f3f4f6;
  border-color: #333;
}

.dark-mode .mk-julia-post .mk-table tr:nth-child(even) td {
  background: #1f1f1f;
}

.dark-mode .mk-julia-post .mk-box-note {
  background: #2a2115;
}

.dark-mode .mk-julia-post .mk-box-tip {
  background: #10251c;
}

.dark-mode .mk-julia-post .mk-box-alert {
  background: #2a1518;
}

.dark-mode .mk-julia-post .mk-box-info {
  background: #101f33;
}

.dark-mode .mk-julia-post .mk-seo-card {
  background: #1f1f1f;
  border-color: #333;
}
</style>

<div class="mk-julia-post" markdown="1">

---

## 2. Principais características da linguagem Julia

---

A tabela abaixo resume algumas das características mais importantes da linguagem.

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Característica</th>
      <th>Explicação</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Múltiplo despacho</strong></td>
      <td>Julia escolhe qual método executar com base nos tipos dos argumentos.</td>
    </tr>
    <tr>
      <td><strong>Tipagem dinâmica</strong></td>
      <td>Você não precisa declarar o tipo de uma variável o tempo todo; Julia infere tipos como <code>Int64</code>, <code>Float64</code>, <code>String</code> e <code>Bool</code>.</td>
    </tr>
    <tr>
      <td><strong>Tipagem forte</strong></td>
      <td>Julia não mistura tipos incompatíveis de forma descuidada.</td>
    </tr>
    <tr>
      <td><strong>Alta performance</strong></td>
      <td>O desempenho pode chegar próximo de linguagens como C e Fortran.</td>
    </tr>
    <tr>
      <td><strong>JIT</strong></td>
      <td>Julia compila o código durante a execução, usando Just-In-Time compilation.</td>
    </tr>
    <tr>
      <td><strong>Broadcasting</strong></td>
      <td>Usa o ponto para aplicar operações elemento a elemento.</td>
    </tr>
    <tr>
      <td><strong>Sintaxe matemática</strong></td>
      <td>Permite escrever código parecido com expressões matemáticas.</td>
    </tr>
    <tr>
      <td><strong>Pacotes</strong></td>
      <td>Possui um gerenciador de pacotes integrado.</td>
    </tr>
    <tr>
      <td><strong>Metaprogramação</strong></td>
      <td>Permite usar macros e gerar código automaticamente.</td>
    </tr>
    <tr>
      <td><strong>Código genérico</strong></td>
      <td>Uma mesma função pode funcionar para vários tipos de dados.</td>
    </tr>
    <tr>
      <td><strong>Interoperabilidade</strong></td>
      <td>Julia consegue conversar com Python, R, C, Fortran e outras linguagens.</td>
    </tr>
    <tr>
      <td><strong>Indexação em 1</strong></td>
      <td>O primeiro elemento de um vetor é acessado com <code>[1]</code>.</td>
    </tr>
  </tbody>
</table>
</div>

Agora vamos entender cada ponto com calma.

---

## 3. Múltiplo despacho: uma das ideias mais importantes de Julia

---

O **múltiplo despacho** é uma das características mais famosas de Julia.

Em linguagem simples, significa que Julia pode escolher uma função diferente dependendo dos tipos dos valores que você passa para ela.

Veja um exemplo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">struct</span> <span class="code-variable">Cachorro</span> <span class="code-keyword">end</span>
<span class="code-keyword">struct</span> <span class="code-variable">Gato</span> <span class="code-keyword">end</span>

<span class="code-function">encontro</span><span class="code-paren">(</span><span class="code-variable">a</span><span class="code-operator">::</span><span class="code-variable">Cachorro</span>, <span class="code-variable">b</span><span class="code-operator">::</span><span class="code-variable">Cachorro</span><span class="code-paren">)</span> <span class="code-operator">=</span> <span class="code-string">"Os cachorros brincam juntos"</span>
<span class="code-function">encontro</span><span class="code-paren">(</span><span class="code-variable">a</span><span class="code-operator">::</span><span class="code-variable">Cachorro</span>, <span class="code-variable">b</span><span class="code-operator">::</span><span class="code-variable">Gato</span><span class="code-paren">)</span> <span class="code-operator">=</span> <span class="code-string">"O cachorro corre atrás do gato"</span>
<span class="code-function">encontro</span><span class="code-paren">(</span><span class="code-variable">a</span><span class="code-operator">::</span><span class="code-variable">Gato</span>, <span class="code-variable">b</span><span class="code-operator">::</span><span class="code-variable">Cachorro</span><span class="code-paren">)</span> <span class="code-operator">=</span> <span class="code-string">"O gato se assusta com o cachorro"</span>
<span class="code-function">encontro</span><span class="code-paren">(</span><span class="code-variable">a</span><span class="code-operator">::</span><span class="code-variable">Gato</span>, <span class="code-variable">b</span><span class="code-operator">::</span><span class="code-variable">Gato</span><span class="code-paren">)</span> <span class="code-operator">=</span> <span class="code-string">"Os gatos se ignoram"</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">encontro</span><span class="code-paren">(</span><span class="code-function">Cachorro</span><span class="code-paren">(</span><span class="code-paren">)</span>, <span class="code-function">Gato</span><span class="code-paren">(</span><span class="code-paren">)</span><span class="code-paren">)</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>O cachorro corre atrás do gato</code></pre>
  </div>
</div>

Nesse exemplo, a função tem sempre o mesmo nome:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">encontro</span></code></pre>
  </div>
</div>

Mas Julia escolhe qual versão executar olhando os tipos dos argumentos:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">Cachorro</span><span class="code-paren">(</span><span class="code-paren">)</span>
<span class="code-function">Gato</span><span class="code-paren">(</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Ou seja, esta chamada:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">encontro</span><span class="code-paren">(</span><span class="code-function">Cachorro</span><span class="code-paren">(</span><span class="code-paren">)</span>, <span class="code-function">Gato</span><span class="code-paren">(</span><span class="code-paren">)</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

usa esta definição:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">encontro</span><span class="code-paren">(</span><span class="code-variable">a</span><span class="code-operator">::</span><span class="code-variable">Cachorro</span>, <span class="code-variable">b</span><span class="code-operator">::</span><span class="code-variable">Gato</span><span class="code-paren">)</span> <span class="code-operator">=</span> <span class="code-string">"O cachorro corre atrás do gato"</span></code></pre>
  </div>
</div>

<div class="mk-box mk-box-tip">
  <strong>Resumo:</strong><br>
  No múltiplo despacho, o nome da função pode ser o mesmo, mas o comportamento muda conforme os tipos dos argumentos.
</div>

---

## 4. Tipagem dinâmica: você não precisa declarar tudo

---

Julia possui **tipagem dinâmica**.

Isso significa que você pode criar variáveis sem dizer explicitamente qual é o tipo delas.

Por exemplo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">idade</span> <span class="code-operator">=</span> <span class="code-number">18</span>
<span class="code-variable">nome</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span>
<span class="code-variable">altura</span> <span class="code-operator">=</span> <span class="code-number">1.68</span>
<span class="code-variable">aprovado</span> <span class="code-operator">=</span> <span class="code-keyword">true</span></code></pre>
  </div>
</div>

Julia entende automaticamente que:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Variável</th>
      <th>Valor</th>
      <th>Tipo interpretado por Julia</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>idade</code></td>
      <td><code>18</code></td>
      <td><code>Int64</code> — número inteiro de 64 bits</td>
    </tr>
    <tr>
      <td><code>nome</code></td>
      <td><code>"Ana"</code></td>
      <td><code>String</code> — texto</td>
    </tr>
    <tr>
      <td><code>altura</code></td>
      <td><code>1.68</code></td>
      <td><code>Float64</code> — número decimal de ponto flutuante</td>
    </tr>
    <tr>
      <td><code>aprovado</code></td>
      <td><code>true</code></td>
      <td><code>Bool</code> — valor lógico verdadeiro ou falso</td>
    </tr>
  </tbody>
</table>
</div>

Em Julia, você pode verificar o tipo de qualquer valor com a função `typeof`:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">typeof</span><span class="code-paren">(</span><span class="code-variable">idade</span><span class="code-paren">)</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">typeof</span><span class="code-paren">(</span><span class="code-variable">nome</span><span class="code-paren">)</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">typeof</span><span class="code-paren">(</span><span class="code-variable">altura</span><span class="code-paren">)</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">typeof</span><span class="code-paren">(</span><span class="code-variable">aprovado</span><span class="code-paren">)</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>Int64
String
Float64
Bool</code></pre>
  </div>
</div>

Na maioria dos computadores atuais de 64 bits, um número inteiro como `18` aparece como `Int64`, e um número decimal como `1.68` aparece como `Float64`.

Você não precisou escrever algo como:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">idade</span><span class="code-operator">::</span><span class="code-function">Int64</span> <span class="code-operator">=</span> <span class="code-number">18</span></code></pre>
  </div>
</div>

Embora Julia permita anotações de tipo, elas não são obrigatórias no começo. Neste exemplo, `Int64` deixa explícito que `idade` deve ser um inteiro de 64 bits.

---

## 5. Tipagem forte: Julia não mistura tudo automaticamente

---

Julia também possui **tipagem forte**.

Isso significa que ela não mistura tipos incompatíveis sem você deixar claro o que quer fazer.

Veja este exemplo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">numero</span> <span class="code-operator">=</span> <span class="code-number">10</span>
<span class="code-variable">texto</span> <span class="code-operator">=</span> <span class="code-string">"5"</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-variable">numero</span> <span class="code-operator">+</span> <span class="code-variable">texto</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Esse código gera erro, porque Julia não soma automaticamente um número com um texto.

Para fazer a soma, você precisa converter o texto `"5"` para número:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">numero</span> <span class="code-operator">=</span> <span class="code-number">10</span>
<span class="code-variable">texto</span> <span class="code-operator">=</span> <span class="code-string">"5"</span>

<span class="code-variable">valor_convertido</span> <span class="code-operator">=</span> <span class="code-function">parse</span><span class="code-paren">(</span><span class="code-function">Int64</span>, <span class="code-variable">texto</span><span class="code-paren">)</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-variable">numero</span> <span class="code-operator">+</span> <span class="code-variable">valor_convertido</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>15</code></pre>
  </div>
</div>

A função `parse(Int64, texto)` transforma o texto `"5"`, que é do tipo `String`, em número inteiro do tipo `Int64`.

<div class="mk-box mk-box-note">
  <strong>Interpretação:</strong><br>
  Julia é flexível para criar variáveis, mas não é descuidada com operações entre tipos diferentes.
</div>

---

## 6. Alta performance e JIT

---

Julia é conhecida por ter **alta performance**.

Isso acontece porque Julia usa uma estratégia chamada **JIT**, abreviação de:

> Just-In-Time compilation

Em português:

> compilação no momento da execução.

Na prática, quando você executa uma função pela primeira vez, Julia compila aquela função para os tipos de dados usados.

Por isso, às vezes a primeira execução pode parecer um pouco mais lenta, mas as próximas execuções tendem a ser mais rápidas.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">function</span> <span class="code-function">soma_quadrados</span><span class="code-paren">(</span><span class="code-variable">n</span><span class="code-paren">)</span>
    <span class="code-variable">total</span> <span class="code-operator">=</span> <span class="code-number">0</span>

    <span class="code-keyword">for</span> <span class="code-variable">i</span> <span class="code-keyword">in</span> <span class="code-number">1</span><span class="code-operator">:</span><span class="code-variable">n</span>
        <span class="code-variable">total</span> <span class="code-operator">=</span> <span class="code-variable">total</span> <span class="code-operator">+</span> <span class="code-variable">i</span><span class="code-operator">^</span><span class="code-number">2</span>
    <span class="code-keyword">end</span>

    <span class="code-keyword">return</span> <span class="code-variable">total</span>
<span class="code-keyword">end</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">soma_quadrados</span><span class="code-paren">(</span><span class="code-number">1000</span><span class="code-paren">)</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Nesse exemplo, a função soma os quadrados dos números de `1` até `1000`.

Matematicamente, ela calcula:

$$
1^2 + 2^2 + 3^2 + \cdots + 1000^2
$$

---

## 7. Broadcasting: o ponto em Julia

---

Uma das coisas mais importantes para quem vai trabalhar com dados em Julia é o **broadcasting**.

Broadcasting significa aplicar uma operação elemento por elemento.

Veja:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">notas</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-number">7.5</span>, <span class="code-number">8.0</span>, <span class="code-number">6.5</span>, <span class="code-number">9.0</span><span class="code-paren">]</span>

<span class="code-variable">notas_ajustadas</span> <span class="code-operator">=</span> <span class="code-variable">notas</span> <span class="code-operator">.+</span> <span class="code-number">0.5</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-variable">notas_ajustadas</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>[8.0, 8.5, 7.0, 9.5]</code></pre>
  </div>
</div>

O ponto em:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-operator">.+</span> </code></pre>
  </div>
</div>

significa:

> some `0.5` em cada elemento do vetor.

Sem o ponto, Julia tentaria somar um vetor inteiro com um número de uma forma que não representa a operação elemento a elemento.

Outro exemplo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">notas</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-number">7.5</span>, <span class="code-number">8.0</span>, <span class="code-number">6.5</span>, <span class="code-number">9.0</span><span class="code-paren">]</span>

<span class="code-variable">proporcoes</span> <span class="code-operator">=</span> <span class="code-variable">notas</span> <span class="code-operator">./</span> <span class="code-number">10</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-variable">proporcoes</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>[0.75, 0.8, 0.65, 0.9]</code></pre>
  </div>
</div>

Aqui:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-operator">./</span></code></pre>
  </div>
</div>

significa:

> divida cada nota por 10.

<div class="mk-box mk-box-tip">
  <strong>Regra prática:</strong><br>
  Em Julia, quando você quiser aplicar uma operação a cada elemento de um vetor, provavelmente vai usar o ponto: <code>.+</code>, <code>.-</code>, <code>.*</code>, <code>./</code> ou uma função com ponto, como <code>sqrt.(x)</code>.
</div>

---

## 8. Sintaxe matemática

---

Julia permite escrever códigos muito próximos da notação matemática.

Por exemplo, em matemática escrevemos:

$$
f(x) = x^2 + 2x + 1
$$

Em Julia, podemos escrever:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">f</span><span class="code-paren">(</span><span class="code-variable">x</span><span class="code-paren">)</span> <span class="code-operator">=</span> <span class="code-variable">x</span><span class="code-operator">^</span><span class="code-number">2</span> <span class="code-operator">+</span> <span class="code-number">2</span><span class="code-variable">x</span> <span class="code-operator">+</span> <span class="code-number">1</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">f</span><span class="code-paren">(</span><span class="code-number">3</span><span class="code-paren">)</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>16</code></pre>
  </div>
</div>

Explicando:

$$
f(3) = 3^2 + 2 \cdot 3 + 1
$$

$$
f(3) = 9 + 6 + 1 = 16
$$

O símbolo `^` representa potência.

Então:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">x</span><span class="code-operator">^</span><span class="code-number">2</span></code></pre>
  </div>
</div>

significa:

$$
x^2
$$

---

## 9. Pacotes em Julia

---

Julia possui um gerenciador de pacotes integrado.

Pacotes são extensões que adicionam novas funcionalidades à linguagem.

Por exemplo:

- `DataFrames.jl` para trabalhar com tabelas;
- `CSV.jl` para ler arquivos CSV;
- `Plots.jl` para fazer gráficos;
- `Statistics` para funções estatísticas;
- `Distributions.jl` para distribuições de probabilidade.

Para instalar um pacote, podemos usar:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">import</span> <span class="code-module">Pkg</span>

<span class="code-module">Pkg</span><span class="code-operator">.</span><span class="code-function">add</span><span class="code-paren">(</span><span class="code-string">"DataFrames"</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Depois de instalado, usamos:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">DataFrames</span></code></pre>
  </div>
</div>

E então podemos criar uma tabela:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">DataFrames</span>

<span class="code-variable">df</span> <span class="code-operator">=</span> <span class="code-function">DataFrame</span><span class="code-paren">(</span>
    <span class="code-variable">disciplina</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"Julia"</span>, <span class="code-string">"Estatística"</span>, <span class="code-string">"Cálculo"</span><span class="code-paren">]</span>,
    <span class="code-variable">minutos</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-number">45</span>, <span class="code-number">60</span>, <span class="code-number">30</span><span class="code-paren">]</span>
<span class="code-paren">)</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-variable">df</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Aqui, `DataFrame` representa uma tabela com linhas e colunas.

---

## 10. Metaprogramação e macros

---

Julia também permite **metaprogramação**.

Isso significa que o código pode manipular ou gerar outro código.

Um exemplo simples de macro é `@time`.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">@time</span> <span class="code-function">sum</span><span class="code-paren">(</span><span class="code-number">1</span><span class="code-operator">:</span><span class="code-number">1_000_000</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

A macro `@time` mede o tempo gasto para executar uma expressão.

Neste caso, estamos somando os números de `1` até `1_000_000`.

O sublinhado em:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-number">1_000_000</span></code></pre>
  </div>
</div>

serve apenas para melhorar a leitura.

É o mesmo que escrever:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-number">1000000</span></code></pre>
  </div>
</div>

---

## 11. Código genérico

---

Em Julia, uma função pode funcionar para vários tipos de dados.

Veja:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">dobro</span><span class="code-paren">(</span><span class="code-variable">x</span><span class="code-paren">)</span> <span class="code-operator">=</span> <span class="code-number">2</span> <span class="code-operator">*</span> <span class="code-variable">x</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">dobro</span><span class="code-paren">(</span><span class="code-number">10</span><span class="code-paren">)</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">dobro</span><span class="code-paren">(</span><span class="code-number">3.5</span><span class="code-paren">)</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-function">dobro</span><span class="code-paren">(</span><span class="code-paren">[</span><span class="code-number">1</span>, <span class="code-number">2</span>, <span class="code-number">3</span><span class="code-paren">]</span><span class="code-paren">)</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>20
7.0
[2, 4, 6]</code></pre>
  </div>
</div>

A mesma função `dobro` funcionou para:

- número inteiro;
- número decimal;
- vetor.

Isso é uma das grandes forças de Julia.

---

## 12. Interoperabilidade

---

Julia também consegue conversar com outras linguagens.

Isso é importante porque, na prática, muitos projetos científicos usam bibliotecas já existentes em outras linguagens.

Julia pode interagir com:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Linguagem</th>
      <th>Uso comum</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Python</td>
      <td>Bibliotecas de machine learning, automação e ciência de dados.</td>
    </tr>
    <tr>
      <td>R</td>
      <td>Estatística, modelos, relatórios e visualização.</td>
    </tr>
    <tr>
      <td>C</td>
      <td>Bibliotecas de baixo nível e alta performance.</td>
    </tr>
    <tr>
      <td>Fortran</td>
      <td>Computação científica clássica e métodos numéricos.</td>
    </tr>
  </tbody>
</table>
</div>

Isso significa que aprender Julia não te isola do restante do ecossistema científico.

---

## 13. Indexação em 1

---

Em Julia, o primeiro elemento de um vetor é acessado com índice `1`.

Veja:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">notas</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-number">7.5</span>, <span class="code-number">8.0</span>, <span class="code-number">6.5</span>, <span class="code-number">9.0</span><span class="code-paren">]</span>

<span class="code-function">println</span><span class="code-paren">(</span><span class="code-variable">notas</span><span class="code-paren">[</span><span class="code-number">1</span><span class="code-paren">]</span><span class="code-paren">)</span>
<span class="code-function">println</span><span class="code-paren">(</span><span class="code-variable">notas</span><span class="code-paren">[</span><span class="code-number">2</span><span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>7.5
8.0</code></pre>
  </div>
</div>

Aqui:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">notas</span><span class="code-paren">[</span><span class="code-number">1</span><span class="code-paren">]</span></code></pre>
  </div>
</div>

pega o primeiro valor.

E:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">notas</span><span class="code-paren">[</span><span class="code-number">2</span><span class="code-paren">]</span></code></pre>
  </div>
</div>

pega o segundo valor.

<div class="mk-box mk-box-alert">
  <strong>Atenção para quem vem de Python, JavaScript ou C:</strong><br>
  Nessas linguagens, geralmente o primeiro elemento é acessado com índice <code>0</code>.  
  Em Julia, o primeiro elemento é acessado com índice <code>1</code>.
</div>

---

## 14. Então, como devemos pensar em Julia?

---

Depois de ver essas características, podemos resumir Julia assim:

> Julia é uma linguagem feita para escrever código científico com clareza, desempenho e expressividade matemática.

Ela é especialmente interessante para quem trabalha ou estuda:

- estatística;
- probabilidade;
- ciência de dados;
- matemática;
- simulação;
- otimização;
- análise numérica;
- visualização de dados;
- programação científica.

Agora que entendemos o “espírito” da linguagem, podemos começar de fato com os primeiros comandos.

---

## 15. Primeiro comando em Julia

---

O primeiro comando clássico em programação é imprimir uma mensagem na tela.

Em Julia, usamos a função `println`.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">println</span><span class="code-paren">(</span><span class="code-string">"Olá, Julia!"</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### Saída esperada

<div class="code-container">
  <div class="code-header">
    <div class="code-lang"></div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar saída">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>Olá, Julia!</code></pre>
  </div>
</div>

A função `println()` imprime uma informação na tela e pula para a próxima linha.

Vamos dividir:

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Parte</th>
      <th>Significado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>println</code></td>
      <td>Função usada para mostrar algo na tela.</td>
    </tr>
    <tr>
      <td><code>()</code></td>
      <td>Parênteses usados para passar informações para a função.</td>
    </tr>
    <tr>
      <td><code>"Olá, Julia!"</code></td>
      <td>Texto que será mostrado na tela.</td>
    </tr>
  </tbody>
</table>
</div>


---

## Referências

As explicações deste post foram organizadas didaticamente a partir da documentação oficial e dos materiais oficiais da linguagem Julia.

<div class="mk-table-wrap">
<table class="mk-table">
  <thead>
    <tr>
      <th>Referência</th>
      <th>Onde consultar</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Site oficial da linguagem Julia</strong></td>
      <td><a href="https://julialang.org/" target="_blank" rel="noopener noreferrer">julialang.org</a></td>
    </tr>
    <tr>
      <td><strong>Documentação oficial — Tipos em Julia</strong></td>
      <td><a href="https://docs.julialang.org/en/v1/manual/types/" target="_blank" rel="noopener noreferrer">docs.julialang.org — Types</a></td>
    </tr>
    <tr>
      <td><strong>Documentação oficial — Métodos e múltiplo despacho</strong></td>
      <td><a href="https://docs.julialang.org/en/v1/manual/methods/" target="_blank" rel="noopener noreferrer">docs.julialang.org — Methods</a></td>
    </tr>
    <tr>
      <td><strong>Documentação oficial — Dicas de performance</strong></td>
      <td><a href="https://docs.julialang.org/en/v1/manual/performance-tips/" target="_blank" rel="noopener noreferrer">docs.julialang.org — Performance Tips</a></td>
    </tr>
    <tr>
      <td><strong>Documentação oficial — Visão geral da documentação</strong></td>
      <td><a href="https://docs.julialang.org/" target="_blank" rel="noopener noreferrer">docs.julialang.org</a></td>
    </tr>
  </tbody>
</table>
</div>

---

## Compartilhe este artigo

<style>
/* Compartilhamento específico deste post */
</style>

<div class="share-buttons">
  <p class="share-buttons-title">Gostou deste artigo? Compartilhe!</p>

  <a href="https://api.whatsapp.com/send?text={{ page.title | url_encode }}%20-%20{{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp" title="Compartilhar no WhatsApp">
    <i class="bi bi-whatsapp"></i>
  </a>

  <a href="https://www.facebook.com/sharer/sharer.php?u={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn facebook" title="Compartilhar no Facebook">
    <i class="bi bi-facebook"></i>
  </a>

  <a href="https://www.linkedin.com/shareArticle?mini=true&url={{ site.url }}{{ page.url }}&title={{ page.title | url_encode }}&summary={{ page.description | url_encode }}" target="_blank" rel="noopener noreferrer" class="share-btn linkedin" title="Compartilhar no LinkedIn">
    <i class="bi bi-linkedin"></i>
  </a>

  <a href="https://x.com/intent/tweet?text={{ page.title | url_encode }}&url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer" class="share-btn twitter-x" title="Compartilhar no X">
    <i class="bi bi-twitter-x"></i>
  </a>

  <button id="copy-link-btn-julia-parte-1" class="share-btn copy-link" title="Copiar Link">
    <i class="bi bi-link-45deg"></i>
  </button>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("copy-link-btn-julia-parte-1");
  if (!btn) return;

  btn.addEventListener("click", function () {
    navigator.clipboard.writeText(window.location.href).then(function () {
      const originalContent = btn.innerHTML;
      btn.innerHTML = "Copiado!";
      btn.style.fontSize = "12px";
      btn.style.fontWeight = "bold";

      setTimeout(function () {
        btn.innerHTML = originalContent;
        btn.style.fontSize = "";
        btn.style.fontWeight = "";
      }, 2000);
    });
  });
});
</script>

</div>