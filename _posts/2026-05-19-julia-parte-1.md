---
layout: post
image: /assets/images/julia-part1.avif
title: "Aprendendo Julia do Zero — Parte 1: Primeiros Passos"
categories: [JULIA]
tags: [Análise de dados]
lang: pt
ref: julia-parte-1
author: dante-bertuzzi
mathjax: true
description: "Aprenda Julia do zero: o que é a linguagem, como escrever seus primeiros comandos, usar variáveis, tipos, operações, strings, vetores e funções simples."
---

Julia é uma linguagem de programação moderna criada para unir duas qualidades que, por muito tempo, pareciam difíceis de combinar: **facilidade de escrita** e **alto desempenho computacional**.

Ela é muito usada em áreas como estatística, matemática, ciência de dados, simulações, otimização, computação científica e machine learning. Para quem trabalha com dados, Julia é especialmente interessante porque permite escrever códigos próximos da linguagem matemática, mas com desempenho adequado para problemas maiores.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/julia-part1.avif" alt="Triângulo de Pascal com coeficientes binomiais destacados" style="max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">

  </figcaption>
</figure>

> Nesta primeira parte, vamos aprender Julia do zero: comandos básicos, operações matemáticas, variáveis, textos, vetores e funções simples.

---

## 1. O que é Julia?

Julia é uma linguagem de programação de alto nível, isto é, uma linguagem feita para ser relativamente simples de ler e escrever. Ao mesmo tempo, ela foi projetada para ser rápida em cálculos numéricos e científicos.

Em outras linguagens, é comum existir uma separação entre:

- uma linguagem fácil para prototipar ideias;
- uma linguagem mais rápida para executar cálculos pesados.

Julia tenta diminuir essa distância. A ideia central é permitir que você escreva um código claro, próximo da matemática, sem precisar abandonar desempenho.

### Exemplo simples

Em Julia, podemos escrever uma fórmula matemática quase diretamente:

$$
m = \frac{x_1 + x_2 + x_3}{3}
$$

No código:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>x1 = 10
x2 = 20
x3 = 30

m = (x1 + x2 + x3) / 3

println(m)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div><span class="code-number">20.0</span></div>
</div>

---

---

### Por que aprender Julia?

Antes de começar a escrever código, vale entender algumas características que tornam Julia uma linguagem especial para matemática, estatística, ciência de dados e computação científica.

<div class="mk-table-wrap">
  <table class="mk-table mk-julia-features-table">
    <thead>
      <tr>
        <th>Termo</th>
        <th>Tradução</th>
        <th>O que significa na prática?</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="mk-term">Fast</span></td>
        <td>Rápida</td>
        <td>
          Julia foi criada para alto desempenho. Seus programas são compilados para código nativo eficiente usando LLVM,
          o que permite executar cálculos numéricos e científicos com muita velocidade.
        </td>
      </tr>

      <tr>
        <td><span class="mk-term">Dynamic</span></td>
        <td>Dinâmica</td>
        <td>
          Julia é dinamicamente tipada, ou seja, você não precisa declarar manualmente o tipo de cada variável.
          Ela tem uma sensação parecida com linguagens de script, como Python, mas também permite desempenho elevado.
        </td>
      </tr>

      <tr>
        <td><span class="mk-term">Reproducible</span></td>
        <td>Reprodutível</td>
        <td>
          Julia permite criar ambientes reprodutíveis. Isso significa que você pode recriar o mesmo ambiente de pacotes
          e versões em outro computador, facilitando projetos científicos, acadêmicos e profissionais.
        </td>
      </tr>

      <tr>
        <td><span class="mk-term">Composable</span></td>
        <td>Componível</td>
        <td>
          Julia usa despacho múltiplo, conhecido como <em>multiple dispatch</em>. Isso permite combinar funções e tipos
          de forma flexível, favorecendo códigos reutilizáveis, organizados e expressivos.
        </td>
      </tr>

      <tr>
        <td><span class="mk-term">General</span></td>
        <td>Geral</td>
        <td>
          Julia não serve apenas para cálculos matemáticos. Ela possui recursos como entrada e saída assíncrona,
          metaprogramação, depuração, logs, profiling, gerenciador de pacotes e criação de programas executáveis.
        </td>
      </tr>

      <tr>
        <td><span class="mk-term">Open source</span></td>
        <td>Código aberto</td>
        <td>
          Julia é um projeto open source, disponível sob a licença MIT. Seu código-fonte está no GitHub,
          e a linguagem conta com uma comunidade ativa, colaborativa e acessível.
        </td>
      </tr>
    </tbody>
  </table>
