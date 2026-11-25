---
layout: page
title: Eventos Independentes e a Regra do Produto
lang: pt
ref: eventos-independentes
parent: probabilidade
permalink: /pt/probabilidade/eventos-independentes
order: 5
mathjax: true
description: "Quando multiplicar probabilidades, o que quer dizer \"1 em N\", por que arredondar antes muda o resultado e quando a regra do produto falha, com código em Julia."
---

Muita conta de probabilidade do dia a dia é uma multiplicação: a chance de
tirar cara cinco vezes seguidas, de acertar a loteria, de chutar todas as
questões de uma prova e acertar. Esta página explica quando essa
multiplicação é permitida, como transformar o resultado em "1 em N" e um
cuidado que muda a resposta mais do que parece: arredondar no meio do
caminho.

## Independência

Dois eventos são **independentes** quando saber que um aconteceu não muda a
chance do outro. Lançar uma moeda e um dado: a moeda dar cara não diz nada
sobre o número do dado. Formalmente, $A$ e $B$ são independentes quando

$$
P(A \mid B) = P(A),
$$

ou seja, a [probabilidade condicional](/pt/probabilidade/probabilidade-condicional)
de $A$ dado $B$ é igual à probabilidade de $A$ sem informação nenhuma.

Essa forma só faz sentido quando $P(B) > 0$, porque a probabilidade
condicional divide por $P(B)$. Por isso a definição usada nos livros é a da
próxima seção, $P(A \cap B) = P(A) \cdot P(B)$, que vale sempre e deixa claro
que a relação é simétrica: se $A$ não muda a chance de $B$, $B$ também não
muda a chance de $A$.

**Independente não é o mesmo que mutuamente exclusivo.** Eventos mutuamente
exclusivos não podem acontecer juntos, como um dado dar 1 e dar 2 no mesmo
lançamento. Se os dois têm alguma chance de acontecer, eles nunca são
independentes: saber que deu 1 faz a chance de ter dado 2 cair para zero. A
regra do produto da próxima seção falha para eles: $P(A \cap B) = 0$, mas
$P(A) \cdot P(B) = \tfrac{1}{36}$.

## A regra do produto

Se $A$ e $B$ são independentes, a chance de os dois acontecerem é o produto
das chances:

$$
P(A \cap B) = P(A) \cdot P(B).
$$

Moeda dar cara **e** dado dar 6: $\tfrac12 \cdot \tfrac16 = \tfrac{1}{12}$.

A regra vale para quantos eventos você quiser, desde que sejam
**mutuamente independentes**:

$$
P(A_1 \cap A_2 \cap \cdots \cap A_n) = P(A_1) \cdot P(A_2) \cdots P(A_n).
$$

"Mutuamente" pede mais do que parece: não basta que cada par seja
independente. Lance duas moedas e considere $A$ = "a primeira dá cara", $B$ =
"a segunda dá cara" e $C$ = "as duas dão o mesmo resultado". Cada um tem
chance $\tfrac12$, e qualquer par deles é independente: cada interseção de
dois tem chance $\tfrac14 = \tfrac12 \cdot \tfrac12$. Mas, se $A$ e $B$
acontecem, $C$ acontece com certeza, e $P(A \cap B \cap C) = \tfrac14$, não
$\tfrac18$. Para três ou mais eventos, a independência tem de valer para
todos os subgrupos ao mesmo tempo.

## Exemplo: chutar uma prova inteira

Uma prova tem 8 questões de múltipla escolha, com quantidades diferentes de
alternativas. Você não estudou nada e chuta todas. Qual a chance de acertar
as 8?

| Questão | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Alternativas | 3 | 3 | 4 | 4 | 5 | 5 | 6 | 7 |
| Chance de acertar | 1/3 | 1/3 | 1/4 | 1/4 | 1/5 | 1/5 | 1/6 | 1/7 |

Se cada chute é uma escolha ao acaso entre as alternativas, chutes em
questões diferentes são independentes (acertar a primeira não ajuda nem
atrapalha a segunda), então a regra do produto vale:

