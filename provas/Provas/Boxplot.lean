import Mathlib

/-!
# Boxplot

Post: /boxplot-o-que-e-cada-elemento-como-se-calcula-e-como-interpretar/ (e a versão em inglês).

Notação: a amostra ordenada é uma função `x : ℕ → ℝ`, com x 1 ≤ x 2 ≤ … ≤ x n (as estatísticas
de ordem). O quartil do tipo 7 na posição h = (n − 1)p + 1, com j = ⌊h⌋ e g = h − j, é
x j + g · (x (j+1) − x j).
-/

namespace Provas.Boxplot

/-- Quantil do tipo 7 a partir da parte inteira `j` e da parte fracionária `g` da posição. -/
noncomputable def tipo7 (x : ℕ → ℝ) (j : ℕ) (g : ℝ) : ℝ := x j + g * (x (j + 1) - x j)

/-- O quantil do tipo 7 fica sempre entre as duas observações vizinhas que ele interpola
(seção 4: "interpola-se linearmente entre os dois valores vizinhos"). -/
theorem tipo7_entre (x : ℕ → ℝ) (j : ℕ) (g : ℝ) (hg0 : 0 ≤ g) (hg1 : g ≤ 1)
    (hx : x j ≤ x (j + 1)) : x j ≤ tipo7 x j g ∧ tipo7 x j g ≤ x (j + 1) := by
  unfold tipo7
  constructor <;> nlinarith

/-- O quartil só depende das duas observações vizinhas: trocar o valor de qualquer outra
estatística de ordem (por exemplo, tornar o máximo ainda maior) não o altera
(seção 3.2: a mediana "não se move quando um valor extremo fica ainda mais extremo"). -/
theorem tipo7_ignora_outros (x : ℕ → ℝ) (j k : ℕ) (g v : ℝ) (hk : k ≠ j) (hk' : k ≠ j + 1) :
    tipo7 (Function.update x k v) j g = tipo7 x j g := by
  unfold tipo7
  rw [Function.update_of_ne (Ne.symm hk), Function.update_of_ne (Ne.symm hk')]

/-- Aumentar o maior valor mantém a amostra ordenada: o novo valor continua sendo
a estatística de ordem n. -/
theorem aumentar_maximo_mantem_ordem (x : ℕ → ℝ) (n : ℕ) (v : ℝ)
    (hx : MonotoneOn x (Set.Icc 1 n)) (hv : x n ≤ v) :
    MonotoneOn (Function.update x n v) (Set.Icc 1 n) := by
  intro a ha b hb hab
  by_cases hbn : b = n
  · subst hbn
    by_cases han : a = b
    · subst han; simp
    · rw [Function.update_of_ne han, Function.update_self]
      exact (hx ha hb hab).trans hv
  · have han : a ≠ n := by
      intro h; subst h; exact hbn (le_antisymm hb.2 hab)
    rw [Function.update_of_ne han, Function.update_of_ne hbn]
    exact hx ha hb hab

/-- Profundidade dos hinges de Tukey: (⌊(n + 1)/2⌋ + 1)/2. -/
noncomputable def profHinge (n : ℕ) : ℚ := (((n + 1) / 2 : ℕ) + 1 : ℚ) / 2

/-- Posição do quartil inferior no tipo 7: (n − 1)/4 + 1. -/
noncomputable def posTipo7 (n : ℕ) : ℚ := ((n : ℚ) - 1) / 4 + 1

/-- Hinge de Tukey e quartil do tipo 7 ficam a no máximo 1/4 de posição um do outro,
para qualquer tamanho de amostra (seção 4 e comentário do código). -/
theorem hinge_perto_tipo7 (n : ℕ) : |profHinge n - posTipo7 n| ≤ 1 / 4 := by
  unfold profHinge posTipo7
  have h := Nat.div_add_mod (n + 1) 2
  have hm := Nat.mod_lt (n + 1) (by norm_num : 2 > 0)
  set m := (n + 1) / 2
  set r := (n + 1) % 2
  have hn : (n : ℚ) = 2 * m + r - 1 := by
    have : ((2 * m + r : ℕ) : ℚ) = ((n + 1 : ℕ) : ℚ) := by rw [h]
    push_cast at this; linarith
  have hr : (r : ℚ) = 0 ∨ (r : ℚ) = 1 := by
    interval_cases r <;> simp
  rw [abs_le]
  rcases hr with hr | hr <;> rw [hn, hr] <;> constructor <;> linarith

/-- Para n ímpar, hinge e quartil do tipo 7 ocupam a mesma posição: os dois métodos dão
o mesmo valor. -/
theorem hinge_igual_tipo7_impar (n : ℕ) (hn : n % 2 = 1) : profHinge n = posTipo7 n := by
  unfold profHinge posTipo7
  have h := Nat.div_add_mod (n + 1) 2
  have hr : (n + 1) % 2 = 0 := by omega
  rw [hr] at h
  have : ((2 * ((n + 1) / 2) : ℕ) : ℚ) = ((n + 1 : ℕ) : ℚ) := by rw [← h]; simp
  push_cast at this
  linarith

/-! ## Cercas sob normalidade

Se Q1 = μ − zσ e Q3 = μ + zσ (z = 0,6745 na normal), as cercas internas ficam a 4zσ da
média (≈ 2,698σ) e as externas a 7zσ (≈ 4,721σ) — seção 5.3. -/

theorem cerca_interna_superior (μ σ z : ℝ) :
    let q1 := μ - z * σ; let q3 := μ + z * σ
    q3 + 3 / 2 * (q3 - q1) = μ + 4 * z * σ := by
  intro q1 q3; simp only [q1, q3]; ring

theorem cerca_interna_inferior (μ σ z : ℝ) :
    let q1 := μ - z * σ; let q3 := μ + z * σ
    q1 - 3 / 2 * (q3 - q1) = μ - 4 * z * σ := by
  intro q1 q3; simp only [q1, q3]; ring

theorem cerca_externa (μ σ z : ℝ) :
    let q1 := μ - z * σ; let q3 := μ + z * σ
    q3 + 3 * (q3 - q1) = μ + 7 * z * σ ∧ q1 - 3 * (q3 - q1) = μ - 7 * z * σ := by
  intro q1 q3; simp only [q1, q3]; constructor <;> ring

/-- Com z entre 0,6744 e 0,6745, a cerca interna fica entre 2,6976σ e 2,698σ. -/
theorem cerca_interna_numerica (z : ℝ) (h1 : 0.6744 ≤ z) (h2 : z ≤ 0.6745) :
    2.6976 ≤ 4 * z ∧ 4 * z ≤ 2.698 := by
  constructor <;> linarith

/-- As duas metades da caixa somam o IQR: (Q2 − Q1) + (Q3 − Q2) = Q3 − Q1 (seção 3.4). -/
theorem metades_somam_iqr (q1 q2 q3 : ℝ) : (q2 - q1) + (q3 - q2) = q3 - q1 := by ring

end Provas.Boxplot
