import Mathlib

/-!
# Probabilidade condicional, probabilidade total e Teorema de Bayes

Página: /pt/probabilidade/probabilidade-condicional (e /en/probability/conditional-probability).

No Mathlib, `μ[A | B]` é a probabilidade condicional de `A` dado `B`. Quando `P(B) = 0`, o
Mathlib define `μ[A | B] = 0`; a página só usa a fórmula com `P(B) > 0`, e os teoremas abaixo
que precisam disso trazem a hipótese `μ B ≠ 0`.
-/

namespace Provas.Condicional

open MeasureTheory ProbabilityTheory Finset
open scoped ENNReal

variable {Ω : Type*} [MeasurableSpace Ω] {μ : Measure Ω} [IsProbabilityMeasure μ]

omit [IsProbabilityMeasure μ] in
/-- Definição: P(A | B) = P(A ∩ B) / P(B). Página: seção 2. -/
theorem definicao {B : Set Ω} (hB : MeasurableSet B) (A : Set Ω) :
    μ[A | B] = μ (A ∩ B) / μ B := by
  rw [cond_apply hB, Set.inter_comm, ENNReal.div_eq_inv_mul]

/-- Com P(B) > 0, P(· | B) é uma probabilidade. Página: seção 3. -/
theorem eh_probabilidade {B : Set Ω} (hB : μ B ≠ 0) : IsProbabilityMeasure μ[|B] :=
  cond_isProbabilityMeasure hB

omit [IsProbabilityMeasure μ] in
/-- Propriedade 1: 0 ≤ P(A | B) ≤ 1 (o 0 ≤ é automático em `ℝ≥0∞`; o ≤ 1 vale até com
P(B) = 0, pela convenção do Mathlib). Página: seção 3. -/
theorem menor_que_um (B A : Set Ω) : μ[A | B] ≤ 1 :=
  prob_le_one

/-- Propriedade 2: P(Ω | B) = 1 e P(B | B) = 1. Página: seção 3. -/
theorem evento_certo {B : Set Ω} (hB : μ B ≠ 0) :
    μ[Set.univ | B] = 1 ∧ μ[B | B] = 1 := by
  have := cond_isProbabilityMeasure (μ := μ) hB
  exact ⟨measure_univ, cond_apply_self hB (measure_ne_top μ B)⟩

omit [IsProbabilityMeasure μ] in
/-- Propriedade 3 (aditividade): se A₁ ∩ A₂ = ∅, então
P(A₁ ∪ A₂ | B) = P(A₁ | B) + P(A₂ | B). Página: seção 3. -/
theorem aditividade {A₁ A₂ : Set Ω} (B : Set Ω) (hd : Disjoint A₁ A₂)
    (h₂ : MeasurableSet A₂) : μ[A₁ ∪ A₂ | B] = μ[A₁ | B] + μ[A₂ | B] :=
  measure_union hd h₂

/-- Propriedade 4 (complemento): P(Aᶜ | B) = 1 − P(A | B). Página: seção 3. -/
theorem complemento {A B : Set Ω} (hA : MeasurableSet A) (hB : μ B ≠ 0) :
    μ[Aᶜ | B] = 1 - μ[A | B] := by
  have := cond_isProbabilityMeasure (μ := μ) hB
  exact prob_compl_eq_one_sub hA

/-- Regra da multiplicação: P(A ∩ B) = P(B)·P(A | B) = P(A)·P(B | A). Página: seção 4. -/
theorem multiplicacao {A B : Set Ω} (hA : MeasurableSet A) (hB : MeasurableSet B) :
    μ (A ∩ B) = μ B * μ[A | B] ∧ μ (A ∩ B) = μ A * μ[B | A] := by
  constructor
  · rw [mul_comm, cond_mul_eq_inter hB A μ, Set.inter_comm]
  · rw [mul_comm, cond_mul_eq_inter hA B μ]

/-- Independência: com P(B) > 0, P(A ∩ B) = P(A)·P(B) se e só se P(A | B) = P(A).
Página: seção 5. -/
theorem independencia_iff {A B : Set Ω} (hB : MeasurableSet B) (hB0 : μ B ≠ 0) :
    μ (A ∩ B) = μ A * μ B ↔ μ[A | B] = μ A := by
  have hfin : μ B ≠ ∞ := measure_ne_top μ B
  rw [cond_apply hB, Set.inter_comm B A]
  constructor
  · intro h
    rw [h, mul_comm (μ A), ← mul_assoc, ENNReal.inv_mul_cancel hB0 hfin, one_mul]
  · intro h
    rw [← h, mul_comm _ (μ (A ∩ B)), mul_assoc, ENNReal.inv_mul_cancel hB0 hfin, mul_one]

