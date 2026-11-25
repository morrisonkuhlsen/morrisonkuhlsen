import Mathlib

/-!
# Estimadores

Página: /pt/inferencia-estatistica/estimadores (e /en/statistical-inference/estimators).

A padronização Z = (X̄ − μ)/(σ/√n) ~ N(0, 1) está em `Provas.Testes.padronizacao`; a
equivalência entre o intervalo e o teste, em `Provas.Testes.teste_e_intervalo`.
-/

namespace Provas.Estimadores

open Finset MeasureTheory ProbabilityTheory

/-- Expansão usada na log-verossimilhança e na fatorização:
Σ(xᵢ − μ)² = Σxᵢ² − 2μΣxᵢ + nμ². Página: seções 3.3 e 4.3. -/
theorem expansao {ι : Type*} (s : Finset ι) (x : ι → ℝ) (μ : ℝ) :
    ∑ i ∈ s, (x i - μ) ^ 2 = ∑ i ∈ s, x i ^ 2 - 2 * μ * ∑ i ∈ s, x i + s.card * μ ^ 2 := by
  have : ∀ i ∈ s, (x i - μ) ^ 2 = x i ^ 2 - 2 * μ * x i + μ ^ 2 := fun i _ ↦ by ring
  rw [sum_congr rfl this, sum_add_distrib, sum_sub_distrib, ← mul_sum, sum_const, nsmul_eq_mul]

/-- Decomposição: com x̄ = Σxᵢ/n, Σ(xᵢ − μ)² = Σ(xᵢ − x̄)² + n(x̄ − μ)². -/
theorem decomposicao {ι : Type*} (s : Finset ι) (hs : s.Nonempty) (x : ι → ℝ) (μ : ℝ) :
    ∑ i ∈ s, (x i - μ) ^ 2 =
      ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) ^ 2 +
        s.card * ((∑ j ∈ s, x j) / s.card - μ) ^ 2 := by
  have hn : (s.card : ℝ) ≠ 0 := by exact_mod_cast hs.card_pos.ne'
  rw [expansao, expansao]
  field_simp
  ring

/-- EMV da média da normal: a log-verossimilhança é −n·ln(σ√(2π)) − Σ(xᵢ − μ)²/(2σ²), então
maximizá-la é minimizar Σ(xᵢ − μ)²; o mínimo é atingido em μ = x̄, e só nele.
Página: seção 5. -/
theorem emv_media {ι : Type*} (s : Finset ι) (hs : s.Nonempty) (x : ι → ℝ) (μ : ℝ) :
    ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) ^ 2 ≤ ∑ i ∈ s, (x i - μ) ^ 2 ∧
    (∑ i ∈ s, (x i - μ) ^ 2 = ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) ^ 2 ↔
      μ = (∑ j ∈ s, x j) / s.card) := by
  have hn : (0 : ℝ) < s.card := by exact_mod_cast hs.card_pos
  rw [decomposicao s hs x μ]
  constructor
  · nlinarith [sq_nonneg ((∑ j ∈ s, x j) / s.card - μ)]
  · constructor
    · intro h
      have h2 : (s.card : ℝ) * ((∑ j ∈ s, x j) / s.card - μ) ^ 2 = 0 := by linarith
      have h3 : ((∑ j ∈ s, x j) / s.card - μ) ^ 2 = 0 := by
        rcases mul_eq_zero.mp h2 with h | h
        · exact absurd h hn.ne'
        · exact h
      have := pow_eq_zero_iff (n := 2) (by norm_num) |>.mp h3
      linarith
    · intro h
      rw [h, sub_self]
      ring

/-- Erro quadrático médio = variância + viés², para um estimador com distribuição finita
(valores tₖ com probabilidades pₖ somando 1): Σ pₖ(tₖ − θ)² = Σ pₖ(tₖ − m)² + (m − θ)²,
onde m = Σ pₖtₖ é a esperança do estimador. Página: seção 0. -/
theorem eqm_decomposicao {ι : Type*} (s : Finset ι) (p t : ι → ℝ) (θ : ℝ)
    (hp : ∑ k ∈ s, p k = 1) :
    ∑ k ∈ s, p k * (t k - θ) ^ 2 =
      ∑ k ∈ s, p k * (t k - ∑ j ∈ s, p j * t j) ^ 2 + (∑ j ∈ s, p j * t j - θ) ^ 2 := by
  set m := ∑ j ∈ s, p j * t j with hm
  have e1 : ∀ k ∈ s, p k * (t k - θ) ^ 2 = p k * t k ^ 2 - 2 * θ * (p k * t k) + θ ^ 2 * p k :=
    fun k _ ↦ by ring
  have e2 : ∀ k ∈ s, p k * (t k - m) ^ 2 = p k * t k ^ 2 - 2 * m * (p k * t k) + m ^ 2 * p k :=
    fun k _ ↦ by ring
  rw [sum_congr rfl e1, sum_congr rfl e2]
  simp only [sum_add_distrib, sum_sub_distrib, ← mul_sum, hp, ← hm]
  ring

