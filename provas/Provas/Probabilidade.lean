import Mathlib

/-!
# Probabilidade

Páginas: /pt/probabilidade/ e os tópicos da área (e as versões em /en/probability/).
-/

namespace Provas.Probabilidade

open MeasureTheory ProbabilityTheory

variable {Ω : Type*} [MeasurableSpace Ω] {P : Measure Ω} [IsProbabilityMeasure P]

/-- Regra do complemento: P(Aᶜ) = 1 − P(A), para A mensurável.
Página: /pt/probabilidade/ ("Evento complementar"). -/
theorem regra_complemento {A : Set Ω} (hA : MeasurableSet A) :
    P.real Aᶜ = 1 - P.real A := by
  rw [probReal_compl_eq_one_sub hA]

/-- Regra da adição: P(A ∪ B) = P(A) + P(B) − P(A ∩ B), para A e B mensuráveis.
Página: /pt/probabilidade/ ("Regra da adição"). A prova só usa que B é
mensurável; a hipótese sobre A fica no enunciado porque A é um evento. -/
theorem regra_adicao {A B : Set Ω} (_hA : MeasurableSet A) (hB : MeasurableSet B) :
    P.real (A ∪ B) = P.real A + P.real B - P.real (A ∩ B) := by
  have h := measureReal_union_add_inter (μ := P) (s := A) hB
  linarith

/-- Atalho da variância para uma distribuição finita: se as probabilidades pᵢ
somam 1 e μ = Σ pᵢ xᵢ, então Σ pᵢ (xᵢ − μ)² = Σ pᵢ xᵢ² − μ².
É o Var(X) = E[X²] − (E[X])² da página /pt/probabilidade/ ("Variância de uma
variável aleatória"), no caso discreto finito. -/
theorem atalho_variancia {ι : Type*} (s : Finset ι) (p x : ι → ℝ)
    (hp : ∑ i ∈ s, p i = 1) :
    ∑ i ∈ s, p i * (x i - ∑ j ∈ s, p j * x j) ^ 2 =
      ∑ i ∈ s, p i * x i ^ 2 - (∑ j ∈ s, p j * x j) ^ 2 := by
  set μ := ∑ j ∈ s, p j * x j with hμ
  have expand : ∀ i ∈ s, p i * (x i - μ) ^ 2 =
      p i * x i ^ 2 - 2 * μ * (p i * x i) + μ ^ 2 * p i := by
    intro i _; ring
  rw [Finset.sum_congr rfl expand, Finset.sum_add_distrib, Finset.sum_sub_distrib,
    ← Finset.mul_sum, ← Finset.mul_sum, hp, ← hμ]
  ring

/-- Exemplo das três fábricas (/pt/probabilidade/probabilidade-condicional):
P(B) = 0,02·0,5 + 0,03·0,3 + 0,04·0,2 = 0,027 e P(A₂ | B) = 0,03·0,3 / 0,027 = 1/3.
(A versão antiga da página dizia 0,029 e 31,03%.) -/
theorem exemplo_fabricas :
    (0.02 : ℚ) * 0.5 + 0.03 * 0.3 + 0.04 * 0.2 = 0.027 ∧
    (0.03 : ℚ) * 0.3 / 0.027 = 1 / 3 := by
  norm_num

/-- Exemplo dos carrapatos (/pt/probabilidade/probabilidade-condicional):
x = 0,10·(0,26 − x) tem a solução única x = 0,026/1,1 = 13/550 ≈ 0,02364,
e P(H | L) = x / 0,16 = 13/88 ≈ 0,1477. -/
theorem exemplo_carrapatos (x : ℚ) (h : x = 0.10 * (0.26 - x)) :
    x = 13 / 550 ∧ x / 0.16 = 13 / 88 := by
  have hx : x = 13 / 550 := by linarith
  subst hx
  norm_num

end Provas.Probabilidade
