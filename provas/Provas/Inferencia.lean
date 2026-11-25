import Mathlib

/-!
# Inferência Estatística (página principal da área)

Página: /pt/inferencia-estatistica/ (e /en/statistical-inference/).

As propriedades que a página afirma valer sempre já estão provadas em outros arquivos:
- E[X̄] = μ: `Provas.Estimadores.media_nao_viesada`;
- Var(X̄) = σ²/n para observações independentes: `Provas.LimiteCentral.variancia_media`;
- Teorema do Limite Central: `Provas.LimiteCentral.tlc`;
- reduzir o erro padrão à metade exige quadruplicar n: `Provas.Intervalos.quadruplicar`;
- o teste bilateral rejeita H₀ exatamente quando μ₀ fica fora do intervalo:
  `Provas.Testes.teste_e_intervalo`.
-/

namespace Provas.Inferencia

/-- Contas do exemplo do teste t (n = 36, x̄ = 12, s = 6, μ₀ = 10): √36 = 6, erro padrão 1,
t = 2, 35 graus de liberdade, d de Cohen = 1/3. -/
theorem contas :
    Real.sqrt 36 = 6 ∧ (6 : ℝ) / 6 = 1 ∧ (12 - 10 : ℝ) / 1 = 2 ∧ (36 - 1 : ℕ) = 35 ∧
    ((12 - 10) / 6 : ℚ) = 1 / 3 := by
  refine ⟨?_, by norm_num, by norm_num, by norm_num, by norm_num⟩
  rw [show (36 : ℝ) = 6 ^ 2 by norm_num, Real.sqrt_sq (by norm_num)]

end Provas.Inferencia
