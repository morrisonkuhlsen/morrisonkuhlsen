---
layout: page
title: Análise de Dados
lang: pt
ref: analise-de-dados
order: 4
---

# Análise de Dados

L'inferenza statistica è il processo attraverso il quale si traggono conclusioni su una popolazione basandosi su un campione di dati. Questa disciplina è fondamentale per prendere decisioni in condizioni di incertezza e per generalizzare i risultati osservati in un campione all'intera popolazione di riferimento.

## Concetti Fondamentali

### 1. Popolazione e Campione
- **Popolazione**: Insieme completo di elementi che condividono una o più caratteristiche di interesse
- **Campione**: Sottoinsieme rappresentativo della popolazione, selezionato per l'analisi
- **Parametro**: Caratteristica numerica di una popolazione (es. media μ, deviazione standard σ)
- **Statistica**: Stima di un parametro basata sul campione (es. media campionaria x̄, deviazione standard campionaria s)

### 2. Distribuzioni Campionarie

#### Teorema del Limite Centrale
Per campioni sufficientemente grandi (n ≥ 30), la distribuzione delle medie campionarie si approssima a una distribuzione normale, indipendentemente dalla forma della distribuzione della popolazione.

**Formula:**
$$
\bar{X} \sim N\left(\mu, \frac{\sigma}{\sqrt{n}}\right)
$$

#### Errore Standard
Misura della variabilità della stima campionaria.

**Per la media:**
$$
SE = \frac{s}{\sqrt{n}}
$$

## Stima dei Parametri

### 1. Stima Puntuale
Fornisce un singolo valore come stima del parametro della popolazione.

**Esempi:**
- Media campionaria (x̄) per μ
- Varianza campionaria (s²) per σ²
- Proporzione campionaria (p̂) per π

### 2. Stima Intervallare
Fornisce un intervallo di valori plausibili per il parametro, con un certo livello di confidenza.

**Intervallo di confidenza per la media (σ noto):**
$$
\bar{x} \pm z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}
$$

**Intervallo di confidenza per la media (σ non noto):**
$$
\bar{x} \pm t_{n-1,\alpha/2} \cdot \frac{s}{\sqrt{n}}
$$

## Verifica delle Ipotesi

### 1. Formulazione delle Ipotesi
- **Ipotesi nulla (H₀)**: Affermazione da verificare (es. "nessun effetto")
- **Ipotesi alternativa (H₁)**: Affermazione contraria all'ipotesi nulla

### 2. Errori
- **Errore di I tipo (α)**: Rifiutare H₀ quando è vera
- **Errore di II tipo (β)**: Non rifiutare H₀ quando è falsa
- **Potenza del test (1-β)**: Probabilità di rifiutare correttamente H₀ quando è falsa

### 3. P-value
Probabilità di osservare un risultato almeno altrettanto estremo di quello osservato, assumendo che H₀ sia vera.

**Regola decisionale:**
- Se p-value < α → Rifiuto H₀
- Se p-value ≥ α → Non rifiuto H₀

## Test Statistici Comuni

### 1. Test t per un campione
Verifica se la media di una popolazione è uguale a un valore specificato.

**Ipotesi:**
- H₀: μ = μ₀
- H₁: μ ≠ μ₀ (o <, >)

**Statistica test:**
$$
t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}}
$$

### 2. Test t per due campioni indipendenti
Confronta le medie di due gruppi indipendenti.

**Ipotesi:**
- H₀: μ₁ = μ₂
- H₁: μ₁ ≠ μ₂ (o <, >)


### 3. Analisi della Varianza (ANOVA)
Confronta le medie di tre o più gruppi.

**Ipotesi:**
- H₀: μ₁ = μ₂ = ... = μₖ
- H₁: Almeno due medie sono diverse

### 4. Test del Chi-quadro
Verifica l'indipendenza tra due variabili categoriche o la bontà di adattamento.

**Statistica test:**
$$
\chi^2 = \sum \frac{(O - E)^2}{E}
$$
dove O sono le frequenze osservate ed E quelle attese.

## Esempio Pratico con Python

### Analisi di un Esperimento A/B

