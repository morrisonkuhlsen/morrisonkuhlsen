import Mathlib
import Provas.Estimadores

/-!
# Análise de Variância

Página: /pt/inferencia-estatistica/analise-variancia
(e /en/statistical-inference/analysis-of-variance).
-/

namespace Provas.Anova

open Finset MeasureTheory

/-- Decomposição da soma de quadrados (seção 4): para observações `x i`, cada uma num grupo
`grupo i`, com média do grupo m_g = (Σ_{i no grupo g} xᵢ)/n_g e média geral x̄ = Σxᵢ/N,
SQ_total = SQ_entre + SQ_dentro:
Σᵢ (xᵢ − x̄)² = Σ_g n_g (m_g − x̄)² + Σᵢ (xᵢ − m_{grupo i})². -/
theorem decomposicao_sq {ι G : Type*} [DecidableEq G] (s : Finset ι) (grupo : ι → G)
    (x : ι → ℝ) :
    let N : ℝ := s.card
    let media_geral := (∑ i ∈ s, x i) / N
    let n : G → ℝ := fun g ↦ (s.filter (fun i ↦ grupo i = g)).card
    let media : G → ℝ := fun g ↦ (∑ i ∈ s.filter (fun i ↦ grupo i = g), x i) / n g
    ∑ i ∈ s, (x i - media_geral) ^ 2 =
      ∑ g ∈ s.image grupo, n g * (media g - media_geral) ^ 2 +
        ∑ i ∈ s, (x i - media (grupo i)) ^ 2 := by
  intro N media_geral n media
  have hmaps : ∀ i ∈ s, grupo i ∈ s.image grupo := fun i hi ↦ mem_image_of_mem grupo hi
  -- Cada soma sobre s é a soma, grupo a grupo, das somas dentro de cada grupo.
  rw [← sum_fiberwise_of_maps_to hmaps (fun i ↦ (x i - media_geral) ^ 2),
    ← sum_fiberwise_of_maps_to hmaps (fun i ↦ (x i - media (grupo i)) ^ 2), ← sum_add_distrib]
  refine sum_congr rfl fun g hg ↦ ?_
  have hne : (s.filter (fun i ↦ grupo i = g)).Nonempty := by
    obtain ⟨i, hi, rfl⟩ := mem_image.mp hg
    exact ⟨i, mem_filter.mpr ⟨hi, rfl⟩⟩
  -- Dentro do grupo g, vale a decomposição Σ(xᵢ − μ)² = Σ(xᵢ − m)² + n(m − μ)².
  have hdentro : ∑ i ∈ s.filter (fun i ↦ grupo i = g), (x i - media (grupo i)) ^ 2 =
      ∑ i ∈ s.filter (fun i ↦ grupo i = g), (x i - media g) ^ 2 :=
    sum_congr rfl fun i hi ↦ by rw [(mem_filter.mp hi).2]
  rw [hdentro, Provas.Estimadores.decomposicao _ hne x media_geral]
  ring

/-- Coeficiente η² = SQ_entre/SQ_total fica entre 0 e 1 (seção 6), porque
SQ_total = SQ_entre + SQ_dentro com as duas parcelas ≥ 0 (e SQ_total > 0, isto é,
nem todos os valores iguais). -/
theorem eta_quadrado_entre_0_e_1 (SQ_entre SQ_dentro : ℝ) (hentre : 0 ≤ SQ_entre)
    (hdentro0 : 0 ≤ SQ_dentro)
    (hT : 0 < SQ_entre + SQ_dentro) :
    0 ≤ SQ_entre / (SQ_entre + SQ_dentro) ∧ SQ_entre / (SQ_entre + SQ_dentro) ≤ 1 := by
  refine ⟨div_nonneg hentre hT.le, (div_le_one hT).mpr (by linarith)⟩

/-- Graus de liberdade (seção 4): com k grupos e N observações (1 ≤ k ≤ N),
(k − 1) + (N − k) = N − 1. -/
theorem graus_liberdade (k N : ℕ) (hk : 1 ≤ k) (hkN : k ≤ N) :
    (k - 1) + (N - k) = N - 1 := by
  omega