</div>

## 2. Onde escrever código Julia?

Existem várias formas de escrever código Julia. Para começar, as mais comuns são:

<div class="mk-table-wrap">
  <table class="mk-table">
    <thead>
      <tr>
        <th>Ambiente</th>
        <th>Para que serve</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>REPL do Julia</td>
        <td>Testar comandos rapidamente no terminal.</td>
      </tr>
      <tr>
        <td>Arquivo <code>.jl</code></td>
        <td>Criar programas salvos.</td>
      </tr>
      <tr>
        <td>Pluto.jl</td>
        <td>Criar notebooks interativos.</td>
      </tr>
      <tr>
        <td>VS Code</td>
        <td>Trabalhar em projetos maiores.</td>
      </tr>
      <tr>
        <td>Neovim</td>
        <td>Programar de forma leve e produtiva pelo terminal.</td>
      </tr>
    </tbody>
  </table>
</div>

Nesta postagem, vamos focar nos comandos básicos, que funcionam tanto no REPL quanto em arquivos `.jl`.

---

## 3. Seu primeiro comando

O comando mais clássico em qualquer linguagem é imprimir uma mensagem na tela.

Em Julia, usamos `println()`:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>println("Olá, Julia!")</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Olá, Julia!</div>
</div>

O texto precisa ficar entre aspas duplas:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>println("Estou aprendendo programação com Julia.")</code></pre>
  </div>
</div>

---

## 4. Comentários em Julia

Comentários são partes do código que não são executadas. Eles servem para explicar o que está acontecendo.

Em Julia, comentários de uma linha começam com `#`.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Este é um comentário
println("Este comando será executado.")</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Este comando será executado.</div>
</div>

Também é possível fazer comentários maiores usando `#=` e `=#`:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>#=
Este é um comentário
com várias linhas.
Ele não será executado.
=#

println("Julia é ótima para matemática e estatística.")</code></pre>
  </div>
</div>

---

## 5. Operações matemáticas básicas

Julia pode ser usada como uma calculadora. Veja os principais operadores:

<div class="mk-table-wrap">
  <table class="mk-table">
    <thead>
      <tr>
        <th>Operação</th>
        <th>Símbolo</th>
        <th>Exemplo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Soma</td>
        <td><code>+</code></td>
        <td><code>2 + 3</code></td>
      </tr>
      <tr>
        <td>Subtração</td>
        <td><code>-</code></td>
        <td><code>10 - 4</code></td>
      </tr>
      <tr>
        <td>Multiplicação</td>
        <td><code>*</code></td>
        <td><code>5 * 6</code></td>
      </tr>
      <tr>
        <td>Divisão</td>
        <td><code>/</code></td>
        <td><code>20 / 4</code></td>
      </tr>
      <tr>
        <td>Potência</td>
        <td><code>^</code></td>
        <td><code>2^3</code></td>
      </tr>
      <tr>
        <td>Resto da divisão</td>
        <td><code>%</code></td>
        <td><code>10 % 3</code></td>
      </tr>
    </tbody>
  </table>
</div>

### Exemplos

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>println(2 + 3)
println(10 - 4)
println(5 * 6)
println(20 / 4)
println(2^3)
println(10 % 3)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>5</div>
  <div>6</div>
  <div>30</div>
  <div>5.0</div>
  <div>8</div>
  <div>1</div>
</div>

Observe que `20 / 4` retorna `5.0`, não apenas `5`. Isso acontece porque a divisão com `/` gera um número decimal.

---

## 6. Ordem das operações

Julia respeita a ordem usual da matemática:

1. Parênteses
2. Potências
3. Multiplicação e divisão
4. Soma e subtração

Por exemplo:

$$
2 + 3 \times 4 = 2 + 12 = 14
$$

Em Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>resultado = 2 + 3 * 4

