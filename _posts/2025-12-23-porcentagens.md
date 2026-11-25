---
layout: post
image: /assets/images/percentage.avif
title: "Porcentagem — fórmulas e exemplos resolvidos."
categories: [MATEMÁTICA, GUIA]
tags: [Matemática]
lang: pt
ref: porcentagens
author: dante-bertuzzi
description: "Guia prático de porcentagens: as fórmulas, exemplos resolvidos, porcentagens sucessivas, pontos percentuais e uma aplicação real na DOI do cartório de imóveis."
mathjax: true
---

<img src="/assets/images/percentage.avif" alt="Ilustração com um quadro de fórmulas de porcentagem, um gráfico de pizza com fatias de 60%, 25% e 15%, um caderno com os exemplos 20% de 150 e 15% de 80, e uma calculadora." style="max-width: 800px; width: 100%; height: auto; display: block; margin: 1em auto; border-radius: 8px;">

Porcentagem é uma forma de comparar quantidades usando a ideia de "por cem", indicada pelo símbolo %. Em vez de dizer 0,25, dizemos 25%, o que facilita interpretar descontos, aumentos, juros, impostos, probabilidades, estatísticas e relatórios do dia a dia.

Formalmente, dizer que uma parte é $$p\%$$ de um total significa que a parte vale $$\frac{p}{100}$$ do total. Todas as fórmulas abaixo saem dessa definição.

## 1. Calcular $$p\%$$ de um valor

$$R = V \cdot \frac{p}{100}$$

**Exemplo:** calcular $$10\%$$ de $$500$$.

$$
\begin{aligned}
R &= 500 \cdot \frac{10}{100} = 500 \cdot 0{,}10 = \boxed{50}
\end{aligned}
$$

## 2. Descobrir o valor total (base)

Se $$T$$ é $$p\%$$ de um valor desconhecido $$V$$:

$$V = \frac{T}{p/100} = \frac{T \cdot 100}{p}$$

**Exemplo:** uma taxa de $$450$$ corresponde a $$5\%$$ do valor total.

$$
V = \frac{450}{0{,}05} = \frac{450 \cdot 100}{5} = \boxed{9.000}
$$

## 3. Descobrir a porcentagem

$$p = \frac{T}{V} \cdot 100$$

**Exemplo:** $$200$$ é quantos por cento de $$800$$?

$$
p = \frac{200}{800} \cdot 100 = 0{,}25 \cdot 100 = \boxed{25\%}
$$

## 4. Aumento percentual

$$V_f = V \cdot \left(1 + \frac{p}{100}\right)$$

**Exemplo:** aumentar $$1.000$$ em $$12\%$$.

$$
V_f = 1.000 \cdot (1 + 0{,}12) = 1.000 \cdot 1{,}12 = \boxed{1.120}
$$

O número $$1{,}12$$ é o **fator de aumento**: multiplicar por ele equivale a somar 12%.

## 5. Desconto percentual

$$V_f = V \cdot \left(1 - \frac{p}{100}\right)$$

**Exemplo:** aplicar desconto de $$25\%$$ sobre $$800$$.

$$
V_f = 800 \cdot (1 - 0{,}25) = 800 \cdot 0{,}75 = \boxed{600}
$$

## 6. Valor original antes de um aumento

$$V = \frac{V_f}{1 + \frac{p}{100}}$$

**Exemplo:** após um aumento de $$20\%$$, o valor passou a ser $$1.200$$.

$$
V = \frac{1.200}{1{,}20} = \boxed{1.000}
$$

Note que tirar 20% de 1.200 daria 960, e não 1.000: os 20% foram calculados sobre o valor antigo, não sobre o novo.

## 7. Valor original antes de um desconto

$$V = \frac{V_f}{1 - \frac{p}{100}}$$

**Exemplo:** após um desconto de $$10\%$$, o valor ficou em $$900$$.

$$
V = \frac{900}{0{,}90} = \boxed{1.000}
$$

## 8. Variação percentual

$$\Delta\% = \frac{V_f - V_i}{V_i} \cdot 100$$

**Exemplo:** de $$500$$ para $$650$$.

$$
\Delta\% = \frac{650 - 500}{500} \cdot 100 = \frac{150}{500} \cdot 100 = \boxed{30\%}
$$