$$
P(\text{acertar as 8}) = \frac13 \cdot \frac13 \cdot \frac14 \cdot \frac14 \cdot \frac15 \cdot \frac15 \cdot \frac16 \cdot \frac17
= \frac{1}{151.200}.
$$

Em decimal, isso é $0{,}0000066$, ou $6{,}61 \times 10^{-6}$ em
[notação científica](/matematica-basica/potencias.html).

## O que quer dizer "1 em N"

Uma probabilidade pequena fica mais fácil de imaginar invertida. "1 em N"
quer dizer que a probabilidade é $p = 1/N$; então, para achar o N, basta
inverter:

$$
N = \frac{1}{p} = \frac{1}{1/151.200} = 151.200.
$$

A chance de acertar a prova inteira no chute é de **1 em 151.200**. O que
isso quer dizer, na prática, é uma média: em muitas tentativas, sai um acerto
a cada 151.200, em média.

Isso **não** quer dizer que, chutando 151.200 provas, você acerta uma com
certeza. A chance de acertar pelo menos uma vez em $N$ tentativas é $1$
menos a chance de errar todas, e errar todas é, de novo, um produto de
eventos independentes (as tentativas não influenciam umas às outras):

$$
P(\text{pelo menos uma}) = 1 - (1 - p)^N = 1 - \left(1 - \frac{1}{151.200}\right)^{151.200} \approx 63{,}2\%.
$$

Esse 63,2% não é coincidência: para qualquer probabilidade pequena, tentar
$N = 1/p$ vezes dá chance de cerca de $1 - 1/e \approx 63{,}2\%$. Com o dobro
de tentativas, 86,5%. O
[post sobre a Mega-Sena](/mega-sena-frequencias/) faz a mesma conta com
apostas.

O mesmo truque do complemento responde a uma pergunta mais animadora: a
chance de acertar **pelo menos uma** das 8 questões é $1$ menos a chance de
errar todas, $1 - \tfrac23 \cdot \tfrac23 \cdot \tfrac34 \cdot \tfrac34 \cdot
\tfrac45 \cdot \tfrac45 \cdot \tfrac56 \cdot \tfrac67 = 88{,}6\%$.

## Cuidado: arredondar antes de multiplicar

As probabilidades raramente chegam como frações. Em geral chegam em
decimal, já arredondadas. Veja o que acontece com o mesmo exemplo:

| Como os fatores foram escritos | Produto | N = 1/p | Erro no N |
|---|---:|---:|---:|
| Frações exatas | $6{,}6138 \times 10^{-6}$ | 151.200 | — |
| Cada fator com 3 casas (0,333; 0,250; ... 0,143) | $6{,}6204 \times 10^{-6}$ | 151.049 | −0,1% |
| Cada fator com 2 casas (0,33; 0,25; ... 0,14) | $6{,}4796 \times 10^{-6}$ | 154.332 | +2,1% |
| Produto exato arredondado para $7 \times 10^{-6}$ | $7 \times 10^{-6}$ | 142.857 | −5,5% |

Nenhum desses arredondamentos parece grave sozinho. O problema é que, numa
multiplicação, os **erros relativos se somam** (aproximadamente, quando são
pequenos). Com duas casas, 0,33 está 1%
abaixo de 1/3 (e aparece duas vezes), 0,17 está 2% acima de 1/6, e 0,14 está
2% abaixo de 1/7: $-1\% - 1\% + 2\% - 2\% = -2\%$. O produto sai 2,0% abaixo
do certo, e o N, 2,1% acima. Com oito fatores, oito pequenos erros têm muitas
chances de se acumular.

Com três casas, o erro quase sumiu por dois motivos. Os erros dos fatores
ficaram de dez a vinte vezes menores (0,333 está 0,1% abaixo de 1/3, e 0,167 e 0,143
ficam 0,2% e 0,1% acima de 1/6 e 1/7), e, além disso, tinham sinais
diferentes e se cancelaram em parte. A primeira coisa dá para controlar
guardando mais casas; a segunda é sorte.

