import Mathlib

/-!
# A fórmula de Euler

Post: /formula-de-euler-e-elevado-a-i-pi/ (e a versão em inglês, /euler-formula-identity/).

As afirmações do post que valem sempre: as potências de i, as séries de e^z, cos e sen,
a fórmula de Euler para todo x real, o módulo 1, a soma dos ângulos, a identidade
e^{iπ} + 1 = 0, os pontos especiais do círculo e o limite de Euler (1 + iπ/n)^n → −1.
-/

namespace Provas.Euler

open Complex Filter Topology

/-! ## As potências de i -/

/-- i² = −1, i³ = −i e i⁴ = 1: as potências de i se repetem de 4 em 4
(seção "Cinco minutos de números complexos"). -/
theorem potencias_de_i : I ^ 2 = -1 ∧ I ^ 3 = -I ∧ I ^ 4 = 1 := by
  refine ⟨I_sq, ?_, I_pow_four⟩
  rw [pow_succ, I_sq]
  ring

/-- Para todo inteiro k ≥ 0, i^(k + 4) = i^k: o ciclo de 4. -/
theorem ciclo_de_quatro (k : ℕ) : I ^ (k + 4) = I ^ k := by
  rw [pow_add, I_pow_four, mul_one]

/-- Multiplicar por i gira 90° no sentido anti-horário: i · (a + bi) = −b + ai. -/
theorem multiplicar_por_i (a b : ℝ) : I * (a + b * I) = -b + a * I := by
  ring_nf
  rw [I_sq]
  ring

/-! ## As três séries -/

/-- e^z = 1 + z + z²/2! + z³/3! + ⋯, para todo número complexo z (seção "De onde vem a fórmula"). -/
theorem serie_exponencial (z : ℂ) : HasSum (fun n : ℕ => z ^ n / n.factorial) (exp z) := by
  rw [exp_eq_exp_ℂ]
  exact NormedSpace.expSeries_div_hasSum_exp z

/-- cos x = 1 − x²/2! + x⁴/4! − ⋯, para todo x real. -/
theorem serie_cosseno (x : ℝ) :
    HasSum (fun n : ℕ => (-1) ^ n * x ^ (2 * n) / (2 * n).factorial) (Real.cos x) :=
  Real.hasSum_cos x

/-- sen x = x − x³/3! + x⁵/5! − ⋯, para todo x real. -/
theorem serie_seno (x : ℝ) :
    HasSum (fun n : ℕ => (-1) ^ n * x ^ (2 * n + 1) / (2 * n + 1).factorial) (Real.sin x) :=
  Real.hasSum_sin x

/-! ## A fórmula -/

/-- Fórmula de Euler: para todo x real, e^{ix} = cos x + i sen x
(seção "A fórmula"). -/
theorem formula_de_euler (x : ℝ) : exp (x * I) = Real.cos x + Real.sin x * I := by
  rw [exp_mul_I, ← ofReal_cos, ← ofReal_sin]

/-- A parte real de e^{ix} é cos x e a parte imaginária é sen x. -/
theorem partes_real_e_imaginaria (x : ℝ) :
    (exp (x * I)).re = Real.cos x ∧ (exp (x * I)).im = Real.sin x := by
  rw [formula_de_euler]
  constructor <;> simp [cos_ofReal_re, sin_ofReal_re]

/-- Para todo x real, |e^{ix}| = 1: o ponto está sempre no círculo de raio 1
(seção "A fórmula"). -/
theorem modulo_um (x : ℝ) : ‖exp (x * I)‖ = 1 :=
  norm_exp_ofReal_mul_I x

/-- A conta do módulo pelo caminho do texto: cos² x + sen² x = 1. -/
theorem cos_quadrado_mais_sen_quadrado (x : ℝ) : Real.cos x ^ 2 + Real.sin x ^ 2 = 1 :=
  Real.cos_sq_add_sin_sq x

