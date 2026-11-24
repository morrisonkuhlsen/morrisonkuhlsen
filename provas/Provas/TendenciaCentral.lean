import Mathlib

/-!
# Tendência central

Página: /pt/estatistica-descritiva/tendencia-central ("Uma propriedade que
explica a robustez") e a versão em inglês.

A página afirma que a média minimiza a soma dos quadrados das distâncias e
que a mediana minimiza a soma das distâncias absolutas.
-/

namespace Provas.TendenciaCentral

open Finset

/-- Decomposição da soma dos quadrados: para qualquer c,
Σ (xᵢ − c)² = Σ (xᵢ − x̄)² + n·(x̄ − c)², com x̄ = (Σ xᵢ)/n. -/
theorem soma_quadrados_decomposta {ι : Type*} (s : Finset ι) (x : ι → ℝ) (c : ℝ)
    (hn : s.Nonempty) :
    ∑ i ∈ s, (x i - c) ^ 2 =
      ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) ^ 2 +
        s.card * ((∑ j ∈ s, x j) / s.card - c) ^ 2 := by
  have hc : (s.card : ℝ) ≠ 0 := by exact_mod_cast hn.card_pos.ne'
  set μ := (∑ j ∈ s, x j) / s.card with hμ
  have hsum : ∑ j ∈ s, x j = s.card * μ := by rw [hμ]; field_simp
  have e : ∀ i ∈ s, (x i - c) ^ 2 =
      (x i - μ) ^ 2 + 2 * (μ - c) * (x i - μ) + (μ - c) ^ 2 := by
    intro i _; ring
  rw [sum_congr rfl e, sum_add_distrib, sum_add_distrib, ← mul_sum, sum_sub_distrib,
    hsum, sum_const, nsmul_eq_mul]
  simp

/-- A média minimiza a soma dos quadrados: Σ (xᵢ − x̄)² ≤ Σ (xᵢ − c)² para todo c. -/
theorem media_minimiza_quadrados {ι : Type*} (s : Finset ι) (x : ι → ℝ) (c : ℝ)
    (hn : s.Nonempty) :
    ∑ i ∈ s, (x i - (∑ j ∈ s, x j) / s.card) ^ 2 ≤ ∑ i ∈ s, (x i - c) ^ 2 := by
  rw [soma_quadrados_decomposta s x c hn]
  have : (0 : ℝ) ≤ s.card * ((∑ j ∈ s, x j) / s.card - c) ^ 2 := by positivity
  linarith

/-- Passo de um ponto só, para c ≥ m. -/
private lemma passo_acima (a m c : ℝ) (hc : m ≤ c) :
    |a - m| + (c - m) * (if a ≤ m then 1 else -1) ≤ |a - c| := by
  split_ifs with h
  · rw [abs_of_nonpos (by linarith), abs_of_nonpos (by linarith)]; linarith
  · rw [not_le] at h
    rw [abs_of_pos (by linarith)]
    have := le_abs_self (a - c)
    linarith

/-- Passo de um ponto só, para c ≤ m. -/
private lemma passo_abaixo (a m c : ℝ) (hc : c ≤ m) :
    |a - m| + (m - c) * (if m ≤ a then 1 else -1) ≤ |a - c| := by
  split_ifs with h
  · rw [abs_of_nonneg (by linarith), abs_of_nonneg (by linarith)]; linarith
  · rw [not_le] at h
    rw [abs_of_neg (by linarith)]
    have := neg_abs_le (a - c)
    linarith

/-- Soma ±1 sobre uma condição: dá (nº que satisfaz) − (nº que não satisfaz). -/
private lemma soma_sinal {ι : Type*} (s : Finset ι) (p : ι → Prop) [DecidablePred p] :
    ∑ i ∈ s, (if p i then (1 : ℝ) else -1) =
      2 * ((s.filter p).card : ℝ) - s.card := by
  rw [sum_ite, sum_const, sum_const, nsmul_eq_mul, nsmul_eq_mul, mul_one, mul_neg, mul_one]
  have h := card_filter_add_card_filter_not (s := s) p
  have h' : ((s.filter p).card : ℝ) + ((s.filter (fun i => ¬ p i)).card : ℝ) = s.card := by
    exact_mod_cast h
  linarith

/-- A mediana minimiza a soma das distâncias absolutas.

"m é uma mediana" quer dizer: pelo menos metade dos dados é ≤ m e pelo menos
metade é ≥ m. Então, para todo c, Σ |xᵢ − m| ≤ Σ |xᵢ − c|. -/
theorem mediana_minimiza_absolutos {ι : Type*} (s : Finset ι) (x : ι → ℝ) (m c : ℝ)
    (h_abaixo : (s.card : ℝ) ≤ 2 * (s.filter (fun i => x i ≤ m)).card)
    (h_acima : (s.card : ℝ) ≤ 2 * (s.filter (fun i => m ≤ x i)).card) :
    ∑ i ∈ s, |x i - m| ≤ ∑ i ∈ s, |x i - c| := by
  rcases le_total m c with hc | hc
  · have hs : ∑ i ∈ s, (|x i - m| + (c - m) * (if x i ≤ m then 1 else -1)) ≤
        ∑ i ∈ s, |x i - c| := sum_le_sum fun i _ => passo_acima (x i) m c hc
    rw [sum_add_distrib, ← mul_sum, soma_sinal s (fun i => x i ≤ m)] at hs
    have : 0 ≤ (c - m) * (2 * ((s.filter (fun i => x i ≤ m)).card : ℝ) - s.card) :=
      mul_nonneg (by linarith) (by linarith)
    linarith
  · have hs : ∑ i ∈ s, (|x i - m| + (m - c) * (if m ≤ x i then 1 else -1)) ≤
        ∑ i ∈ s, |x i - c| := sum_le_sum fun i _ => passo_abaixo (x i) m c hc
    rw [sum_add_distrib, ← mul_sum, soma_sinal s (fun i => m ≤ x i)] at hs
    have : 0 ≤ (m - c) * (2 * ((s.filter (fun i => m ≤ x i)).card : ℝ) - s.card) :=
      mul_nonneg (by linarith) (by linarith)
    linarith

/-- A tabela da página, com os dados {1, 2, 10}: as somas em m = 1, 2, 3. -/
theorem exemplo_tabela :
    |(1 : ℝ) - 1| + |2 - 1| + |10 - 1| = 10 ∧
    |(1 : ℝ) - 2| + |2 - 2| + |10 - 2| = 9 ∧
    |(1 : ℝ) - 3| + |2 - 3| + |10 - 3| = 10 := by
  norm_num [abs_of_nonneg, abs_of_nonpos]

end Provas.TendenciaCentral
