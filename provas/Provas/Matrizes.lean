import Mathlib

/-!
# Matrizes 2 × 2

Página: matematica-basica/matrizes.html.
-/

namespace Provas.Matrizes

open Matrix

/-- A inversa 2 × 2: se ad − bc ≠ 0, a matriz
(1/(ad − bc)) · [[d, −b], [−c, a]] desfaz A pelos dois lados.
A hipótese ad − bc ≠ 0 é a que a página chama de "quando existe". -/
theorem inversa_2x2 {K : Type*} [Field K] (a b c d : K) (h : a * d - b * c ≠ 0) :
    !![a, b; c, d] * ((a * d - b * c)⁻¹ • !![d, -b; -c, a]) = 1 ∧
    ((a * d - b * c)⁻¹ • !![d, -b; -c, a]) * !![a, b; c, d] = 1 := by
  -- O mesmo caminho da página: A vezes [[d, −b], [−c, a]] dá (ad − bc)·I,
  -- e o fator 1/(ad − bc) cancela o determinante.
  have hAB : !![a, b; c, d] * !![d, -b; -c, a] =
      (a * d - b * c) • (1 : Matrix (Fin 2) (Fin 2) K) := by
    ext i j
    fin_cases i <;> fin_cases j <;> simp [Matrix.mul_apply, Fin.sum_univ_two] <;> ring
  have hBA : !![d, -b; -c, a] * !![a, b; c, d] =
      (a * d - b * c) • (1 : Matrix (Fin 2) (Fin 2) K) := by
    ext i j
    fin_cases i <;> fin_cases j <;> simp [Matrix.mul_apply, Fin.sum_univ_two] <;> ring
  constructor
  · rw [Matrix.mul_smul, hAB, smul_smul, inv_mul_cancel₀ h, one_smul]
  · rw [Matrix.smul_mul, hBA, smul_smul, inv_mul_cancel₀ h, one_smul]

/-- O determinante 2 × 2 é ad − bc. -/
theorem det_2x2 {R : Type*} [CommRing R] (a b c d : R) :
    (!![a, b; c, d]).det = a * d - b * c := by
  simp [Matrix.det_fin_two]

/-- A ordem importa: existem matrizes 2 × 2 com AB ≠ BA. -/
theorem produto_nao_comuta :
    ∃ A B : Matrix (Fin 2) (Fin 2) ℤ, A * B ≠ B * A := by
  refine ⟨!![0, 1; 0, 0], !![0, 0; 1, 0], ?_⟩
  decide

end Provas.Matrizes
