---
layout: post
image: /assets/images/capa-lean.avif
title: "Lean: a linguagem em que o computador confere a sua prova"
categories: [MATEMÁTICA, LEAN]
tags: [Matemática, Lean, Julia, R, Python]
lang: pt
ref: lean-provas-formais
author: dante-bertuzzi
description: "O que é o Lean, por que testar um milhão de casos não prova nada e como escrever, ler e conferir as primeiras provas formais, com os erros que o Lean mostra."
mathjax: true
slug: lean-linguagem-computador-confere-prova
---

Testei a identidade $(a + b)^2 = a^2 + 2ab + b^2$ com um milhão de pares de números inteiros. Ela valeu em todos. Isso prova que ela vale sempre?

Não. E não é preciosismo: daqui a pouco aparece uma fórmula que acerta os primeiros 40 casos e erra o 41º. O que prova uma afirmação "para todo número" é uma demonstração. E demonstração escrita por gente tem um problema conhecido: gente pula passos, esquece hipóteses e erra contas. Este site já publicou uma soma de 0,01 + 0,009 + 0,008 escrita como 0,029, quando o certo é 0,027, e o erro só foi achado numa revisão.

Hoje as demonstrações do site são conferidas em **Lean**, uma linguagem em que você escreve a prova e o computador confere cada passo. Este post conta o que é o Lean, mostra as primeiras provas com as mensagens que ele devolve (inclusive quando a prova está errada) e diz com honestidade o que ele não resolve.

## Testar não é provar

O bloco abaixo faz duas coisas. Primeiro, confere a identidade do binômio em um milhão de pares de inteiros sorteados entre −1.000 e 1.000. Depois, olha a fórmula $n^2 + n + 41$ e pergunta, para cada $n$ de 0 a 100, se o resultado é um número primo (só divisível por 1 e por ele mesmo).

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>using Random

# 1) A identidade (a + b)² = a² + 2ab + b² em um milhão de pares de inteiros
Random.seed!(123)
a = rand(-1000:1000, 1_000_000)
b = rand(-1000:1000, 1_000_000)
println("pares que satisfazem a identidade: ", count((a .+ b) .^ 2 .== a .^ 2 .+ 2 .* a .* b .+ b .^ 2))

# 2) n² + n + 41 é primo? (divisão por tentativa, para não depender de pacote)
eh_primo(m) = m ≥ 2 &amp;&amp; all(m % d != 0 for d in 2:isqrt(m))
resultados = [eh_primo(n^2 + n + 41) for n in 0:100]
primeira_falha = findfirst(!, resultados) - 1      # o vetor começa em n = 0
println("primos de n = 0 até n = 39: ", all(resultados[1:40]))
println("primeiro n que falha: ", primeira_falha, " (", primeira_falha^2 + primeira_falha + 41,
        " = 41 × ", (primeira_falha^2 + primeira_falha + 41) ÷ 41, ")")
println("falhas entre n = 0 e n = 100: ", count(!, resultados))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">pares que satisfazem a identidade: 1000000
primos de n = 0 até n = 39: true
primeiro n que falha: 40 (1681 = 41 × 41)
falhas entre n = 0 e n = 100: 14</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># 1) A identidade (a + b)² = a² + 2ab + b² em um milhão de pares de inteiros
set.seed(123)
a &lt;- sample(-1000:1000, 1e6, replace = TRUE)
b &lt;- sample(-1000:1000, 1e6, replace = TRUE)
cat("pares que satisfazem a identidade:", sum((a + b)^2 == a^2 + 2 * a * b + b^2), "\n")

