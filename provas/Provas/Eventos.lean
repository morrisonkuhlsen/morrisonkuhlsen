import Mathlib

/-!
# Eventos e espaço amostral

Página: /pt/probabilidade/eventos-espaco-amostral (e /en/probability/sample-space-events).

Eventos de um espaço amostral finito são representados como `Finset`s de um tipo
com igualdade decidível; as leis de conjuntos valem para quaisquer conjuntos (`Set`).
-/

namespace Provas.Eventos

open Finset

variable {α : Type*} [DecidableEq α]

/-- Cardinalidade da união de dois eventos finitos:
card(A ∪ B) = card(A) + card(B) − card(A ∩ B). Página: seção 3.2, item 1.
(Escrita com soma dos dois lados para evitar a subtração de naturais.) -/
theorem card_uniao (A B : Finset α) :
    (A ∪ B).card + (A ∩ B).card = A.card + B.card :=
  card_union_add_card_inter A B

/-- A mesma fórmula, com subtração, em ℤ. -/
theorem card_uniao_sub (A B : Finset α) :
    ((A ∪ B).card : ℤ) = A.card + B.card - (A ∩ B).card := by
  have := card_union_add_card_inter A B
  omega

/-- Cardinalidade da união de três eventos finitos (inclusão-exclusão).
Página: seção 3.2, item 1. -/
theorem card_uniao_tres (A B C : Finset α) :
    ((A ∪ B ∪ C).card : ℤ) = A.card + B.card + C.card
      - (A ∩ B).card - (B ∩ C).card - (A ∩ C).card + (A ∩ B ∩ C).card := by
  have h1 := card_uniao_sub (A ∪ B) C
  have h2 := card_uniao_sub A B
  have h3 : (A ∪ B) ∩ C = (A ∩ C) ∪ (B ∩ C) := union_inter_distrib_right A B C
  have h4 := card_uniao_sub (A ∩ C) (B ∩ C)
  have h5 : (A ∩ C) ∩ (B ∩ C) = A ∩ B ∩ C := by ext x; simp
  rw [h3] at h1
  rw [h5] at h4
  rw [h1, h2, h4]
  ring

/-- Complemento: se A ⊆ Ω, card(Ω \ A) = card(Ω) − card(A). Página: seção 3.2, item 2. -/
theorem card_complemento (Ω A : Finset α) (h : A ⊆ Ω) :
    (Ω \ A).card = Ω.card - A.card :=
  card_sdiff_of_subset h

omit [DecidableEq α] in
/-- Se A ⊆ B, então card(A) ≤ card(B). Página: seção 3.2, item 3. -/
theorem card_mono (A B : Finset α) (h : A ⊆ B) : A.card ≤ B.card :=
  card_le_card h

/-- card(A ∩ B) ≤ min(card(A), card(B)). Página: seção 3.2, item 3. -/
theorem card_inter_le_min (A B : Finset α) : (A ∩ B).card ≤ min A.card B.card :=
  le_min (card_le_card inter_subset_left) (card_le_card inter_subset_right)

/-- card(A ∪ B) ≤ card(A) + card(B). Página: seção 3.2, item 3. -/
theorem card_uniao_le (A B : Finset α) : (A ∪ B).card ≤ A.card + B.card :=
  card_union_le A B

/-- Espaço equiprovável finito: P(A ∪ B) = [card(A) + card(B) − card(A ∩ B)] / card(Ω),
com P(E) = card(E)/card(Ω). Página: seção 3.4. -/
theorem prob_uniao_equiprovavel (Ω A B : Finset α) :
    ((A ∪ B).card : ℚ) / Ω.card = (A.card + B.card - (A ∩ B).card) / Ω.card := by
  have := card_union_add_card_inter A B
  congr 1
  have h : ((A ∪ B).card : ℚ) + (A ∩ B).card = A.card + B.card := by exact_mod_cast this
  linarith

/-! ## Leis de conjuntos (seção 4), para conjuntos quaisquer -/

variable {β : Type*} (A B C : Set β)

/-- Comutativa. -/
theorem comutativa : A ∪ B = B ∪ A ∧ A ∩ B = B ∩ A :=
  ⟨Set.union_comm A B, Set.inter_comm A B⟩

/-- Associativa. -/
theorem associativa : (A ∪ B) ∪ C = A ∪ (B ∪ C) ∧ (A ∩ B) ∩ C = A ∩ (B ∩ C) :=
  ⟨Set.union_assoc A B C, Set.inter_assoc A B C⟩

/-- Distributiva. -/
theorem distributiva :
    A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C) ∧ A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C) :=
  ⟨Set.union_inter_distrib_left A B C, Set.inter_union_distrib_left A B C⟩

/-- Leis de De Morgan (o complemento é tomado no espaço amostral, o tipo `β`). -/
theorem de_morgan : (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ ∧ (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ :=
  ⟨Set.compl_union A B, Set.compl_inter A B⟩

/-! ## Contas da página (dois dados, baralho) -/

/-- Dois dados: Ω tem 36 pares; A = {soma 7} tem 6; B = {primeiro dado > 4} tem 12;
A ∩ B tem 2; A ∪ B tem 16. Página: seção 3.4. -/
theorem dois_dados :
    let Ω := (Finset.Icc 1 6 ×ˢ Finset.Icc 1 6 : Finset (ℕ × ℕ))
    let A := Ω.filter (fun p => p.1 + p.2 = 7)
    let B := Ω.filter (fun p => 4 < p.1)
    Ω.card = 36 ∧ A.card = 6 ∧ B.card = 12 ∧ (A ∩ B).card = 2 ∧ (A ∪ B).card = 16 := by
  decide

end Provas.Eventos
