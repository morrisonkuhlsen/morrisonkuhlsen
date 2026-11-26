import Mathlib

/-!
# Modelos Preditivos

Página: /pt/analise-de-dados/modelos-preditivos (e /en/data-analysis/predictive-models).

Notação: erros eᵢ = yᵢ − ŷᵢ de n previsões, indexados por `s`;
EAM = Σ|eᵢ|/n, REQM = √(Σeᵢ²/n). Na classificação, VP, FN, FP e VN são as contagens da
matriz de confusão (verdadeiros positivos, falsos negativos, falsos positivos e
verdadeiros negativos).
-/

namespace Provas.Preditivos

open Finset Real

variable {ι : Type*} (s : Finset ι)

/-! ## Medidas de erro (seção 3) -/

/-- (Σ|eᵢ|)² ≤ n·Σeᵢ² (desigualdade de Cauchy–Schwarz com o vetor de uns). Seção 3. -/
theorem soma_abs_sq_le (e : ι → ℝ) :
    (∑ i ∈ s, |e i|) ^ 2 ≤ s.card * ∑ i ∈ s, e i ^ 2 := by
  have h := Finset.sum_mul_sq_le_sq_mul_sq s (fun _ ↦ (1 : ℝ)) (fun i ↦ |e i|)
  simpa [sq_abs] using h

/-- O EAM nunca passa da REQM: Σ|eᵢ|/n ≤ √(Σeᵢ²/n). Seção 3. -/
theorem eam_le_reqm (e : ι → ℝ) (hs : s.Nonempty) :
    (∑ i ∈ s, |e i|) / s.card ≤ Real.sqrt ((∑ i ∈ s, e i ^ 2) / s.card) := by
  have hn : (0 : ℝ) < s.card := by exact_mod_cast hs.card_pos
  have h0 : 0 ≤ (∑ i ∈ s, |e i|) / s.card := div_nonneg (sum_nonneg fun i _ ↦ abs_nonneg _) hn.le
  rw [Real.le_sqrt h0 (div_nonneg (sum_nonneg fun i _ ↦ sq_nonneg _) hn.le), div_pow,
    div_le_div_iff₀ (by positivity) hn]
  have := soma_abs_sq_le s e
  nlinarith [this]

/-- A linha de base "prever sempre a média" é a constante de menor erro quadrático:
Σ(yᵢ − c)² = Σ(yᵢ − ȳ)² + n(ȳ − c)² ≥ Σ(yᵢ − ȳ)². Seção 3. -/
theorem media_minimiza (y : ι → ℝ) (c : ℝ) (hs : s.Nonempty) :
    ∑ i ∈ s, (y i - (∑ j ∈ s, y j) / s.card) ^ 2 ≤ ∑ i ∈ s, (y i - c) ^ 2 := by
  have hn : (s.card : ℝ) ≠ 0 := by exact_mod_cast hs.card_pos.ne'
  set Y := (∑ j ∈ s, y j) / s.card with hY
  have dy : ∑ i ∈ s, (y i - Y) = 0 := by
    rw [sum_sub_distrib, sum_const, nsmul_eq_mul, hY]; field_simp; ring
  have e : ∀ i ∈ s, (y i - c) ^ 2 = (y i - Y) ^ 2 + 2 * (Y - c) * (y i - Y) + (Y - c) ^ 2 :=
    fun i _ ↦ by ring
  rw [sum_congr rfl e, sum_add_distrib, sum_add_distrib, ← mul_sum, dy, sum_const, nsmul_eq_mul]
  have : (0 : ℝ) ≤ s.card * (Y - c) ^ 2 := by positivity
  linarith

/-- Contas do exemplo do sorvete: Sxx = 70, Sxy = 350, b = 5, a = −50; no teste, erros
3, −3 e 4, EAM = 10/3 e REQM² = 34/3; a média do treino (75) tem REQM² = 874/3. Seção 2. -/
theorem contas_sorvete :
    ((-5 : ℚ) ^ 2 + (-3) ^ 2 + (-1) ^ 2 + 1 ^ 2 + 3 ^ 2 + 5 ^ 2 = 70) ∧
    ((-5 : ℚ) * (-23) + (-3) * (-18) + (-1) * (-4) + 1 * 6 + 3 * 12 + 5 * 27 = 350) ∧
    ((350 : ℚ) / 70 = 5) ∧ ((75 : ℚ) - 5 * 25 = -50) ∧
    ((52 + 57 + 71 + 81 + 87 + 102 : ℚ) / 6 = 75) ∧
    ((58 : ℚ) - (-50 + 5 * 21) = 3 ∧ (72 : ℚ) - (-50 + 5 * 25) = -3 ∧
      (99 : ℚ) - (-50 + 5 * 29) = 4) ∧
    ((|(3 : ℚ)| + |(-3 : ℚ)| + |(4 : ℚ)|) / 3 = 10 / 3) ∧
    (((3 : ℚ) ^ 2 + (-3) ^ 2 + 4 ^ 2) / 3 = 34 / 3) ∧
    (((-17 : ℚ) ^ 2 + (-3) ^ 2 + 24 ^ 2) / 3 = 874 / 3) := by
  norm_num [abs_of_neg]