/-- Multiplicar soma os ângulos: e^{ia} · e^{ib} = e^{i(a+b)} (seção "Multiplicar é girar"). -/
theorem multiplicar_soma_angulos (a b : ℝ) :
    exp (a * I) * exp (b * I) = exp (((a + b : ℝ) : ℂ) * I) := by
  rw [← exp_add]
  push_cast
  ring_nf

/-- Fórmula do cosseno da soma, que sai da fórmula de Euler:
cos(a + b) = cos a cos b − sen a sen b, para todos a e b reais. -/
theorem cosseno_da_soma (a b : ℝ) :
    Real.cos (a + b) = Real.cos a * Real.cos b - Real.sin a * Real.sin b :=
  Real.cos_add a b

/-- Fórmula do seno da soma: sen(a + b) = sen a cos b + cos a sen b. -/
theorem seno_da_soma (a b : ℝ) :
    Real.sin (a + b) = Real.sin a * Real.cos b + Real.cos a * Real.sin b :=
  Real.sin_add a b

/-- Dar uma volta inteira não muda o ponto: e^{i(x + 2π)} = e^{ix}, para todo x real. -/
theorem volta_inteira (x : ℝ) : exp (((x + 2 * Real.pi : ℝ) : ℂ) * I) = exp (x * I) := by
  push_cast
  rw [add_mul, exp_add, exp_two_pi_mul_I, mul_one]

/-! ## A identidade e os pontos especiais -/

/-- Identidade de Euler: e^{iπ} + 1 = 0 (seção "Meia volta: e elevado a iπ"). -/
theorem identidade_de_euler : exp (Real.pi * I) + 1 = 0 := by
  rw [exp_pi_mul_I]
  ring

/-- e^{iπ/2} = i: um quarto de volta. -/
theorem quarto_de_volta : exp ((Real.pi / 2 : ℝ) * I) = I := by
  rw [formula_de_euler, Real.cos_pi_div_two, Real.sin_pi_div_two]
  simp

/-- e^{2πi} = 1: uma volta inteira. -/
theorem volta_completa : exp (2 * Real.pi * I) = 1 :=
  exp_two_pi_mul_I

/-- e^{iπ/3} = 1/2 + (√3/2) i: seção "Exemplo resolvido: 60 graus". -/
theorem sessenta_graus :
    exp ((Real.pi / 3 : ℝ) * I) = 1 / 2 + (Real.sqrt 3 / 2 : ℝ) * I := by
  rw [formula_de_euler, Real.cos_pi_div_three, Real.sin_pi_div_three]
  push_cast
  ring

/-! ## O caminho do próprio Euler -/

/-- (1 + iπ/n)^n → −1 quando n → ∞ (seção "O caminho de Euler"). -/
theorem limite_de_euler :
    Tendsto (fun n : ℕ => (1 + (Real.pi * I) / n) ^ n) atTop (𝓝 (-1)) := by
  rw [← exp_pi_mul_I]
  exact tendsto_one_add_div_pow_exp _

/-! ## Onde aparece: a função característica -/

/-- Para toda variável aleatória real X (função mensurável) e todo t real, a média de e^{itX}
existe, porque |e^{itX}| = 1: é a função característica φ(t) = E[e^{itX}]
(seção "Onde a fórmula aparece"). -/
theorem funcao_caracteristica_existe {Ω : Type*} [MeasurableSpace Ω] (μ : MeasureTheory.Measure Ω)
    [MeasureTheory.IsProbabilityMeasure μ] {X : Ω → ℝ} (hX : Measurable X) (t : ℝ) :
    MeasureTheory.Integrable (fun ω => exp (((t * X ω : ℝ) : ℂ) * I)) μ := by
  refine MeasureTheory.Integrable.of_bound (C := 1) ?_ ?_
  · exact (by fun_prop : Measurable (fun ω => exp (((t * X ω : ℝ) : ℂ) * I))).aestronglyMeasurable
  · exact Filter.Eventually.of_forall (fun ω => by rw [norm_exp_ofReal_mul_I])

end Provas.Euler
