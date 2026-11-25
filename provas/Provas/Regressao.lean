import Mathlib

/-!
# Regressão Linear

Página: /pt/analise-de-dados/regressao-linear (e /en/data-analysis/linear-regression).

Notação: n pares (xᵢ, yᵢ) indexados por `s`, x̄ = Σxᵢ/n, ȳ = Σyᵢ/n,
Sxx = Σ(xᵢ − x̄)², Sxy = Σ(xᵢ − x̄)(yᵢ − ȳ), b = Sxy/Sxx e a = ȳ − b·x̄.
A hipótese Sxx ≠ 0 é "nem todos os x iguais", que a página diz.
-/

namespace Provas.Regressao

open Finset

variable {ι : Type*} (s : Finset ι) (x y : ι → ℝ)

/-- Forma de cálculo: Sxy = Σxᵢyᵢ − n·x̄·ȳ. Seção 3. -/
theorem sxy_forma (hs : s.Nonempty) :
    ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) * (y i - (∑ j ∈ s, y j) / s.card) =
      ∑ i ∈ s, x i * y i - s.card * ((∑ j ∈ s, x j) / s.card) * ((∑ j ∈ s, y j) / s.card) := by
  have hn : (s.card : ℝ) ≠ 0 := by exact_mod_cast hs.card_pos.ne'
  have e : ∀ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) * (y i - (∑ j ∈ s, y j) / s.card) =
      x i * y i - (∑ j ∈ s, y j) / s.card * x i - (∑ j ∈ s, x j) / s.card * y i +
        (∑ j ∈ s, x j) / s.card * ((∑ j ∈ s, y j) / s.card) := fun i _ ↦ by ring
  rw [sum_congr rfl e, sum_add_distrib, sum_sub_distrib, sum_sub_distrib, ← mul_sum, ← mul_sum,
    sum_const, nsmul_eq_mul]
  field_simp
  ring

/-- Forma de cálculo: Sxx = Σxᵢ² − n·x̄² (caso y = x da anterior). Seção 3. -/
theorem sxx_forma (hs : s.Nonempty) :
    ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) ^ 2 =
      ∑ i ∈ s, x i ^ 2 - s.card * ((∑ j ∈ s, x j) / s.card) ^ 2 := by
  have := sxy_forma s x x hs
  simp only [← sq] at this
  rw [this]
  ring

/-- Equações normais: com b = Sxy/Sxx e a = ȳ − b·x̄, os resíduos eᵢ = yᵢ − a − b·xᵢ
somam zero e Σ xᵢeᵢ = 0. Seção 3 ("os resíduos somam zero"). -/
theorem equacoes_normais (hs : s.Nonempty)
    (hSxx : ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) ^ 2 ≠ 0) :
    let xb := (∑ j ∈ s, x j) / s.card
    let yb := (∑ j ∈ s, y j) / s.card
    let b := (∑ i ∈ s, (x i - xb) * (y i - yb)) / ∑ i ∈ s, (x i - xb) ^ 2
    let a := yb - b * xb
    ∑ i ∈ s, (y i - a - b * x i) = 0 ∧ ∑ i ∈ s, x i * (y i - a - b * x i) = 0 := by
  intro xb yb b a
  have hn : (s.card : ℝ) ≠ 0 := by exact_mod_cast hs.card_pos.ne'
  have sx : ∑ j ∈ s, x j = s.card * xb := by simp only [xb]; field_simp
  have sy : ∑ j ∈ s, y j = s.card * yb := by simp only [yb]; field_simp
  -- resíduo escrito com desvios: eᵢ = (yᵢ − ȳ) − b(xᵢ − x̄)
  have e : ∀ i ∈ s, y i - a - b * x i = (y i - yb) - b * (x i - xb) := fun i _ ↦ by
    simp only [a]; ring
  have dx : ∑ i ∈ s, (x i - xb) = 0 := by rw [sum_sub_distrib, sum_const, nsmul_eq_mul, sx]; ring
  have dy : ∑ i ∈ s, (y i - yb) = 0 := by rw [sum_sub_distrib, sum_const, nsmul_eq_mul, sy]; ring
  have hS : ∑ i ∈ s, (x i - xb) ^ 2 ≠ 0 := hSxx
  have hb : b * ∑ i ∈ s, (x i - xb) ^ 2 = ∑ i ∈ s, (x i - xb) * (y i - yb) :=
    div_mul_cancel₀ _ hS
  constructor
  · rw [sum_congr rfl e, sum_sub_distrib, ← mul_sum, dx, dy]; ring
  · -- Σ xᵢeᵢ = Σ (xᵢ − x̄)eᵢ + x̄ Σ eᵢ, e Σ (xᵢ − x̄)eᵢ = Sxy − b·Sxx = 0
    have h1 : ∀ i ∈ s, x i * (y i - a - b * x i) =
        ((x i - xb) * (y i - yb) - b * (x i - xb) ^ 2) + xb * ((y i - yb) - b * (x i - xb)) :=
      fun i _ ↦ by simp only [a]; ring
    rw [sum_congr rfl h1, sum_add_distrib, sum_sub_distrib, ← mul_sum, ← mul_sum,
      sum_sub_distrib, ← mul_sum, dx, dy, hb]
    ring

