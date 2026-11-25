import Mathlib

/-!
# Questões resolvidas de probabilidade

Página: /pt/probabilidade/questions (e /en/probability/questions).

As fórmulas das distribuições (binomial, Poisson, normal, exponencial) já estão em
`Provas/Distribuicoes.lean`; aqui ficam as propriedades que as questões usam e as contas.
-/

namespace Provas.Questoes

open Real

/-- Exponencial, falta de memória: com P(T > t) = e^(−λt),
P(T > s + t) / P(T > s) = P(T > t), para quaisquer s e t. Página: Questão 2, item 4. -/
theorem exponencial_falta_de_memoria (l s t : ℝ) :
    exp (-l * (s + t)) / exp (-l * s) = exp (-l * t) := by
  rw [← exp_sub]
  ring_nf

/-- Exponencial com taxa λ > 0: a mediana m = ln 2 / λ satisfaz P(T > m) = e^(−λm) = 1/2.
Página: Questão 2, item 3. -/
theorem exponencial_mediana {l : ℝ} (hl : 0 < l) : exp (-l * (log 2 / l)) = 1 / 2 := by
  have : -l * (log 2 / l) = -log 2 := by field_simp
  rw [this, exp_neg, exp_log (by norm_num : (0 : ℝ) < 2), one_div]

/-- Geométrica (X = número da tentativa do 1º sucesso, k ≥ 1), com 0 < p ≤ 1: as
probabilidades P(X = k) = (1 − p)^(k−1)·p somam 1. -/
theorem geometrica_soma {p : ℝ} (hp0 : 0 < p) (hp1 : p ≤ 1) :
    HasSum (fun j : ℕ ↦ (1 - p) ^ j * p) 1 := by
  have hq : ‖1 - p‖ < 1 := by
    rw [Real.norm_eq_abs, abs_lt]; constructor <;> linarith
  have := (hasSum_geometric_of_norm_lt_one hq).mul_right p
  convert this using 1
  rw [sub_sub_cancel, inv_mul_cancel₀ hp0.ne']

/-- Geométrica: P(X > k) = Σ_{j ≥ k} (1 − p)^j·p = (1 − p)^k, isto é, as k primeiras
tentativas falham. (O índice j aqui é o número de fracassos antes do sucesso, X = j + 1.)
Página: Questão 5, item 3. -/
theorem geometrica_cauda {p : ℝ} (hp0 : 0 < p) (hp1 : p ≤ 1) (k : ℕ) :
    HasSum (fun j : ℕ ↦ (1 - p) ^ (k + j) * p) ((1 - p) ^ k) := by
  have := (geometrica_soma hp0 hp1).mul_left ((1 - p) ^ k)
  simpa [pow_add, mul_assoc] using this

/-- Geométrica: E[X] = Σ_{k ≥ 1} k·(1 − p)^(k−1)·p = 1/p. Somando r geométricas
independentes (linearidade da esperança), a binomial negativa tem E[X] = r/p.
Página: Questão 6, item 2. -/
theorem geometrica_media {p : ℝ} (hp0 : 0 < p) (hp1 : p ≤ 1) :
    HasSum (fun j : ℕ ↦ ((j : ℝ) + 1) * ((1 - p) ^ j * p)) (1 / p) := by
  have hq : ‖1 - p‖ < 1 := by
    rw [Real.norm_eq_abs, abs_lt]; constructor <;> linarith
  -- Σ j·qʲ = q/(1 − q)² e Σ qʲ = 1/(1 − q), com q = 1 − p
  have h1 := (hasSum_coe_mul_geometric_of_norm_lt_one hq).add
    (hasSum_geometric_of_norm_lt_one hq)
  have h2 := h1.mul_right p
  convert h2 using 1
  · ext j; ring
  · have : (1 : ℝ) - (1 - p) = p := by ring
    rw [this]; field_simp; ring

/-- Binomial negativa (X = tentativa do r-ésimo sucesso): P(X = 5) com r = 3 e p = 0,4 é
C(4, 2)·0,4³·0,6² = 0,13824. -/
theorem binomial_negativa_conta :
    (Nat.choose 4 2 : ℚ) * (2/5) ^ 3 * (3/5) ^ 2 = 13824 / 100000 := by
  norm_num [Nat.choose]

/-- Contas da página, em frações exatas. -/
theorem contas :
    -- Questão 1: Binomial(6; 0,2)
    (Nat.choose 6 2 : ℚ) * (1/5) ^ 2 * (4/5) ^ 4 = 24576 / 100000 ∧
    (1/5 : ℚ) ^ 6 = 64 / 1000000 ∧ 1 - (1/5 : ℚ) ^ 6 = 999936 / 1000000 ∧
    (9/10 : ℚ) ^ 6 = 531441 / 1000000 ∧ (4/5 : ℚ) ^ 6 = 262144 / 1000000 ∧
    (6 : ℚ) * (1/5) = 6/5 ∧
    -- Questão 5: Geométrica(0,4)
    (3/5 : ℚ) ^ 2 * (2/5) = 144 / 1000 ∧ (3/5 : ℚ) ^ 4 = 1296 / 10000 ∧
    -- Questão 6: E[X] = r/p
    (3 : ℚ) / (2/5) = 15/2 := by
  norm_num [Nat.choose]

end Provas.Questoes
