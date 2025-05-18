---
layout: page
title: Inferência Estatística
lang: pt
ref: inferencia-estatistica
order: 3
---

# Inferência Estatística

La probabilità è lo studio matematico dell'incertezza, che fornisce un quadro formale per quantificare il caso e l'aleatorietà. È fondamentale in statistica, finanza, scienze naturali e intelligenza artificiale.

## Concetti Fondamentali

### Definizioni di Probabilità

#### 1. Definizione Classica (Laplace)
La probabilità di un evento è il rapporto tra il numero di casi favorevoli e il numero di casi possibili, supponendo che siano tutti ugualmente probabili.

**Formula:**
$$
P(A) = \frac{\text{casi favorevoli}}{\text{casi possibili}}
$$

#### 2. Definizione Frequentista
La probabilità di un evento è il limite della sua frequenza relativa in un gran numero di prove ripetute.

**Formula:**
$$
P(A) = \lim_{n \to \infty} \frac{n_A}{n}
$$
dove \(n_A\) è il numero di volte che si verifica l'evento A in n prove.

#### 3. Definizione Soggettiva
La probabilità esprime il grado di fiducia che un individuo assegna al verificarsi di un evento, basandosi sulle informazioni disponibili.

### Variabili Casuali

#### Variabili Casuali Discrete
Assumono un insieme numerabile di valori.

**Esempi:**
- Numero di teste in 10 lanci di moneta
- Numero di clienti in un negozio in un'ora

**Distribuzioni notevoli:**
- Binomiale
- Poisson
- Ipergeometrica

#### Variabili Casuali Continue
Possono assumere qualsiasi valore in un intervallo reale.

**Esempi:**
- Altezza degli studenti
- Tempo di vita di un componente elettronico

**Distribuzioni notevoli:**
- Normale (Gaussiana)
- Esponenziale
- Uniforme continua

### Teoremi Fondamentali

#### Teorema di Bayes
Permette di aggiornare la probabilità di un'ipotesi alla luce di nuove evidenze.

**Formula:**
$$
P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}
$$

#### Legge dei Grandi Numeri
All'aumentare del numero di prove, la media campionaria converge alla media attesa.

#### Teorema del Limite Centrale
La somma di un gran numero di variabili casuali indipendenti tende a distribuirsi normalmente, indipendentemente dalla distribuzione delle singole variabili.

## Esempi Pratici con Python

### Simulazione del Lancio di Dadi

```python
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Simulazione di 1000 lanci di due dadi
np.random.seed(42)
lanci = np.random.randint(1, 7, size=(1000, 2))
somme = lanci.sum(axis=1)

# Calcolo delle probabilità empiriche
valori, conteggi = np.unique(somme, return_counts=True)
prob_empiriche = conteggi / 1000

# Probabilità teoriche (per due dadi)
prob_teoriche = {
    2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36, 6: 5/36,
    7: 6/36, 8: 5/36, 9: 4/36, 10: 3/36, 11: 2/36, 12: 1/36
}

# Visualizzazione
plt.figure(figsize=(12, 6))

# Istogramma delle probabilità empiriche
plt.bar(valori - 0.2, prob_empiriche, width=0.4, label='Empiriche', alpha=0.7)

# Probabilità teoriche
plt.bar(valori + 0.2, [prob_teoriche[v] for v in valori], width=0.4, label='Teoriche', alpha=0.7)

plt.xlabel('Somma dei dadi')
plt.ylabel('Probabilità')
plt.title('Distribuzione della somma di due dadi')
plt.xticks(valori)
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# Calcolo della probabilità di ottenere almeno un 6 in 4 lanci di dado
p_singolo_lancio = 1/6
p_almeno_un_sei = 1 - (5/6)**4
print(f"Probabilità di ottenere almeno un 6 in 4 lanci: {p_almeno_un_sei:.2%}")
```

## Applicazioni Avanzate

### 1. Catene di Markov
Modelli probabilistici per sistemi che evolvono nel tempo in modo casuale, mantenendo la proprietà di assenza di memoria.

**Applicazioni:**
- Modelli meteorologici
- Algoritmi di PageRank (Google)
- Processi di coda

### 2. Processi Stocastici
Successione di variabili casuali che evolvono nel tempo.

**Esempi:**
- Moti Browniani (finanza)
- Teoria delle code
- Modelli di diffusione

### 3. Inferenza Bayesiana
Approccio statistico che aggiorna le probabilità man mano che si acquisiscono nuove informazioni.

**Applicazioni:**
- Filtri antispam
- Diagnosi mediche
- Apprendimento automatico

## Esercizi Pratici

### Esercizio 1: Paradosso del Compleanno
Calcola la probabilità che in un gruppo di n persone almeno due compiano gli anni lo stesso giorno.

```python
def paradosso_compleanno(n):
    prob_diversi = 1.0
    for i in range(n):
        prob_diversi *= (365 - i) / 365
    return 1 - prob_diversi

# Calcola per gruppi da 1 a 60 persone
n_persone = range(1, 61)
probabilita = [paradosso_compleanno(n) for n in n_persone]

# Trova il numero minimo per cui la probabilità supera il 50%
n_minimo = next(i for i, p in enumerate(probabilita, 1) if p > 0.5)
print(f"Numero minimo di persone per P > 50%: {n_minimo}")
```

### Esercizio 2: Gioco delle Tre Porte (Monty Hall)
Simula il famoso problema del gioco a premi e verifica la strategia ottimale.

## Risorse di Approfondimento

### Libri Consigliati
- "Probabilità e statistica per l'ingegneria e le scienze" di Sheldon M. Ross
- "Introduzione alla probabilità" di Joseph K. Blitzstein e Jessica Hwang

### Corsi Online
- [Probabilità e Statistica su Khan Academy](https://it.khanacademy.org/math/statistics-probability)
- [Probabilità e Scienza dei Dati su edX](https://www.edx.org/learn/probability)

### Strumenti Software
- [SciPy](https://www.scipy.org/) - Libreria scientifica per Python con funzioni di probabilità
- [R Project](https://www.r-project.org/) - Ambiente software per il calcolo statistico

## Conclusione

La probabilità fornisce gli strumenti matematici per modellare e comprendere il caso e l'incertezza. Dalle applicazioni più semplici, come i giochi d'azzardo, fino ai modelli complessi utilizzati nell'intelligenza artificiale e nella finanza, la probabilità è una disciplina fondamentale per chiunque lavori con i dati o prenda decisioni in condizioni di incertezza.

*"La probabilità è la misura dell'aspettativa che un evento si verifichi."* - Pierre-Simon Laplace