println(resultado)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div><span class="code-number">14</span></div>
</div>

Se quisermos mudar a ordem, usamos parênteses:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>resultado = (2 + 3) * 4

println(resultado)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div><span class="code-number">20</span></div>
</div>

---

## 7. Variáveis

Uma variável é um nome que usamos para guardar um valor.

Por exemplo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>idade = 18
nome = "Ana"
altura = 1.68

println(idade)
println(nome)
println(altura)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>18</div>
  <div>Ana</div>
  <div>1.68</div>
</div>

Aqui temos três variáveis:

<div class="mk-table-wrap">
  <table class="mk-table">
    <thead>
      <tr>
        <th>Variável</th>
        <th>Valor</th>
        <th>Tipo de dado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>idade</code></td>
        <td><code>18</code></td>
        <td>Número inteiro</td>
      </tr>
      <tr>
        <td><code>nome</code></td>
        <td><code>"Ana"</code></td>
        <td>Texto</td>
      </tr>
      <tr>
        <td><code>altura</code></td>
        <td><code>1.68</code></td>
        <td>Número decimal</td>
      </tr>
    </tbody>
  </table>
</div>

---

## 8. Tipos básicos de dados

Julia possui vários tipos de dados. Nesta primeira parte, vamos conhecer os principais:

<div class="mk-table-wrap">
  <table class="mk-table">
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Exemplo</th>
        <th>Significado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>Int64</code></td>
        <td><code>10</code></td>
        <td>Número inteiro</td>
      </tr>
      <tr>
        <td><code>Float64</code></td>
        <td><code>3.14</code></td>
        <td>Número decimal</td>
      </tr>
      <tr>
        <td><code>String</code></td>
        <td><code>"Julia"</code></td>
        <td>Texto</td>
      </tr>
      <tr>
        <td><code>Char</code></td>
        <td><code>'A'</code></td>
        <td>Caractere</td>
      </tr>
      <tr>
        <td><code>Bool</code></td>
        <td><code>true</code> ou <code>false</code></td>
        <td>Valor lógico</td>
      </tr>
    </tbody>
  </table>
</div>

Podemos descobrir o tipo de um valor usando `typeof()`:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>println(typeof(10))
println(typeof(3.14))
println(typeof("Julia"))
println(typeof('J'))
println(typeof(true))</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Int64</div>
  <div>Float64</div>
  <div>String</div>
  <div>Char</div>
  <div>Bool</div>
</div>

---

## 9. Textos em Julia

Textos são chamados de `String`.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>nome = "Dante"

println(nome)</code></pre>
  </div>
</div>

### Juntando textos

Para juntar textos, podemos usar `*`:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>primeiro_nome = "Ada"
sobrenome = "Lovelace"

nome_completo = primeiro_nome * " " * sobrenome

println(nome_completo)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Ada Lovelace</div>
</div>

### Interpolação de strings

Uma forma mais elegante é usar `$` dentro do texto:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>nome = "Ada"
idade = 28

println("Meu nome é $nome e eu tenho $idade anos.")</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Meu nome é Ada e eu tenho 28 anos.</div>
</div>

---

## 10. Valores lógicos

Valores lógicos representam verdadeiro ou falso:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>maior_de_idade = true
tem_cadastro = false

println(maior_de_idade)
println(tem_cadastro)</code></pre>
  </div>
</div>

Valores lógicos são muito importantes para condições, filtros e decisões no código.

Exemplo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>idade = 20

println(idade >= 18)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>true</div>
</div>

---

## 11. Operadores de comparação

Operadores de comparação servem para comparar valores.

<div class="mk-table-wrap">
  <table class="mk-table">
    <thead>
      <tr>
        <th>Operador</th>
        <th>Significado</th>
        <th>Exemplo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>==</code></td>
        <td>Igual a</td>
        <td><code>x == y</code></td>
      </tr>
      <tr>
        <td><code>!=</code></td>
        <td>Diferente de</td>
        <td><code>x != y</code></td>
      </tr>
      <tr>
        <td><code>&gt;</code></td>
        <td>Maior que</td>
        <td><code>x &gt; y</code></td>
      </tr>
      <tr>
        <td><code>&lt;</code></td>
        <td>Menor que</td>
        <td><code>x &lt; y</code></td>
      </tr>
      <tr>
        <td><code>&gt;=</code></td>
        <td>Maior ou igual a</td>
        <td><code>x &gt;= y</code></td>
      </tr>
      <tr>
        <td><code>&lt;=</code></td>
        <td>Menor ou igual a</td>
        <td><code>x &lt;= y</code></td>
      </tr>
    </tbody>
  </table>