# 2) n² + n + 41 é primo? (divisão por tentativa, para não depender de pacote)
eh_primo &lt;- function(m) m &gt;= 2 &amp;&amp; all(m %% seq_len(floor(sqrt(m)))[-1] != 0)
n &lt;- 0:100
resultados &lt;- sapply(n^2 + n + 41, eh_primo)
primeira_falha &lt;- n[which(!resultados)[1]]
valor &lt;- primeira_falha^2 + primeira_falha + 41
cat("primos de n = 0 até n = 39:", all(resultados[1:40]), "\n")
cat(sprintf("primeiro n que falha: %d (%d = 41 × %d)\n", primeira_falha, valor, valor %/% 41))
cat("falhas entre n = 0 e n = 100:", sum(!resultados), "\n")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">pares que satisfazem a identidade: 1000000 
primos de n = 0 até n = 39: TRUE 
primeiro n que falha: 40 (1681 = 41 × 41)
falhas entre n = 0 e n = 100: 14 </pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import numpy as np
from math import isqrt

# 1) A identidade (a + b)² = a² + 2ab + b² em um milhão de pares de inteiros
rng = np.random.default_rng(123)
a = rng.integers(-1000, 1001, 1_000_000)
b = rng.integers(-1000, 1001, 1_000_000)
print("pares que satisfazem a identidade:", np.sum((a + b) ** 2 == a**2 + 2 * a * b + b**2))

# 2) n² + n + 41 é primo? (divisão por tentativa, para não depender de pacote)
def eh_primo(m):
    return m &gt;= 2 and all(m % d != 0 for d in range(2, isqrt(m) + 1))

resultados = [eh_primo(n**2 + n + 41) for n in range(101)]
primeira_falha = resultados.index(False)
valor = primeira_falha**2 + primeira_falha + 41
print("primos de n = 0 até n = 39:", all(resultados[:40]))
print(f"primeiro n que falha: {primeira_falha} ({valor} = 41 × {valor // 41})")
print("falhas entre n = 0 e n = 100:", resultados.count(False))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">pares que satisfazem a identidade: 1000000
primos de n = 0 até n = 39: True
primeiro n que falha: 40 (1681 = 41 × 41)
falhas entre n = 0 e n = 100: 14</pre>
</div>
  </div>
</div>

As três linguagens sorteiam pares diferentes, mas o resultado é o mesmo: a identidade passou em todos os pares. Já $n^2 + n + 41$ dá primo para todo $n$ de 0 a 39, quarenta casos seguidos. Quem parasse de testar ali concluiria que a fórmula sempre gera primos. Em $n = 40$ ela erra:

$$
40^2 + 40 + 41 = 1600 + 40 + 41 = 1681 = 41 \times 41
$$

De 0 a 100 são 14 falhas. Conferi a contagem por outro caminho, com o crivo de Eratóstenes (riscar os múltiplos de cada número), e ela bate: as falhas estão em $n$ = 40, 41, 44, 49, 56, 65, 76, 81, 82, 84, 87, 89, 91 e 96.

A lição vale para os dois casos. Um milhão de acertos da identidade não prova que ela vale para o milionésimo primeiro par. Quarenta acertos da fórmula dos primos também não provavam nada, e ela de fato falha. Teste mostra que algo *parece* valer, ou acha um contraexemplo. Só uma demonstração garante o "para todo".

## O que é o Lean

O site oficial descreve o Lean como uma linguagem de programação de código aberto e um **assistente de provas**: um programa que confere demonstrações matemáticas. Você escreve o enunciado e a prova num formato que o computador entende, e ele aceita a prova só se cada passo seguir das regras. Não há "é fácil ver que": o passo que você pular, ele cobra.

O Lean foi criado por Leonardo de Moura em 2013, e o primeiro commit no repositório é de julho daquele ano. A versão 4, usada hoje, começou a ser desenvolvida em 2018 e teve o lançamento oficial do Lean 4.0 em setembro de 2023. Desde julho de 2023 o projeto é tocado pela **Lean FRO**, uma organização sem fins lucrativos fundada por de Moura e Sebastian Ullrich. As datas estão na página "About" da Lean FRO.

A parte que confere as provas, o núcleo (*kernel*), é pequena de propósito: quanto menor o código em que é preciso confiar, menor a chance de ele próprio ter um erro. Por cima dele há ferramentas que ajudam a *encontrar* provas, as **táticas**, mas tudo o que elas produzem passa de novo pelo núcleo.

