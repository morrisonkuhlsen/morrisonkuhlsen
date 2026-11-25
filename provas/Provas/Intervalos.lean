import Mathlib

/-!
# Intervalos de confiança

Página: /pt/inferencia-estatistica/intervalos-confianca
(e /en/statistical-inference/confidence-intervals).

A equivalência "μ₀ no intervalo ⇔ o teste bilateral não rejeita" é o teorema
`Provas.Testes.teste_e_intervalo`.
-/

namespace Provas.Intervalos

open Real

/-- Tamanho da amostra para a média: se n ≥ (z·σ/E)², então a margem z·σ/√n é no máximo E
(com z, σ, E > 0 e n > 0). Página: seção 4. -/
theorem tamanho_amostra {z σ E n : ℝ} (hz : 0 < z) (hσ : 0 < σ) (hE : 0 < E) (hn : 0 < n)
    (h : (z * σ / E) ^ 2 ≤ n) : z * σ / sqrt n ≤ E := by
  have hs : 0 < sqrt n := sqrt_pos.mpr hn
  have hzE : 0 ≤ z * σ / E := by positivity
  have h1 : z * σ / E ≤ sqrt n := by
    calc z * σ / E = sqrt ((z * σ / E) ^ 2) := (sqrt_sq hzE).symm
      _ ≤ sqrt n := sqrt_le_sqrt h
  rw [div_le_iff₀ hs]
  rw [div_le_iff₀ hE] at h1
  linarith

/-- Quadruplicar a amostra corta a margem de erro pela metade: c/√(4n) = (c/√n)/2.
Página: seção 5. -/
theorem quadruplicar (c n : ℝ) : c / sqrt (4 * n) = c / sqrt n / 2 := by
  rw [sqrt_mul (by norm_num : (0 : ℝ) ≤ 4), show sqrt 4 = 2 by
    rw [show (4 : ℝ) = 2 ^ 2 by norm_num, sqrt_sq (by norm_num : (0 : ℝ) ≤ 2)]]
  rw [div_div, mul_comm]

/-- p(1 − p) ≤ 1/4 para todo p, com igualdade em p = 1/2: por isso p* = 0,5 dá o maior
tamanho de amostra. Página: seção 4. -/
theorem p_meio_maximo (p : ℝ) : p * (1 - p) ≤ 1 / 4 ∧ (1/2 : ℝ) * (1 - 1/2) = 1 / 4 := by
  constructor
  · nlinarith [sq_nonneg (p - 1/2)]
  · norm_num

/-- Contas da página, em frações exatas: média 1507/12, soma dos quadrados dos desvios
1187/12 (pela fórmula Σx² − (Σx)²/n), EP da proporção e tamanhos de amostra. -/
theorem contas :
    ((120 + 130 + 125 + 128 + 122 + 127 + 126 + 124 + 129 + 123 + 128 + 125 : ℚ) = 1507) ∧
    ((120^2 + 130^2 + 125^2 + 128^2 + 122^2 + 127^2 + 126^2 + 124^2 + 129^2 + 123^2 + 128^2 +
      125^2 : ℚ) - 1507^2 / 12 = 1187 / 12) ∧
    (45/100 : ℚ) * (55/100) / 100 = 2475 / 1000000 ∧
    (196/100 : ℚ) * 5 / 10 = 98/100 ∧
    ((196/100 : ℚ) * 5 / 1) ^ 2 = 9604/100 ∧
    (196/100 : ℚ) ^ 2 * (1/4) / (5/100) ^ 2 = 38416/100 := by
  norm_num

end Provas.Intervalos
