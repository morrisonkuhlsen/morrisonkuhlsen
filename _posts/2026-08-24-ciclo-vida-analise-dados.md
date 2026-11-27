---
layout: post
image: /assets/images/capa-ciclo-vida-dados.avif
title: "O ciclo de vida da análise de dados: da pergunta de negócio ao monitoramento em produção"
categories: [ANÁLISE DE DADOS, ESTATÍSTICA, GUIA]
lang: pt
tags: [Análise de dados, Estatística, Julia, R, Python, Lean]
ref: ciclo-vida-analise-dados
author: dante-bertuzzi
description: "As oito etapas do ciclo de vida da análise de dados, do problema ao monitoramento: o erro típico de cada uma, quando encerrá-la e os frameworks clássicos."
slug: ciclo-de-vida-da-analise-de-dados
---

Análise de dados quase nunca é aquilo que os cursos desenham: uma linha reta que começa numa planilha e termina num gráfico bonito. Na prática é um **ciclo** — etapas encadeadas, com voltas frequentes a fases anteriores, cujo objetivo não é produzir um gráfico, mas produzir uma **decisão defensável**.

Neste post percorro as oito etapas desse ciclo: o que caracteriza cada uma, o erro típico que se comete nela, e o critério que permite dizer "esta etapa está concluída". No fim, mostro como os frameworks clássicos — CRISP-DM, KDD, SEMMA, OSEMN — dizem quase as mesmas coisas com nomes diferentes.

<style>
/* Caixas de destaque e tabelas deste post. O tema não define nenhuma das duas,
   e o conteúdo aqui é majoritariamente comparativo — sem isso as colunas
   encostam umas nas outras e os destaques somem no meio do texto. */
