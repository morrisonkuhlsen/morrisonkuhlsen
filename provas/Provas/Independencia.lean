import Mathlib

/-!
# Eventos independentes e a regra do produto

Página: /pt/probabilidade/eventos-independentes (e /en/probability/independent-events).
-/

namespace Provas.Independencia

open MeasureTheory ProbabilityTheory Finset

variable {Ω : Type*} [MeasurableSpace Ω] {μ : Measure Ω} [IsProbabilityMeasure μ]

omit [IsProbabilityMeasure μ] in
/-- Mutuamente exclusivos não são independentes: se A ∩ B = ∅ e P(A), P(B) > 0,
então P(A ∩ B) ≠ P(A)·P(B). Página: seção "Independência". -/
theorem exclusivos_nao_independentes {A B : Set Ω} (hAB : A ∩ B = ∅)
    (hA : 0 < μ.real A) (hB : 0 < μ.real B) :
    μ.real (A ∩ B) ≠ μ.real A * μ.real B := by
  rw [hAB, measureReal_empty]
  exact (mul_pos hA hB).ne

omit [IsProbabilityMeasure μ] in
/-- A definição pelo produto é simétrica: P(A ∩ B) = P(A)P(B) ↔ P(B ∩ A) = P(B)P(A).
Página: seção "Independência". -/
theorem produto_simetrico (A B : Set Ω) :
    μ.real (A ∩ B) = μ.real A * μ.real B ↔ μ.real (B ∩ A) = μ.real B * μ.real A := by
  rw [Set.inter_comm, mul_comm]

/-- Regra do produto com condicional: P(A ∩ B) = P(A)·P(B | A), para A mensurável.
Página: seção "Quando não dá para multiplicar". -/
theorem produto_condicional {A : Set Ω} (hA : MeasurableSet A) (B : Set Ω) :
    μ (A ∩ B) = μ A * μ[B | A] := by
  rw [mul_comm, cond_mul_eq_inter hA B μ]

/-- "Pelo menos uma vez em N tentativas": se A₀, A₁, … são mutuamente independentes e
cada uma tem probabilidade p, então P(A₀ ∪ … ∪ A_{N−1}) = 1 − (1 − p)^N.
Página: seção "O que quer dizer 1 em N". -/
theorem pelo_menos_uma {A : ℕ → Set Ω} (hA : ∀ i, MeasurableSet (A i))
    (hind : iIndepSet A μ) {p : ℝ} (hp : ∀ i, μ.real (A i) = p) (N : ℕ) :
    μ.real (⋃ i ∈ range N, A i) = 1 - (1 - p) ^ N := by
  -- os complementos também são independentes: cada Aᵢᶜ é mensurável na σ-álgebra gerada por Aᵢ
  have hm : ∀ i ∈ range N, MeasurableSet[MeasurableSpace.generateFrom {A i}] (A i)ᶜ :=
    fun i _ ↦ (MeasurableSpace.measurableSet_generateFrom (Set.mem_singleton _)).compl
  have hprod : μ (⋂ i ∈ range N, (A i)ᶜ) = ∏ i ∈ range N, μ (A i)ᶜ :=
    iIndep.meas_biInter hind hm
  have hU : MeasurableSet (⋃ i ∈ range N, A i) :=
    Finset.measurableSet_biUnion _ fun i _ ↦ hA i
  have hcompl : (⋃ i ∈ range N, A i)ᶜ = ⋂ i ∈ range N, (A i)ᶜ := by
    ext x; simp
  have h1 : μ.real (⋃ i ∈ range N, A i) = 1 - μ.real (⋂ i ∈ range N, (A i)ᶜ) := by
    rw [← hcompl, probReal_compl_eq_one_sub hU]
    ring
  have h2 : μ.real (⋂ i ∈ range N, (A i)ᶜ) = ∏ i ∈ range N, μ.real (A i)ᶜ := by
    simp only [Measure.real, hprod, ENNReal.toReal_prod]
  have h3 : ∀ i ∈ range N, μ.real (A i)ᶜ = 1 - p := fun i _ ↦ by
    rw [probReal_compl_eq_one_sub (hA i), hp i]
  rw [h1, h2, prod_congr rfl h3, prod_const, card_range]

/-- Exemplo de independência dois a dois sem independência mútua: duas moedas
(4 resultados igualmente prováveis), A = "1ª cara", B = "2ª cara", C = "iguais".
Cada par tem P = 1/4 = (1/2)(1/2), mas P(A ∩ B ∩ C) = 1/4 ≠ 1/8.
Página: seção "A regra do produto". -/
theorem dois_a_dois_nao_mutua :
    let Ω := (Finset.univ : Finset (Bool × Bool))
    let P := fun (E : Finset (Bool × Bool)) ↦ (E.card : ℚ) / Ω.card
    let A := Ω.filter (fun w ↦ w.1 = true)
    let B := Ω.filter (fun w ↦ w.2 = true)
    let C := Ω.filter (fun w ↦ w.1 = w.2)
    P A = 1/2 ∧ P B = 1/2 ∧ P C = 1/2 ∧
    P (A ∩ B) = P A * P B ∧ P (A ∩ C) = P A * P C ∧ P (B ∩ C) = P B * P C ∧
    P (A ∩ B ∩ C) = 1/4 ∧ P (A ∩ B ∩ C) ≠ P A * P B * P C := by
  intro Ω P A B C
  have h0 : Ω.card = 4 := by decide
  have hA : A.card = 2 := by decide
  have hB : B.card = 2 := by decide
  have hC : C.card = 2 := by decide
  have hAB : (A ∩ B).card = 1 := by decide
  have hAC : (A ∩ C).card = 1 := by decide
  have hBC : (B ∩ C).card = 1 := by decide
  have hABC : (A ∩ B ∩ C).card = 1 := by decide
  simp only [P, h0, hA, hB, hC, hAB, hAC, hBC, hABC]
  norm_num

/-- Contas da página, em frações exatas. -/
theorem contas :
    (1/3 : ℚ) * (1/3) * (1/4) * (1/4) * (1/5) * (1/5) * (1/6) * (1/7) = 1 / 151200 ∧
    1 - (2/3 : ℚ) * (2/3) * (3/4) * (3/4) * (4/5) * (4/5) * (5/6) * (6/7) = 31 / 35 ∧
    (4/52 : ℚ) * (3/51) = 1 / 221 ∧ (4/52 : ℚ) * (4/52) = 1 / 169 ∧
    (1/2 : ℚ) * (1/6) = 1 / 12 := by
  norm_num

end Provas.Independencia
