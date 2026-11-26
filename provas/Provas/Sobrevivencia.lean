import Mathlib

/-!
# Viés de sobrevivência

Post: /vies-de-sobrevivencia-avioes-abraham-wald/ (e a versão em inglês).

Notação: regiões indexadas por `s`; aᵢ = fração da área (Σaᵢ = 1); qᵢ = chance de um tiro
na região i derrubar o avião.
-/

namespace Provas.Sobrevivencia

open Finset Real

variable {ι : Type*} (s : Finset ι)

/-! ## Um tiro por avião: Bayes -/

/-- Com um tiro por avião, P(região i | voltou) = aᵢ(1 − qᵢ) / Σⱼ aⱼ(1 − qⱼ), e essas
probabilidades somam 1 (quando algum avião volta). Seção "Isso tem nome, e o nome é Bayes". -/
theorem posterior_soma_um (a q : ι → ℝ) (h : ∑ j ∈ s, a j * (1 - q j) ≠ 0) :
    ∑ i ∈ s, a i * (1 - q i) / ∑ j ∈ s, a j * (1 - q j) = 1 := by
  rw [← sum_div, div_self h]

/-- Cada região é "encolhida" na proporção de 1 − qᵢ: P(i | voltou) / aᵢ = (1 − qᵢ)/P(voltou). -/
theorem encolhimento (a q : ι → ℝ) (i : ι) (hai : a i ≠ 0) :
    (a i * (1 - q i) / ∑ j ∈ s, a j * (1 - q j)) / a i = (1 - q i) / ∑ j ∈ s, a j * (1 - q j) := by
  field_simp

/-- Contas da tabela dos 1.000 aviões: voltam 70, 15, 291, 336 e 90 (total 802), e
P(motor | voltou) = 0,35 × 0,20 / 0,802 = 35/401 ≈ 0,0873. -/
theorem contas_tabela :
    ((200 : ℚ) * (1 - 65 / 100) = 70) ∧ ((50 : ℚ) * (1 - 70 / 100) = 15) ∧
    ((300 : ℚ) * (1 - 3 / 100) = 291) ∧ ((350 : ℚ) * (1 - 4 / 100) = 336) ∧
    ((100 : ℚ) * (1 - 10 / 100) = 90) ∧ ((70 : ℚ) + 15 + 291 + 336 + 90 = 802) ∧
    ((35 / 100 : ℚ) * (20 / 100) / (802 / 1000) = 35 / 401) := by
  norm_num

/-- Estimador de um tiro: se a região i aparece em sᵢ = N·aᵢ·(1 − qᵢ) aviões que voltaram,
então 1 − sᵢ/(N·aᵢ) = qᵢ. -/
theorem estimador_um_tiro (N ai qi : ℝ) (hN : N ≠ 0) (ha : ai ≠ 0) :
    1 - (N * ai * (1 - qi)) / (N * ai) = qi := by
  field_simp; ring

/-! ## Vários tiros (Poisson): o estimador recupera λ e qᵢ -/

/-- Se as contagens forem exatamente as esperadas — S = N·e^(−λQ) aviões de volta,
H = S·λ(1 − Q) furos e hᵢ = S·λ·aᵢ(1 − qᵢ) furos na região i, com Q = Σaⱼqⱼ e Σaⱼ = 1 —,
então λ̂ = H/S + ln(N/S) = λ e q̂ᵢ = 1 − hᵢ/(S·λ̂·aᵢ) = qᵢ. -/
theorem estimador_poisson (a q : ι → ℝ) (N lam : ℝ) (hN : 0 < N) (hlam : lam ≠ 0)
    (i : ι) (hai : a i ≠ 0) :
    let Q := ∑ j ∈ s, a j * q j
    let S := N * exp (-(lam * Q))
    let H := S * (lam * (1 - Q))
    let lamHat := H / S + Real.log (N / S)
    lamHat = lam ∧ 1 - (S * lam * a i * (1 - q i)) / (S * lamHat * a i) = q i := by
  intro Q S H lamHat
  have hS : S ≠ 0 := by positivity
  have hlog : Real.log (N / S) = lam * Q := by
    simp only [S]
    rw [div_mul_eq_div_div, div_self hN.ne', one_div, ← exp_neg, neg_neg, log_exp]
  have hl : lamHat = lam := by
    simp only [lamHat, H]
    rw [hlog, mul_div_cancel_left₀ _ hS]
    ring
  refine ⟨hl, ?_⟩
  rw [hl]
  field_simp
  ring

end Provas.Sobrevivencia
