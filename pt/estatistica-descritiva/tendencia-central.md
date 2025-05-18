---
layout: page
title: Medidas de Tendência Central
lang: pt
ref: tendencia-central
parent: estatistica-descritiva
permalink: /pt/estatistica-descritiva/tendencia-central
order: 1
---

A medidas de tendência central é um valor central ou valor típico para uma distribuição de probabilidade em um conjunto de dados. Elas nos ajudam a resumir e compreender melhor os dados, mostrando onde eles "tendem" a se concentrar.

## Introdução

Em estatística descritiva, as medidas de tendência central mais comuns são:

1. Média Aritmética
2. Mediana
3. Moda

Cada uma dessas medidas tem suas particularidades e é mais adequada para diferentes tipos de dados e distribuições.

---

## 1. Média Aritmética

A média aritmética é a soma de todos os valores dividida pelo número de elementos.

### Fórmula
```
Média = (Σxᵢ) / n
Onde:
- Σxᵢ = soma de todos os valores
- n = número de observações
```

### Exemplo Prático
Considere as idades de 5 pessoas: 20, 22, 24, 26, 28 anos.

```
Média = (20 + 22 + 24 + 26 + 28) / 5 = 120 / 5 = 24 anos
```

### Quando usar com cautela
- A média é sensível a valores extremos (outliers)
- Em distribuições assimétricas, pode não representar bem o centro dos dados

---

## 2. Mediana

A mediana é o valor que divide o conjunto de dados ordenado em duas partes iguais.

### Como calcular:
1. Ordene os dados em ordem crescente
2. Se o número de observações for ímpar, a mediana é o valor central
3. Se for par, é a média dos dois valores centrais

### Exemplos

**Conjunto ímpar (5 elementos):** 3, 5, 7, 9, 11
```
Mediana = 7 (terceiro valor)
```

**Conjunto par (6 elementos):** 2, 4, 6, 8, 10, 12
```
Mediana = (6 + 8) / 2 = 7
```

### Vantagens
- Não é afetada por valores extremos
- Melhor para distribuições assimétricas

---

## 3. Moda

A moda é o valor que mais se repete em um conjunto de dados.

### Tipos de conjuntos:
- **Amodal**: nenhum valor se repete
- **Unimodal**: uma moda
- **Bimodal**: duas modas
- **Multimodal**: três ou mais modas

### Exemplos
```
Conjunto A: 1, 2, 2, 3, 4 → Moda = 2 (unimodal)
Conjunto B: 1, 1, 2, 3, 3 → Modas = 1 e 3 (bimodal)
Conjunto C: 1, 2, 3, 4, 5 → Sem moda (amodal)
```

### Aplicações
- Útil para dados categóricos (cores, marcas, categorias)
- Importante em pesquisas de mercado

---

## Comparação entre as Medidas

| Medida | Vantagens | Desvantagens | Melhor uso |
|--------|-----------|--------------|------------|
| **Média** | Considera todos os valores | Sensível a outliers | Dados simétricos sem outliers |
| **Mediana** | Robusta a outliers | Não considera todos os valores | Dados assimétricos ou com outliers |
| **Moda** | Pode ser usada com dados categóricos | Pode não ser única ou existir | Dados categóricos ou quando precisamos do valor mais frequente |

---

## Exercício Prático

Calcule a média, mediana e moda para o seguinte conjunto de dados que representa as notas de uma turma de 10 alunos:

```
7.5, 8.0, 6.5, 9.0, 7.5, 8.5, 6.0, 9.5, 8.0, 7.0
```

### Solução:
1. **Média**: 
   ```
   (7.5 + 8.0 + 6.5 + 9.0 + 7.5 + 8.5 + 6.0 + 9.5 + 8.0 + 7.0) / 10 = 77.5 / 10 = 7.75
   ```

2. **Mediana**:
   Dados ordenados: 6.0, 6.5, 7.0, 7.5, 7.5, 8.0, 8.0, 8.5, 9.0, 9.5
   Mediana = (7.5 + 8.0) / 2 = 7.75

3. **Moda**:
   Valores que mais se repetem: 7.5 e 8.0 (bimodal)

---

## Considerações Finais

- A escolha da medida de tendência central adequada depende do tipo de dados e da distribuição.
- Em distribuições simétricas, média, mediana e moda tendem a ser próximas.
- Em distribuições assimétricas, a mediana geralmente é a melhor escolha.
- A moda é a única medida que pode ser usada com dados nominais.

**Dica profissional**:  Sempre visualize seus dados antes de escolher a medida de tendência central mais adequada. Um simples histograma pode revelar a distribuição dos seus dados e te ajudar na decisão.

---

## Para Saber Mais

- [Medidas de Tendência Central - Khan Academy](https://pt.khanacademy.org/math/statistics-probability/summarizing-quantitative-data/mean-median-basics/a/mean-median-and-mode-review)
- [Estatística Básica - Livro por Bussab e Morettin](https://www.grupoa.com.br/livros/estatistica-basica/9788543001126)
- [Understanding Statistical Averages - Towards Data Science](https://towardsdatascience.com/understanding-statistical-averages-61a8ddb7a2f7)
