import Mathlib

/-!
# Post sobre o Lean

Post: /lean-linguagem-computador-confere-prova/ (e a versão em inglês,
/lean-language-computer-checks-your-proof/). Os mesmos teoremas aparecem no texto.
-/

namespace Provas.PostLean

open Finset

/-- (a + b)² = a² + 2ab + b² para quaisquer reais a e b (seção "A primeira prova"). -/
theorem binomio (a b : ℝ) : (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by
  ring

/-- No Lean, 1/0 = 0 (seção "A hipótese que ninguém escreve"). -/
theorem um_sobre_zero : (1 : ℝ) / 0 = 0 := by
  simp

/-- x/x = 1 desde que x ≠ 0 (mesma seção). -/
theorem divide_por_si (x : ℝ) (hx : x ≠ 0) : x / x = 1 := by
  exact div_self hx

/-- n² + n + 41 é primo para todo n < 40 (seção "Provando o que o teste só sugeria"). -/
theorem primos_ate_39 : ∀ n < 40, Nat.Prime (n ^ 2 + n + 41) := by
  intro n hn
  interval_cases n <;> norm_num

/-- 40² + 40 + 41 = 1681 = 41 · 41 não é primo (mesma seção). -/
theorem falha_em_40 : ¬ Nat.Prime (40 ^ 2 + 40 + 41) := by
  norm_num

/-- 1 + 3 + 5 + ⋯ + (2n − 1) = n² para todo n natural (seção "Uma prova por indução"). -/
theorem soma_impares (n : ℕ) : ∑ i ∈ range n, (2 * i + 1) = n ^ 2 := by
  induction n with
  | zero => simp
  | succ k ih =>
    rw [sum_range_succ, ih]
    ring

end Provas.PostLean
