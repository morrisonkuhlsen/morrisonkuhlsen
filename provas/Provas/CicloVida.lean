import Mathlib

/-!
# Ciclo de vida da análise de dados

Post: /ciclo-de-vida-da-analise-de-dados/ (e a versão em inglês,
/data-analysis-life-cycle/).

`X` é a variável de interesse (por exemplo, a renda) e `R` é o indicador de observação:
`R = 1` quando o valor foi registrado e `R = 0` quando faltou. A média dos casos completos,
na população, é E[X·R] / E[R].
-/

namespace Provas.CicloVida

open ProbabilityTheory MeasureTheory

variable {Ω : Type*} [MeasurableSpace Ω] {μ : Measure Ω}

/-- Sob MCAR (a ausência não depende da variável: `X` e `R` independentes), a média dos casos
completos é igual à média de todos: descartar os incompletos não cria viés
(seção "MCAR, MAR, MNAR"). -/
theorem mcar_media_dos_completos {X R : Ω → ℝ} (hind : X ⟂ᵢ[μ] R)
    (hX : AEStronglyMeasurable X μ) (hR : AEStronglyMeasurable R μ)
    (hobs : ∫ ω, R ω ∂μ ≠ 0) :
    (∫ ω, X ω * R ω ∂μ) / (∫ ω, R ω ∂μ) = ∫ ω, X ω ∂μ := by
  rw [hind.integral_fun_mul_eq_mul_integral hX hR, mul_div_assoc, div_self hobs, mul_one]

end Provas.CicloVida
