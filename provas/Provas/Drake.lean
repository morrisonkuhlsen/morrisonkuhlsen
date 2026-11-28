import Mathlib

/-!
# A equação de Drake

Post: /equacao-de-drake-quantas-civilizacoes/ (e a versão em inglês,
/drake-equation-how-many-civilizations/).

As afirmações do post que valem sempre: o estado estacionário (nascimentos por ano vezes
duração), o logaritmo do produto, os limites do produto, a média de um produto de fatores
independentes, a média da distribuição log-uniforme, o teto de f_l e a troca de N < 1 por
log₁₀ N < 0.
-/

namespace Provas.Drake

open MeasureTheory ProbabilityTheory Real

/-! ## Por que multiplicar por L -/

/-- Estado estacionário: se nascem r civilizações por ano e cada uma dura L anos, as que
existem hoje são as nascidas nos últimos L anos, e a soma dá L · r
(seção "Por que multiplicar por L"). -/
theorem estado_estacionario (r : ℝ) (L : ℕ) :
    ∑ _k ∈ Finset.range L, r = L * r := by
  simp

/-! ## Produto e logaritmo -/

/-- O logaritmo de um produto de fatores positivos é a soma dos logaritmos
(seção "Por que a escala logarítmica"). -/
theorem log_do_produto {n : ℕ} (x : Fin n → ℝ) (hx : ∀ i, 0 < x i) :
    Real.log (∏ i, x i) = ∑ i, Real.log (x i) :=
  Real.log_prod (fun i _ => (hx i).ne')

/-- Se cada fator está entre um mínimo e um máximo não negativos, o produto está entre o
produto dos mínimos e o produto dos máximos (seção "Faixas, não números"). -/
theorem limites_do_produto {n : ℕ} (a x b : Fin n → ℝ) (ha : ∀ i, 0 ≤ a i)
    (hax : ∀ i, a i ≤ x i) (hxb : ∀ i, x i ≤ b i) :
    ∏ i, a i ≤ ∏ i, x i ∧ ∏ i, x i ≤ ∏ i, b i := by
  constructor
  · exact Finset.prod_le_prod₀ (fun i _ => ha i) (fun i _ => hax i)
  · exact Finset.prod_le_prod₀ (fun i _ => (ha i).trans (hax i)) (fun i _ => hxb i)

/-- N < 1 é o mesmo que log₁₀ N < 0, para N > 0 (seção "Por que a escala logarítmica"). -/
theorem menor_que_um_iff_log_negativo {N : ℝ} (hN : 0 < N) :
    Real.logb 10 N < 0 ↔ N < 1 :=
  Real.logb_neg_iff (by norm_num) hN

/-! ## Médias -/

/-- A média de um produto de fatores independentes é o produto das médias
(seção "A média de N"). -/
theorem media_do_produto {Ω ι : Type*} [MeasurableSpace Ω] {μ : Measure Ω} [Fintype ι]
    {X : ι → Ω → ℝ} (hind : iIndepFun X μ) (hmed : ∀ i, AEStronglyMeasurable (X i) μ) :
    ∫ ω, ∏ i, X i ω ∂μ = ∏ i, ∫ ω, X i ω ∂μ :=
  hind.integral_fun_prod_eq_prod_integral hmed

/-- Média da log-uniforme: se o logaritmo natural de X é uniforme entre ln a e ln b
(0 < a < b), a média de X é (b − a)/ln(b/a) (seção "A média de N"). -/
theorem media_log_uniforme {a b : ℝ} (ha : 0 < a) (hab : a < b) :
    (1 / (Real.log b - Real.log a)) * ∫ u in Real.log a..Real.log b, Real.exp u
      = (b - a) / Real.log (b / a) := by
  rw [integral_exp, Real.exp_log ha, Real.exp_log (ha.trans hab),
    Real.log_div (ha.trans hab).ne' ha.ne']
  ring

/-! ## O fator f_l -/

/-- No modelo de Sandberg, Drexler e Ord, f_l = 1 − e^(−x), com x ≥ 0 o número esperado de
origens da vida no planeta. Então f_l fica entre 0 e 1 e nunca passa de x
(seção "O fator mais incerto"). -/
theorem fl_entre_zero_e_um_e_ate_x {x : ℝ} (hx : 0 ≤ x) :
    0 ≤ 1 - Real.exp (-x) ∧ 1 - Real.exp (-x) ≤ 1 ∧ 1 - Real.exp (-x) ≤ x := by
  refine ⟨?_, ?_, ?_⟩
  · have : Real.exp (-x) ≤ 1 := Real.exp_le_one_iff.mpr (by linarith)
    linarith
  · have := Real.exp_pos (-x)
    linarith
  · have := Real.add_one_le_exp (-x)
    linarith

end Provas.Drake
