import Mathlib

/-!
# Probabilidade

Páginas: /pt/probabilidade/ e os tópicos da área (e as versões em /en/probability/).

A regra da multiplicação, a independência (P(A ∩ B) = P(A)P(B) ⇔ P(A | B) = P(A) quando
P(B) > 0) e o Teorema de Bayes da página principal estão em `Provas/Condicional.lean`.
-/

namespace Provas.Probabilidade

open MeasureTheory ProbabilityTheory

variable {Ω : Type*} [MeasurableSpace Ω] {P : Measure Ω} [IsProbabilityMeasure P]

/-- Regra do complemento: P(Aᶜ) = 1 − P(A), para A mensurável.
Página: /pt/probabilidade/ ("Evento complementar"). -/
theorem regra_complemento {A : Set Ω} (hA : MeasurableSet A) :
    P.real Aᶜ = 1 - P.real A := by
  rw [probReal_compl_eq_one_sub hA]

/-- Regra da adição: P(A ∪ B) = P(A) + P(B) − P(A ∩ B), para A e B mensuráveis.
Página: /pt/probabilidade/ ("Regra da adição"). A prova só usa que B é
mensurável; a hipótese sobre A fica no enunciado porque A é um evento. -/
theorem regra_adicao {A B : Set Ω} (_hA : MeasurableSet A) (hB : MeasurableSet B) :
    P.real (A ∪ B) = P.real A + P.real B - P.real (A ∩ B) := by
  have h := measureReal_union_add_inter (μ := P) (s := A) hB
  linarith

/-- Atalho da variância para uma distribuição finita: se as probabilidades pᵢ
somam 1 e μ = Σ pᵢ xᵢ, então Σ pᵢ (xᵢ − μ)² = Σ pᵢ xᵢ² − μ².
É o Var(X) = E[X²] − (E[X])² da página /pt/probabilidade/ ("Variância de uma
variável aleatória"), no caso discreto finito. -/
theorem atalho_variancia {ι : Type*} (s : Finset ι) (p x : ι → ℝ)
    (hp : ∑ i ∈ s, p i = 1) :
    ∑ i ∈ s, p i * (x i - ∑ j ∈ s, p j * x j) ^ 2 =
      ∑ i ∈ s, p i * x i ^ 2 - (∑ j ∈ s, p j * x j) ^ 2 := by
  set μ := ∑ j ∈ s, p j * x j with hμ
  have expand : ∀ i ∈ s, p i * (x i - μ) ^ 2 =
      p i * x i ^ 2 - 2 * μ * (p i * x i) + μ ^ 2 * p i := by
    intro i _; ring
  rw [Finset.sum_congr rfl expand, Finset.sum_add_distrib, Finset.sum_sub_distrib,
    ← Finset.mul_sum, ← Finset.mul_sum, hp, ← hμ]
  ring

/-- Exemplo das três fábricas (/pt/probabilidade/probabilidade-condicional):
P(B) = 0,02·0,5 + 0,03·0,3 + 0,04·0,2 = 0,027 e P(A₂ | B) = 0,03·0,3 / 0,027 = 1/3.
(A versão antiga da página dizia 0,029 e 31,03%.) -/
theorem exemplo_fabricas :
    (0.02 : ℚ) * 0.5 + 0.03 * 0.3 + 0.04 * 0.2 = 0.027 ∧
    (0.03 : ℚ) * 0.3 / 0.027 = 1 / 3 := by
  norm_num

/-- Exemplo dos carrapatos (/pt/probabilidade/probabilidade-condicional):
x = 0,10·(0,26 − x) tem a solução única x = 0,026/1,1 = 13/550 ≈ 0,02364,
e P(H | L) = x / 0,16 = 13/88 ≈ 0,1477. -/
theorem exemplo_carrapatos (x : ℚ) (h : x = 0.10 * (0.26 - x)) :
    x = 13 / 550 ∧ x / 0.16 = 13 / 88 := by
  have hx : x = 13 / 550 := by linarith
  subst hx
  norm_num

/-- Toda probabilidade está entre 0 e 1. Página: /pt/probabilidade/ ("Valores possíveis"). -/
theorem entre_zero_e_um (A : Set Ω) : 0 ≤ P.real A ∧ P.real A ≤ 1 :=
  ⟨measureReal_nonneg, measureReal_le_one⟩

/-- Probabilidade 0 não quer dizer impossível: no sorteio uniforme em [0, 1], o evento
{1/2} não é vazio, mas tem probabilidade 0. Página: /pt/probabilidade/ (nota "Cuidado com o
caso contínuo"). -/
theorem zero_nao_e_impossivel :
    ({1/2} : Set ℝ).Nonempty ∧ (volume.restrict (Set.Icc (0 : ℝ) 1)) {1/2} = 0 :=
  ⟨Set.singleton_nonempty _, le_antisymm
    ((Measure.restrict_apply_le _ _).trans_eq Real.volume_singleton) (by simp)⟩

/-- Contas da página principal: dado (par: 3/6 = 1/2; maior que 4: 2/6 = 1/3), duas moedas
(cara e cara: 1/4), três moedas (exatamente 2 caras: 3·(1/2)²·(1/2) = 3/8) e o número X de
caras em duas moedas (E(X) = 1, E(X²) = 3/2, Var(X) = 1/2 pelas duas fórmulas). -/
theorem contas :
    (3 : ℚ) / 6 = 1/2 ∧ (2 : ℚ) / 6 = 1/3 ∧ (1/2 : ℚ) * (1/2) = 1/4 ∧
    (Nat.choose 3 2 : ℚ) * (1/2) ^ 2 * (1/2) = 3/8 ∧
    (0 : ℚ) * (1/4) + 1 * (1/2) + 2 * (1/4) = 1 ∧
    (0 : ℚ) ^ 2 * (1/4) + 1 ^ 2 * (1/2) + 2 ^ 2 * (1/4) = 3/2 ∧
    (3/2 : ℚ) - 1 ^ 2 = 1/2 ∧
    (0 - 1 : ℚ) ^ 2 * (1/4) + (1 - 1) ^ 2 * (1/2) + (2 - 1) ^ 2 * (1/4) = 1/2 := by
  norm_num [Nat.choose]

end Provas.Probabilidade
