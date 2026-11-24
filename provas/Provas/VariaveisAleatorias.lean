import Mathlib

/-!
# Variáveis aleatórias

Página: /pt/probabilidade/variaveis-aleatorias (e /en/probability/random-variables).

A média e a variância da normal, usadas na página, estão provadas em
`Provas/Distribuicoes.lean` (`normal_media` e `normal_variancia`).
-/

namespace Provas.VariaveisAleatorias

open Finset MeasureTheory ProbabilityTheory

/-- Dado honesto: E[X] = Σ x·(1/6), x = 1, …, 6, vale 7/2 = 3,5.
Página: seção 3.1. (A face x + 1 percorre 1, …, 6 quando x percorre 0, …, 5.) -/
theorem dado_esperanca :
    ∑ x ∈ range 6, ((x : ℚ) + 1) * (1 / 6) = 7 / 2 := by
  simp [sum_range_succ]
  norm_num

/-- Dado honesto: Var(X) = Σ (x − 3,5)²·(1/6) = 35/12, pela definição.
Página: seção 3.2. -/
theorem dado_variancia :
    ∑ x ∈ range 6, ((x : ℚ) + 1 - 7 / 2) ^ 2 * (1 / 6) = 35 / 12 := by
  simp [sum_range_succ]
  norm_num

/-- Dado honesto, pelo atalho: E[X²] − (E[X])² = 91/6 − (7/2)² = 35/12.
Página: seção 3.2 (segundo caminho). -/
theorem dado_variancia_atalho :
    ∑ x ∈ range 6, ((x : ℚ) + 1) ^ 2 * (1 / 6) - (7 / 2) ^ 2 = 35 / 12 := by
  simp [sum_range_succ]
  norm_num

/-- Atalho da variância: Var(X) = E[X²] − (E[X])², para X com E[X²] finito.
Página: seção 3.2. -/
theorem variancia_atalho {Ω : Type*} [MeasurableSpace Ω] {P : Measure Ω}
    [IsProbabilityMeasure P] {X : Ω → ℝ} (hX : MemLp X 2 P) :
    variance X P = P[X ^ 2] - P[X] ^ 2 :=
  variance_eq_sub hX

/-- Variável contínua (distribuição com densidade, isto é, absolutamente contínua em
relação ao comprimento): a probabilidade de um valor exato é zero.
Página: seção 2.2 ("Observação importante"). -/
theorem continua_ponto_zero {P : Measure ℝ} (hP : P ≪ volume) (x : ℝ) :
    P {x} = 0 :=
  hP (Real.volume_singleton)

/-- Fórmula da transformação: se X tem densidade f_X, g é uma bijeção mensurável e a
inversa g⁻¹ tem derivada (g⁻¹)' em todo ponto, então Y = g(X) satisfaz
P(Y ∈ s) = ∫_s f_X(g⁻¹(y))·|(g⁻¹)'(y)| dy, ou seja, f_Y(y) = f_X(g⁻¹(y))·|(g⁻¹)'(y)|.
Aqui `ginv` é g⁻¹ e `ginv.symm` é g.
Página: seção 4.1. -/
theorem transformacao (ginv : ℝ ≃ᵐ ℝ) {ginv' : ℝ → ℝ}
    (hd : ∀ y, HasDerivAt ginv (ginv' y) y)
    {fX : ℝ → ℝ} (hf : 0 ≤ᵐ[volume] fX) (hint : Integrable fX)
    {s : Set ℝ} (hs : MeasurableSet s) :
    (volume.withDensity (fun x ↦ ENNReal.ofReal (fX x))).map ginv.symm s
      = ENNReal.ofReal (∫ y in s, |ginv' y| * fX (ginv y)) :=
  ginv.withDensity_ofReal_map_symm_apply_eq_integral_abs_deriv_mul' hs hd hf hint

/-- Passos 6 a 9 da seção 4.1: somando os dois ramos ±√y,
f_X(√y)/(2√y) + f_X(−√y)/(2√y) = e^(−y/2)/√(2πy), para y > 0,
onde f_X(x) = e^(−x²/2)/√(2π) é a densidade da normal padrão. -/
theorem qui_quadrado_densidade (y : ℝ) (hy : 0 < y) :
    1 / Real.sqrt (2 * Real.pi) * Real.exp (-(Real.sqrt y) ^ 2 / 2) * (1 / (2 * Real.sqrt y)) +
      1 / Real.sqrt (2 * Real.pi) * Real.exp (-(-Real.sqrt y) ^ 2 / 2) *
        (1 / (2 * Real.sqrt y)) =
      Real.exp (-y / 2) / Real.sqrt (2 * Real.pi * y) := by
  have hs : Real.sqrt y ^ 2 = y := Real.sq_sqrt hy.le
  have hpos : 0 < Real.sqrt y := Real.sqrt_pos.mpr hy
  have hpi : 0 < Real.sqrt (2 * Real.pi) := Real.sqrt_pos.mpr (by positivity)
  rw [Real.sqrt_mul (by positivity) y, neg_sq, hs]
  field_simp
  ring

end Provas.VariaveisAleatorias