```python
import numpy as np
import pandas as pd
import scipy.stats as stats
import matplotlib.pyplot as plt
import seaborn as sns

# Generazione dati di esempio
np.random.seed(42)

# Gruppo di controllo (A)
gruppo_A = np.random.normal(loc=100, scale=15, size=100)  # Media 100, DS 15
# Gruppo di trattamento (B)
gruppo_B = np.random.normal(loc=110, scale=15, size=100)  # Media 110, DS 15

# Creazione DataFrame
df = pd.DataFrame({
    'gruppo': ['A'] * 100 + ['B'] * 100,
    'valore': np.concatenate([gruppo_A, gruppo_B])
})

# Statistiche descrittive
print("Statistiche descrittive per gruppo:")
print(df.groupby('gruppo').describe())

# Visualizzazione
plt.figure(figsize=(10, 6))
sns.boxplot(x='gruppo', y='valore', data=df)
plt.title('Confronto tra Gruppo A e Gruppo B')
plt.show()

# Test t per due campioni indipendenti
t_stat, p_value = stats.ttest_ind(
    df[df['gruppo'] == 'A']['valore'],
    df[df['gruppo'] == 'B']['valore'],
    equal_var=True  # assumiamo varianze uguali
)

print(f"\nRisultati del test t:")
print(f"Statistica t: {t_stat:.4f}")
print(f"P-value: {p_value:.4f}")

# Calcolo intervallo di confidenza 95% per la differenza delle medie
n1 = len(gruppo_A)
n2 = len(gruppo_B)
mean1, mean2 = np.mean(gruppo_A), np.mean(gruppo_B)
std1, std2 = np.std(gruppo_A, ddof=1), np.std(gruppo_B, ddof=1)

# Errore standard della differenza
se_diff = np.sqrt((std1**2/n1) + (std2**2/n2))
# Gradi di libertà (approssimazione di Welch)
df = ((std1**2/n1 + std2**2/n2)**2) / \
      ((std1**2/n1)**2/(n1-1) + (std2**2/n2)**2/(n2-1))
# Valore critico t
t_crit = stats.t.ppf(0.975, df)
# Intervallo di confidenza
ci_lower = (mean1 - mean2) - t_crit * se_diff
ci_upper = (mean1 - mean2) + t_crit * se_diff

print(f"\nDifferenza tra le medie: {mean1-mean2:.2f}")
print(f"Intervallo di confidenza 95%: [{ci_lower:.2f}, {ci_upper:.2f}]")

# Interpretazione
alpha = 0.05
if p_value < alpha:
    print("\nConclusione: Rifiutiamo l'ipotesi nulla (p < 0.05).")
    print("C'è evidenza statistica di una differenza significativa tra i gruppi.")
else:
    print("\nConclusione: Non possiamo rifiutare l'ipotesi nulla (p ≥ 0.05).")
    print("Non c'è evidenza statistica di una differenza significativa tra i gruppi.")

## Applicazioni Avanzate

### 1. Analisi della Potenza
Determinare la dimensione campionaria necessaria per rilevare un effetto di una certa entità.

### 2. Analisi delle Varianza (ANOVA) a Misure Ripetute
Utilizzata quando le stesse unità sperimentali sono misurate in condizioni diverse.

### 3. Modelli Lineari Generalizzati
Estensione della regressione lineare per variabili risposta non normalmente distribuite.

## Esercizi Pratici

### Esercizio 1: Test t per un campione
Supponi di voler verificare se il punteggio medio in un test è significativamente diverso da 75. I dati sono i seguenti:
```
punteggi = [72, 85, 88, 75, 69, 80, 78, 82, 76, 81, 74, 77, 79, 83, 71]
```
Esegui un test t a un campione con α = 0.05 e interpreta i risultati.

### Esercizio 2: Test del Chi-quadro
In un'indagine su 200 persone, si è studiata la relazione tra genere (M/F) e preferenza per tre tipi di prodotto (A/B/C). I risultati sono:

| Genere | Prodotto A | Prodotto B | Prodotto C | Totale |
|--------|------------|------------|------------|--------|
| M      | 30         | 25         | 20         | 75     |
| F      | 45         | 30         | 50         | 125    |
| Totale | 75         | 55         | 70         | 200    |

Verifica se c'è un'associazione tra genere e preferenza del prodotto (α = 0.05).

## Risorse di Approfondimento

### Libri Consigliati
- "Statistical Inference" di George Casella e Roger L. Berger
- "All of Statistics" di Larry Wasserman
- "Introduzione alla statistica" di Sheldon M. Ross

### Corsi Online
- [Inferenza Statistica su Coursera](https://www.coursera.org/learn/statistical-inference)
- [Statistica Inferenziale su edX](https://www.edx.org/learn/statistics)

### Strumenti Software
- [R](https://www.r-project.org/) - Linguaggio specializzato in analisi statistica
- [JASP](https://jasp-stats.org/) - Interfaccia grafica per analisi statistiche
- [Jamovi](https://www.jamovi.org/) - Alternativa open source a SPSS

## Conclusione

L'inferenza statistica è uno strumento potente per trarre conclusioni su popolazioni basandosi su dati campionari. Attraverso la stima dei parametri e la verifica delle ipotesi, possiamo prendere decisioni informate in condizioni di incertezza. La corretta applicazione di questi metodi richiede una comprensione approfondita dei concetti statistici di base, una scelta appropriata delle tecniche analitiche e un'interpretazione attenta dei risultati.

*"La statistica è la grammatica della scienza."* - Karl Pearson)
- Regressione lineare
