# Provas

Provas formais, em Lean 4 com Mathlib, das identidades e propriedades que o
site afirma valerem sempre. As regras de quando e como provar estão no
`CLAUDE.md` da raiz (§1.2 e §1.3).

```bash
lake exe cache get   # só na primeira vez: baixa o Mathlib já compilado (~8 GB em .lake/)
lake build           # verifica todas as provas
```

Uma prova por assunto em `Provas/<Assunto>.lean`, importada em `Provas.lean`.
Cada teorema traz no comentário a página do site que faz a afirmação. Nada de
`sorry`, `admit` ou `axiom` novo.

| Arquivo | O que prova |
|---|---|
| `ProdutosNotaveis.lean` | (a+b)², (a−b)², (a+b)(a−b) |
| `Matrizes.lean` | inversa 2×2 (com ad − bc ≠ 0), determinante 2×2, AB ≠ BA |
| `Probabilidade.lean` | regra do complemento, regra da adição, atalho da variância (caso finito), contas exatas dos exemplos das fábricas e dos carrapatos |
| `TendenciaCentral.lean` | a média minimiza Σ(xᵢ − c)² (com a decomposição da soma dos quadrados), a mediana minimiza Σ\|xᵢ − c\|, e a tabela do exemplo {1, 2, 10} |