A base é sempre o valor **inicial**. De 650 de volta para 500, a variação é $$\frac{-150}{650} \cdot 100 \approx -23{,}1\%$$, e não $$-30\%$$.

### As oito fórmulas em código

Cada fórmula vira uma função de uma linha. O código abaixo recalcula todos os exemplos acima e os exercícios do fim do post.

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
    <pre><code>using Printf

# As fórmulas do post, uma função para cada
parte(V, p)              = V * p / 100            # 1. quanto é p% de V
base(T, p)               = T * 100 / p            # 2. T é p% de qual valor?
porcentagem(T, V)        = T / V * 100            # 3. T é quantos % de V?
aumento(V, p)            = V * (1 + p / 100)      # 4. V aumentado em p%
desconto(V, p)           = V * (1 - p / 100)      # 5. V com desconto de p%
antes_do_aumento(Vf, p)  = Vf / (1 + p / 100)     # 6. valor antes de um aumento de p%
antes_do_desconto(Vf, p) = Vf / (1 - p / 100)     # 7. valor antes de um desconto de p%
variacao(Vi, Vf)         = (Vf - Vi) / Vi * 100   # 8. variação percentual de Vi para Vf

exemplos = [("1. 10% de 500", parte(500, 10)),
            ("2. 450 é 5% de", base(450, 5)),
            ("3. 200 em 800 (%)", porcentagem(200, 800)),
            ("4. 1.000 com +12%", aumento(1000, 12)),
            ("5. 800 com -25%", desconto(800, 25)),
            ("6. antes de +20% (1.200)", antes_do_aumento(1200, 20)),
            ("7. antes de -10% (900)", antes_do_desconto(900, 10)),
            ("8. de 500 para 650 (%)", variacao(500, 650)),
            ("Exercício 1", parte(450, 18)),
            ("Exercício 2", base(36, 12)),
            ("Exercício 3", aumento(desconto(200, 15), 10))]
for (texto, r) in exemplos
    @printf("%-26s %9.2f\n", texto, r)
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">1. 10% de 500                  50.00
2. 450 é 5% de               9000.00
3. 200 em 800 (%)              25.00
4. 1.000 com +12%            1120.00
5. 800 com -25%               600.00
6. antes de +20% (1.200)     1000.00
7. antes de -10% (900)       1000.00
8. de 500 para 650 (%)         30.00
Exercício 1                    81.00
Exercício 2                   300.00
Exercício 3                   187.00</pre>
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
    <pre><code># As fórmulas do post, uma função para cada
def parte(V, p):              return V * p / 100            # 1. quanto é p% de V
def base(T, p):               return T * 100 / p            # 2. T é p% de qual valor?
def porcentagem(T, V):        return T / V * 100            # 3. T é quantos % de V?
def aumento(V, p):            return V * (1 + p / 100)      # 4. V aumentado em p%
def desconto(V, p):           return V * (1 - p / 100)      # 5. V com desconto de p%
def antes_do_aumento(Vf, p):  return Vf / (1 + p / 100)     # 6. valor antes de um aumento de p%
def antes_do_desconto(Vf, p): return Vf / (1 - p / 100)     # 7. valor antes de um desconto de p%
def variacao(Vi, Vf):         return (Vf - Vi) / Vi * 100   # 8. variação percentual de Vi para Vf

exemplos = [("1. 10% de 500", parte(500, 10)),
            ("2. 450 é 5% de", base(450, 5)),
            ("3. 200 em 800 (%)", porcentagem(200, 800)),
            ("4. 1.000 com +12%", aumento(1000, 12)),
            ("5. 800 com -25%", desconto(800, 25)),
            ("6. antes de +20% (1.200)", antes_do_aumento(1200, 20)),
            ("7. antes de -10% (900)", antes_do_desconto(900, 10)),
            ("8. de 500 para 650 (%)", variacao(500, 650)),
            ("Exercício 1", parte(450, 18)),
            ("Exercício 2", base(36, 12)),
            ("Exercício 3", aumento(desconto(200, 15), 10))]
