import Mathlib

/-!
# Regressão à média

Post: /regressao-a-media-castigo-elogio-galton/ (e a versão em inglês,
/regression-to-the-mean-galton/).

Modelo do post: nota = habilidade + sorte. `T` é a habilidade, `E₁` e `E₂` são as sortes das
duas provas, sem correlação com a habilidade nem entre si.
-/

namespace Provas.RegressaoMedia

open ProbabilityTheory MeasureTheory

variable {Ω : Type*} [MeasurableSpace Ω] {μ : Measure Ω} [IsFiniteMeasure μ]

/-- Covariância entre as duas provas = variância da habilidade, quando as sortes não têm
correlação com a habilidade nem entre si (seção "Habilidade mais sorte"). -/
theorem covariancia_provas {T E₁ E₂ : Ω → ℝ} (hT : MemLp T 2 μ) (h₁ : MemLp E₁ 2 μ)
    (h₂ : MemLp E₂ 2 μ) (c₁ : cov[T, E₂; μ] = 0) (c₂ : cov[E₁, T; μ] = 0)
    (c₃ : cov[E₁, E₂; μ] = 0) :
    cov[T + E₁, T + E₂; μ] = Var[T; μ] := by
  rw [covariance_add_left hT h₁ (hT.add h₂), covariance_add_right hT hT h₂,
    covariance_add_right h₁ hT h₂, covariance_self hT.aestronglyMeasurable.aemeasurable, c₁, c₂, c₃]
  ring

/-- Variância de cada prova = variância da habilidade + variância da sorte (mesma seção). -/
theorem variancia_prova {T E : Ω → ℝ} (hT : MemLp T 2 μ) (hE : MemLp E 2 μ)
    (c : cov[T, E; μ] = 0) :
    Var[T + E; μ] = Var[T; μ] + Var[E; μ] := by
  rw [variance_add hT hE, c]
  ring

/-- Com variância da habilidade a ≥ 0 e da sorte b > 0, a correlação a/(a+b) fica em [0, 1):
quanto mais sorte, mais perto de 0. -/
theorem correlacao_entre_zero_e_um (a b : ℝ) (ha : 0 ≤ a) (hb : 0 < b) :
    0 ≤ a / (a + b) ∧ a / (a + b) < 1 := by
  have hab : 0 < a + b := by linarith
  refine ⟨div_nonneg ha hab.le, ?_⟩
  rw [div_lt_one hab]
  linarith

/-- No exemplo do post, variância da habilidade 0,6 e da sorte 0,4 dão correlação 0,6. -/
theorem correlacao_exemplo : (0.6 : ℝ) / (0.6 + 0.4) = 0.6 := by norm_num

/-- Em unidades padronizadas, a previsão é ρ·z. Com |ρ| < 1 e z ≠ 0, ela fica estritamente
mais perto da média (zero) do que a nota observada: é a regressão à média. -/
theorem previsao_mais_perto (ρ z : ℝ) (hρ : |ρ| < 1) (hz : z ≠ 0) : |ρ * z| < |z| := by
  rw [abs_mul]
  have : 0 < |z| := abs_pos.mpr hz
  nlinarith [abs_nonneg ρ]

/-- Com |ρ| ≤ 1 (como toda correlação), a previsão nunca fica mais longe da média que z. -/
theorem previsao_nunca_mais_longe (ρ z : ℝ) (hρ : |ρ| ≤ 1) : |ρ * z| ≤ |z| := by
  rw [abs_mul]
  nlinarith [abs_nonneg ρ, abs_nonneg z]

/-- A reta de mínimos quadrados ŷ = ȳ + r·(s_y/s_x)·(x − x̄), escrita em desvios padrão,
vira (ŷ − ȳ)/s_y = r·(x − x̄)/s_x (seção sobre os dados de Galton). -/
theorem reta_padronizada (x xbar ybar sx sy r : ℝ) (hx : sx ≠ 0) (hy : sy ≠ 0) :
    ((ybar + r * (sy / sx) * (x - xbar)) - ybar) / sy = r * ((x - xbar) / sx) := by
  field_simp
  ring

/-- A variância não encolhe: a parte prevista (ρ²σ²) mais a parte não prevista ((1 − ρ²)σ²)
somam de novo σ² (seção "O que a regressão à média não é"). -/
theorem variancia_nao_encolhe (ρ σ : ℝ) : ρ ^ 2 * σ ^ 2 + (1 - ρ ^ 2) * σ ^ 2 = σ ^ 2 := by
  ring

end Provas.RegressaoMedia