omit [IsProbabilityMeasure μ] in
/-- Mutuamente exclusivos: se A ∩ B = ∅, então P(A | B) = 0. Com P(A) > 0, isso muda a
chance de A, logo eles são dependentes. Página: seção 5. -/
theorem exclusivos_condicional_zero {A B : Set Ω} (hB : MeasurableSet B) (hAB : A ∩ B = ∅) :
    μ[A | B] = 0 := by
  rw [cond_apply hB, Set.inter_comm, hAB, measure_empty, mul_zero]

/-- Lei da probabilidade total: se A₁, …, Aₙ formam uma partição de Ω (mensuráveis,
disjuntos dois a dois e com união Ω), então P(B) = Σ P(B | Aᵢ)·P(Aᵢ).
(A página pede também P(Aᵢ) > 0 para que cada P(B | Aᵢ) esteja definida; a igualdade vale
mesmo sem isso.) Página: seção 6. -/
theorem probabilidade_total {ι : Type*} [Fintype ι] {A : ι → Set Ω}
    (hA : ∀ i, MeasurableSet (A i)) (hdisj : Pairwise (Function.onFun Disjoint A))
    (hcob : ⋃ i, A i = Set.univ) {B : Set Ω} (hB : MeasurableSet B) :
    μ B = ∑ i, μ[B | A i] * μ (A i) := by
  have h1 : B = ⋃ i, A i ∩ B := by rw [← Set.iUnion_inter, hcob, Set.univ_inter]
  have hd : Pairwise (Function.onFun Disjoint fun i ↦ A i ∩ B) := fun i j hij ↦
    (hdisj hij).mono Set.inter_subset_left Set.inter_subset_left
  conv_lhs => rw [h1]
  rw [measure_iUnion hd fun i ↦ (hA i).inter hB, tsum_fintype]
  exact Finset.sum_congr rfl fun i _ ↦ (cond_mul_eq_inter (hA i) B μ).symm

/-- Teorema de Bayes: P(A | B) = P(B | A)·P(A) / P(B). Página: seção 7.1. -/
theorem bayes {A B : Set Ω} (hA : MeasurableSet A) (hB : MeasurableSet B) :
    μ[A | B] = μ[B | A] * μ A / μ B := by
  rw [cond_eq_inv_mul_cond_mul hB hA μ, ENNReal.div_eq_inv_mul]
  ring

/-- Teorema de Bayes com partição:
P(Aᵢ | B) = P(B | Aᵢ)·P(Aᵢ) / Σⱼ P(B | Aⱼ)·P(Aⱼ). Página: seção 7.1. -/
theorem bayes_particao {ι : Type*} [Fintype ι] {A : ι → Set Ω}
    (hA : ∀ i, MeasurableSet (A i)) (hdisj : Pairwise (Function.onFun Disjoint A))
    (hcob : ⋃ i, A i = Set.univ) {B : Set Ω} (hB : MeasurableSet B) (i : ι) :
    μ[A i | B] = μ[B | A i] * μ (A i) / ∑ j, μ[B | A j] * μ (A j) := by
  rw [bayes (hA i) hB, ← probabilidade_total hA hdisj hcob hB]

/-- Exercício dos carrapatos: de x = r·(P(L) + P(H) − x) vem
x = r·(P(L) + P(H)) / (1 + r). Página: seção 8.1. -/
theorem carrapatos_formula {pL pH r x : ℝ} (hr : 1 + r ≠ 0) (h : x = r * (pL + pH - x)) :
    x = r * (pL + pH) / (1 + r) := by
  rw [eq_div_iff hr]
  linear_combination h

