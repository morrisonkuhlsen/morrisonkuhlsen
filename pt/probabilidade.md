---
layout: page
title: Probabilidade
lang: pt
ref: probabilidade
order: 2
---

# Probabilidade

La statistica descrittiva è il ramo della statistica che si occupa di descrivere e riassumere i dati attraverso indici e rappresentazioni grafiche. È il primo passo fondamentale in qualsiasi analisi dati, poiché permette di comprendere la struttura e le caratteristiche principali del dataset in esame.

## Concetti Fondamentali

### Misure di Tendenza Centrale

#### Media Aritmetica
La media aritmetica è la somma di tutti i valori divisa per il numero di osservazioni.

**Formula:**
$$
\bar{x} = \frac{1}{n}\sum_{i=1}^{n}x_i
$$

#### Mediana
La mediana è il valore che divide a metà un insieme ordinato di dati.

**Calcolo:**
1. Ordinare i dati in ordine crescente
2. Se il numero di osservazioni è dispari, la mediana è il valore centrale
3. Se è pari, è la media dei due valori centrali

#### Moda
La moda è il valore che compare con maggiore frequenza in un insieme di dati.

### Misure di Dispersione

#### Varianza e Deviazione Standard
Misurano quanto i dati si discostano dalla media.

**Formula della varianza campionaria:**
$$
s^2 = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2
$$

**Deviazione standard:**
$$
s = \sqrt{s^2}
$$

#### Intervallo di Variazione
Differenza tra il valore massimo e minimo del dataset.

## Rappresentazioni Grafiche

### Istogramma
Rappresenta la distribuzione di frequenza di una variabile continua.

**Quando usarlo:**
- Per visualizzare la forma della distribuzione
- Identificare valori anomali
- Valutare la simmetria

### Box Plot
Mostra la distribuzione dei dati attraverso i quartili.

**Elementi chiave:**
- Mediana (linea interna al box)
- Primo e terzo quartile (estremi del box)
- Baffi (1.5 * IQR)
- Outliers (punti esterni)

### Grafico a Torta
Utile per mostrare le proporzioni di categorie in un insieme.

**Linee guida:**
- Usare massimo 5-6 categorie
- Ordinare le fette in senso orario dal più grande
- Evitare per dati con valori simili

## Esempi Pratici con Python

### Analisi Esplorativa di Base

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Dati di esempio
np.random.seed(42)
età = np.random.normal(35, 10, 1000).astype(int)  # età tra 15 e 55 anni
reddito = np.random.lognormal(3.5, 0.5, 1000)  # reddito annuale

# Creazione di un DataFrame
df = pd.DataFrame({'Età': età, 'Reddito_Annuale': reddito})

# Statistiche descrittive
print("\nStatistiche descrittive:")
print(df.describe())

# Calcolo della correlazione
correlazione = df.corr()
print("\nMatrice di correlazione:")
print(correlazione)

# Visualizzazioni
plt.figure(figsize=(15, 5))

# Istogramma dell'età
plt.subplot(1, 2, 1)
sns.histplot(data=df, x='Età', kde=True, bins=20)
plt.title('Distribuzione delle Età')

# Box plot del reddito
plt.subplot(1, 2, 2)
sns.boxplot(data=df, y='Reddito_Annuale')
plt.title('Distribuzione del Reddito')

plt.tight_layout()
plt.show()
```

## Applicazioni Pratiche

1. **Ricerca di Mercato**
   - Analisi delle preferenze dei consumatori
   - Segmentazione della clientela
   - Valutazione della soddisfazione

2. **Controllo Qualità**
   - Monitoraggio dei processi produttivi
   - Rilevamento di anomalie
   - Analisi delle cause di difetti

3. **Scienze Sociali**
   - Analisi di sondaggi
   - Studi demografici
   - Ricerca educativa

## Esercizi Pratici

1. **Calcolo delle misure di tendenza centrale**
   Dato il seguente dataset di voti: [5, 7, 8, 6, 9, 7, 8, 5, 8, 7]
   - Calcola media, mediana e moda
   - Calcola la varianza e la deviazione standard
   - Crea un box plot

2. **Analisi Esplorativa**
   Scarica un dataset dal web (es. da [Kaggle](https://www.kaggle.com/datasets)) e:
   - Esegui un'analisi descrittiva completa
   - Identifica eventuali valori anomali
   - Crea visualizzazioni appropriate

## Risorse Utili

- **Libri Consigliati**
  - "Statistica per la ricerca sociale" di Alan Agresti
  - "Introduzione alla statistica" di Sheldon M. Ross

- **Corsi Online**
  - [Corso di Statistica su Coursera](https://www.coursera.org/learn/statistics)
  - [Introduzione alla Data Science su edX](https://www.edx.org/learn/data-science)

- **Strumenti**
  - [Pandas](https://pandas.pydata.org/) - Libreria Python per l'analisi dati
  - [Seaborn](https://seaborn.pydata.org/) - Visualizzazione dati statistici
  - [JASP](https://jasp-stats.org/) - Software di statistica open source

## Conclusione

La statistica descrittiva fornisce gli strumenti fondamentali per comprendere e comunicare le caratteristiche principali dei dati. Padroneggiare queste tecniche è essenziale per qualsiasi professionista che lavora con i dati, poiché costituisce la base per analisi più avanzate e per prendere decisioni informate basate su evidenze empiriche.

*"I dati non sono informazioni, le informazioni non sono conoscenza, la conoscenza non è comprensione, la comprensione non è saggezza."* - Clifford Stoll
