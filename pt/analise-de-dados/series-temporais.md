---
layout: page
title: Séries Temporais
lang: pt
ref: series-temporais
parent: analise-de-dados
permalink: /pt/analise-de-dados/series-temporais
order: 2
---

<img src="{{ site.baseurl }}/assets/images/timeseries.png" alt="Ilustração de séries temporais" style="max-width: 600px; display: block; margin: 1em auto;">

As **séries temporais** são conjuntos de dados coletados e organizados em ordem cronológica. Elas permitem analisar como uma variável evolui ao longo do tempo, sendo fundamentais em áreas como economia, finanças, meteorologia, saúde, indústria, web analytics, entre outras.

### Exemplos reais de séries temporais:
- Temperatura diária de uma cidade
- Cotação do dólar ao longo dos dias
- Número de acessos a um site por hora
- Vendas mensais de uma loja

#### Tipos de séries temporais:
- **Contínua**: observações em qualquer instante (ex: sensores industriais)
- **Discreta**: observações em intervalos regulares (ex: vendas mensais)
- **Univariada**: apenas uma variável (ex: temperatura)
- **Multivariada**: várias variáveis (ex: temperatura, umidade, pressão)

As principais características de uma série temporal são:

1. **Ordem temporal**: cada observação está associada a um instante ou período de tempo.
2. **Dependência temporal**: valores próximos no tempo tendem a estar correlacionados.
3. **Possibilidade de padrões**: tendência, sazonalidade, ciclos e ruído.

---

<div style="border-left: 4px solid orange; padding: 0.5em; background-color: #fff3cd;">
  <strong>⚠️ Atenção:</strong> Antes de aplicar métodos estatísticos tradicionais em séries temporais, é importante considerar a <strong>dependência entre as observações</strong>.<br>
  Técnicas como média e variância podem ter interpretações diferentes em dados temporais.<br>
  Recomenda-se sempre <strong>visualizar a série</strong> e analisar seus componentes antes de modelar.
</div>

---

## 1. Componentes de uma Série Temporal

Uma série temporal pode ser decomposta em diferentes componentes:

| Componente      | Descrição                                                         | Exemplo prático                      |
|-----------------|-------------------------------------------------------------------|--------------------------------------|
| **Tendência (T)**      | Movimento de longo prazo, indicando crescimento ou queda persistente | Crescimento populacional, inflação   |
| **Sazonalidade (S)**   | Padrões que se repetem em intervalos regulares              | Vendas maiores no Natal, clima anual |
| **Ciclos (C)**         | Flutuações de longo prazo, menos regulares que a sazonalidade| Ciclos econômicos, crises financeiras|
| **Aleatoriedade (R)**  | Variações imprevisíveis, chamadas de ruído                  | Eventos inesperados, erros de medição|

A decomposição clássica pode ser expressa como:

$$
Y_t = T_t + S_t + C_t + R_t
$$

ou, no modelo multiplicativo:

$$
Y_t = T_t \times S_t \times C_t \times R_t
$$

---
### Decomposição na Prática

A decomposição ajuda a separar tendências, padrões sazonais e ruídos, facilitando a análise e a previsão. Em Julia, pode-se usar pacotes como `TSAnalysis` ou `Seasonal` para decompor séries reais.

## Exemplo prático em Julia

Abaixo, um exemplo de como simular e visualizar uma série temporal com tendência e sazonalidade usando Julia:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>
    <div style="flex-grow: 1;"></div>
    <button class="copy-button" onclick="copyCode(this)">
      <i class="bi bi-clipboard"></i>Copiar
    </button>
  </div>
  <div class="code-content">
    <pre><code># Exemplo prático em Julia: Série Temporal com Tendência e Sazonalidade

using Plots

# Gerar dados simulados
n = 36  # 3 anos de dados mensais
t = 1:n
tendencia = 10 .+ 2 .* t
sazonalidade = 15 .* sin.(2π .* t ./ 12)
ruido = randn(n) .* 5
serie = tendencia .+ sazonalidade .+ ruido

# Plotar a série temporal
plot(t, serie, label="Série Temporal", xlabel="Mês", ylabel="Valor", title="Exemplo de Série Temporal em Julia")
</code></pre>
  </div>
</div>