for texto, r in exemplos:
    print(f"{texto:&lt;26s} {r:9.2f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">1. 10% de 500                  50.00
2. 450 é 5% de               9000.00
3. 200 em 800 (%)              25.00
4. 1.000 com +12%            1120.00
5. 800 com -25%               600.00
6. antes de +20% (1.200)     1000.00
7. antes de -10% (900)       1000.00
8. de 500 para 650 (%)         30.00
Exercício 1                    81.00
Exercício 2                   300.00
Exercício 3                   187.00</pre>
</div>
  </div>
</div>

## 9. Porcentagens sucessivas

Aplicar duas porcentagens seguidas é multiplicar os fatores, não somar as taxas:

$$V_f = V \cdot \left(1 + \frac{a}{100}\right)\left(1 + \frac{b}{100}\right)$$

com $$a$$ ou $$b$$ negativos para descontos.

**Exemplo:** dois aumentos de $$10\%$$: $$1{,}10 \cdot 1{,}10 = 1{,}21$$, um aumento total de $$21\%$$, e não de $$20\%$$.

**Exemplo:** aumento de $$20\%$$ seguido de desconto de $$20\%$$:

$$
V_f = V \cdot 1{,}20 \cdot 0{,}80 = 0{,}96\,V \quad\Longrightarrow\quad \boxed{\text{perda de } 4\%}
$$

Um aumento e um desconto da **mesma taxa** nunca se anulam: o fator é $$(1 + r)(1 - r) = 1 - r^2$$, sempre menor que 1 (com $$r = p/100$$). Isso não quer dizer que um aumento e um desconto nunca se anulem: um aumento de 25% seguido de um desconto de 20% volta ao valor inicial, porque $$1{,}25 \cdot 0{,}80 = 1$$.

A mesma conta responde a uma pergunta comum: **depois de uma queda de $$q\%$$, quanto é preciso subir para voltar ao valor inicial?** O fator de subida tem que desfazer o de queda, $$\frac{1}{1 - q/100}$$, o que dá uma alta de

$$\frac{q}{100 - q} \cdot 100\%.$$

Uma queda de 50% exige uma alta de 100% para recuperar o valor.

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
    <pre><code># Aumento seguido de desconto de mesma taxa: o fator é (1 + p/100)(1 - p/100) = 1 - (p/100)²
println("Taxa   Fator final   Variação total")
for p in (10, 20, 50)
    f = (1 + p / 100) * (1 - p / 100)
    @printf("%3d%%   %11.4f   %+13.2f%%\n", p, f, (f - 1) * 100)
end

# Depois de uma queda de q%, quanto é preciso subir para voltar ao valor inicial?
println("\nQueda   Alta necessária")
for q in (10, 20, 25, 50, 75)
    @printf("%4d%%   %14.2f%%\n", q, q / (100 - q) * 100)
end

# Em logaritmos, variações sucessivas se somam
r = log(1.20) + log(0.80)
@printf("\nln(1,20) + ln(0,80) = %.4f  -&gt;  exp(%.4f) = %.4f\n", r, r, exp(r))</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Taxa   Fator final   Variação total
 10%        0.9900           -1.00%
 20%        0.9600           -4.00%
 50%        0.7500          -25.00%
Queda   Alta necessária
  10%            11.11%
  20%            25.00%
  25%            33.33%
  50%           100.00%
  75%           300.00%
ln(1,20) + ln(0,80) = -0.0408  -&gt;  exp(-0.0408) = 0.9600</pre>
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
    <pre><code>import math

# Aumento seguido de desconto de mesma taxa: o fator é (1 + p/100)(1 - p/100) = 1 - (p/100)²
print("Taxa   Fator final   Variação total")
for p in (10, 20, 50):
    f = (1 + p / 100) * (1 - p / 100)
    print(f"{p:3d}%   {f:11.4f}   {(f - 1) * 100:+13.2f}%")

# Depois de uma queda de q%, quanto é preciso subir para voltar ao valor inicial?
print("\nQueda   Alta necessária")
for q in (10, 20, 25, 50, 75):
    print(f"{q:4d}%   {q / (100 - q) * 100:14.2f}%")

# Em logaritmos, variações sucessivas se somam
r = math.log(1.20) + math.log(0.80)
print(f"\nln(1,20) + ln(0,80) = {r:.4f}  -&gt;  exp({r:.4f}) = {math.exp(r):.4f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Taxa   Fator final   Variação total
 10%        0.9900           -1.00%
 20%        0.9600           -4.00%
 50%        0.7500          -25.00%
Queda   Alta necessária
  10%            11.11%
  20%            25.00%
  25%            33.33%
  50%           100.00%
  75%           300.00%
ln(1,20) + ln(0,80) = -0.0408  -&gt;  exp(-0.0408) = 0.9600</pre>
</div>
  </div>
</div>

A última linha mostra outra forma de ver as porcentagens sucessivas: em **logaritmos**, os fatores se somam. $$\ln(1{,}20) + \ln(0{,}80) = -0{,}0408$$, e $$e^{-0{,}0408} = 0{,}96$$. Essa ideia volta na aplicação do fim do post.

## 10. Porcentagem de outra porcentagem

Para calcular $$p\%$$ de $$q\%$$, multiplicam-se as formas decimais:

$$
p\% \text{ de } q\% = \frac{p}{100} \cdot \frac{q}{100} = \frac{p\,q}{10.000},
\qquad\text{ou, em porcentagem,}\qquad \frac{p\,q}{100}\,\%.
$$

**Exemplo:** $$12\%$$ de $$95\%$$.

$$
\frac{12}{100}\cdot\frac{95}{100}=\frac{1.140}{10.000}=\frac{114}{1.000}=0{,}114=\boxed{11{,}4\%}
$$

Esse tipo de conta aparece quando uma fatia é parte de outra: se 95% dos alunos fizeram a prova e 12% destes tiraram nota máxima, 11,4% de **todos** os alunos tiraram nota máxima.

## Atalho: multiplicar e dividir por 100

Como $$p\%$$ de $$V$$ é $$\frac{p \cdot V}{100}$$, basta multiplicar $$p$$ por $$V$$ e depois dividir por 100: cortar dois zeros do produto ou, se não houver zeros, andar com a vírgula duas casas para a esquerda.

| Conta | Produto $$p \cdot V$$ | Dividir por 100 | Resultado |
|---|---|---|---|
| 5% de 400 | $$5 \cdot 400 = 2.000$$ | cortar dois zeros | **20** |
| 30% de 80 | $$30 \cdot 80 = 2.400$$ | cortar dois zeros | **24** |
| 30% de 500 | $$30 \cdot 500 = 15.000$$ | cortar dois zeros | **150** |
| 6% de 60 | $$6 \cdot 60 = 360$$ | cortar um zero e andar uma casa | **3,6** |
| 60% de 683 | $$60 \cdot 683 = 40.980$$ | cortar um zero e andar uma casa | **409,8** |
| 3% de 240 | $$3 \cdot 240 = 720$$ | cortar um zero e andar uma casa | **7,2** |
| 2% de 252 | $$2 \cdot 252 = 504$$ | andar duas casas | **5,04** |
| 5% de 0,43 | $$5 \cdot 0{,}43 = 2{,}15$$ | andar duas casas | **0,0215** |

Para contas de cabeça, ajudam também três referências: 10% é dividir por 10; 5% é a metade de 10%; 1% é dividir por 100. Assim, 15% de 80 é $$8 + 4 = 12$$.

---

## Conceitos adicionais

### Conversões úteis

- Percentual para decimal: $$p\% = \frac{p}{100}$$. Exemplo: $$15\% = 0{,}15$$.
- Decimal para percentual: multiplica-se por 100. Exemplo: $$0{,}23 = 23\%$$.
- Percentual para fração: escreve-se $$\frac{p}{100}$$ e simplifica-se. Exemplos: $$50\% = \frac{1}{2}$$ e $$2{,}5\% = \frac{25}{1.000} = \frac{1}{40}$$.

### Como se leem as frações

A palavra "**avos**" só aparece na leitura de algumas frações. A regra é:

- **denominador de 2 a 9:** nomes próprios. $$\frac{1}{2}$$ é "um meio" (ou "metade"), $$\frac{1}{3}$$ "um terço", $$\frac{3}{4}$$ "três quartos", depois quinto, sexto, sétimo, oitavo e nono;
- **denominador 10, 100, 1.000…:** décimos, centésimos, milésimos. $$\frac{3}{100}$$ é "três centésimos";
- **os demais denominadores:** lê-se o número seguido de "avos". $$\frac{1}{12}$$ é "um doze avos", e $$\frac{7}{15}$$, "sete quinze avos".

Assim, $$\frac{1}{4}$$ é "um quarto", nunca "quatro avos". E a porcentagem é, literalmente, uma contagem em **centésimos**: $$3\% = \frac{3}{100}$$, "três centésimos".

### Pontos percentuais e variação percentual

Se uma taxa sobe de $$5\%$$ para $$8\%$$:

- o aumento é de **3 pontos percentuais** (a diferença entre as taxas);
- a variação percentual é de $$\frac{8 - 5}{5} \cdot 100 = 60\%$$ (o quanto a taxa cresceu em relação a ela mesma).

As duas frases são verdadeiras, mas dizem coisas diferentes. "A inflação subiu 3%" é ambíguo; "subiu 3 pontos percentuais" não é.

### Porcentagens ponderadas

Quando grupos de tamanhos diferentes têm porcentagens diferentes, a porcentagem do conjunto é a média ponderada pelos tamanhos:

$$\bar{p} = \frac{\sum_i w_i\, p_i}{\sum_i w_i}$$

**Exemplo:** a turma A, com 30 alunos, teve 80% de aprovação, e a turma B, com 20 alunos, 70%:

$$\bar{p}=\frac{30\cdot80 + 20\cdot70}{30+20} = \frac{2.400+1.400}{50}=76\%$$

A média simples, $$\frac{80 + 70}{2} = 75\%$$, estaria errada: ela trataria as duas turmas como se tivessem o mesmo tamanho.

### Erros comuns

- Confundir pontos percentuais com variação percentual.
- Somar taxas sucessivas em vez de multiplicar os fatores.
- Achar que um aumento e um desconto da mesma taxa se anulam.
- Calcular a variação sobre a base errada (sobre o valor final, em vez do inicial).
- Tirar a média simples de porcentagens de grupos de tamanhos diferentes.

### Exercícios propostos (com resposta)

1. Quanto é $$18\%$$ de $$450$$? Resposta: $$81$$.
2. Se $$x$$ representa $$12\%$$ de $$V$$ e $$x=36$$, qual é $$V$$? Resposta: $$300$$.
3. Uma mercadoria custa $$200$$; aplica-se um desconto de $$15\%$$ e depois um acréscimo de $$10\%$$. Qual o preço final? Resposta: $$200\cdot0{,}85\cdot1{,}10=187$$.

---

## Aplicação: venda parcial de um imóvel e a DOI

Sempre que um imóvel é comprado ou vendido, o cartório informa a operação à Receita Federal na **DOI** (Declaração sobre Operações Imobiliárias). Pela Instrução Normativa RFB nº 2.186/2024 (art. 4º), a obrigação é do cartório de notas, quando lavra a escritura, e do cartório de registro de imóveis em alguns casos, como quando o título é um instrumento particular. A DOI pede, para cada vendedor (alienante) e cada comprador (adquirente), um **percentual de participação na operação**. Quando só uma parte do imóvel é vendida, esse percentual não é o mesmo que a parte de cada um no imóvel, e é aí que entra a porcentagem.

### O problema

Cinco pessoas são coproprietárias de um imóvel urbano de $$2.000\ \text{m}^2$$, registrado numa única matrícula. Cada uma tem uma **fração ideal** do imóvel. Quatro delas vão vender suas partes; a quinta, que tem $$35\%$$, não vai vender.

| Coproprietário | Fração ideal do imóvel | Situação |
|---|---|---|
| Marcos | 40% | vende |
| Leandro | 15% | vende |
| João | 8% | vende |
| Pedro | 2% | vende |
| Quinta pessoa | 35% | não vende |
| **Total** | **100%** | |

A parte vendida é

$$40\% + 15\% + 8\% + 2\% = 65\%$$

do imóvel, ou $$0{,}65 \cdot 2.000 = 1.300\ \text{m}^2$$. Na DOI, esse é o **valor da parte transacionada**, que o manual da Receita manda informar "em relação ao imóvel", como percentual ou como área.

### O que a DOI pede

O manual de preenchimento da Receita (versão 1.1, de abril de 2025) diz:

- "O percentual de propriedade no imóvel é diferente do percentual de participação na operação."
- "O percentual de participação deve ser informado conforme a participação de cada alienante na operação levada a cartório."
- "A soma das participações não poderá ser inferior a 99,00% ou superior 100,00%."

Ou seja, a parte vendida passa a ser a nova base de 100%, e a quinta pessoa não entra, porque não é alienante. O próprio manual traz um exemplo assim: a viúva, com 50% do imóvel, e seis irmãos, com 7,14% cada, vendem 92,84% do imóvel a um sétimo irmão; na DOI, a viúva aparece com 53,86% e cada irmão com 7,69%.

### A conta

A participação de cada vendedor é a sua fração dividida pelo total vendido, a fórmula 3 do começo do post:

$$x_i = \frac{p_i}{65} \cdot 100$$

Em forma vetorial, isso é multiplicar o vetor das frações dos vendedores por um único número:

$$
\mathbf{x} = \lambda\,\mathbf{p}, \qquad
\mathbf{p} = \begin{pmatrix} 40 \\ 15 \\ 8 \\ 2 \end{pmatrix}, \qquad
\lambda = \frac{100}{65} = \frac{20}{13}.
$$

O valor de $$\lambda$$ sai da condição de que as participações somem 100: $$40\lambda + 15\lambda + 8\lambda + 2\lambda = 65\lambda = 100$$. Como todos são multiplicados pelo mesmo $$\lambda$$, as proporções entre os vendedores ($$40 : 15 : 8 : 2$$) não mudam.

$$
\mathbf{x} = \frac{20}{13}\begin{pmatrix} 40 \\ 15 \\ 8 \\ 2 \end{pmatrix}
= \begin{pmatrix} 800/13 \\ 300/13 \\ 160/13 \\ 40/13 \end{pmatrix}
\approx \begin{pmatrix} 61{,}54 \\ 23{,}08 \\ 12{,}31 \\ 3{,}08 \end{pmatrix},
\qquad
\frac{800 + 300 + 160 + 40}{13} = \frac{1.300}{13} = 100.
$$

### Cuidado com o arredondamento

As frações exatas somam 100%, mas os valores arredondados para duas casas somam $$61{,}54 + 23{,}08 + 12{,}31 + 3{,}08 = 100{,}01\%$$, acima do limite de 100,00% do manual. O código abaixo faz a conta com frações exatas e mostra duas formas de cair na faixa aceita: truncar as quatro participações (soma 99,97%) ou arredondar e tirar o centésimo que sobra da maior parcela (soma 100,00%). Ele também refaz o exemplo do manual.

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
    <pre><code># Frações ideais dos quatro vendedores, em % do imóvel
nomes  = ["Marcos", "Leandro", "João", "Pedro"]
fracao = [40, 15, 8, 2]
S = sum(fracao)                                   # parte transacionada
@printf("Parte transacionada: %d%% do imóvel (%d m² de 2.000 m²)\n\n", S, 2000 * S ÷ 100)

fr(x) = denominator(x) == 1 ? string(numerator(x)) : string(numerator(x), "/", denominator(x))
exata = fracao .* 100 .// S                       # participação na operação, em %, sem arredondar
arred = round.(Int, exata .* 100)                 # em centésimos de ponto percentual
trunca = floor.(Int, exata .* 100)

println("Vendedor   % do imóvel   Participação exata   Arredondada   Truncada")
for i in eachindex(nomes)
    @printf("%-8s %13d   %6s = %8.4f %13.2f %10.2f\n", nomes[i], fracao[i], fr(exata[i]),
            float(exata[i]), arred[i] / 100, trunca[i] / 100)
end
@printf("%-8s %13d   %6s = %8.4f %13.2f %10.2f\n", "Soma", S, fr(sum(exata)),
        float(sum(exata)), sum(arred) / 100, sum(trunca) / 100)

ajuste = copy(arred)
ajuste[argmax(ajuste)] -= sum(arred) - 10_000     # tira o centésimo que sobra da maior parcela
@printf("\nCom ajuste na maior parcela: %s = %.2f\n",
        join([@sprintf("%.2f", a / 100) for a in ajuste], " + "), sum(ajuste) / 100)

# O exemplo 3 do manual da Receita: a viúva (50%) e seis irmãos (7,14% cada) vendem 92,84%
manual = [5000; fill(714, 6)] .// 9284 .* 100
@printf("Manual: viúva %.2f%%, cada irmão %.2f%%, soma arredondada %.2f%%\n",
        manual[1], manual[2], sum(round.(Int, manual .* 100)) / 100)</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Parte transacionada: 65% do imóvel (1300 m² de 2.000 m²)
Vendedor   % do imóvel   Participação exata   Arredondada   Truncada
Marcos              40   800/13 =  61.5385         61.54      61.53
Leandro             15   300/13 =  23.0769         23.08      23.07
João                 8   160/13 =  12.3077         12.31      12.30
Pedro                2    40/13 =   3.0769          3.08       3.07
Soma                65      100 = 100.0000        100.01      99.97
Com ajuste na maior parcela: 61.53 + 23.08 + 12.31 + 3.08 = 100.00
Manual: viúva 53.86%, cada irmão 7.69%, soma arredondada 100.00%</pre>
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
    <pre><code>from fractions import Fraction

# Frações ideais dos quatro vendedores, em % do imóvel
nomes  = ["Marcos", "Leandro", "João", "Pedro"]
fracao = [40, 15, 8, 2]
S = sum(fracao)                                   # parte transacionada
print(f"Parte transacionada: {S}% do imóvel ({2000 * S // 100} m² de 2.000 m²)\n")

exata = [Fraction(f * 100, S) for f in fracao]    # participação na operação, em %, sem arredondar
arred = [round(x * 100) for x in exata]           # em centésimos de ponto percentual
trunca = [math.floor(x * 100) for x in exata]

print("Vendedor   % do imóvel   Participação exata   Arredondada   Truncada")
for nome, f, x, a, t in zip(nomes, fracao, exata, arred, trunca):
    print(f"{nome:&lt;8s} {f:13d}   {str(x):&gt;6s} = {float(x):8.4f} {a / 100:13.2f} {t / 100:10.2f}")
print(f"{'Soma':&lt;8s} {S:13d}   {str(sum(exata)):&gt;6s} = {float(sum(exata)):8.4f} "
      f"{sum(arred) / 100:13.2f} {sum(trunca) / 100:10.2f}")

ajuste = arred.copy()
ajuste[ajuste.index(max(ajuste))] -= sum(arred) - 10_000   # tira o centésimo que sobra da maior parcela
print(f"\nCom ajuste na maior parcela: {' + '.join(f'{a / 100:.2f}' for a in ajuste)} = {sum(ajuste) / 100:.2f}")

# O exemplo 3 do manual da Receita: a viúva (50%) e seis irmãos (7,14% cada) vendem 92,84%
manual = [Fraction(v, 9284) * 100 for v in [5000] + [714] * 6]
print(f"Manual: viúva {float(manual[0]):.2f}%, cada irmão {float(manual[1]):.2f}%, "
      f"soma arredondada {sum(round(m * 100) for m in manual) / 100:.2f}%")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">Parte transacionada: 65% do imóvel (1300 m² de 2.000 m²)
Vendedor   % do imóvel   Participação exata   Arredondada   Truncada
Marcos              40   800/13 =  61.5385         61.54      61.53
Leandro             15   300/13 =  23.0769         23.08      23.07
João                 8   160/13 =  12.3077         12.31      12.30
Pedro                2    40/13 =   3.0769          3.08       3.07
Soma                65      100 = 100.0000        100.01      99.97
Com ajuste na maior parcela: 61.53 + 23.08 + 12.31 + 3.08 = 100.00
Manual: viúva 53.86%, cada irmão 7.69%, soma arredondada 100.00%</pre>
</div>
  </div>
</div>

O manual fixa só a faixa (de 99,00% a 100,00%), não o método. A escolha entre truncar e ajustar a maior parcela fica a critério de quem preenche.

### A mesma conta com exponencial e logaritmo

A divisão $$\frac{p_i}{65}$$ também pode ser escrita só com exponencial e logaritmo, porque $$\frac{a}{b} = e^{\ln a - \ln b}$$:

$$x_i = 100 \cdot e^{\ln p_i - \ln 65}$$

Para Marcos: $$\ln 40 - \ln 65 = \ln\frac{40}{65}$$, e $$e^{\ln(40/65)} = \frac{40}{65} = \frac{8}{13}$$, de modo que $$x_M = \frac{800}{13} \approx 61{,}54\%$$, o mesmo resultado.

Essa forma lembra o **operador EML** (*exp-minus-log*), apresentado por Andrzej Odrzywołek em 2026 e explicado em detalhe no post [O operador EML](/operador-eml-funcoes-elementares/):

$$\operatorname{eml}(x, y) = e^x - \ln y.$$

O artigo mostra que esse único operador, junto com a constante 1, gera todas as funções de uma calculadora científica. Duas das identidades:

$$e^x = \operatorname{eml}(x, 1), \qquad \ln z = \operatorname{eml}\big(1, \operatorname{eml}(\operatorname{eml}(1, z), 1)\big).$$

A segunda pode ser conferida à mão: $$\operatorname{eml}(1, z) = e - \ln z$$; depois, $$\operatorname{eml}(e - \ln z, 1) = e^{e - \ln z} = \frac{e^e}{z}$$; por fim, $$\operatorname{eml}\!\left(1, \frac{e^e}{z}\right) = e - (e - \ln z) = \ln z$$.

A fórmula da DOI acima usa exponencial e logaritmo, mas não o operador EML. É uma curiosidade, não um método melhor: para preencher a DOI, a divisão direta basta. O código confere as duas identidades e recalcula as participações pela forma exponencial.

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
    <pre><code>eml(x, y) = exp(x) - log(y)                       # o operador de Odrzywołek (2026)

@printf("eml(0,5; 1)               = %.10f   e^0,5 = %.10f\n", eml(0.5, 1), exp(0.5))
@printf("eml(1; eml(eml(1; 65); 1)) = %.10f   ln 65 = %.10f\n", eml(1, eml(eml(1, 65), 1)), log(65))

# A participação de cada vendedor escrita só com exp e ln
println()
for (nome, f) in zip(nomes, fracao)
    @printf("%-8s 100 exp(ln %2d - ln %d) = %8.4f\n", nome, f, S, 100 * exp(log(f) - log(S)))
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">eml(0,5; 1)               = 1.6487212707   e^0,5 = 1.6487212707
eml(1; eml(eml(1; 65); 1)) = 4.1743872699   ln 65 = 4.1743872699
Marcos   100 exp(ln 40 - ln 65) =  61.5385
Leandro  100 exp(ln 15 - ln 65) =  23.0769
João     100 exp(ln  8 - ln 65) =  12.3077
Pedro    100 exp(ln  2 - ln 65) =   3.0769</pre>
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
    <pre><code>def eml(x, y): return math.exp(x) - math.log(y)   # o operador de Odrzywołek (2026)

print(f"eml(0,5; 1)               = {eml(0.5, 1):.10f}   e^0,5 = {math.exp(0.5):.10f}")
print(f"eml(1; eml(eml(1; 65); 1)) = {eml(1, eml(eml(1, 65), 1)):.10f}   ln 65 = {math.log(65):.10f}")

# A participação de cada vendedor escrita só com exp e ln
print()
for nome, f in zip(nomes, fracao):
    print(f"{nome:&lt;8s} 100 exp(ln {f:2d} - ln {S}) = {100 * math.exp(math.log(f) - math.log(S)):8.4f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">eml(0,5; 1)               = 1.6487212707   e^0,5 = 1.6487212707
eml(1; eml(eml(1; 65); 1)) = 4.1743872699   ln 65 = 4.1743872699
Marcos   100 exp(ln 40 - ln 65) =  61.5385
Leandro  100 exp(ln 15 - ln 65) =  23.0769
João     100 exp(ln  8 - ln 65) =  12.3077
Pedro    100 exp(ln  2 - ln 65) =   3.0769</pre>
</div>
  </div>
</div>

## Referências

1. RECEITA FEDERAL. *Declaração sobre Operações Imobiliárias (DOI): orientações para o preenchimento manual*. Versão 1.1, abr. 2025. Disponível em: <https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/doi/doi-preenchimento.pdf>. Acesso em: 25 nov. 2026.
2. BRASIL. Receita Federal. *Instrução Normativa RFB nº 2.186, de 12 de abril de 2024*. Dispõe sobre a Declaração sobre Operações Imobiliárias (DOI). Disponível em: <https://www.normasbrasil.com.br/norma/instrucao-normativa-2186-2024_457803.html>. Acesso em: 25 nov. 2026.
3. ODRZYWOŁEK, A. *All elementary functions from a single binary operator*. arXiv:2603.21852, 2026. Disponível em: <https://arxiv.org/abs/2603.21852>. Acesso em: 25 nov. 2026.
4. TODA MATÉRIA. *O que é fração?* (regras para a leitura das frações). Disponível em: <https://www.todamateria.com.br/o-que-e-fracao/>. Acesso em: 25 nov. 2026.