</div>

Exemplo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>a = 10
b = 5

println(a == b)
println(a != b)
println(a > b)
println(a < b)
println(a >= b)
println(a <= b)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>false</div>
  <div>true</div>
  <div>true</div>
  <div>false</div>
  <div>true</div>
  <div>false</div>
</div>

<div style="border-left: 4px solid orange; padding: 0.8em; background-color: #fff3cd; border-radius: 6px;">
  <strong>⚠️ Atenção:</strong> Em Julia, usamos <code>=</code> para atribuição e <code>==</code> para comparação.
  <br><br>
  Exemplo:
  <br>
  <code>x = 10</code> guarda o valor 10 em <code>x</code>.
  <br>
  <code>x == 10</code> verifica se <code>x</code> é igual a 10.
</div>

---

## 12. Vetores

Um vetor é uma coleção de valores.

Em estatística e ciência de dados, vetores aparecem o tempo todo: notas de alunos, idades, salários, tempos de espera, medições, contagens etc.

Em Julia, criamos um vetor usando colchetes:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>notas = [8.0, 7.5, 9.0, 6.5]

println(notas)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>[8.0, 7.5, 9.0, 6.5]</div>
</div>

### Acessando elementos do vetor

Em Julia, a contagem dos índices começa em `1`.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>notas = [8.0, 7.5, 9.0, 6.5]

println(notas[1])
println(notas[2])
println(notas[3])
println(notas[4])</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>8.0</div>
  <div>7.5</div>
  <div>9.0</div>
  <div>6.5</div>
</div>

> Diferente de linguagens como Python e JavaScript, Julia começa a indexação em `1`, não em `0`.

---

## 13. Funções úteis para vetores

Algumas funções básicas para trabalhar com vetores:

<div class="mk-table-wrap">
  <table class="mk-table">
    <thead>
      <tr>
        <th>Função</th>
        <th>O que faz</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>sum(v)</code></td>
        <td>Soma os elementos do vetor.</td>
      </tr>
      <tr>
        <td><code>length(v)</code></td>
        <td>Conta quantos elementos existem.</td>
      </tr>
      <tr>
        <td><code>maximum(v)</code></td>
        <td>Retorna o maior valor.</td>
      </tr>
      <tr>
        <td><code>minimum(v)</code></td>
        <td>Retorna o menor valor.</td>
      </tr>
      <tr>
        <td><code>sort(v)</code></td>
        <td>Ordena os valores.</td>
      </tr>
      <tr>
        <td><code>mean(v)</code></td>
        <td>Calcula a média usando o pacote <code>Statistics</code>.</td>
      </tr>
    </tbody>
  </table>
</div>

Exemplo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics

notas = [8.0, 7.5, 9.0, 6.5]

println("Soma: ", sum(notas))
println("Quantidade: ", length(notas))
println("Maior nota: ", maximum(notas))
println("Menor nota: ", minimum(notas))
println("Notas ordenadas: ", sort(notas))
println("Média: ", mean(notas))</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Soma: 31.0</div>
  <div>Quantidade: 4</div>
  <div>Maior nota: 9.0</div>
  <div>Menor nota: 6.5</div>
  <div>Notas ordenadas: [6.5, 7.5, 8.0, 9.0]</div>
  <div>Média: 7.75</div>
</div>

---

## 14. Calculando uma média manualmente

Vamos calcular a média de um conjunto de notas.

A fórmula da média aritmética é:

$$
\bar{x} = \frac{\sum_{i=1}^{n} x_i}{n}
$$

Se temos as notas:

$$
8{,}0,\ 7{,}5,\ 9{,}0,\ 6{,}5
$$

Então:

$$
\bar{x} = \frac{8{,}0 + 7{,}5 + 9{,}0 + 6{,}5}{4}
$$