**Explicação:**
- `tendencia`: cria um crescimento linear ao longo do tempo.
- `sazonalidade`: adiciona um padrão periódico (anual).
- `ruido`: insere variações aleatórias.
- O gráfico mostra como a série evolui, combinando esses componentes.

---

### Decomposição e Suavização

Além de visualizar, é comum decompor e suavizar séries temporais para entender melhor seus padrões.

#### Média Móvel Simples
A média móvel suaviza flutuações de curto prazo e destaca tendências.

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

# Série simulada
serie = [120, 130, 125, 140, 150, 160, 155, 170, 165, 180, 190, 250]

# Função para média móvel simples
function media_movel(vetor, janela)
    n = length(vetor)
    movel = [mean(vetor[i:i+janela-1]) for i in 1:(n-janela+1)]
    return movel
end

mm3 = media_movel(serie, 3)
println("Médias móveis de ordem 3: ", mm3)
</code></pre>
  </div>
</div>

**Dica:** A média móvel é útil para suavizar ruídos e identificar tendências, mas pode atrasar a detecção de mudanças rápidas.

## 2. Exemplo Prático

Considere a série de vendas mensais de uma loja ao longo de 12 meses:

| Mês        | Jan | Fev | Mar | Abr | Mai | Jun | Jul | Ago | Set | Out | Nov | Dez |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| Vendas (R$)| 120 | 130 | 125 | 140 | 150 | 160 | 155 | 170 | 165 | 180 | 190 | 250 |

- **Tendência**: crescimento ao longo do ano.
- **Sazonalidade**: pico de vendas em dezembro (Natal).
- **Aleatoriedade**: pequenas oscilações mês a mês.

---

## 3. Aplicações de Séries Temporais

- **Previsão:** estimar valores futuros (ex: previsão do tempo, demanda de energia, vendas, séries financeiras)
- **Detecção de anomalias:** identificar comportamentos atípicos (ex: fraudes, falhas em máquinas, picos de acesso)
- **Análise de padrões:** entender ciclos e sazonalidades para tomada de decisão
- **Controle de qualidade:** monitoramento de processos industriais
- **Saúde:** análise de epidemias, evolução de casos

---

## 4. Principais Gráficos e Análises

- **Gráfico de linha temporal:** evolução dos valores ao longo do tempo
- **Gráfico de autocorrelação (ACF/PACF):** identifica dependências entre períodos
- **Boxplot por período:** avalia variação sazonal
- **Decomposição visual:** separa tendência, sazonalidade e ruído

**Dica:** Sempre visualize seus dados antes de modelar!

---

## 5. Modelos Clássicos para Séries Temporais

- **Média móvel e suavização exponencial:** para suavizar flutuações
- **ARIMA/SARIMA:** modelos estatísticos para previsão
- **Prophet:** modelo automatizado criado pelo Facebook
- **Redes neurais recorrentes (RNN, LSTM):** para séries complexas

**Quando usar cada modelo?**
- Séries simples e curtas: média móvel, suavização
- Séries com padrões complexos: ARIMA, Prophet, LSTM

---

## 6. Boas Práticas e Armadilhas

- Sempre verifique **estacionariedade** (média e variância constantes no tempo)
- Cuidado com **overfitting**: não ajuste demais o modelo aos dados históricos
- Use parte dos dados para **validação** (treino/teste)
- Considere outliers e rupturas estruturais na série
- Documente hipóteses e limitações

---

## 8. Glossário

| Termo          | Significado                                  |
|----------------|----------------------------------------------|
| Série Temporal | Sequência de dados ao longo do tempo         |
| Tendência      | Direção geral dos dados (subida/descida)     |
| Sazonalidade   | Padrões que se repetem em intervalos regulares|
| Ciclo          | Flutuações de longo prazo, menos regulares   |
| Ruído          | Variações aleatórias e imprevisíveis         |
| Autocorrelação | Correlação de uma série com ela mesma        |

---

## 7. Referências e Links Úteis

- [Forecasting: Principles and Practice (livro gratuito)](https://otexts.com/fpp3/)
- [Documentação do pacote TimeSeries.jl (Julia)](https://juliastats.org/TimeSeries.jl/stable/)
- Morettin, P.A. e Toloi, C.M. "Análise de Séries Temporais" (livro clássico em português)