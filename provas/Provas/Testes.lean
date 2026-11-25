import Mathlib

/-!
# Testes de hipótese

Página: /pt/inferencia-estatistica/testes-hipotese (e /en/statistical-inference/hypothesis-testing).

A fórmula P(pelo menos 1 falso positivo) = 1 − (1 − α)^m para testes independentes é o
teorema `Provas.Independencia.pelo_menos_uma`.
-/

namespace Provas.Testes

open MeasureTheory ProbabilityTheory Finset

/-- Padronização do teste Z: se X̄ ~ N(μ₀, σ²/n) e o erro padrão é ep = σ/√n (ep ≠ 0, com
ep² igual à variância de X̄), então Z = (X̄ − μ₀)/ep ~ N(0, 1). Página: seção 2.2, item 1. -/
theorem padronizacao (μ₀ ep : ℝ) (v : NNReal) (hep : ep ≠ 0) (hv : (v : ℝ) = ep ^ 2) :
    (gaussianReal μ₀ v).map (fun x ↦ (x - μ₀) / ep) = gaussianReal 0 1 := by
  have hcomp : (fun x ↦ (x - μ₀) / ep) = (fun x ↦ x / ep) ∘ (fun x ↦ x - μ₀) := rfl
  rw [hcomp, ← Measure.map_map (by fun_prop) (by fun_prop), gaussianReal_map_sub_const,
    gaussianReal_map_div_const, sub_self, zero_div]
  congr 1
  ext
  simp only [NNReal.coe_div, NNReal.coe_mk, NNReal.coe_one, hv]
  field_simp

/-- Bonferroni: se cada um dos m eventos "falso positivo no teste i" tem probabilidade no
máximo α/m, a probabilidade de pelo menos um falso positivo é no máximo α, sem precisar de
independência (desigualdade da união). Página: seção 6. -/
theorem bonferroni {Ω : Type*} [MeasurableSpace Ω] (P : Measure Ω) [IsProbabilityMeasure P]
    {m : ℕ} (hm : 0 < m) (A : Fin m → Set Ω) {α : ℝ}
    (h : ∀ i, P.real (A i) ≤ α / m) : P.real (⋃ i, A i) ≤ α := by
  calc P.real (⋃ i, A i) ≤ ∑ i, P.real (A i) := measureReal_iUnion_fintype_le _
    _ ≤ ∑ _i : Fin m, α / m := Finset.sum_le_sum fun i _ ↦ h i
    _ = α := by
      rw [Finset.sum_const, Finset.card_univ, Fintype.card_fin, nsmul_eq_mul]
      field_simp

/-- Teste e intervalo de confiança: com c ≥ 0 o valor crítico e ep > 0 o erro padrão,
|x̄ − μ₀| / ep ≤ c (não rejeitar H₀) se e só se μ₀ está em [x̄ − c·ep, x̄ + c·ep].
Página: seção 5. -/
theorem teste_e_intervalo {xbar μ₀ c ep : ℝ} (hep : 0 < ep) :
    |xbar - μ₀| / ep ≤ c ↔ xbar - c * ep ≤ μ₀ ∧ μ₀ ≤ xbar + c * ep := by
  rw [div_le_iff₀ hep, abs_sub_le_iff]
  constructor <;> rintro ⟨h1, h2⟩ <;> constructor <;> linarith

/-- Contas da página, em frações exatas: exercício 4.1 (EP = 0,4 e t = 3); qui-quadrado
do exercício 4.2 (esperados e χ² = 693/80 = 8,6625); proporção (p̂ = 0,2, n·p₀ = 30);
intervalo 11,2 ± 2,0301·0,4. -/
theorem contas :
    (24/10 : ℚ) / 6 = 4/10 ∧ ((112/10 : ℚ) - 10) / (4/10) = 3 ∧
    (50 * 50 : ℚ) / 110 = 250/11 ∧ (50 * 40 : ℚ) / 110 = 200/11 ∧ (50 * 20 : ℚ) / 110 = 100/11 ∧
    (60 * 50 : ℚ) / 110 = 300/11 ∧ (60 * 40 : ℚ) / 110 = 240/11 ∧ (60 * 20 : ℚ) / 110 = 120/11 ∧
    (30 - 250/11 : ℚ) ^ 2 / (250/11) + (15 - 200/11) ^ 2 / (200/11) + (5 - 100/11) ^ 2 / (100/11) +
      (20 - 300/11) ^ 2 / (300/11) + (25 - 240/11) ^ 2 / (240/11) + (15 - 120/11) ^ 2 / (120/11)
      = 693/80 ∧
    (693/80 : ℚ) = 86625/10000 ∧
    (40 : ℚ) / 200 = 2/10 ∧ (200 : ℚ) * (15/100) = 30 ∧ (15/100 : ℚ) * (85/100) = 1275/10000 ∧
    (112/10 : ℚ) - 20301/10000 * (4/10) = 1038796/100000 ∧
    (112/10 : ℚ) + 20301/10000 * (4/10) = 1201204/100000 := by
  norm_num

end Provas.Testes
