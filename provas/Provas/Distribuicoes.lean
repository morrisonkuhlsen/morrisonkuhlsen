import Mathlib

/-!
# Distribuições de probabilidade

Página: /pt/probabilidade/distribuicoes (e /en/probability/distributions).

Cada teorema confere a média e a variância que a página afirma, a partir da
própria função de probabilidade (ou densidade) escrita na página.
-/

namespace Provas.Distribuicoes

open Finset Real

/-! ## Bernoulli -/

/-- Bernoulli: com P(X = x) = pˣ(1 − p)¹⁻ˣ, x ∈ {0, 1}, a média é p.
Página: /pt/probabilidade/distribuicoes, seção 1.1. -/
theorem bernoulli_media (p : ℝ) :
    ∑ x ∈ range 2, (x : ℝ) * (p ^ x * (1 - p) ^ (1 - x)) = p := by
  simp [sum_range_succ]

/-- Bernoulli: a variância é p(1 − p).
Página: /pt/probabilidade/distribuicoes, seção 1.1. -/
theorem bernoulli_variancia (p : ℝ) :
    ∑ x ∈ range 2, ((x : ℝ) - p) ^ 2 * (p ^ x * (1 - p) ^ (1 - x)) = p * (1 - p) := by
  simp [sum_range_succ]
  ring

/-! ## Binomial -/

/-- As probabilidades da binomial somam 1 (binômio de Newton). -/
theorem binomial_soma (n : ℕ) (p : ℝ) :
    ∑ k ∈ range (n + 1), (n.choose k : ℝ) * p ^ k * (1 - p) ^ (n - k) = 1 := by
  calc ∑ k ∈ range (n + 1), (n.choose k : ℝ) * p ^ k * (1 - p) ^ (n - k)
      = ∑ k ∈ range (n + 1), p ^ k * (1 - p) ^ (n - k) * (n.choose k : ℝ) :=
        sum_congr rfl fun k _ => by ring
    _ = (p + (1 - p)) ^ n := (add_pow p (1 - p) n).symm
    _ = 1 := by rw [show p + (1 - p) = 1 by ring, one_pow]

/-- k·C(n + 1, k + 1) = (n + 1)·C(n, k), escrito sobre ℝ. -/
private lemma choose_succ_mul (n k : ℕ) :
    ((k : ℝ) + 1) * ((n + 1).choose (k + 1) : ℝ) = ((n : ℝ) + 1) * (n.choose k : ℝ) := by
  have h := Nat.add_one_mul_choose_eq n k
  have h' : ((n + 1 : ℕ) : ℝ) * (n.choose k : ℝ) =
      ((n + 1).choose (k + 1) : ℝ) * ((k + 1 : ℕ) : ℝ) := by exact_mod_cast h
  push_cast at h'
  linarith

