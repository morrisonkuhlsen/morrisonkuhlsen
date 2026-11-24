import Mathlib

/-!
# Produtos notáveis

Identidades algébricas que o site afirma valerem para quaisquer números.
Valem em qualquer anel comutativo, o que inclui inteiros, racionais e reais.
-/

namespace Provas.ProdutosNotaveis

/-- Binômio ao quadrado: (a + b)² = a² + 2ab + b².
Página: /binomio-quadrado/ (e matematica-basica/produtos-notaveis.html). -/
theorem binomio_quadrado {R : Type*} [CommRing R] (a b : R) :
    (a + b) ^ 2 = a ^ 2 + 2 * a * b + b ^ 2 := by
  ring

/-- Quadrado da diferença: (a − b)² = a² − 2ab + b².
Página: matematica-basica/produtos-notaveis.html. -/
theorem quadrado_diferenca {R : Type*} [CommRing R] (a b : R) :
    (a - b) ^ 2 = a ^ 2 - 2 * a * b + b ^ 2 := by
  ring

/-- Produto da soma pela diferença: (a + b)(a − b) = a² − b².
Página: matematica-basica/produtos-notaveis.html. -/
theorem soma_vezes_diferenca {R : Type*} [CommRing R] (a b : R) :
    (a + b) * (a - b) = a ^ 2 - b ^ 2 := by
  ring

end Provas.ProdutosNotaveis