$$
\bar{x} = \frac{31}{4} = 7{,}75
$$

Em Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>notas = [8.0, 7.5, 9.0, 6.5]

soma = sum(notas)
quantidade = length(notas)
media = soma / quantidade

println("Soma das notas: ", soma)
println("Quantidade de notas: ", quantidade)
println("Média: ", media)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Soma das notas: 31.0</div>
  <div>Quantidade de notas: 4</div>
  <div>Média: 7.75</div>
</div>

---

## 15. Criando funções simples

Uma função é um bloco de código que executa uma tarefa.

A estrutura básica é:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>function nome_da_funcao(argumento)
    # código da função
end</code></pre>
  </div>
</div>

### Exemplo: função para somar dois números

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>function somar(a, b)
    return a + b
end

resultado = somar(10, 5)

println(resultado)</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div><span class="code-number">15</span></div>
</div>

### Exemplo: função para calcular média

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>function calcular_media(valores)
    soma = sum(valores)
    quantidade = length(valores)
    media = soma / quantidade

    return media
end

notas = [8.0, 7.5, 9.0, 6.5]

println(calcular_media(notas))</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div><span class="code-number">7.75</span></div>
</div>

---

## 16. Forma curta de função

Julia também permite escrever funções pequenas em uma linha:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>quadrado(x) = x^2

println(quadrado(5))</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div><span class="code-number">25</span></div>
</div>

Outro exemplo:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>dobro(x) = 2x

println(dobro(8))</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div><span class="code-number">16</span></div>
</div>

Observe que em Julia é possível escrever `2x` em vez de `2 * x` em algumas situações matemáticas. Essa é uma das características que tornam a linguagem visualmente próxima da notação matemática.

---

## 17. Um mini projeto: média de notas

Agora vamos juntar o que aprendemos em um pequeno programa.

Objetivo:

- guardar o nome de um aluno;
- guardar suas notas;
- calcular a média;
- exibir o resultado final.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia - mini projeto</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Statistics

nome = "Marina"
notas = [8.0, 7.5, 9.0, 6.5]

media = mean(notas)

println("Aluno(a): $nome")
println("Notas: $notas")
println("Média final: $media")</code></pre>
  </div>
</div>

#### Saída esperada:

<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>Aluno(a): Marina</div>
  <div>Notas: [8.0, 7.5, 9.0, 6.5]</div>
  <div>Média final: 7.75</div>
</div>

---

## 18. Mini laboratório interativo

Digite algumas notas separadas por vírgula para calcular a média. Este exemplo usa JavaScript apenas para tornar a postagem interativa no navegador, mas a lógica é a mesma que usamos em Julia: somar os valores e dividir pela quantidade.

<div class="julia-lab">
  <h3>Calculadora de média</h3>
  <p>Insira valores separados por vírgula:</p>

  <input 
    type="text" 
    id="julia-values-input" 
    placeholder="Ex: 8, 7.5, 9, 6.5"
  >

  <button id="julia-calculate-btn" onclick="calculateJuliaMean()">
    Calcular média
  </button>

  <div class="julia-lab-result">
    <p>Soma: <span id="julia-sum-result">-</span></p>
    <p>Quantidade: <span id="julia-count-result">-</span></p>
    <p>Média: <span id="julia-mean-result">-</span></p>
  </div>
</div>