/-- Exemplos por contagem, com resultados igualmente prováveis. Página: seções 1, 2.1, 3 e 5. -/
theorem contagens :
    -- dado: P(6 | par) = 1/3
    let dado := Finset.Icc 1 6
    let par := dado.filter (fun k ↦ k % 2 = 0)
    let seis := dado.filter (fun k ↦ k = 6)
    -- baralho: (valor, naipe); valor 0 = ás; naipes 0 e 1 = vermelhos
    let baralho := (Finset.univ : Finset (Fin 13 × Fin 4))
    let as := baralho.filter (fun c ↦ c.1 = 0)
    let verm := baralho.filter (fun c ↦ c.2.val < 2)
    -- dois dados
    let dois := Finset.Icc 1 6 ×ˢ Finset.Icc 1 6
    let T := dois.filter (fun p ↦ p.1 = 3)
    let S8 := dois.filter (fun p ↦ p.1 + p.2 = 8)
    let S7 := dois.filter (fun p ↦ p.1 + p.2 = 7)
    ((seis ∩ par).card : ℚ) / par.card = 1/3 ∧
    ((as ∩ verm).card : ℚ) / verm.card = 1/13 ∧ (as.card : ℚ) / baralho.card = 1/13 ∧
    ((as ∩ verm).card : ℚ) / as.card = 1/2 ∧
    ((S8 ∩ T).card : ℚ) / T.card = 1/6 ∧ (S8.card : ℚ) / dois.card = 5/36 ∧
    ((S7 ∩ T).card : ℚ) / T.card = 1/6 ∧ (S7.card : ℚ) / dois.card = 1/6 := by
  intro dado par seis baralho as verm dois T S8 S7
  have h1 : (seis ∩ par).card = 1 := by decide
  have h2 : par.card = 3 := by decide
  have h3 : (as ∩ verm).card = 2 := by decide
  have h4 : verm.card = 26 := by decide
  have h5 : as.card = 4 := by decide
  have h6 : baralho.card = 52 := by decide
  have h7 : (S8 ∩ T).card = 1 := by decide
  have h8 : T.card = 6 := by decide
  have h9 : S8.card = 5 := by decide
  have h10 : dois.card = 36 := by decide
  have h11 : (S7 ∩ T).card = 1 := by decide
  have h12 : S7.card = 6 := by decide
  simp only [h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12]
  norm_num

/-- Urna com 3 bolas vermelhas (0, 1, 2) e 2 azuis (3, 4), duas retiradas sem reposição
(pares ordenados de bolas diferentes): P(V₁ ∩ V₂) = 3/10, P(V₂) = 3/5, P(V₁ | V₂) = 1/2.
Página: seção 9, exercício 2. -/
theorem urna :
    let pares := (Finset.univ : Finset (Fin 5 × Fin 5)).filter (fun p ↦ p.1 ≠ p.2)
    let V1 := pares.filter (fun p ↦ p.1.val < 3)
    let V2 := pares.filter (fun p ↦ p.2.val < 3)
    ((V1 ∩ V2).card : ℚ) / pares.card = 3/10 ∧ (V2.card : ℚ) / pares.card = 3/5 ∧
    ((V1 ∩ V2).card : ℚ) / V2.card = 1/2 := by
  intro pares V1 V2
  have h1 : (V1 ∩ V2).card = 6 := by decide
  have h2 : pares.card = 20 := by decide
  have h3 : V2.card = 12 := by decide
  simp only [h1, h2, h3]
  norm_num

/-- Contas da página, em frações exatas. -/
theorem contas :
    -- dois ases sem reposição; com reposição
    (4/52 : ℚ) * (3/51) = 1/221 ∧ (4/52 : ℚ) * (4/52) = 1/169 ∧
    -- três fábricas: probabilidade total e posterioris
    (2/100 : ℚ) * (5/10) + 3/100 * (3/10) + 4/100 * (2/10) = 27/1000 ∧
    (2/100 : ℚ) * (5/10) / (27/1000) = 10/27 ∧ (3/100 : ℚ) * (3/10) / (27/1000) = 1/3 ∧
    (4/100 : ℚ) * (2/10) / (27/1000) = 8/27 ∧
    -- teste diagnóstico (1%, 99%, 5%) e prevalência de 10%
    (99/100 : ℚ) * (1/100) + 5/100 * (99/100) = 594/10000 ∧
    (99/100 : ℚ) * (1/100) / (594/10000) = 1/6 ∧
    (99/100 : ℚ) * (1/10) + 5/100 * (9/10) = 144/1000 ∧
    (99/100 : ℚ) * (1/10) / (144/1000) = 6875/10000 ∧
    -- carrapatos
    (13/550 : ℚ) = 1/10 * (16/100 + 10/100 - 13/550) ∧ (13/550 : ℚ) / (16/100) = 13/88 ∧
    -- HIV
    (99/100 : ℚ) * (1/5000) + 1/100 * (4999/5000) = 10196/1000000 ∧
    (99/100 : ℚ) * (1/5000) / (10196/1000000) = 99/5098 ∧
    (99/100 : ℚ) * (4999/5000) + 1/100 * (1/5000) = 989804/1000000 ∧
    (99/100 : ℚ) * (4999/5000) / (989804/1000000) = 494901/494902 ∧
    -- controle de qualidade
    (95/100 : ℚ) * (2/1000) + 5/100 * (998/1000) = 518/10000 ∧
    (95/100 : ℚ) * (2/1000) / (518/10000) = 19/518 ∧
    -- previsão do tempo
    (2/10 : ℚ) * (1/10) + 8/10 * (9/10) = 74/100 ∧ (2/10 : ℚ) * (1/10) / (74/100) = 1/37 ∧
    (8/10 : ℚ) * (1/10) / (8/10 * (1/10) + 2/10 * (9/10)) = 4/13 := by
  norm_num

end Provas.Condicional