/-- E[X] para a binomial, escrito como soma: Σ k·C(n,k)·pᵏ(1 − p)ⁿ⁻ᵏ = n·p. -/
theorem binomial_media (n : ℕ) (p : ℝ) :
    ∑ k ∈ range (n + 1), (k : ℝ) * ((n.choose k : ℝ) * p ^ k * (1 - p) ^ (n - k)) =
      n * p := by
  cases n with
  | zero => simp
  | succ m =>
    rw [sum_range_succ']
    simp only [Nat.cast_zero, zero_mul, add_zero]
    have : ∀ j ∈ range (m + 1),
        ((j + 1 : ℕ) : ℝ) * (((m + 1).choose (j + 1) : ℝ) * p ^ (j + 1) *
          (1 - p) ^ (m + 1 - (j + 1))) =
        ((m : ℝ) + 1) * p * ((m.choose j : ℝ) * p ^ j * (1 - p) ^ (m - j)) := by
      intro j _
      have hc := choose_succ_mul m j
      rw [show m + 1 - (j + 1) = m - j by omega]
      push_cast
      calc ((j : ℝ) + 1) * (((m + 1).choose (j + 1) : ℝ) * p ^ (j + 1) * (1 - p) ^ (m - j))
          = (((j : ℝ) + 1) * ((m + 1).choose (j + 1) : ℝ)) * p ^ (j + 1) *
              (1 - p) ^ (m - j) := by ring
        _ = ((m : ℝ) + 1) * (m.choose j : ℝ) * p ^ (j + 1) * (1 - p) ^ (m - j) := by rw [hc]
        _ = _ := by ring
    rw [sum_congr rfl this, ← mul_sum, binomial_soma]
    push_cast
    ring

/-- E[X(X − 1)] para a binomial: Σ k(k − 1)·C(n,k)·pᵏ(1 − p)ⁿ⁻ᵏ = n(n − 1)·p². -/
theorem binomial_fatorial2 (n : ℕ) (p : ℝ) :
    ∑ k ∈ range (n + 1), (k : ℝ) * ((k : ℝ) - 1) *
        ((n.choose k : ℝ) * p ^ k * (1 - p) ^ (n - k)) =
      n * (n - 1) * p ^ 2 := by
  cases n with
  | zero => simp
  | succ m =>
    rw [sum_range_succ']
    simp only [Nat.cast_zero, zero_mul, add_zero]
    have : ∀ j ∈ range (m + 1),
        ((j + 1 : ℕ) : ℝ) * (((j + 1 : ℕ) : ℝ) - 1) *
          (((m + 1).choose (j + 1) : ℝ) * p ^ (j + 1) * (1 - p) ^ (m + 1 - (j + 1))) =
        ((m : ℝ) + 1) * p * ((j : ℝ) * ((m.choose j : ℝ) * p ^ j * (1 - p) ^ (m - j))) := by
      intro j _
      have hc := choose_succ_mul m j
      rw [show m + 1 - (j + 1) = m - j by omega]
      push_cast
      calc ((j : ℝ) + 1) * ((j : ℝ) + 1 - 1) *
            (((m + 1).choose (j + 1) : ℝ) * p ^ (j + 1) * (1 - p) ^ (m - j))
          = (j : ℝ) * (((j : ℝ) + 1) * ((m + 1).choose (j + 1) : ℝ)) * p ^ (j + 1) *
              (1 - p) ^ (m - j) := by ring
        _ = (j : ℝ) * (((m : ℝ) + 1) * (m.choose j : ℝ)) * p ^ (j + 1) *
              (1 - p) ^ (m - j) := by rw [hc]
        _ = _ := by ring
    rw [sum_congr rfl this, ← mul_sum, binomial_media]
    push_cast
    ring

/-- Binomial: Var(X) = Σ (k − np)²·C(n,k)·pᵏ(1 − p)ⁿ⁻ᵏ = n·p·(1 − p).
Página: /pt/probabilidade/distribuicoes, seção 1.2. -/
theorem binomial_variancia (n : ℕ) (p : ℝ) :
    ∑ k ∈ range (n + 1), ((k : ℝ) - n * p) ^ 2 *
        ((n.choose k : ℝ) * p ^ k * (1 - p) ^ (n - k)) =
      n * p * (1 - p) := by
  have e : ∀ k ∈ range (n + 1), ((k : ℝ) - n * p) ^ 2 *
        ((n.choose k : ℝ) * p ^ k * (1 - p) ^ (n - k)) =
      (k : ℝ) * ((k : ℝ) - 1) * ((n.choose k : ℝ) * p ^ k * (1 - p) ^ (n - k)) +
      (1 - 2 * n * p) * ((k : ℝ) * ((n.choose k : ℝ) * p ^ k * (1 - p) ^ (n - k))) +
      (n * p) ^ 2 * ((n.choose k : ℝ) * p ^ k * (1 - p) ^ (n - k)) := by
    intro k _; ring
  rw [sum_congr rfl e, sum_add_distrib, sum_add_distrib, ← mul_sum, ← mul_sum,
    binomial_fatorial2, binomial_media, binomial_soma]
  ring

/-! ## Uniforme contínua -/

/-- Uniforme em [a, b], a < b: E[X] = ∫ₐᵇ x/(b − a) dx = (a + b)/2.
Página: /pt/probabilidade/distribuicoes, seção 2.3. -/
theorem uniforme_media (a b : ℝ) (hab : a < b) :
    ∫ x in a..b, x * (1 / (b - a)) = (a + b) / 2 := by
  have hba : b - a ≠ 0 := by linarith
  rw [intervalIntegral.integral_mul_const, integral_id]
  field_simp
  ring

/-- Uniforme em [a, b], a < b: Var(X) = ∫ₐᵇ (x − (a+b)/2)²/(b − a) dx = (b − a)²/12.
Página: /pt/probabilidade/distribuicoes, seção 2.3. -/
theorem uniforme_variancia (a b : ℝ) (hab : a < b) :
    ∫ x in a..b, (x - (a + b) / 2) ^ 2 * (1 / (b - a)) = (b - a) ^ 2 / 12 := by
  have hba : b - a ≠ 0 := by linarith
  rw [intervalIntegral.integral_mul_const]
  have : ∫ x in a..b, (x - (a + b) / 2) ^ 2 =
      ((b - (a + b) / 2) ^ 3 - (a - (a + b) / 2) ^ 3) / 3 := by
    rw [intervalIntegral.integral_comp_sub_right (fun x => x ^ 2), integral_pow]
    norm_num
  rw [this]
  field_simp
  ring

/-! ## Poisson -/

/-- As probabilidades da Poisson somam 1: Σ e^(−λ)·λᵏ/k! = 1. -/
theorem poisson_soma (l : ℝ) : HasSum (fun k : ℕ => exp (-l) * l ^ k / k.factorial) 1 := by
  convert (NormedSpace.expSeries_div_hasSum_exp l).mul_left (exp (-l)) using 1
  · simp_rw [mul_div_assoc]
  · simp [← exp_eq_exp_ℝ, ← exp_add]

/-- E[X] para a Poisson: Σ k·e^(−λ)·λᵏ/k! = λ.
Página: /pt/probabilidade/distribuicoes, seção 1.3. -/
theorem poisson_media (l : ℝ) :
    HasSum (fun k : ℕ => (k : ℝ) * (exp (-l) * l ^ k / k.factorial)) l := by
  rw [← hasSum_nat_add_iff' 1]
  have h := (poisson_soma l).mul_left l
  simp only [mul_one, range_one, sum_singleton, Nat.cast_zero, zero_mul, sub_zero] at h ⊢
  convert h using 1
  funext n
  rw [Nat.factorial_succ]
  push_cast
  field_simp
  ring

/-- E[X(X − 1)] para a Poisson: Σ k(k − 1)·e^(−λ)·λᵏ/k! = λ². -/
theorem poisson_fatorial2 (l : ℝ) :
    HasSum (fun k : ℕ => (k : ℝ) * ((k : ℝ) - 1) * (exp (-l) * l ^ k / k.factorial))
      (l ^ 2) := by
  rw [← hasSum_nat_add_iff' 2]
  have h := (poisson_soma l).mul_left (l ^ 2)
  simp only [mul_one, sum_range_succ, range_zero, sum_empty, Nat.cast_zero, Nat.cast_one,
    zero_mul, sub_self, mul_zero, add_zero, sub_zero] at h ⊢
  convert h using 1
  funext n
  rw [Nat.factorial_succ, Nat.factorial_succ]
  push_cast
  field_simp
  ring

/-- Poisson: Var(X) = Σ (k − λ)²·e^(−λ)·λᵏ/k! = λ.
Página: /pt/probabilidade/distribuicoes, seção 1.3. -/
theorem poisson_variancia (l : ℝ) :
    HasSum (fun k : ℕ => ((k : ℝ) - l) ^ 2 * (exp (-l) * l ^ k / k.factorial)) l := by
  have h := ((poisson_fatorial2 l).add ((poisson_media l).mul_left (1 - 2 * l))).add
    ((poisson_soma l).mul_left (l ^ 2))
  convert h using 1
  · funext k; ring
  · ring

/-! ## Exponencial -/

private lemma exp_I0 {l : ℝ} (hl : 0 < l) :
    ∫ x in Set.Ioi (0 : ℝ), exp (-(l * x)) = 1 / l := by
  have h := integral_rpow_mul_exp_neg_mul_Ioi (a := 1) one_pos hl
  simp only [sub_self, rpow_zero, one_mul, rpow_one, Gamma_one, mul_one] at h
  exact h

private lemma exp_I1 {l : ℝ} (hl : 0 < l) :
    ∫ x in Set.Ioi (0 : ℝ), x * exp (-(l * x)) = 1 / l ^ 2 := by
  have h := integral_rpow_mul_exp_neg_mul_Ioi (a := 2) two_pos hl
  norm_num [Gamma_two] at h
  rw [h]
  field_simp

private lemma exp_I2 {l : ℝ} (hl : 0 < l) :
    ∫ x in Set.Ioi (0 : ℝ), x ^ 2 * exp (-(l * x)) = 2 / l ^ 3 := by
  have h := integral_rpow_mul_exp_neg_mul_Ioi (a := 3) (by norm_num) hl
  have hg : Gamma 3 = 2 := by
    rw [show (3 : ℝ) = ((2 : ℕ) : ℝ) + 1 by norm_num, Gamma_nat_eq_factorial]
    norm_num [Nat.factorial]
  have e : ∀ x : ℝ, x ^ ((3 : ℝ) - 1) * exp (-(l * x)) = x ^ 2 * exp (-(l * x)) := by
    intro x
    rw [show (3 : ℝ) - 1 = ((2 : ℕ) : ℝ) by norm_num, rpow_natCast]
  simp_rw [e] at h
  rw [h, hg, show (3 : ℝ) = ((3 : ℕ) : ℝ) by norm_num, rpow_natCast]
  field_simp

/-- Exponencial com taxa λ > 0: E[X] = ∫₀^∞ x·λe^(−λx) dx = 1/λ.
Página: /pt/probabilidade/distribuicoes, seção 2.2. -/
theorem exponencial_media {l : ℝ} (hl : 0 < l) :
    ∫ x in Set.Ioi (0 : ℝ), x * (l * exp (-(l * x))) = 1 / l := by
  have e : ∀ x : ℝ, x * (l * exp (-(l * x))) = l * (x * exp (-(l * x))) := fun x => by ring
  simp_rw [e]
  rw [MeasureTheory.integral_const_mul, exp_I1 hl]
  field_simp

/-- Exponencial com taxa λ > 0: Var(X) = ∫₀^∞ (x − 1/λ)²·λe^(−λx) dx = 1/λ².
Página: /pt/probabilidade/distribuicoes, seção 2.2. -/
theorem exponencial_variancia {l : ℝ} (hl : 0 < l) :
    ∫ x in Set.Ioi (0 : ℝ), (x - 1 / l) ^ 2 * (l * exp (-(l * x))) = 1 / l ^ 2 := by
  have hl0 : l ≠ 0 := hl.ne'
  have i0 : MeasureTheory.IntegrableOn (fun x : ℝ => exp (-(l * x))) (Set.Ioi 0) :=
    MeasureTheory.Integrable.of_integral_ne_zero (by rw [exp_I0 hl]; positivity)
  have i1 : MeasureTheory.IntegrableOn (fun x : ℝ => x * exp (-(l * x))) (Set.Ioi 0) :=
    MeasureTheory.Integrable.of_integral_ne_zero (by rw [exp_I1 hl]; positivity)
  have i2 : MeasureTheory.IntegrableOn (fun x : ℝ => x ^ 2 * exp (-(l * x))) (Set.Ioi 0) :=
    MeasureTheory.Integrable.of_integral_ne_zero (by rw [exp_I2 hl]; positivity)
  have e : ∀ x : ℝ, (x - 1 / l) ^ 2 * (l * exp (-(l * x))) =
      (l * (x ^ 2 * exp (-(l * x))) - 2 * (x * exp (-(l * x)))) +
        (1 / l) * exp (-(l * x)) := by
    intro x; field_simp; ring
  simp_rw [e]
  rw [MeasureTheory.integral_add
      (f := fun x => l * (x ^ 2 * exp (-(l * x))) - 2 * (x * exp (-(l * x))))
      (g := fun x => 1 / l * exp (-(l * x)))
      ((i2.const_mul l).sub (i1.const_mul 2)) (i0.const_mul _),
    MeasureTheory.integral_sub
      (f := fun x => l * (x ^ 2 * exp (-(l * x)))) (g := fun x => 2 * (x * exp (-(l * x))))
      (i2.const_mul l) (i1.const_mul 2),
    MeasureTheory.integral_const_mul, MeasureTheory.integral_const_mul,
    MeasureTheory.integral_const_mul, exp_I0 hl, exp_I1 hl, exp_I2 hl]
  field_simp
  ring

/-! ## Normal -/

open ProbabilityTheory in
/-- Normal: a média de N(μ, σ²) é μ. No Mathlib, `gaussianReal μ v` é a normal com
média μ e variância v = σ², definida pela densidade da página.
Página: /pt/probabilidade/distribuicoes, seção 2.1. -/
theorem normal_media (μ : ℝ) (v : NNReal) : ∫ x, x ∂gaussianReal μ v = μ :=
  integral_id_gaussianReal

open ProbabilityTheory in
/-- Normal: a variância de N(μ, σ²) é σ² (o parâmetro v).
Página: /pt/probabilidade/distribuicoes, seção 2.1. -/
theorem normal_variancia (μ : ℝ) (v : NNReal) : Var[id; gaussianReal μ v] = v :=
  variance_id_gaussianReal

/-- Exponencial: F(x) = P(X ≤ x) = ∫₀ˣ λe^(−λt) dt = 1 − e^(−λx).
Página: /pt/probabilidade/distribuicoes, seção 2.2 (exemplo P(X ≤ 2)). -/
theorem exponencial_acumulada (l x : ℝ) :
    ∫ t in (0 : ℝ)..x, l * exp (-(l * t)) = 1 - exp (-(l * x)) := by
  have hd : ∀ t ∈ Set.uIcc (0 : ℝ) x,
      HasDerivAt (fun t => -exp (-(l * t))) (l * exp (-(l * t))) t := by
    intro t _
    have h1 : HasDerivAt (fun t => -(l * t)) (-l) t := by
      have := ((hasDerivAt_id t).const_mul l).neg
      simp only [id, mul_one] at this
      exact this
    have h2 := h1.exp.neg
    convert h2 using 1
    ring
  rw [intervalIntegral.integral_eq_sub_of_hasDerivAt hd
    (by apply Continuous.intervalIntegrable; fun_prop)]
  simp
  ring

/-- Uniforme em [a, b], a < b: para a ≤ c ≤ d ≤ b,
P(c ≤ X ≤ d) = ∫_c^d 1/(b − a) dx = (d − c)/(b − a).
Página: /pt/probabilidade/distribuicoes, seção 2.3. -/
theorem uniforme_intervalo (a b c d : ℝ) :
    ∫ _x in c..d, 1 / (b - a) = (d - c) / (b - a) := by
  rw [intervalIntegral.integral_const, smul_eq_mul]
  ring

open ProbabilityTheory in
/-- Normal: a densidade é simétrica em relação a μ: f(μ + t) = f(μ − t).
Página: /pt/probabilidade/distribuicoes, seção 2.1. -/
theorem normal_simetrica (μ : ℝ) (v : NNReal) (t : ℝ) :
    gaussianPDFReal μ v (μ + t) = gaussianPDFReal μ v (μ - t) := by
  simp only [gaussianPDFReal]
  ring_nf

open ProbabilityTheory in
/-- Normal: o pico da densidade (a moda) fica em μ: f(x) ≤ f(μ) para todo x.
Página: /pt/probabilidade/distribuicoes, seção 2.1. -/
theorem normal_moda (μ : ℝ) (v : NNReal) (x : ℝ) :
    gaussianPDFReal μ v x ≤ gaussianPDFReal μ v μ := by
  simp only [gaussianPDFReal, sub_self]
  apply mul_le_mul_of_nonneg_left _ (by positivity)
  apply exp_le_exp.mpr
  have : 0 ≤ (x - μ) ^ 2 / (2 * (v : ℝ)) := by positivity
  simp only [ne_eq, OfNat.ofNat_ne_zero, not_false_eq_true, zero_pow, neg_zero, zero_div]
  rw [neg_div]
  linarith

open MeasureTheory ProbabilityTheory in
/-- Normal com σ² > 0: a mediana é μ, isto é, P(X ≤ μ) = 1/2.
Página: /pt/probabilidade/distribuicoes, seção 2.1. -/
theorem normal_mediana (μ : ℝ) (v : NNReal) (hv : v ≠ 0) :
    (gaussianReal μ v).real (Set.Iic μ) = 1 / 2 := by
  set N := gaussianReal μ v
  -- A reflexão x ↦ 2μ − x não muda a distribuição.
  have hf : Measurable (fun x : ℝ => -x + 2 * μ) := by fun_prop
  have hmap : N.map (fun x : ℝ => -x + 2 * μ) = N := by
    have h1 : (fun x : ℝ => -x + 2 * μ) = (· + 2 * μ) ∘ (fun x : ℝ => -x) := rfl
    rw [h1, ← Measure.map_map (by fun_prop) (by fun_prop), gaussianReal_map_neg,
      gaussianReal_map_add_const]
    congr 1
    ring
  have hrefl : N.real (Set.Iic μ) = N.real (Set.Ici μ) := by
    conv_lhs => rw [← hmap]
    rw [map_measureReal_apply hf measurableSet_Iic]
    congr 1
    ext x
    simp only [Set.mem_preimage, Set.mem_Iic, Set.mem_Ici]
    constructor <;> intro h <;> linarith
  -- O ponto μ tem probabilidade zero.
  have hpt : N {μ} = 0 :=
    gaussianReal_absolutelyContinuous μ hv (Real.volume_singleton)
  have hIoi : N.real (Set.Ioi μ) = N.real (Set.Ici μ) :=
    measureReal_congr (Ioi_ae_eq_Ici' hpt)
  have hcompl : N.real (Set.Ioi μ) = 1 - N.real (Set.Iic μ) := by
    rw [← Set.compl_Iic, probReal_compl_eq_one_sub measurableSet_Iic]
  linarith

end Provas.Distribuicoes
