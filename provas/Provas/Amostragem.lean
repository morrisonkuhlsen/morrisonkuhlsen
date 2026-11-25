import Mathlib

/-!
# Amostragem

Página: /pt/inferencia-estatistica/amostragem (e /en/statistical-inference/sampling).

"Quadruplicar n corta o erro padrão pela metade" e "p(1 − p) ≤ 1/4" estão em
`Provas/Intervalos.lean` (`quadruplicar` e `p_meio_maximo`).
-/

namespace Provas.Amostragem

open Finset

/-- Correção para população finita: as duas formas da página são iguais,
n₀ / (1 + (n₀ − 1)/N) = N·a / (E²(N − 1) + a), com n₀ = a/E² e a = z²p(1 − p),
para N > 0, E ≠ 0 e a + E²(N − 1) ≠ 0. Página: seção 5.3. -/
theorem cochran_formas {a E N : ℝ} (hN : N ≠ 0) (hE : E ≠ 0) (hden : E ^ 2 * (N - 1) + a ≠ 0) :
    (a / E ^ 2) / (1 + (a / E ^ 2 - 1) / N) = N * a / (E ^ 2 * (N - 1) + a) := by
  have hE2 : E ^ 2 ≠ 0 := pow_ne_zero 2 hE
  have h1 : 1 + (a / E ^ 2 - 1) / N = (E ^ 2 * (N - 1) + a) / (E ^ 2 * N) := by
    field_simp
    ring
  rw [h1, div_div_eq_mul_div]
  field_simp

/-- Alocação proporcional: os nₕ = n·Nₕ/N somam n (com N = ΣNₕ ≠ 0). Página: seção 6. -/
theorem proporcional_soma {ι : Type*} (s : Finset ι) (Nh : ι → ℝ) (n : ℝ)
    (hN : ∑ i ∈ s, Nh i ≠ 0) :
    ∑ h ∈ s, n * (Nh h / ∑ i ∈ s, Nh i) = n := by
  rw [← Finset.mul_sum, ← Finset.sum_div, div_self hN, mul_one]

/-- Alocação de Neyman: os nₕ = n·Nₕσₕ/Σ Nᵢσᵢ somam n (com Σ Nᵢσᵢ ≠ 0). Página: seção 6. -/
theorem neyman_soma {ι : Type*} (s : Finset ι) (Nh σ : ι → ℝ) (n : ℝ)
    (hD : ∑ i ∈ s, Nh i * σ i ≠ 0) :
    ∑ h ∈ s, n * (Nh h * σ h / ∑ i ∈ s, Nh i * σ i) = n := by
  rw [← Finset.mul_sum, ← Finset.sum_div, div_self hD, mul_one]

/-- Contas da página, em frações exatas: tamanhos de amostra com z = 1,96 (exemplos das
peças e da eleição), correção finita (4802 / 13,4579), alocações (240/160 e 171,43/228,57)
e o fator (3/2)² = 2,25. -/
theorem contas :
    (196/100 : ℚ) ^ 2 * (10/100) * (90/100) / (3/100) ^ 2 = 38416/100 ∧
    (196/100 : ℚ) ^ 2 * (40/100) * (60/100) / (2/100) ^ 2 = 230496/100 ∧
    (5000 : ℚ) * (196/100) ^ 2 * (1/4) = 4802 ∧
    (5/100 : ℚ) ^ 2 * 4999 + (196/100) ^ 2 * (1/4) = 134579/10000 ∧
    (400 : ℚ) * 6000 / 10000 = 240 ∧ (400 : ℚ) * 4000 / 10000 = 160 ∧
    (6000 : ℚ) * 10 + 4000 * 20 = 140000 ∧
    (400 : ℚ) * 60000 / 140000 = 1200/7 ∧ (400 : ℚ) * 80000 / 140000 = 1600/7 ∧
    ((3 : ℚ) / 2) ^ 2 = 9/4 := by
  norm_num

end Provas.Amostragem