.ciclo-box {
  border-left: 4px solid #1F3A5F;
  background: rgba(31, 58, 95, .06);
  border-radius: 4px;
  padding: 1em 1.2em;
  margin: 1.8em 0;
}
.ciclo-box > p:first-child { margin-top: 0; }
.ciclo-box > :last-child { margin-bottom: 0; }
.ciclo-box .ciclo-box-title {
  display: block;
  font-weight: 700;
  color: #1F3A5F;
  margin-bottom: .5em;
  letter-spacing: .01em;
}
/* O azul do diagrama fica ilegível sobre o fundo do tema escuro. */
[data-theme="dark"] .ciclo-box {
  border-left-color: #7FA8D4;
  background: rgba(127, 168, 212, .08);
}
[data-theme="dark"] .ciclo-box .ciclo-box-title { color: #9CC0E6; }
.ciclo-table { overflow-x: auto; margin: 1.6em 0; }
.ciclo-table table { border-collapse: collapse; width: 100%; }
.ciclo-table th,
.ciclo-table td {
  padding: .5em .9em;
  border-bottom: 1px solid rgba(128,128,128,.22);
  text-align: left;
  vertical-align: top;
}
.ciclo-table thead th { border-bottom: 2px solid rgba(128,128,128,.45); }
</style>

---

## 1. O ciclo, em uma figura

O ciclo de vida organiza o trabalho analítico em etapas com entradas, saídas e critérios de qualidade definidos. A propriedade mais importante dele é a que a figura tenta deixar explícita: **isso não é uma esteira**.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/ciclo-vida-analise-dados.png" alt="Diagrama circular com as oito etapas do ciclo de vida da análise de dados — definição do problema, coleta de dados, preparação e limpeza, análise exploratória, modelagem e inferência, validação e interpretação, comunicação dos resultados, implantação e monitoramento — ligadas por setas contínuas no sentido do fluxo principal e por setas tracejadas indicando os retornos frequentes a etapas anteriores" style="max-width: 780px; width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura 1:</strong> as oito etapas do ciclo. As setas contínuas são o fluxo principal; as tracejadas são os retornos que acontecem em praticamente todo projeto real — a exploração redefinindo a pergunta, a validação exigindo nova preparação, o monitoramento abrindo a próxima iteração. Diagrama gerado em Julia (CairoMakie) para este post.
  </figcaption>
</figure>

As três setas tracejadas não são enfeite nem sinal de projeto malfeito. São o comportamento normal do trabalho analítico: descobertas feitas na exploração reformulam a pergunta original, e o que se observa em produção alimenta a iteração seguinte.

<div class="ciclo-box" markdown="1">
<span class="ciclo-box-title">Onde vai o tempo</span>
Em muitos projetos, a preparação e a limpeza dos dados tomam mais tempo que qualquer outra etapa. Não há um número universal para essa fração: ela depende da qualidade dos dados de origem e do quanto a coleta foi pensada para a pergunta.

A etapa mais cara costuma ser a menos glamourosa — e é ela que determina a qualidade de todo o resto.
</div>

---

## 2. Definição do problema

Nenhuma técnica compensa uma pergunta mal formulada. Esta etapa converte uma demanda vaga (*"queremos entender o churn"*) em uma pergunta analítica respondível, com escopo, unidade de análise e critério de sucesso explícitos.

- **Entrada:** demanda de negócio, contexto do domínio, restrições de prazo e de dados.
- **Saída:** pergunta operacionalizada, hipóteses, métricas de sucesso, definição da população e do horizonte temporal.

Quatro perguntas precisam de resposta antes de escrever a primeira linha de código:

1. **Qual decisão será tomada com base neste resultado?** Se nenhuma, o projeto é opcional.
2. **Qual é a unidade de análise** — cliente, transação, sessão, mês?
3. **O que se pretende:** *descrever* (o que aconteceu), *diagnosticar* (por quê), *prever* (o que vai acontecer) ou *prescrever* (o que fazer)?
4. **Qual seria um resultado inconveniente**, e ele ainda assim seria aceito?

A quarta é a que mais gente pula, e é a que separa análise de encomenda. Se a resposta é "não", o que se está pedindo não é uma análise.

**Armadilha típica:** confundir uma métrica com o conceito que ela representa. "Engajamento" não é "número de cliques"; escolher o proxy errado aqui contamina irreversivelmente todas as etapas seguintes — e o pior é que nada nas etapas seguintes vai acusar o erro.

---

## 3. Coleta e aquisição dos dados

Aqui se reúne o material bruto: bancos transacionais, *data warehouses*, APIs, arquivos de terceiros, *web scraping*, instrumentação de produto, pesquisas e experimentos desenhados.

A distinção que mais importa:

- **Dados primários** são gerados para responder à *sua* pergunta (experimentos, questionários) — caros, mas alinhados ao problema.
- **Dados secundários** já existem (logs, sistemas internos, bases públicas) — baratos, mas coletados para outro propósito, o que introduz vieses silenciosos.

Três cuidados centrais:

- **Representatividade.** O mecanismo que gerou os dados também decide quem *não* está neles. Sobreviventes, respondentes e usuários ativos raramente representam a população de interesse.
- **Rastreabilidade.** Registre origem, data de extração, query utilizada e versão da base. Análise sem procedência não é reproduzível — e, seis meses depois, ninguém lembra de qual snapshot saiu aquele número.
- **Conformidade.** Base legal para o tratamento, minimização de dados pessoais, anonimização quando possível (LGPD/GDPR).

---

## 4. Preparação, limpeza e transformação

A etapa mais longa, e por larga margem. Dados brutos praticamente nunca estão em condição de análise. O objetivo é chegar a um conjunto *tidy*: **cada linha uma observação, cada coluna uma variável, cada célula um valor**.

<div class="ciclo-table">
<table>
  <thead>
    <tr>
      <th>Problema</th>
      <th>Tratamento usual</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Dados faltantes</strong></td>
      <td>Diagnosticar o mecanismo (MCAR, MAR, MNAR) antes de decidir; descarte, imputação simples ou múltipla. Nunca imputar sem registrar o que foi imputado.</td>
    </tr>
    <tr>
      <td><strong>Duplicatas</strong></td>
      <td>Definir a chave que identifica uma observação única; deduplicar por regra explícita, não por intuição.</td>
    </tr>
    <tr>
      <td><strong>Inconsistências de tipo e formato</strong></td>
      <td>Padronizar datas, unidades, codificação de texto e categorias escritas de formas diferentes ("SP", "S.P.", "São Paulo").</td>
    </tr>
    <tr>
      <td><strong><em>Outliers</em></strong></td>
      <td>Separar erro de medição de valor legítimo extremo. O segundo caso costuma ser o mais informativo do conjunto.</td>
    </tr>
    <tr>
      <td><strong>Escalas e distribuições</strong></td>
      <td>Padronização, normalização, transformações (log, Box–Cox) quando o método posterior exigir.</td>
    </tr>
    <tr>
      <td><strong>Variáveis derivadas</strong></td>
      <td><em>Feature engineering</em>: razões, defasagens, agregações por janela, codificação de categóricas.</td>
    </tr>
  </tbody>
</table>
</div>

### MCAR, MAR, MNAR: por que o mecanismo decide tudo

A primeira linha da tabela merece um parágrafo próprio, porque é o item que mais silenciosamente invalida análises. A classificação dos mecanismos de dados faltantes nessas três siglas costuma ser atribuída ao trabalho de **Donald Rubin (1976)**, e a ideia central é que o que importa não é *quanto* falta — é **por que falta**.

<div class="ciclo-box" markdown="1">
<span class="ciclo-box-title">Os três mecanismos</span>

- **MCAR** (*missing completely at random*) — a ausência **não depende de nada**: nem do valor que faltou, nem de qualquer variável observada. O equipamento do laboratório queimou numa terça e as amostras daquele dia se perderam. Os dados presentes são uma amostra aleatória simples dos completos.
- **MAR** (*missing at random*) — a ausência depende **apenas do que você observou**. Renda falta mais em questionários de jovens; se a idade está registrada, então *dentro de cada faixa etária* a ausência não depende da renda em si. O nome é infeliz: não é "aleatório", é **aleatório condicionalmente ao observado**.
- **MNAR** (*missing not at random*) — a ausência depende do **próprio valor que não foi observado**. Renda falta mais entre quem ganha muito: a probabilidade de responder é função justamente do número que você não tem.
</div>

A consequência prática de cada um é diferente, e é aqui que a escolha do tratamento se decide:

<div class="ciclo-table">
<table>
  <thead>
    <tr>
      <th>Mecanismo</th>
      <th>Descartar os incompletos é válido?</th>
      <th>Imputação resolve?</th>
      <th>Dá para testar nos dados?</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>MCAR</strong></td>
      <td>Sim — perde-se poder, não validade</td>
      <td>Desnecessária, mas recupera poder</td>
      <td>Em parte: dá para rejeitar MCAR (por exemplo, com o teste de Little, 1988), não para confirmá-lo</td>
    </tr>
    <tr>
      <td><strong>MAR</strong></td>
      <td>Em geral não — pode enviesar (depende do que se estima)</td>
      <td>Sim, <em>se</em> o modelo de imputação incluir as variáveis que explicam a ausência</td>
      <td><strong>Não</strong></td>
    </tr>
    <tr>
      <td><strong>MNAR</strong></td>
      <td>Em geral não — pode enviesar</td>
      <td>Não com os métodos usuais</td>
      <td><strong>Não</strong></td>
    </tr>
  </tbody>
</table>
</div>

Sob MAR, imputar renda sem usar a idade não salva ninguém: a garantia vale para o modelo que contém a variável responsável pela ausência, não para qualquer imputação. E sob MNAR, nenhum método que use só os dados observados corrige o problema — resta modelar o próprio mecanismo de ausência (modelos de seleção de Heckman, *pattern-mixture models*) ou, mais honestamente, fazer **análise de sensibilidade**: mostrar como a conclusão muda sob hipóteses alternativas sobre os faltantes.

O ponto que a maioria dos textos omite:

<div class="ciclo-box" markdown="1">
<span class="ciclo-box-title">MAR versus MNAR é indecidível a partir dos dados</span>
Não existe teste. Por definição, distinguir os dois exigiria conhecer os valores que faltam — e, se você os conhecesse, não haveria problema algum.

Ou seja: **MAR é sempre uma suposição, nunca uma constatação.** É por isso que a tabela diz "diagnosticar o mecanismo *antes* de decidir": o diagnóstico é substantivo, não estatístico. Ele vem de entender como o dado foi coletado — quem respondeu, quem desistiu, o que o sistema deixou de gravar e por quê. É a mesma lógica de representatividade da etapa anterior: o mecanismo que gerou os dados também decide quem *não* está neles.
</div>

### Um exemplo com números

Para ver as três situações acontecendo, o código abaixo inventa a renda mensal de 100 mil pessoas (em R\$ mil; números ilustrativos), com a renda crescendo com a idade, e apaga valores de três jeitos:

- **MCAR:** 30% dos valores somem, sem depender de nada.
- **MAR:** somem 50% das rendas de quem tem menos de 30 anos e 15% das demais. A ausência depende só da idade, que está registrada.
- **MNAR:** somem 50% das rendas acima do percentil 70 e 15% das demais. A ausência depende da própria renda.

Em cada caso, o código calcula a média de duas formas: só com os casos completos e depois de imputar cada valor faltante com a média observada da faixa etária (faixas de 10 anos).

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
    <pre><code>using Random, Statistics, Printf

# Renda mensal (R$ mil) de 100 mil pessoas: números inventados, só para ilustrar.
# A renda cresce com a idade, de modo que jovens ganham menos em média.
Random.seed!(123)
n = 100_000
idade = rand(18:70, n)
renda = 1.0 .+ 0.08 .* idade .+ randn(n)

faixa = div.(idade, 10)                          # faixas de 10 anos: 1 = 18–19, 2 = 20–29, …
falta_mcar = rand(n) .&lt; 0.30                     # falta 30%, sem depender de nada
falta_mar  = rand(n) .&lt; ifelse.(idade .&lt; 30, 0.50, 0.15)                     # depende da idade
falta_mnar = rand(n) .&lt; ifelse.(renda .&gt; quantile(renda, 0.70), 0.50, 0.15)  # depende da renda

# Imputação simples: cada valor faltante recebe a média observada da sua faixa etária
function imputa_por_faixa(renda, falta, faixa)
    completa = copy(renda)
    for f in unique(faixa)
        grupo = faixa .== f
        completa[grupo .&amp; falta] .= mean(renda[grupo .&amp; .!falta])
    end
    completa
end

@printf("média verdadeira:            %.3f\n", mean(renda))
for (nome, falta) in (("MCAR", falta_mcar), ("MAR", falta_mar), ("MNAR", falta_mnar))
    @printf("%-4s  faltam %4.1f%%   só completos %.3f   imputada por faixa %.3f\n", nome,
            100 * mean(falta), mean(renda[.!falta]), mean(imputa_por_faixa(renda, falta, faixa)))
end</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">média verdadeira:            4.519
MCAR  faltam 29.9%   só completos 4.518   imputada por faixa 4.521
MAR   faltam 22.9%   só completos 4.689   imputada por faixa 4.522
MNAR  faltam 25.5%   só completos 4.256   imputada por faixa 4.406</pre>
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
    <pre><code># Renda mensal (R$ mil) de 100 mil pessoas: números inventados, só para ilustrar.
# A renda cresce com a idade, de modo que jovens ganham menos em média.
set.seed(123)
n &lt;- 100000
idade &lt;- sample(18:70, n, replace = TRUE)
renda &lt;- 1 + 0.08 * idade + rnorm(n)

faixa &lt;- idade %/% 10                            # faixas de 10 anos: 1 = 18–19, 2 = 20–29, …
falta_mcar &lt;- runif(n) &lt; 0.30                    # falta 30%, sem depender de nada
falta_mar  &lt;- runif(n) &lt; ifelse(idade &lt; 30, 0.50, 0.15)                     # depende da idade
falta_mnar &lt;- runif(n) &lt; ifelse(renda &gt; quantile(renda, 0.70), 0.50, 0.15)  # depende da renda

# Imputação simples: cada valor faltante recebe a média observada da sua faixa etária
imputa_por_faixa &lt;- function(renda, falta, faixa) {
  medias &lt;- tapply(renda[!falta], faixa[!falta], mean)
  completa &lt;- renda
  completa[falta] &lt;- medias[as.character(faixa[falta])]
  completa
}

cat(sprintf("média verdadeira:            %.3f\n", mean(renda)))
for (nome in c("MCAR", "MAR", "MNAR")) {
  falta &lt;- list(MCAR = falta_mcar, MAR = falta_mar, MNAR = falta_mnar)[[nome]]
  cat(sprintf("%-4s  faltam %4.1f%%   só completos %.3f   imputada por faixa %.3f\n", nome,
              100 * mean(falta), mean(renda[!falta]), mean(imputa_por_faixa(renda, falta, faixa))))
}</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">média verdadeira:            4.513
MCAR  faltam 30.1%   só completos 4.516   imputada por faixa 4.514
MAR   faltam 23.0%   só completos 4.684   imputada por faixa 4.511
MNAR  faltam 25.8%   só completos 4.249   imputada por faixa 4.399</pre>
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
import pandas as pd

# Renda mensal (R$ mil) de 100 mil pessoas: números inventados, só para ilustrar.
# A renda cresce com a idade, de modo que jovens ganham menos em média.
rng = np.random.default_rng(123)
n = 100_000
idade = rng.integers(18, 71, n)
renda = 1.0 + 0.08 * idade + rng.normal(size=n)

faixa = idade // 10                              # faixas de 10 anos: 1 = 18–19, 2 = 20–29, …
falta = {
    "MCAR": rng.random(n) &lt; 0.30,                                            # sem depender de nada
    "MAR": rng.random(n) &lt; np.where(idade &lt; 30, 0.50, 0.15),                 # depende da idade
    "MNAR": rng.random(n) &lt; np.where(renda &gt; np.quantile(renda, 0.70), 0.50, 0.15),  # da renda
}

def imputa_por_faixa(renda, falta, faixa):
    """Cada valor faltante recebe a média observada da sua faixa etária."""
    s = pd.Series(np.where(falta, np.nan, renda))
    return s.fillna(s.groupby(faixa).transform("mean")).to_numpy()

print(f"média verdadeira:            {renda.mean():.3f}")
for nome, f in falta.items():
    print(f"{nome:&lt;4}  faltam {100 * f.mean():4.1f}%   só completos {renda[~f].mean():.3f}   "
          f"imputada por faixa {imputa_por_faixa(renda, f, faixa).mean():.3f}")</code></pre>
  </div>
</div>
<div class="code-output">
  <div class="code-output-header"># Saída</div>
  <pre style="overflow-x: auto; font-size: 0.9em;">média verdadeira:            4.518
MCAR  faltam 29.9%   só completos 4.518   imputada por faixa 4.519
MAR   faltam 22.8%   só completos 4.682   imputada por faixa 4.513
MNAR  faltam 25.6%   só completos 4.251   imputada por faixa 4.401</pre>
</div>
  </div>
</div>

Na versão em Julia, a média verdadeira é 4,519. As três linguagens sorteiam números diferentes, mas contam a mesma história:

- **MCAR:** só os completos dão 4,518. Descartar não criou viés, só diminuiu a amostra. Isso vale sempre que a ausência é independente da variável, e está provado em Lean (`provas/Provas/CicloVida.lean`).
- **MAR:** só os completos dão 4,689. Como faltam mais jovens, que ganham menos, a média sobe. A conta exata dá o mesmo valor: com idades de 18 a 70 igualmente prováveis, a média esperada dos completos é 4,689 e a fração que falta é 22,9%. Imputar pela faixa etária, a variável que explica a ausência, recupera 4,522.
- **MNAR:** só os completos dão 4,256, e a imputação por faixa etária só chega a 4,406. Nenhuma correção feita com o que foi observado traz de volta o que sumiu justamente por ser alto.

Daí vem a segunda frase daquela célula — *nunca imputar sem registrar o que foi imputado*. Um valor imputado carrega incerteza que um valor medido não carrega. Se ele circula sem marcação, a validação (etapa 6) vai medir precisão sobre números inventados, e não terá como saber disso.

<div class="ciclo-box" markdown="1">
<span class="ciclo-box-title">Vazamento de informação (<em>data leakage</em>)</span>
Qualquer transformação que use estatísticas do conjunto completo (média, desvio, categorias) precisa ser **ajustada apenas no conjunto de treino** e depois aplicada aos demais.

Padronizar antes de dividir os dados é o erro mais comum e o mais difícil de detectar — ele produz métricas otimistas que desabam em produção, e nada no relatório denuncia o problema.
</div>

---

## 5. Análise exploratória (EDA)

Antes de modelar, é preciso conhecer os dados. A EDA é deliberadamente aberta: busca estrutura, padrões, anomalias e relações, e serve tanto para gerar hipóteses quanto para verificar os pressupostos das técnicas que virão.

- **Univariada:** distribuições, medidas de tendência central e dispersão, assimetria, contagens por categoria.
- **Bivariada:** correlações, tabelas cruzadas, comparações entre grupos, gráficos de dispersão.
- **Multivariada:** interações, redução de dimensionalidade, agrupamentos, estrutura temporal e espacial.

Visualização não é enfeite: é o instrumento principal desta etapa. O [quarteto de Anscombe](/quarteto-de-anscombe-por-que-graficos-sao-indispensaveis-na-estatistica/) e os conjuntos de Matejka e Fitzmaurice (2017), conhecidos como *Datasaurus Dozen*, mostram dados com médias, variâncias e correlações praticamente iguais e formatos radicalmente diferentes. **Resumos numéricos escondem; gráficos revelam.**

**Armadilha típica:** *p-hacking* por exploração — testar dezenas de relações e reportar apenas as significativas. A EDA **gera** hipóteses; ela não as confirma. Confirmação exige dados que não foram usados para formulá-las.

---

## 6. Modelagem e inferência

Aqui a pergunta é formalizada em um modelo. A escolha decorre diretamente do objetivo definido na etapa 1 — não do que está na moda:

<div class="ciclo-table">
<table>
  <thead>
    <tr>
      <th>Objetivo</th>
      <th>Pergunta</th>
      <th>Abordagens típicas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Descritivo</strong></td>
      <td>O que aconteceu?</td>
      <td>Estatística descritiva, segmentação, agrupamento, séries históricas.</td>
    </tr>
    <tr>
      <td><strong>Inferencial</strong></td>
      <td>O padrão observado se sustenta na população?</td>
      <td>Intervalos de confiança, testes de hipótese, modelos lineares e generalizados, métodos bayesianos.</td>
    </tr>
    <tr>
      <td><strong>Preditivo</strong></td>
      <td>O que deve acontecer?</td>
      <td>Regressão, árvores e <em>ensembles</em>, redes neurais, modelos de séries temporais.</td>
    </tr>
    <tr>
      <td><strong>Causal</strong></td>
      <td>O que acontece <em>se</em> intervirmos?</td>
      <td>Experimentos aleatorizados, diferenças-em-diferenças, variáveis instrumentais, escore de propensão.</td>
    </tr>
  </tbody>
</table>
</div>

<div class="ciclo-box" markdown="1">
<span class="ciclo-box-title">Predição não é causalidade</span>
Um modelo pode prever muito bem usando variáveis que não causam nada — consumo de sorvete prevê afogamentos. Para responder "o que fazer", predição de alta acurácia é **insuficiente**: é necessário um desenho de identificação causal.
</div>

Um bom relato de modelagem sempre inclui três coisas: os pressupostos assumidos, a estratégia de validação e o **modelo mais simples que serve de linha de base**. Um modelo complexo que não supera a média histórica não justifica a própria complexidade.

---

## 7. Validação e interpretação

Etapa de contraprova. Um resultado só vale se sobrevive a tentativas honestas de derrubá-lo.

- **Validação estatística:** verificação de pressupostos, análise de resíduos, validação cruzada, avaliação em conjunto de teste intocado e — quando há dimensão temporal — validação *out-of-time*.
- **Análise de sensibilidade:** os resultados mudam sob outras escolhas razoáveis de limpeza, especificação ou período?
- **Métricas adequadas ao problema:** acurácia é enganosa em bases desbalanceadas; a escolha entre precisão, revocação, AUC, calibração ou custo esperado deve refletir o custo real dos erros.
- **Significância prática:** um efeito estatisticamente significativo pode ser irrelevante em magnitude. Reporte o **tamanho do efeito**, não apenas o p-valor.
- **Equidade e viés:** o desempenho se mantém entre subgrupos? Modelos treinados em dados históricos herdam desigualdades históricas.

---

## 8. Comunicação dos resultados

Análise que não é compreendida não gera decisão. A comunicação deve ser construída para o público, não para o analista.

- **Estrutura:** conclusão primeiro, depois evidência, depois método. O detalhe técnico vai para o apêndice.
- **Honestidade sobre incerteza:** apresente intervalos, não apenas pontos; declare limitações e o que os dados **não** permitem afirmar.
- **Visualização responsável:** eixos não truncados de forma enganosa, escalas comparáveis, elementos decorativos ausentes.
- **Recomendação acionável:** vincule cada conclusão à decisão que ela informa e ao seu grau de confiança.

---

## 9. Implantação e monitoramento

Quando o resultado alimenta um processo recorrente — um *dashboard*, um escore em produção, uma regra automatizada — o ciclo não termina na entrega.

- **Operacionalização:** versionamento de código, dados e modelo; pipelines reprodutíveis; testes automatizados sobre os dados de entrada.
- **Monitoramento de desempenho:** as métricas de validação se mantêm com dados novos?
- ***Data drift* e *concept drift*:** a distribuição das variáveis muda; a relação entre variáveis e alvo também. Um modelo estável em um mundo instável degrada silenciosamente.
- **Ciclos de realimentação:** um modelo que influencia o comportamento que ele prevê altera os próprios dados que o alimentam.
- **Critério de reciclagem:** defina **antes** da implantação o gatilho de retreinamento ou de aposentadoria do modelo.

---

## 10. Os frameworks clássicos, lado a lado

Diferentes tradições nomeiam as mesmas etapas de formas distintas. Vale conhecer a correspondência para não se perder quando alguém disser "estamos na fase de *Modify*".

<div class="ciclo-table">
<table>
  <thead>
    <tr>
      <th>Este ciclo</th>
      <th>CRISP-DM</th>
      <th>KDD</th>
      <th>SEMMA</th>
      <th>OSEMN</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1. Problema</td>
      <td>Entendimento do negócio</td>
      <td>—</td>
      <td>—</td>
      <td>—</td>
    </tr>
    <tr>
      <td>2. Coleta</td>
      <td>Entendimento dos dados</td>
      <td>Seleção</td>
      <td><em>Sample</em></td>
      <td><em>Obtain</em></td>
    </tr>
    <tr>
      <td>3. Preparação</td>
      <td>Preparação dos dados</td>
      <td>Pré-processamento e transformação</td>
      <td><em>Modify</em></td>
      <td><em>Scrub</em></td>
    </tr>
    <tr>
      <td>4. Exploração</td>
      <td>Entendimento dos dados</td>
      <td>—</td>
      <td><em>Explore</em></td>
      <td><em>Explore</em></td>
    </tr>
    <tr>
      <td>5. Modelagem</td>
      <td>Modelagem</td>
      <td>Mineração de dados</td>
      <td><em>Model</em></td>
      <td><em>Model</em></td>
    </tr>
    <tr>
      <td>6. Validação</td>
      <td>Avaliação</td>
      <td>Interpretação / avaliação</td>
      <td><em>Assess</em></td>
      <td>—</td>
    </tr>
    <tr>
      <td>7. Comunicação</td>
      <td>Implantação</td>
      <td>Consolidação do conhecimento</td>
      <td>—</td>
      <td>i<em>N</em>terpret</td>
    </tr>
    <tr>
      <td>8. Monitoramento</td>
      <td>Implantação</td>
      <td>—</td>
      <td>—</td>
      <td>—</td>
    </tr>
  </tbody>
</table>
</div>

- **CRISP-DM** tem seis fases (entendimento do negócio, entendimento dos dados, preparação dos dados, modelagem, avaliação e implantação), é explicitamente iterativo e começa no negócio, não nos dados.
- **KDD** (*knowledge discovery in databases*) enfatiza a descoberta de conhecimento; na versão mais citada, suas etapas são seleção, pré-processamento, transformação, mineração de dados e interpretação/avaliação.
- **SEMMA** (*Sample, Explore, Modify, Model, Assess*) vem da SAS e cobre o ciclo técnico da modelagem; não tem etapa para o enquadramento do problema nem para a implantação. A própria SAS o apresenta como uma organização das ferramentas do seu software, e não como uma metodologia geral.
- **OSEMN** é um mnemônico (*Obtain, Scrub, Explore, Model, iNterpret*).

A correspondência da tabela é aproximada e é uma leitura deste post: cada framework divide o trabalho do seu jeito.

Nenhum deles substitui o julgamento: **são mapas, não trilhos.** Repare nos travessões da tabela — as lacunas dizem mais sobre cada framework do que os preenchimentos.

---

## 11. Por que o ciclo é iterativo

Três retornos são tão frequentes que devem ser **previstos no cronograma**, não tratados como imprevisto:

1. **Exploração → Definição do problema.** A EDA revela que a pergunta original não é respondível com os dados existentes, ou que a pergunta interessante é outra.
2. **Validação → Preparação.** Resíduos com estrutura, desempenho instável entre subgrupos ou vazamento detectado obrigam a revisar a construção das variáveis.
3. **Monitoramento → Novo ciclo.** A degradação em produção é informação nova sobre o fenômeno, e inicia a próxima iteração com uma pergunta melhor.

Tratar essas voltas como fracasso leva a escondê-las. Tratá-las como parte do processo é o que distingue análise madura de análise apressada.

---

## 12. Lista de verificação: quando uma etapa está concluída

<div class="ciclo-box" markdown="1">
<span class="ciclo-box-title">Uma etapa está concluída quando…</span>

1. **Problema:** a pergunta cabe em uma frase e a decisão que ela informa está nomeada.
2. **Coleta:** a origem de cada campo é rastreável e o mecanismo de seleção da amostra é conhecido.
3. **Preparação:** toda transformação está em código executável, e o conjunto se reconstrói do bruto sem intervenção manual.
4. **Exploração:** você consegue descrever a distribuição de cada variável relevante e explicar cada anomalia encontrada.
5. **Modelagem:** existe uma linha de base simples e o modelo escolhido a supera de forma mensurável.
6. **Validação:** o desempenho foi medido em dados nunca usados para ajustar nada, e é estável sob escolhas alternativas razoáveis.
7. **Comunicação:** o público consegue reproduzir a conclusão e enunciar as limitações com suas próprias palavras.
8. **Implantação:** há métrica monitorada, alerta configurado e critério de retreinamento definido.
</div>

---

> *"Todos os modelos estão errados, mas alguns são úteis."*
> — George E. P. Box, título de uma seção de "Robustness in the Strategy of Scientific Model Building" (1979), p. 202 (em tradução livre; no original: "All models are wrong but some are useful")

O ciclo existe para maximizar a segunda parte da frase.

---

## Resumo

- A análise de dados é um ciclo de oito etapas, e três voltas (exploração → problema, validação → preparação, monitoramento → novo ciclo) são esperadas, não acidentes.
- A pergunta vem antes dos dados: sem a decisão que o resultado vai informar, nenhuma técnica salva o projeto.
- Na preparação, o que decide o tratamento dos faltantes é *por que* eles faltam. Sob MCAR, descartar não enviesa; sob MAR, só a imputação que usa a variável responsável pela ausência corrige; sob MNAR, os dados observados não bastam, e resta a análise de sensibilidade.
- Predição não é causalidade, significância não é importância, e todo modelo precisa vencer uma linha de base simples.
- O ciclo não termina na entrega: o que acontece em produção é a entrada da próxima iteração.

---

## Referências

- Rubin, D. B. (1976). Inference and missing data. *Biometrika*, 63(3), 581–592. DOI: [10.1093/biomet/63.3.581](https://doi.org/10.1093/biomet/63.3.581). (Não consultado diretamente.)
- Little, R. J. A. (1988). A test of missing completely at random for multivariate data with missing values. *Journal of the American Statistical Association*, 83(404), 1198–1202. DOI: [10.1080/01621459.1988.10478722](https://doi.org/10.1080/01621459.1988.10478722).
- Matejka, J.; Fitzmaurice, G. (2017). Same stats, different graphs. In: *Proceedings of the 2017 CHI Conference on Human Factors in Computing Systems*, p. 1290–1294. DOI: [10.1145/3025453.3025912](https://doi.org/10.1145/3025453.3025912). (Não consultado diretamente.)
- Box, G. E. P. (1979). Robustness in the strategy of scientific model building. In: Launer, R. L.; Wilkinson, G. N. (Eds.). *Robustness in Statistics*. Academic Press, p. 201–236.