/-- A reta de mínimos quadrados minimiza a soma dos quadrados dos resíduos: para quaisquer
α, β, Σ(yᵢ − a − b·xᵢ)² ≤ Σ(yᵢ − α − β·xᵢ)². Seção 3. -/
theorem minimos_quadrados (hs : s.Nonempty)
    (hSxx : ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) ^ 2 ≠ 0) (α β : ℝ) :
    let xb := (∑ j ∈ s, x j) / s.card
    let yb := (∑ j ∈ s, y j) / s.card
    let b := (∑ i ∈ s, (x i - xb) * (y i - yb)) / ∑ i ∈ s, (x i - xb) ^ 2
    let a := yb - b * xb
    ∑ i ∈ s, (y i - a - b * x i) ^ 2 ≤ ∑ i ∈ s, (y i - α - β * x i) ^ 2 := by
  intro xb yb b a
  obtain ⟨h0, h1⟩ := equacoes_normais s x y hs hSxx
  -- yᵢ − α − βxᵢ = eᵢ + ((a − α) + (b − β)xᵢ); o termo cruzado some pelas equações normais
  have exp : ∀ i ∈ s, (y i - α - β * x i) ^ 2 =
      (y i - a - b * x i) ^ 2 + ((a - α) + (b - β) * x i) ^ 2 +
        (2 * (a - α) * (y i - a - b * x i) + 2 * (b - β) * (x i * (y i - a - b * x i))) :=
    fun i _ ↦ by ring
  rw [sum_congr rfl exp, sum_add_distrib, sum_add_distrib, sum_add_distrib, ← mul_sum, ← mul_sum,
    h0, h1]
  have : 0 ≤ ∑ i ∈ s, ((a - α) + (b - β) * x i) ^ 2 := sum_nonneg fun i _ ↦ sq_nonneg _
  linarith

/-- A reta passa pelo ponto das médias: a + b·x̄ = ȳ. Seção 3. -/
theorem passa_pelas_medias (xb yb b : ℝ) : (yb - b * xb) + b * xb = yb := by ring

/-- Soma dos quadrados dos resíduos: SQres = Syy − Sxy²/Sxx, isto é, Syy − b·Sxy.
Com ela, R² = 1 − SQres/Syy = Sxy²/(Sxx·Syy). Seção 5. -/
theorem sq_residuos (hSxx : ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) ^ 2 ≠ 0) :
    let xb := (∑ j ∈ s, x j) / s.card
    let yb := (∑ j ∈ s, y j) / s.card
    let Sxx := ∑ i ∈ s, (x i - xb) ^ 2
    let Sxy := ∑ i ∈ s, (x i - xb) * (y i - yb)
    let Syy := ∑ i ∈ s, (y i - yb) ^ 2
    let b := Sxy / Sxx
    let a := yb - b * xb
    ∑ i ∈ s, (y i - a - b * x i) ^ 2 = Syy - Sxy ^ 2 / Sxx := by
  intro xb yb Sxx Sxy Syy b a
  have hS : Sxx ≠ 0 := hSxx
  have e : ∀ i ∈ s, (y i - a - b * x i) ^ 2 =
      (y i - yb) ^ 2 - 2 * b * ((x i - xb) * (y i - yb)) + b ^ 2 * (x i - xb) ^ 2 :=
    fun i _ ↦ by simp only [a]; ring
  rw [sum_congr rfl e, sum_add_distrib, sum_sub_distrib, ← mul_sum, ← mul_sum]
  simp only [b]
  field_simp
  ring

/-- Contas do exemplo (horas de estudo × nota), em aritmética exata. Seções 4 a 7. -/
theorem contas :
    ((5 + 7 + 8 + 10 + 12 + 15 + 18 + 20 : ℚ)) = 95 ∧
    ((6 + 7 + 15/2 + 8 + 17/2 + 9 + 19/2 + 10 : ℚ)) = 131 / 2 ∧
    ((25 + 49 + 64 + 100 + 144 + 225 + 324 + 400 : ℚ)) = 1331 ∧
    ((36 + 49 + 225/4 + 64 + 289/4 + 81 + 361/4 + 100 : ℚ)) = 2195 / 4 ∧
    ((30 + 49 + 60 + 80 + 102 + 135 + 171 + 200 : ℚ)) = 827 ∧
    ((95 : ℚ) / 8) = 11.875 ∧ ((131 / 2 : ℚ) / 8) = 8.1875 ∧
    (8 * 11.875 * 8.1875 : ℚ) = 777.8125 ∧ (827 - 777.8125 : ℚ) = 49.1875 ∧
    (8 * 11.875 ^ 2 : ℚ) = 1128.125 ∧ (1331 - 1128.125 : ℚ) = 202.875 ∧
    (2195 / 4 - 8 * 8.1875 ^ 2 : ℚ) = 399 / 32 ∧
    (49.1875 / 202.875 : ℚ) = 787 / 3246 ∧
    (8.1875 - 787 / 3246 * 11.875 : ℚ) = 17231 / 3246 ∧
    (17231 / 3246 + 787 / 3246 * 14 : ℚ) = 28249 / 3246 ∧
    (17231 / 3246 + 787 / 3246 * 25 : ℚ) = 36906 / 3246 ∧
    -- R² = Sxy²/(Sxx·Syy)
    ((49.1875 : ℚ) ^ 2 / (202.875 * (399 / 32))) = 1 - (1763 / 3246) / (399 / 32) := by
  norm_num

end Provas.Regressao