<script>
function calculateJuliaMean() {
  const input = document.getElementById("julia-values-input").value;

  const values = input
    .split(",")
    .map(x => parseFloat(x.trim().replace(",", ".")))
    .filter(x => !isNaN(x));

  if (values.length === 0) {
    document.getElementById("julia-sum-result").textContent = "-";
    document.getElementById("julia-count-result").textContent = "-";
    document.getElementById("julia-mean-result").textContent = "Insira valores válidos";
    return;
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  const count = values.length;
  const mean = sum / count;

  document.getElementById("julia-sum-result").textContent = sum.toFixed(2);
  document.getElementById("julia-count-result").textContent = count;
  document.getElementById("julia-mean-result").textContent = mean.toFixed(2);
}
</script>

---

## 19. Resumo da Parte 1

Nesta primeira parte, vimos os fundamentos mais importantes para começar em Julia:

<div class="mk-table-wrap">
  <table class="mk-table">
    <thead>
      <tr>
        <th>Conceito</th>
        <th>Exemplo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Imprimir texto</td>
        <td><code>println("Olá")</code></td>
      </tr>
      <tr>
        <td>Comentário</td>
        <td><code># comentário</code></td>
      </tr>
      <tr>
        <td>Variável</td>
        <td><code>x = 10</code></td>
      </tr>
      <tr>
        <td>Número inteiro</td>
        <td><code>10</code></td>
      </tr>
      <tr>
        <td>Número decimal</td>
        <td><code>3.14</code></td>
      </tr>
      <tr>
        <td>Texto</td>
        <td><code>"Julia"</code></td>
      </tr>
      <tr>
        <td>Valor lógico</td>
        <td><code>true</code></td>
      </tr>
      <tr>
        <td>Vetor</td>
        <td><code>[1, 2, 3]</code></td>
      </tr>
      <tr>
        <td>Soma de vetor</td>
        <td><code>sum(v)</code></td>
      </tr>
      <tr>
        <td>Tamanho do vetor</td>
        <td><code>length(v)</code></td>
      </tr>
      <tr>
        <td>Função</td>
        <td><code>function nome() ... end</code></td>
      </tr>
      <tr>
        <td>Função curta</td>
        <td><code>f(x) = x^2</code></td>
      </tr>
    </tbody>
  </table>
</div>

---

## 20. Exercícios para praticar

Tente resolver antes de olhar qualquer resposta.

### Exercício 1

Crie três variáveis:

- `nome`
- `idade`
- `cidade`

Depois, imprima uma frase usando interpolação de strings.

Exemplo esperado:

<div class="code-output">
  <div class="code-output-header"># Saída esperada</div>
  <div>Meu nome é Ana, tenho 20 anos e moro em Recife.</div>
</div>

### Exercício 2

Crie um vetor com cinco números e calcule:

- a soma;
- a quantidade de elementos;
- a média;
- o maior valor;
- o menor valor.

### Exercício 3

Crie uma função chamada `dobro` que recebe um número e retorna o dobro desse número.

### Exercício 4

Crie uma função chamada `media_manual` que recebe um vetor e retorna:

$$
\frac{\text{soma dos valores}}{\text{quantidade de valores}}
$$

### Exercício 5

Crie um vetor com as notas de um aluno e mostre uma mensagem como:

<div class="code-output">
  <div class="code-output-header"># Saída esperada</div>
  <div>A média final do aluno foi 8.25</div>
</div>

---

## 21. Gabarito sugerido

### Exercício 1

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>nome = "Ana"
idade = 20
cidade = "Recife"

println("Meu nome é $nome, tenho $idade anos e moro em $cidade.")</code></pre>
  </div>
</div>

### Exercício 2

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>valores = [10, 20, 30, 40, 50]

println("Soma: ", sum(valores))
println("Quantidade: ", length(valores))
println("Média: ", sum(valores) / length(valores))
println("Maior valor: ", maximum(valores))
println("Menor valor: ", minimum(valores))</code></pre>
  </div>
</div>

### Exercício 3

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>dobro(x) = 2x

println(dobro(10))</code></pre>
  </div>
</div>

### Exercício 4

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>function media_manual(valores)
    return sum(valores) / length(valores)
end

dados = [5, 10, 15, 20]

println(media_manual(dados))</code></pre>
  </div>
</div>

### Exercício 5

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>notas = [8.0, 9.0, 7.5, 8.5]

media = sum(notas) / length(notas)

println("A média final do aluno foi $media")</code></pre>
  </div>
</div>

---

## 22. Próximos passos

Na próxima parte, podemos avançar para os primeiros controles de fluxo da linguagem:

- `if`, `else` e `elseif`;
- operadores lógicos;
- condições compostas;
- laços `for`;
- laços `while`;
- criação de pequenos programas com decisões.

Esses conceitos são fundamentais para transformar comandos soltos em programas de verdade.

---

## Referências

1. JULIA DOCUMENTATION. **The Julia Language — Manual**. Disponível em: <https://docs.julialang.org/>.

2. BEZANSON, J.; EDELMAN, A.; KARPINSKI, S.; SHAH, V. B. **Julia: A Fresh Approach to Numerical Computing**. SIAM Review, 2017.

3. LAU, S.; GONZALEZ, J.; NOLAN, D. **Principles and Techniques of Data Science**. Capítulos introdutórios sobre programação e análise de dados.

4. WICKHAM, H.; GROLEMUND, G. **R for Data Science**. Referência útil para raciocínio em ciência de dados, ainda que em outra linguagem.

---

<style>
.mk-table-wrap {
  width: 100%;
  overflow-x: auto;
  margin: 1.6rem 0 2rem;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(23, 50, 77, 0.08);
}

.mk-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid #e3e8ef;
  border-radius: 14px;
  overflow: hidden;
  font-size: 0.96rem;
}

