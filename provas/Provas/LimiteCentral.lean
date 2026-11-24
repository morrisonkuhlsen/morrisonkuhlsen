import Mathlib

/-!
# Teorema do Limite Central

Página: /pt/probabilidade/teorema-limite-central (e /en/probability/central-limit-theorem).

O TLC em si está provado no Mathlib
(`ProbabilityTheory.tendstoInDistribution_inv_sqrt_mul_sum_sub`, que dá a convergência de
(ΣXᵢ − nμ)/√n para N(0, σ²)). Aqui ele é posto na forma da página, dividindo por σ.
-/

namespace Provas.LimiteCentral

open MeasureTheory ProbabilityTheory Filter Finset

variable {Ω Ω' : Type*} {mΩ : MeasurableSpace Ω} {mΩ' : MeasurableSpace Ω'}
  {P : Measure Ω} [IsProbabilityMeasure P] {P' : Measure Ω'} [IsProbabilityMeasure P']
  {X : ℕ → Ω → ℝ}

/-- **TLC**, na forma da página: se X₁, X₂, … são independentes e identicamente
distribuídas, com média μ e variância σ² finita e positiva, então
(ΣXᵢ − nμ)/(σ√n) converge em distribuição para N(0, 1).
Página: seção 2 ("Enunciado formal"). -/
theorem tlc {Z : Ω' → ℝ} (hZ : HasLaw Z (gaussianReal 0 1) P')
    (hX : MemLp (X 0) 2 P) (hσ : Var[X 0; P] ≠ 0) (hindep : iIndepFun X P)
    (hident : ∀ i, IdentDistrib (X i) (X 0) P P) :
    TendstoInDistribution
      (fun (n : ℕ) ω ↦ (∑ k ∈ range n, X k ω - n * P[X 0]) / (√(Var[X 0; P]) * √n))
      atTop Z (fun _ ↦ P) P' := by
  set v := Var[X 0; P] with hv
  have hv0 : 0 < v := lt_of_le_of_ne (variance_nonneg _ _) (Ne.symm hσ)
  set σ := √v with hσdef
  have hσ0 : σ ≠ 0 := (Real.sqrt_pos.mpr hv0).ne'
  -- Y = σ·Z tem distribuição N(0, σ²).
  have hmap : (gaussianReal 0 1).map (fun x : ℝ ↦ σ * x) = gaussianReal 0 v.toNNReal := by
    rw [gaussianReal_map_const_mul]
    congr 1
    · ring
    · ext
      simp [σ, Real.sq_sqrt hv0.le, Real.coe_toNNReal _ hv0.le]
  have hlaw : HasLaw (fun x : ℝ ↦ σ * x) (gaussianReal 0 v.toNNReal) (gaussianReal 0 1) :=
    ⟨by fun_prop, hmap⟩
  have hY : HasLaw (fun ω' ↦ σ * Z ω') (gaussianReal 0 v.toNNReal) P' := hlaw.comp hZ
  have h := (tendstoInDistribution_inv_sqrt_mul_sum_sub hY hX hindep hident).continuous_comp
    (g := fun x : ℝ ↦ x / σ) (continuous_id.div_const σ)
  refine h.congr (fun n ↦ ae_of_all _ fun ω ↦ ?_) (ae_of_all _ fun ω' ↦ ?_)
  · simp only [Function.comp_apply, div_eq_mul_inv, mul_inv]
    ring
  · simp only [Function.comp_apply]
    field_simp

/-- A forma "com a média amostral" é a mesma conta: para n ≥ 1,
(ΣXᵢ − nμ)/(σ√n) = (X̄ − μ)/(σ/√n), onde X̄ = (ΣXᵢ)/n.
Página: seção 2 ("Ou, equivalentemente..."). -/
theorem forma_media (n : ℕ) (hn : 0 < n) (S μ σ : ℝ) (hσ : σ ≠ 0) :
    (S - n * μ) / (σ * √n) = (S / n - μ) / (σ / √n) := by
  have hn' : (n : ℝ) ≠ 0 := by exact_mod_cast hn.ne'
  have hs : √(n : ℝ) ≠ 0 := (Real.sqrt_pos.mpr (by exact_mod_cast hn)).ne'
  have key : ∀ t : ℝ, t ≠ 0 → (S - t ^ 2 * μ) / (σ * t) = (S / t ^ 2 - μ) / (σ / t) := by
    intro t ht
    field_simp
  have k := key (√(n : ℝ)) hs
  rwa [Real.sq_sqrt (by positivity)] at k

omit [IsProbabilityMeasure P] in
/-- Média amostral de variáveis independentes com a mesma variância σ²:
Var(X̄) = σ²/n. É daí que vem o erro padrão σ/√n.
Página: seções 2 e 5. -/
theorem variancia_media (hindep : iIndepFun X P)
    (hident : ∀ i, IdentDistrib (X i) (X 0) P P) (hX : MemLp (X 0) 2 P) (n : ℕ) (hn : 0 < n) :
    Var[fun ω ↦ (∑ k ∈ range n, X k ω) / n; P] = Var[X 0; P] / n := by
  have hmem : ∀ k ∈ range n, MemLp (X k) 2 P := fun k _ ↦ (hident k).memLp_iff.2 hX
  have hsum : Var[∑ k ∈ range n, X k; P] = ∑ k ∈ range n, Var[X k; P] :=
    IndepFun.variance_sum hmem fun i _ j _ hij ↦ hindep.indepFun hij
  have hsame : ∀ k ∈ range n, Var[X k; P] = Var[X 0; P] := fun k _ ↦ (hident k).variance_eq
  have hfun : (fun ω ↦ (∑ k ∈ range n, X k ω) / n) = fun ω ↦ (1 / (n : ℝ)) * (∑ k ∈ range n, X k) ω := by
    funext ω; simp [Finset.sum_apply, div_eq_inv_mul]
  rw [hfun, variance_const_mul, hsum, sum_congr rfl hsame, sum_const, card_range, nsmul_eq_mul]
  have hn' : (n : ℝ) ≠ 0 := by exact_mod_cast hn.ne'
  field_simp

end Provas.LimiteCentral
