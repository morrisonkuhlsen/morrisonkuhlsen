import Mathlib

/-!
# A hipótese de Riemann, contada nos primos

Post: /hipotese-de-riemann-zeros-primos-julia/ (e a versão em inglês).

Aqui ficam só as afirmações do post que valem sempre e que dá para enunciar sem a hipótese:
o produto de Euler, a soma de um zero com o seu conjugado, o peso da integral de Volchkov,
a paridade da distância entre primos ímpares e os restos na divisão por 3.
-/

namespace Provas.Riemann

open Complex

/-! ## A ponte de Euler -/

/-- Produto de Euler: para Re(s) > 1, ζ(s) = ∏ₚ 1/(1 − p⁻ˢ). Seção "A ponte de Euler".
(Resultado da Mathlib, reenunciado aqui.) -/
theorem produto_de_euler {s : ℂ} (hs : 1 < s.re) :
    ∏' p : Nat.Primes, (1 - (p : ℂ) ^ (-s))⁻¹ = riemannZeta s :=
  riemannZeta_eulerProduct_tprod hs

/-- Cada fator do produto é uma série geométrica: 1/(1 − q) = Σ qᵏ quando |q| < 1. -/
theorem fator_geometrico (q : ℂ) (hq : ‖q‖ < 1) : (1 - q)⁻¹ = ∑' k : ℕ, q ^ k :=
  (tsum_geometric_of_norm_lt_one hq).symm

/-! ## A escada refeita com ondas -/

/-- Um zero e o seu conjugado juntos: para x > 0, x^ρ/ρ + x^ρ̄/ρ̄ = 2·Re(x^ρ/ρ), um número
real. Seção "A escada refeita com ondas". -/
theorem par_conjugado (x : ℝ) (hx : 0 < x) (ρ : ℂ) :
    (x : ℂ) ^ ρ / ρ + (x : ℂ) ^ (starRingEnd ℂ ρ) / (starRingEnd ℂ ρ) =
      ((2 * ((x : ℂ) ^ ρ / ρ).re : ℝ) : ℂ) := by
  have harg : (x : ℂ).arg ≠ Real.pi := by
    rw [arg_ofReal_of_nonneg hx.le]; exact Real.pi_pos.ne
  have h : (x : ℂ) ^ (starRingEnd ℂ ρ) / (starRingEnd ℂ ρ) = starRingEnd ℂ ((x : ℂ) ^ ρ / ρ) := by
    rw [cpow_conj _ _ harg, conj_ofReal, map_div₀]
  rw [h, add_conj]

/-! ## A integral de Volchkov -/

/-- O peso (1 − 12t²)/(1 + 4t²)³ é a parte real de 1/(1 + 2it)³. Seção "A hipótese numa
integral só". -/
theorem peso_volchkov (t : ℝ) :
    (1 / ((1 : ℂ) + 2 * t * I) ^ 3).re = (1 - 12 * t ^ 2) / (1 + 4 * t ^ 2) ^ 3 := by
  have h : (1 : ℂ) + 2 * t * I ≠ 0 := by
    intro h0
    have := congrArg Complex.re h0
    simp at this
  have e : 1 / ((1 : ℂ) + 2 * t * I) ^ 3 =
      ((1 - 2 * t * I) ^ 3) / (((1 + 4 * t ^ 2) ^ 3 : ℝ) : ℂ) := by
    have h4 : (((1 + 4 * t ^ 2) ^ 3 : ℝ) : ℂ) =
        ((1 : ℂ) + 2 * t * I) ^ 3 * (1 - 2 * t * I) ^ 3 := by
      push_cast
      rw [← mul_pow]
      congr 1
      ring_nf
      rw [I_sq]
      ring
    have hb : (1 : ℂ) - 2 * t * I ≠ 0 := by
      intro h0
      have := congrArg Complex.re h0
      simp at this
    rw [h4]
    field_simp
  rw [e, div_ofReal_re]
  congr 1
  simp only [pow_succ, pow_zero, one_mul, mul_re, sub_re, one_re, mul_im, sub_im, one_im,
    ofReal_re, ofReal_im, I_re, I_im, re_ofNat, im_ofNat]
  ring

/-- O peso troca de sinal em t = 1/√12: lá, 1 − 12t² = 0. -/
theorem peso_zero : 1 - 12 * (1 / Real.sqrt 12) ^ 2 = 0 := by
  rw [div_pow, Real.sq_sqrt (by norm_num)]; norm_num

/-! ## Primos vizinhos -/

/-- Dois primos ímpares estão sempre a uma distância par. Seção "Um histograma que veio da
física" (legenda da Figura 4). -/
theorem distancia_par (p q : ℕ) (hp : p % 2 = 1) (hq : q % 2 = 1) (h : p ≤ q) :
    (q - p) % 2 = 0 := by
  omega

/-- Se p > 3 e p + 2 são primos, então p deixa resto 2 na divisão por 3. -/
theorem gemeos_resto (p : ℕ) (hp : p.Prime) (hp3 : 3 < p) (hq : (p + 2).Prime) : p % 3 = 2 := by
  have h0 : p % 3 ≠ 0 := by
    intro h
    have : 3 ∣ p := Nat.dvd_of_mod_eq_zero h
    rcases hp.eq_one_or_self_of_dvd 3 this with h1 | h1 <;> omega
  have h1 : p % 3 ≠ 1 := by
    intro h
    have : 3 ∣ p + 2 := by omega
    rcases hq.eq_one_or_self_of_dvd 3 this with h2 | h2 <;> omega
  omega

/-- Se p > 3 e p + 4 são primos, então p deixa resto 1 na divisão por 3. -/
theorem distancia_quatro_resto (p : ℕ) (hp : p.Prime) (hp3 : 3 < p) (hq : (p + 4).Prime) :
    p % 3 = 1 := by
  have h0 : p % 3 ≠ 0 := by
    intro h
    have : 3 ∣ p := Nat.dvd_of_mod_eq_zero h
    rcases hp.eq_one_or_self_of_dvd 3 this with h1 | h1 <;> omega
  have h2 : p % 3 ≠ 2 := by
    intro h
    have : 3 ∣ p + 4 := by omega
    rcases hq.eq_one_or_self_of_dvd 3 this with h3 | h3 <;> omega
  omega

/-- … e p + 6 deixa o mesmo resto que p, então nunca é barrado pelo 3. -/
theorem distancia_seis_resto (p : ℕ) : (p + 6) % 3 = p % 3 := by omega

/-! ## Moedas -/

/-- Em n lançamentos de uma moeda honesta, a variância do número de caras é n·(1/2)·(1/2) = n/4,
então o desvio padrão é √n/2. Seção "A ideia, antes de qualquer fórmula". -/
theorem desvio_moedas (n : ℝ) : Real.sqrt (n * (1 / 2) * (1 / 2)) = Real.sqrt n / 2 := by
  rw [show n * (1 / 2) * (1 / 2) = n / 4 by ring, Real.sqrt_div' _ (by norm_num : (0:ℝ) ≤ 4),
    show (4 : ℝ) = 2 ^ 2 by norm_num, Real.sqrt_sq (by norm_num)]

end Provas.Riemann