.mk-table thead {
  background: linear-gradient(135deg, #4063d8 0%, #7653d8 100%);
  color: #ffffff;
}

.mk-table th,
.mk-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #edf1f5;
  vertical-align: middle;
}

.mk-table th {
  font-weight: 700;
  white-space: nowrap;
}

.mk-table tbody tr {
  transition: background 0.2s ease;
}

.mk-table tbody tr:hover {
  background: #f6f8ff;
}

.mk-table tbody tr:last-child td {
  border-bottom: none;
}

.mk-table code {
  background: #f1f5f9;
  color: #17324d;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.92em;
}

.julia-lab {
  background: linear-gradient(135deg, #f7f9fc 0%, #eef3f8 100%);
  border: 1px solid #dce6f1;
  border-radius: 14px;
  padding: 22px;
  margin: 28px 0;
  box-shadow: 0 8px 24px rgba(23, 50, 77, 0.08);
}

.julia-lab h3 {
  margin-top: 0;
  color: #17324d;
}

.julia-lab input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ccd8e4;
  border-radius: 8px;
  font-size: 16px;
  margin: 10px 0 14px 0;
  outline: none;
}

.julia-lab input:focus {
  border-color: #4063d8;
  box-shadow: 0 0 0 3px rgba(64, 99, 216, 0.12);
}

#julia-calculate-btn {
  background: #4063d8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 11px 16px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

#julia-calculate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(64, 99, 216, 0.22);
}

.julia-lab-result {
  margin-top: 18px;
  padding: 14px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e1e8f0;
}

.julia-lab-result p {
  margin: 6px 0;
}

.julia-lab-result span {
  font-weight: 700;
  color: #17324d;
}

.dark-mode .mk-table {
  background: #111827 !important;
  border-color: #334155 !important;
  color: #f9fafb !important;
}

.dark-mode .mk-table thead {
  background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%) !important;
  color: #111827 !important;
}

.dark-mode .mk-table th,
.dark-mode .mk-table td {
  border-color: #334155 !important;
}

.dark-mode .mk-table tbody tr:hover {
  background: #1e293b !important;
}

.dark-mode .mk-table code {
  background: #1e293b !important;
  color: #c4b5fd !important;
}

.dark-mode .julia-lab {
  background: linear-gradient(135deg, #1f2933 0%, #111827 100%) !important;
  border-color: #374151 !important;
  color: #f9fafb !important;
}

.dark-mode .julia-lab h3 {
  color: #a5b4fc !important;
}

.dark-mode .julia-lab input {
  background: #111827 !important;
  color: #f9fafb !important;
  border-color: #374151 !important;
}

.dark-mode .julia-lab-result {
  background: #0f172a !important;
  border-color: #334155 !important;
}

.dark-mode .julia-lab-result span {
  color: #c4b5fd !important;
}

.dark-mode #julia-calculate-btn {
  background: #a5b4fc !important;
  color: #111827 !important;
}
</style>

<script>
function copyCode(button) {
  const container = button.closest(".code-container");
  const code = container.querySelector("code").innerText;

  navigator.clipboard.writeText(code).then(function() {
    const original = button.innerHTML;

    button.innerHTML = "Copiado!";
    button.style.fontSize = "12px";
    button.style.fontWeight = "bold";

    setTimeout(function() {
      button.innerHTML = original;
      button.style.fontSize = "";
      button.style.fontWeight = "";
    }, 1800);
  });
}
</script>

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