Quase toda a matemática que se usa no Lean vem do **Mathlib**, uma biblioteca mantida pela comunidade. Em 26 de novembro de 2026, a página de estatísticas do Mathlib contava 296.731 teoremas e 142.208 definições, escritos por 772 pessoas.

## A primeira prova: o binômio ao quadrado

Este é um arquivo Lean completo. A primeira linha carrega o Mathlib, e o resto enuncia e prova a identidade do binômio:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

theorem binomio (a b : ℝ) : (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by
  ring</code></pre>
  </div>
</div>

Lendo por partes:

- `theorem binomio` dá um nome ao resultado, para ele poder ser usado depois.
- `(a b : ℝ)` declara as variáveis: `a` e `b` são números reais quaisquer. É o "para todo $a$ e $b$" do enunciado.
- Depois dos dois-pontos vem o que se afirma: $(a + b)^2 = a^2 + 2ab + b^2$. No Lean, `^` é potência e `*` é multiplicação.
- `:= by` abre a prova, e `ring` é a tática que a resolve. Ela sabe fazer as contas que valem em qualquer anel comutativo (distributiva, comutativa, associativa) e fecha a igualdade sozinha.

Não aparece mensagem nenhuma, e é isso que se quer: o Lean aceitou a prova. Essa mesma identidade, com a prova geométrica, está no post [Binômio ao quadrado](/binomio-quadrado/).

## Quando a afirmação é falsa

Agora o erro clássico: achar que $(a + b)^2 = a^2 + b^2$.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

theorem binomio_errado (a b : ℝ) : (a + b) ^ 2 = a ^ 2 + b ^ 2 := by
  ring</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Try this:
  [apply] ring_nf
  
  The `ring` tactic failed to close the goal. Use `ring_nf` to obtain a normal form.
    
  Note that `ring` works primarily in *commutative* rings. If you have a noncommutative ring, abelian group or module, consider using `noncomm_ring`, `abel` or `module` instead.
binomio_errado.lean:3:66: error: unsolved goals
a b : ℝ
⊢ a * b * 2 + a ^ 2 + b ^ 2 = a ^ 2 + b ^ 2</pre>
</div>

O Lean recusa. A mensagem começa sugerindo outra tática (`ring_nf`), mas a parte útil é o final. A tática `ring` levou os dois lados à forma mais simples possível e mostra o que sobrou: do lado esquerdo há um termo `a * b * 2` que o lado direito não tem. O símbolo `⊢` marca o **objetivo**, o que ainda falta provar. É exatamente o $2ab$ esquecido. O computador não sabe que o enunciado é "um erro comum", sabe apenas que a igualdade não fecha.

## A hipótese que ninguém escreve

Este é o exemplo que mais ensina. No Lean, dividir por zero não dá erro:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

example : (1 : ℝ) / 0 = 0 := by
  simp

theorem divide_por_si (x : ℝ) : x / x = 1 := by
  field_simp</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">divisao.lean:6:45: error: unsolved goals
x : ℝ
⊢ x / x = 1</pre>
</div>

A primeira afirmação, $1/0 = 0$, passa. É uma convenção do Lean: assim a divisão tem um resultado para qualquer par de números, sem precisar de um caso especial. O preço aparece na segunda afirmação. "Todo número dividido por ele mesmo dá 1" não fecha, porque com $x = 0$ a conta dá $0/0 = 0$, e não 1. A tática `field_simp`, que simplifica frações, não conseguiu fazer nada sem saber que $x$ não é zero, e o objetivo ficou como estava.

Com a hipótese escrita, a prova sai em uma linha, usando um teorema do Mathlib chamado `div_self`:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

theorem divide_por_si (x : ℝ) (hx : x ≠ 0) : x / x = 1 := by
  exact div_self hx</code></pre>
  </div>
</div>

`(hx : x ≠ 0)` é a hipótese, com um nome (`hx`) para poder ser usada. Num livro, a frase "todo número dividido por ele mesmo dá 1" costuma aparecer sem o "diferente de zero", e o leitor completa de cabeça. O Lean não completa. Por isso, no site, a regra é: **se a prova em Lean exige uma hipótese que a página não diz, a página está incompleta**, e a hipótese entra no texto.

## Provando o que o teste só sugeria

O Lean também consegue conferir casos, desde que sejam finitos. A afirmação "$n^2 + n + 41$ é primo para todo $n < 40$" tem 40 casos, e ele confere um por um. A afirmação de que 1681 não é primo também é uma conta finita:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

theorem primos_ate_39 : ∀ n &lt; 40, Nat.Prime (n ^ 2 + n + 41) := by
  intro n hn
  interval_cases n &lt;;&gt; norm_num

theorem falha_em_40 : ¬ Nat.Prime (40 ^ 2 + 40 + 41) := by
  norm_num</code></pre>
  </div>
</div>

`interval_cases n` abre os 40 casos ($n = 0, 1, \dots, 39$), e `norm_num` confere cada um. Nenhuma mensagem: as duas afirmações estão provadas. Repare que isso não contradiz a seção anterior. Aqui a afirmação é sobre 40 casos, e os 40 foram conferidos. Testar não basta quando a afirmação é sobre *infinitos* casos.

## Uma prova por indução

A soma dos $n$ primeiros números ímpares é $n^2$:

$$
1 + 3 + 5 + \dots + (2n - 1) = n^2
$$

Com $n = 5$: $1 + 3 + 5 + 7 + 9 = 25 = 5^2$. O teste confirma até $n = 10.000$:

<div class="code-tabs">
  <div class="code-tab" data-lang="julia">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># 1 + 3 + 5 + … + (2n − 1) = n², conferido de n = 1 até n = 10.000
confere(n) = sum(2i + 1 for i in 0:n-1) == n^2
println("vale para todo n de 1 a 10.000: ", all(confere, 1:10_000))
println("exemplo, n = 5: ", join(2 .* (0:4) .+ 1, " + "), " = ", sum(2 .* (0:4) .+ 1))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">vale para todo n de 1 a 10.000: true
exemplo, n = 5: 1 + 3 + 5 + 7 + 9 = 25</pre>
</div>
  </div>
  <div class="code-tab" data-lang="r">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">R</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># 1 + 3 + 5 + … + (2n − 1) = n², conferido de n = 1 até n = 10.000
confere &lt;- function(n) sum(2 * (0:(n - 1)) + 1) == n^2
cat("vale para todo n de 1 a 10.000:", all(sapply(1:10000, confere)), "\n")
impares &lt;- 2 * (0:4) + 1
cat("exemplo, n = 5:", paste(impares, collapse = " + "), "=", sum(impares), "\n")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">vale para todo n de 1 a 10.000: TRUE 
exemplo, n = 5: 1 + 3 + 5 + 7 + 9 = 25 </pre>
</div>
  </div>
  <div class="code-tab" data-lang="python">
<div class="code-container">
  <div class="code-header">
    <div class="code-lang">Python</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># 1 + 3 + 5 + … + (2n − 1) = n², conferido de n = 1 até n = 10.000
def confere(n):
    return sum(2 * i + 1 for i in range(n)) == n**2

print("vale para todo n de 1 a 10.000:", all(confere(n) for n in range(1, 10_001)))
impares = [2 * i + 1 for i in range(5)]
print("exemplo, n = 5:", " + ".join(map(str, impares)), "=", sum(impares))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">vale para todo n de 1 a 10.000: True
exemplo, n = 5: 1 + 3 + 5 + 7 + 9 = 25</pre>
</div>
  </div>
</div>

Mas são infinitos valores de $n$, e para eles é preciso uma demonstração. A ferramenta é a **indução**:

1. **Caso inicial**: vale para $n = 0$ (a soma vazia é 0, e $0^2 = 0$).
2. **Passo**: *se* vale para um $k$ qualquer, então vale para $k + 1$.

Juntos, os dois passos cobrem todos os números naturais: vale para 0, logo para 1, logo para 2, e assim por diante.

No Lean, a soma $1 + 3 + \dots + (2n-1)$ se escreve `∑ i ∈ range n, (2 * i + 1)`: a soma de $2i + 1$ para $i$ de 0 a $n - 1$. Uma primeira tentativa, ainda incompleta:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

open Finset

theorem soma_impares (n : ℕ) : ∑ i ∈ range n, (2 * i + 1) = n ^ 2 := by
  induction n with
  | zero =&gt; simp
  | succ k ih =&gt;
    rw [sum_range_succ, ih]</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">impares_incompleto.lean:8:14: error: unsolved goals
case succ
k : ℕ
ih : ∑ i ∈ range k, (2 * i + 1) = k ^ 2
⊢ k ^ 2 + (2 * k + 1) = (k + 1) ^ 2</pre>
</div>

`induction n with` separa os dois casos. O caso `zero` sai com `simp`. No caso `succ` (de *sucessor*, $k + 1$), a hipótese de indução se chama `ih` e diz que a fórmula vale para $k$. O passo `rw [sum_range_succ, ih]` faz duas trocas: separa o último termo da soma (`sum_range_succ`) e substitui a soma até $k$ por $k^2$, usando `ih`.

A mensagem mostra o que ainda falta, com tudo o que se sabe naquele ponto: as hipóteses acima e o objetivo depois do `⊢`. Falta provar que

$$
k^2 + (2k + 1) = (k + 1)^2,
$$

que é o binômio de novo. Basta acrescentar `ring`:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang code-lang--lean">Lean</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>import Mathlib

open Finset

theorem soma_impares (n : ℕ) : ∑ i ∈ range n, (2 * i + 1) = n ^ 2 := by
  induction n with
  | zero =&gt; simp
  | succ k ih =&gt;
    rw [sum_range_succ, ih]
    ring

#print axioms soma_impares</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">'soma_impares' depends on axioms: [propext, Classical.choice, Quot.sound]</pre>
</div>

A prova passou. A última linha, `#print axioms`, pede ao Lean a lista dos axiomas em que a prova se apoia: `propext` (duas proposições equivalentes são iguais), `Classical.choice` (o axioma da escolha) e `Quot.sound` (uma regra sobre quocientes). Os três são explicados no capítulo 12 de *Theorem Proving in Lean 4*. Se aparecesse `sorryAx` na lista, a prova teria um buraco: `sorry` é a palavra que manda o Lean aceitar um passo sem prova, e é proibida nas provas do site.

## Como o site usa o Lean

As demonstrações do site ficam na pasta [`provas/`](https://github.com/morrisonkuhlsen/morrisonkuhlsen/tree/master/provas) do repositório: um arquivo por assunto, com o endereço da página que afirma cada resultado. Em 26 de novembro de 2026 eram 176 teoremas em 24 arquivos, de produtos notáveis ao Teorema de Bayes e às cercas do [boxplot](/boxplot-o-que-e-cada-elemento-como-se-calcula-e-como-interpretar/). O comando `lake build` confere todos de uma vez. Os exemplos deste post rodaram no Lean 4.37.0-rc1, com a versão do Mathlib fixada no repositório.

As regras são simples:

- O enunciado em Lean é **o mesmo** que a página afirma, com as mesmas hipóteses.
- Se a prova precisa de uma hipótese que a página não diz, quem muda é a página.
- `sorry` é proibido. Prova que não sai fica fora, e a afirmação da página fica marcada como pendente.

## O que o Lean não resolve

O Lean garante que a prova prova *o enunciado que está escrito em Lean*. Isso deixa de fora coisas importantes:

- **A tradução.** Se eu escrever em Lean um enunciado diferente do que está na página (com uma hipótese a mais, um sinal trocado ou um índice errado), o Lean prova o enunciado errado sem reclamar. Conferir que o enunciado formal diz o mesmo que o texto é trabalho humano.
- **Contas com números do mundo real.** Um p-valor, um quantil da normal ou o resultado de uma simulação são calculados em Julia, R ou Python, e ali o que vale é refazer a conta por outro caminho.
- **Código e referências.** O Lean não roda o código dos posts nem sabe se um livro citado existe e diz o que se afirma.
- **Os axiomas e o próprio núcleo.** A prova vale *dado* que os três axiomas acima são aceitos e que o núcleo do Lean não tem erro. É uma base pequena e muito examinada, mas é uma base.

Ou seja: o Lean não substitui as outras conferências, ele cobre uma parte que antes dependia só de atenção, a de que cada passo da demonstração segue do anterior.

## Como começar

- **Sem instalar nada**: o [Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/nng4) é um jogo para aprender Lean no navegador.
- **Para instalar**: a página [lean-lang.org/install](https://lean-lang.org/install/) recomenda o VS Code com a extensão do Lean 4.
- **Para estudar**: [*Theorem Proving in Lean 4*](https://lean-lang.org/theorem_proving_in_lean4/) explica a linguagem e a lógica; [*Mathematics in Lean*](https://leanprover-community.github.io/mathematics_in_lean/) ensina a usar o Mathlib.
- **Para achar um teorema do Mathlib** (como o `div_self` deste post): o [Loogle](https://loogle.lean-lang.org/) busca definições e teoremas do Lean e do Mathlib.

## Resumo

- Testar muitos casos mostra que algo *parece* valer; $n^2 + n + 41$ acerta 40 vezes seguidas e erra em $n = 40$. Só uma demonstração garante o "para todo".
- O Lean é uma linguagem e um assistente de provas: você escreve a demonstração, e um núcleo pequeno confere cada passo.
- Quando a prova falha, o Lean mostra o objetivo que sobrou (`⊢`), e isso costuma apontar o erro: o $2ab$ esquecido, a hipótese $x \neq 0$ que faltava.
- O Lean confere a prova do enunciado formal. Se esse enunciado corresponde ao texto, se as contas numéricas estão certas e se as fontes existem, isso continua dependendo de conferência humana.

## Referências

- de Moura, L.; Ullrich, S. (2021). The Lean 4 theorem prover and programming language. In: *Automated Deduction – CADE 28*. Lecture Notes in Computer Science, p. 625–635. Springer. DOI: [10.1007/978-3-030-79876-5_37](https://doi.org/10.1007/978-3-030-79876-5_37).
- de Moura, L.; Kong, S.; Avigad, J.; van Doorn, F.; von Raumer, J. (2015). The Lean theorem prover (system description). In: *Automated Deduction – CADE-25*. Lecture Notes in Computer Science, p. 378–388. Springer. DOI: [10.1007/978-3-319-21401-6_26](https://doi.org/10.1007/978-3-319-21401-6_26).
- The mathlib Community (2020). The Lean mathematical library. In: *Proceedings of the 9th ACM SIGPLAN International Conference on Certified Programs and Proofs (CPP 2020)*, p. 367–381. ACM. DOI: [10.1145/3372885.3373824](https://doi.org/10.1145/3372885.3373824).
- Avigad, J.; de Moura, L.; Kong, S.; Ullrich, S. *Theorem Proving in Lean 4*, cap. 12 ("Axioms and Computation"). [lean-lang.org/theorem_proving_in_lean4](https://lean-lang.org/theorem_proving_in_lean4/). Acesso em 26 nov. 2026.
- Avigad, J.; Massot, P. *Mathematics in Lean*. [leanprover-community.github.io/mathematics_in_lean](https://leanprover-community.github.io/mathematics_in_lean/). Acesso em 26 nov. 2026.
- Lean FRO. About (histórico do Lean e da Lean FRO). [lean-lang.org/fro/about](https://lean-lang.org/fro/about/). Acesso em 26 nov. 2026.
- Mathlib. Mathlib statistics. [mathlib.org/mathlib_stats.html](https://mathlib.org/mathlib_stats.html). Acesso em 26 nov. 2026.