/-- Com dois grupos (seção 10), a ANOVA e o teste t de duas amostras com variâncias iguais
são o mesmo teste: F = t². Com tamanhos n₁, n₂ > 0, médias m₁, m₂, média geral
x̄ = (n₁m₁ + n₂m₂)/(n₁ + n₂), SQ_entre = n₁(m₁ − x̄)² + n₂(m₂ − x̄)², gl entre = 1,
QM_dentro = s²_p (variância combinada) > 0 e t = (m₁ − m₂)/√(s²_p(1/n₁ + 1/n₂)). -/
theorem f_igual_t_quadrado (n₁ n₂ m₁ m₂ QM_dentro : ℝ) (h₁ : 0 < n₁) (h₂ : 0 < n₂)
    (hQ : 0 < QM_dentro) :
    let media_geral := (n₁ * m₁ + n₂ * m₂) / (n₁ + n₂)
    let SQ_entre := n₁ * (m₁ - media_geral) ^ 2 + n₂ * (m₂ - media_geral) ^ 2
    let t := (m₁ - m₂) / Real.sqrt (QM_dentro * (1 / n₁ + 1 / n₂))
    (SQ_entre / 1) / QM_dentro = t ^ 2 := by
  intro media_geral SQ_entre t
  have hpos : 0 ≤ QM_dentro * (1 / n₁ + 1 / n₂) := by positivity
  simp only [t, div_pow, Real.sq_sqrt hpos, SQ_entre, media_geral]
  field_simp
  ring

/-- Comparações múltiplas (seção 2): a chance de pelo menos um falso positivo em três testes
não passa da soma das chances de cada um: P(A ∪ B ∪ C) ≤ P(A) + P(B) + P(C).
Com três testes a 5%, isso dá no máximo 15%. -/
theorem uniao_tres {Ω : Type*} [MeasurableSpace Ω] (P : Measure Ω) (A B C : Set Ω) :
    P (A ∪ B ∪ C) ≤ P A + P B + P C :=
  (measure_union_le _ _).trans (by gcongr; exact measure_union_le _ _)

/-- Contas do exemplo dos fertilizantes (seções 5 a 8), em aritmética exata. -/
theorem contas :
    -- médias dos grupos e média geral
    ((20 + 21 + 19 + 22 + 20) / 5 : ℚ) = 102 / 5 ∧
    ((18 + 17 + 20 + 16 + 19) / 5 : ℚ) = 18 ∧
    ((23 + 22 + 21 + 24 + 25) / 5 : ℚ) = 23 ∧
    ((102 + 90 + 115) / 15 : ℚ) = 307 / 15 ∧
    -- SQ_entre
    (5 * ((102 / 5 - 307 / 15) ^ 2 + (18 - 307 / 15) ^ 2 + (23 - 307 / 15) ^ 2) : ℚ)
      = 938 / 15 ∧
    -- SQ_dentro, grupo a grupo
    ((20 - 102 / 5) ^ 2 + (21 - 102 / 5) ^ 2 + (19 - 102 / 5) ^ 2 + (22 - 102 / 5) ^ 2 +
      (20 - 102 / 5) ^ 2 : ℚ) = 26 / 5 ∧
    ((18 - 18) ^ 2 + (17 - 18) ^ 2 + (20 - 18) ^ 2 + (16 - 18) ^ 2 + (19 - 18) ^ 2 : ℚ) = 10 ∧
    ((23 - 23) ^ 2 + (22 - 23) ^ 2 + (21 - 23) ^ 2 + (24 - 23) ^ 2 + (25 - 23) ^ 2 : ℚ) = 10 ∧
    -- SQ_total calculada direto e conferida com SQ_entre + SQ_dentro
    (((20 : ℚ) - 307 / 15) ^ 2 + (21 - 307 / 15) ^ 2 + (19 - 307 / 15) ^ 2 +
      (22 - 307 / 15) ^ 2 + (20 - 307 / 15) ^ 2 + (18 - 307 / 15) ^ 2 + (17 - 307 / 15) ^ 2 +
      (20 - 307 / 15) ^ 2 + (16 - 307 / 15) ^ 2 + (19 - 307 / 15) ^ 2 + (23 - 307 / 15) ^ 2 +
      (22 - 307 / 15) ^ 2 + (21 - 307 / 15) ^ 2 + (24 - 307 / 15) ^ 2 + (25 - 307 / 15) ^ 2)
      = 1316 / 15 ∧
    (938 / 15 + 126 / 5 : ℚ) = 1316 / 15 ∧
    -- quadrados médios, F e η²
    ((938 / 15) / 2 : ℚ) = 469 / 15 ∧ ((126 / 5) / 12 : ℚ) = 21 / 10 ∧
    ((469 / 15) / (21 / 10) : ℚ) = 134 / 9 ∧
    ((938 / 15) / (1316 / 15) : ℚ) = 67 / 94 ∧
    -- QM_dentro é a média das três variâncias (grupos do mesmo tamanho)
    ((13 / 10 + 5 / 2 + 5 / 2) / 3 : ℚ) = 21 / 10 ∧
    -- Tukey: diferenças das médias
    ((18 : ℚ) - 102 / 5) = -12 / 5 ∧ ((23 : ℚ) - 102 / 5) = 13 / 5 ∧
    -- três testes independentes a 5%
    (1 - (95 / 100 : ℚ) ^ 3) = 142625 / 1000000 := by
  norm_num

end Provas.Anova
