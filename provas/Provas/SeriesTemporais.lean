import Mathlib

/-!
# Séries Temporais

Página: /pt/analise-de-dados/series-temporais (e /en/data-analysis/time-series).
-/

namespace Provas.SeriesTemporais

open Finset

/-- Ajuste dos efeitos sazonais (seção 4.4): subtraindo de cada efeito bruto a média dos
efeitos, os efeitos ajustados sempre somam zero. -/
theorem efeitos_somam_zero {ι : Type*} (s : Finset ι) (hs : s.Nonempty) (e : ι → ℝ) :
    ∑ q ∈ s, (e q - (∑ j ∈ s, e j) / s.card) = 0 := by
  have hn : (s.card : ℝ) ≠ 0 := by exact_mod_cast hs.card_pos.ne'
  rw [sum_sub_distrib, sum_const, nsmul_eq_mul]
  field_simp
  ring

/-- Média móvel centrada 2×4 (seção 4.2): é uma média ponderada de 5 valores com pesos
1/8, 1/4, 1/4, 1/4, 1/8, que somam 1; logo, numa série constante, ela devolve a constante. -/
theorem mm24_pesos (c : ℝ) : (c / 2 + c + c + c + c / 2) / 4 = c := by ring

/-- Modelo multiplicativo (seção 1): com valores positivos, ln(T·S·R) = ln T + ln S + ln R. -/
theorem log_multiplicativo (T S R : ℝ) (hT : 0 < T) (hS : 0 < S) (hR : 0 < R) :
    Real.log (T * S * R) = Real.log T + Real.log S + Real.log R := by
  rw [Real.log_mul (by positivity) hR.ne', Real.log_mul hT.ne' hS.ne']

/-- A autocorrelação amostral fica entre −1 e 1 (seção 3). Com uₜ = yₜ − ȳ (t = 0, …, n − 1)
e k ≤ n: |Σ_{t < n−k} uₜ·u_{t+k}| ≤ Σ_{t < n} uₜ². Vem da desigualdade de Cauchy–Schwarz. -/
theorem autocorrelacao_limitada (u : ℕ → ℝ) (n k : ℕ) (hk : k ≤ n) :
    |∑ t ∈ range (n - k), u t * u (t + k)| ≤ ∑ t ∈ range n, u t ^ 2 := by
  have hA : ∑ t ∈ range (n - k), u t ^ 2 ≤ ∑ t ∈ range n, u t ^ 2 :=
    sum_le_sum_of_subset_of_nonneg (range_subset_range.mpr (Nat.sub_le n k))
      (fun _ _ _ ↦ sq_nonneg _)
  have hB : ∑ t ∈ range (n - k), u (t + k) ^ 2 ≤ ∑ t ∈ range n, u t ^ 2 := by
    have : ∑ t ∈ range (n - k), u (t + k) ^ 2 = ∑ t ∈ (range n).filter (k ≤ ·), u t ^ 2 := by
      rw [show (range n).filter (k ≤ ·) = (range (n - k)).map (addRightEmbedding k) by
        ext t; simp only [mem_filter, mem_range, mem_map, addRightEmbedding_apply]
        constructor
        · rintro ⟨h1, h2⟩; exact ⟨t - k, by omega, by omega⟩
        · rintro ⟨a, ha, rfl⟩; exact ⟨by omega, by omega⟩]
      rw [sum_map]; rfl
    rw [this]
    exact sum_le_sum_of_subset_of_nonneg (filter_subset _ _) (fun _ _ _ ↦ sq_nonneg _)
  have hCS := sum_mul_sq_le_sq_mul_sq (range (n - k)) u (fun t ↦ u (t + k))
  have hS0 : 0 ≤ ∑ t ∈ range n, u t ^ 2 := sum_nonneg fun _ _ ↦ sq_nonneg _
  have hA0 : 0 ≤ ∑ t ∈ range (n - k), u t ^ 2 := sum_nonneg fun _ _ ↦ sq_nonneg _
  have hB0 : 0 ≤ ∑ t ∈ range (n - k), u (t + k) ^ 2 := sum_nonneg fun _ _ ↦ sq_nonneg _
  apply abs_le_of_sq_le_sq' _ hS0 |>.elim (fun h1 h2 ↦ abs_le.mpr ⟨h1, h2⟩)
  calc (∑ t ∈ range (n - k), u t * u (t + k)) ^ 2
      ≤ (∑ t ∈ range (n - k), u t ^ 2) * ∑ t ∈ range (n - k), u (t + k) ^ 2 := hCS
    _ ≤ (∑ t ∈ range n, u t ^ 2) * ∑ t ∈ range n, u t ^ 2 :=
        mul_le_mul hA hB hB0 hS0
    _ = (∑ t ∈ range n, u t ^ 2) ^ 2 := by ring

/-- Contas do exemplo das vendas trimestrais (seções 4.2 a 4.7), em aritmética exata. -/
theorem contas :
    -- médias móveis 2×4, t = 3 a 10
    ((40 / 2 + 52 + 46 + 70 + 44 / 2) / 4 : ℚ) = 52.5 ∧
    ((52 / 2 + 46 + 70 + 44 + 56 / 2) / 4 : ℚ) = 53.5 ∧
    ((46 / 2 + 70 + 44 + 56 + 50 / 2) / 4 : ℚ) = 54.5 ∧
    ((70 / 2 + 44 + 56 + 50 + 76 / 2) / 4 : ℚ) = 55.75 ∧
    ((44 / 2 + 56 + 50 + 76 + 48 / 2) / 4 : ℚ) = 57 ∧
    ((56 / 2 + 50 + 76 + 48 + 61 / 2) / 4 : ℚ) = 58.125 ∧
    ((50 / 2 + 76 + 48 + 61 + 54 / 2) / 4 : ℚ) = 59.25 ∧
    ((76 / 2 + 48 + 61 + 54 + 81 / 2) / 4 : ℚ) = 60.375 ∧
    -- efeitos sazonais brutos (média dos dois desvios de cada trimestre) e sua soma
    (((44 - 54.5) + (48 - 59.25)) / 2 : ℚ) = -10.875 ∧
    (((56 - 55.75) + (61 - 60.375)) / 2 : ℚ) = 0.4375 ∧
    (((46 - 52.5) + (50 - 57)) / 2 : ℚ) = -6.75 ∧
    (((70 - 53.5) + (76 - 58.125)) / 2 : ℚ) = 17.1875 ∧
    (-10.875 + 0.4375 + -6.75 + 17.1875 : ℚ) = 0 ∧
    -- tendência linear na série dessazonalizada
    ((1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 + 11 + 12) / 12 : ℚ) = 6.5 ∧
    ((50.875 + 51.5625 + 52.75 + 52.8125 + 54.875 + 55.5625 + 56.75 + 58.8125 + 58.875 +
      60.5625 + 60.75 + 63.8125) / 12 : ℚ) = 56.5 ∧
    (30.9375 + 22.21875 + 13.125 + 9.21875 + 2.4375 + 0.46875 + 0.125 + 3.46875 + 5.9375 +
      14.21875 + 19.125 + 40.21875 : ℚ) = 161.5 ∧
    (30.25 + 20.25 + 12.25 + 6.25 + 2.25 + 0.25 + 0.25 + 2.25 + 6.25 + 12.25 + 20.25 + 30.25 : ℚ)
      = 143 ∧
    ((161.5 : ℚ) / 143) = 323 / 286 ∧ ((56.5 : ℚ) - 323 / 286 * 6.5) = 2163 / 44 ∧
    -- previsões do ano 4
    ((2163 / 44 : ℚ) + 323 / 286 * 13 + -10.875) = 4661 / 88 ∧
    ((2163 / 44 : ℚ) + 323 / 286 * 16 + 17.1875) = 193145 / 2288 := by
  norm_num

end Provas.SeriesTemporais