Por isso, quando duas contas que deveriam dar o mesmo resultado chegam a
números um pouco diferentes, como 1 em 8.895 e 1 em 8.929, o primeiro
suspeito é esse: uma usou os valores completos, a outra arredondou no meio.
A regra é a mesma de
[arredondamento e algarismos significativos](/matematica-basica/arredondamento.html):
faça a conta com todos os algarismos que tiver e arredonde **só o
resultado final**.

## Quando não dá para multiplicar

A regra do produto só vale para eventos independentes. Quando um evento
muda a chance do outro, é preciso usar a probabilidade condicional:

$$
P(A \cap B) = P(A) \cdot P(B \mid A).
$$

Tirar dois ases seguidos de um baralho de 52 cartas, **sem devolver** a
primeira: a chance do primeiro ás é $\tfrac{4}{52}$, mas, se ele saiu,
sobram 3 ases em 51 cartas, então

$$
P(\text{dois ases}) = \frac{4}{52} \cdot \frac{3}{51} = \frac{1}{221}.
$$

Multiplicar como se fossem independentes, $\tfrac{4}{52} \cdot \tfrac{4}{52}$,
daria $\tfrac{1}{169}$: uma chance 31% maior que a verdadeira.

No mundo real, a independência é uma suposição, e muitas vezes falsa.
Chover hoje aumenta a chance de chover amanhã; um voo atrasado atrasa a
conexão seguinte. Multiplicar probabilidades de eventos que andam juntos
costuma subestimar a chance de todos acontecerem ao mesmo tempo.

## Em Julia

Para não arredondar nada no caminho, dá para usar frações exatas, com o
operador `//`:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code>alternativas = [3, 3, 4, 4, 5, 5, 6, 7]

# Frações exatas: nada é arredondado no caminho
p = prod(1 .// alternativas)
N = 1 / p
println("p = ", p, "   N = ", N)

# O mesmo produto com cada fator arredondado para 2 casas
p2 = prod(round.(1 ./ alternativas, digits = 2))
N2 = 1 / p2
println("Com 2 casas: N ≈ ", round(N2, digits = 1),
        "   erro no N: ", round(100 * (N2 / N - 1), digits = 1), "%")

# Chance de acertar ao menos uma vez em N tentativas independentes
pelo_menos_uma = 1 - (1 - Float64(p))^Float64(N)
println("P(pelo menos uma em N tentativas) = ", round(pelo_menos_uma, digits = 4))</code></pre>
  </div>
</div>

#### Saída esperada:
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <div>p = 1//151200   N = 151200//1</div>
  <div>Com 2 casas: N ≈ 154331.7   erro no N: 2.1%</div>
  <div>P(pelo menos uma em N tentativas) = 0.6321</div>
</div>

Quando os valores vêm em decimal e não há frações por trás, a recomendação
é a mesma: guarde os números com todas as casas que tiver e só arredonde o
que for mostrar.

## Resumo

- Eventos são independentes quando um não muda a chance do outro. Isso é
  diferente de serem mutuamente exclusivos.
- Para eventos mutuamente independentes, a chance de todos acontecerem é o
  produto das chances. Independência de cada par não basta.
- "1 em N" é o inverso da probabilidade: $N = 1/p$, um acerto a cada N
  tentativas, em média. Não garante sucesso em N tentativas: para $p$
  pequeno, a chance é de cerca de 63%.
- Arredondar os fatores antes de multiplicar acumula erros relativos.
  Arredonde só no fim.
- Se os eventos não são independentes, use $P(A) \cdot P(B \mid A)$.

## Referências

1. Bussab, W. O.; Morettin, P. A. (2023). *Estatística Básica*. 10. ed. Saraiva Uni.
2. Ross, S. M. (2012). *A First Course in Probability*. 9th ed. Pearson.