/-! ## Classificação (seção 5) -/

/-- F1, a média harmônica da precisão e da sensibilidade, é igual a 2VP/(2VP + FP + FN).
Seção 5.3. -/
theorem f1_formula (VP FP FN : ℝ) (hVP : 0 < VP) (hFP : 0 ≤ FP) (hFN : 0 ≤ FN) :
    let precisao := VP / (VP + FP)
    let sensibilidade := VP / (VP + FN)
    2 * precisao * sensibilidade / (precisao + sensibilidade) = 2 * VP / (2 * VP + FP + FN) := by
  intro precisao sensibilidade
  have h1 : VP + FP ≠ 0 := by linarith
  have h2 : VP + FN ≠ 0 := by linarith
  have h3 : 2 * VP + FP + FN ≠ 0 := by linarith
  simp only [precisao, sensibilidade]
  field_simp
  ring

/-- A acurácia é a média da sensibilidade e da especificidade, ponderada pelo número de
positivos P = VP + FN e de negativos N = VN + FP. Seção 5.3. -/
theorem acuracia_ponderada (VP FN VN FP : ℝ) (hP : VP + FN ≠ 0) (hN : VN + FP ≠ 0) :
    (VP + VN) / (VP + FN + VN + FP) =
      ((VP + FN) * (VP / (VP + FN)) + (VN + FP) * (VN / (VN + FP))) / (VP + FN + VN + FP) := by
  rw [mul_div_cancel₀ _ hP, mul_div_cancel₀ _ hN]

/-- Contas do exemplo: acurácia 29/32, precisão 11/12, sensibilidade 11/13,
especificidade 18/19 e F1 = 22/25. Seção 5.3. -/
theorem contas_matriz :
    ((11 + 18 : ℚ) / 32 = 29 / 32) ∧ ((11 : ℚ) / (11 + 1) = 11 / 12) ∧
    ((11 : ℚ) / (11 + 2) = 11 / 13) ∧ ((18 : ℚ) / (18 + 1) = 18 / 19) ∧
    (2 * (11 / 12 : ℚ) * (11 / 13) / (11 / 12 + 11 / 13) = 22 / 25) ∧
    ((19 : ℚ) / 32 = 0.59375) := by
  norm_num

/-- Baixar o limiar (t' ≤ t) nunca diminui o número de verdadeiros positivos (logo a
sensibilidade sobe ou fica igual) e nunca aumenta o de verdadeiros negativos (a
especificidade cai ou fica igual). `p i` é a probabilidade prevista e `y i` diz se o caso é
positivo. Seção 5.4. -/
theorem limiar_vp (p : ι → ℝ) (y : ι → Prop) [DecidablePred y] (t t' : ℝ) (h : t' ≤ t) :
    (s.filter fun i ↦ t ≤ p i ∧ y i).card ≤ (s.filter fun i ↦ t' ≤ p i ∧ y i).card := by
  apply card_le_card
  intro i hi
  simp only [mem_filter] at hi ⊢
  exact ⟨hi.1, le_trans h hi.2.1, hi.2.2⟩

theorem limiar_vn (p : ι → ℝ) (y : ι → Prop) [DecidablePred y] (t t' : ℝ) (h : t' ≤ t) :
    (s.filter fun i ↦ p i < t' ∧ ¬ y i).card ≤ (s.filter fun i ↦ p i < t ∧ ¬ y i).card := by
  apply card_le_card
  intro i hi
  simp only [mem_filter] at hi ⊢
  exact ⟨hi.1, lt_of_lt_of_le hi.2.1 h, hi.2.2⟩

/-! ## Regressão logística (seção 5.1) -/

/-- A função logística p = 1/(1 + e^(−η)) fica sempre entre 0 e 1, para qualquer η. -/
theorem logistica_entre (η : ℝ) : 0 < 1 / (1 + exp (-η)) ∧ 1 / (1 + exp (-η)) < 1 := by
  have h := exp_pos (-η)
  refine ⟨by positivity, ?_⟩
  rw [div_lt_one (by linarith)]; linarith

/-- … e o logaritmo da chance, log(p/(1 − p)), volta a ser η: o modelo é linear na escala
do log da chance. Seção 5.1. -/
theorem logito_da_logistica (η : ℝ) :
    Real.log ((1 / (1 + exp (-η))) / (1 - 1 / (1 + exp (-η)))) = η := by
  have h := exp_pos (-η)
  have h1 : (1 + exp (-η)) ≠ 0 := by linarith
  have : (1 / (1 + exp (-η))) / (1 - 1 / (1 + exp (-η))) = exp η := by
    field_simp
    rw [add_sub_cancel_left, mul_comm, ← exp_add, add_neg_cancel, exp_zero]
  rw [this, log_exp]

end Provas.Preditivos