/-- A média amostral é não viesada: se cada Xᵢ tem esperança μ (e é integrável),
E[(1/n)ΣXᵢ] = μ. Não precisa de independência. Página: seção 6.1. -/
theorem media_nao_viesada {Ω : Type*} [MeasurableSpace Ω] (P : Measure Ω) [IsProbabilityMeasure P]
    {n : ℕ} (hn : 0 < n) (X : Fin n → Ω → ℝ) (hint : ∀ i, Integrable (X i) P) {μ : ℝ}
    (hμ : ∀ i, ∫ ω, X i ω ∂P = μ) :
    ∫ ω, (1 / (n : ℝ)) * ∑ i, X i ω ∂P = μ := by
  rw [integral_const_mul, integral_finsetSum _ fun i _ ↦ hint i]
  simp only [hμ, sum_const, card_univ, Fintype.card_fin, nsmul_eq_mul]
  have : (n : ℝ) ≠ 0 := by exact_mod_cast hn.ne'
  field_simp

/-- Informação de Fisher para a normal com σ² conhecido: a segunda derivada de
ln f(x; μ) = −ln(σ√(2π)) − (x − μ)²/(2σ²) em relação a μ é −1/σ², para todo x.
Página: seção 6.3. -/
theorem fisher_normal (x σ : ℝ) (hσ : σ ≠ 0) :
    deriv (fun μ ↦ deriv (fun m ↦ -Real.log (σ * Real.sqrt (2 * Real.pi)) -
      (x - m) ^ 2 / (2 * σ ^ 2)) μ) = fun _ ↦ -1 / σ ^ 2 := by
  have h1 : ∀ μ, deriv (fun m ↦ -Real.log (σ * Real.sqrt (2 * Real.pi)) -
      (x - m) ^ 2 / (2 * σ ^ 2)) μ = (x - μ) / σ ^ 2 := by
    intro μ
    have h := ((hasDerivAt_id μ).const_sub x).pow 2 |>.div_const (2 * σ ^ 2)
    have h2 := (hasDerivAt_const μ (-Real.log (σ * Real.sqrt (2 * Real.pi)))).sub h
    have h3 : HasDerivAt (fun m ↦ -Real.log (σ * Real.sqrt (2 * Real.pi)) -
        (x - m) ^ 2 / (2 * σ ^ 2)) ((x - μ) / σ ^ 2) μ := by
      refine h2.congr_deriv ?_
      simp only [id]
      field_simp
      ring
    exact h3.deriv
  funext μ
  simp_rw [h1]
  have h := ((hasDerivAt_id μ).const_sub x).div_const (σ ^ 2)
  have h4 : HasDerivAt (fun m ↦ (x - m) / σ ^ 2) (-1 / σ ^ 2) μ := h
  exact h4.deriv

/-- Contas do exemplo: T = 5050, x̄ = 505, s² = 34/9, I₁₀ = 10/25, LCR = 25/10, e
z = (505 − 500)/(5/√10) = √10. Página: seção 10. -/
theorem contas :
    ((504 + 507 + 503 + 506 + 505 + 502 + 508 + 506 + 503 + 506 : ℚ) = 5050) ∧
    (5050 : ℚ) / 10 = 505 ∧
    ((1 + 4 + 4 + 1 + 0 + 9 + 9 + 1 + 4 + 1 : ℚ) = 34) ∧
    (10 : ℚ) / 25 = 2/5 ∧ 1 / ((2 : ℚ)/5) = 5/2 ∧
    (505 - 500) / (5 / Real.sqrt 10) = Real.sqrt 10 := by
  refine ⟨by norm_num, by norm_num, by norm_num, by norm_num, by norm_num, ?_⟩
  have : Real.sqrt 10 ≠ 0 := by positivity
  field_simp
  norm_num

end Provas.Estimadores
