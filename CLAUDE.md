# CLAUDE.md — morrisonkuhlsen.com

Site de estatística, probabilidade e matemática de base, em português (principal)
e inglês. Jekyll puro; a estrutura técnica está no `README.md`. Este arquivo
trata do **conteúdo**: como escrever, calcular, programar, citar, traduzir,
revisar e publicar.

O leitor é **leigo ou iniciante**. Ele não sabe o que pulamos, não conserta uma
conta errada sozinho e confia no que lê. Um erro numa página de ensino ensina o
erro. Por isso a regra que vale acima de todas as outras:

> **Nada é publicado sem ter sido verificado.** Toda conta foi refeita, todo
> código foi rodado, toda referência existe e diz o que citamos, todo número
> do texto bate com o da tabela, do gráfico, do código e do resumo.
> Na dúvida, não publique: pergunte ou marque como pendente.

---

## 1. Cálculos

### 1.1 Toda conta é refeita de forma independente

- Recalcule **cada** número que aparece na página com código (Julia, Python ou
  Node, no scratchpad), não de cabeça. Vale para resultados finais **e** para
  os intermediários: somas parciais, produtos, médias, desvios, quadrados.
- Refaça por um segundo caminho quando der: fórmula fechada × simulação,
  fração exata × decimal, função de biblioteca × conta manual, força bruta ×
  fórmula. Se os dois caminhos discordarem, o texto não sai.
- Confira as contas **já existentes** ao revisar ou traduzir uma página. Erros
  reais já encontrados assim: soma 0,01 + 0,009 + 0,008 escrita como 0,029
  (é 0,027), e uma probabilidade derivada dela (31,03% em vez de 33,33%).
- Quando um erro aparece numa versão, corrija **nas duas** (PT e EN) e diga o
  que foi corrigido na mensagem de commit.

### 1.2 Os três níveis de verificação

| Nível | Quando | Como |
|---|---|---|
| **1. Recálculo** | **Sempre**, em toda conta da página | Refazer em Julia (ou Python/Node). Frações em aritmética exata (`Rational` do Julia: `1//3`), decimais com todas as casas. |
| **2. Teste da fórmula** | Fórmula ou algoritmo novo (calculadora, função em JS, exemplo com regra geral) | Comparar contra força bruta (enumerar todos os casos) ou simulação com muitas repetições, em vários valores, inclusive bordas (0, 1, n pequeno, valores negativos, denominador perto de zero). |
| **3. Prova formal em Lean** | Demonstração, identidade ou propriedade que a página **afirma valer sempre** | Enunciado e prova em Lean 4 + Mathlib, em `provas/` (ver §1.3). |

O nível 3 entra quando a página diz "para todo…", "sempre vale…", "prova",
"demonstração" ou "identidade": produtos notáveis, propriedades de potências e
logaritmos, fórmula da inversa 2×2, identidades combinatórias (Pascal,
binômio), Var(X) = E[X²] − E[X]², linearidade da esperança, regra do
complemento, regra da adição, Bayes, propriedade de falta de memória da
exponencial, e assim por diante. O que ele **não** cobre, e continua nos níveis
1 e 2: código em Julia/JS, simulações, gráficos, valores numéricos de
distribuições (quantis, p-valores, tabelas) e, claro, referências (§5).

### 1.3 O projeto Lean (`provas/`)

- Lean 4 com Mathlib, em `provas/`; o Jekyll ignora a pasta (`exclude` no
  `_config.yml`) e o git ignora `provas/.lake/` (dependências e compilação).
- Em máquina nova: `cd provas && lake exe cache get` baixa o Mathlib já
  compilado; depois `lake build` verifica todas as provas.
- Uma prova por assunto, em `provas/Provas/<Assunto>.lean` (ex.:
  `ProdutosNotaveis.lean`, `Probabilidade.lean`), importada em
  `provas/Provas.lean`. Cada teorema leva um comentário `/-- … -/` com a
  página do site que o afirma (URL relativa) e o enunciado em português.
- O enunciado em Lean é **exatamente** o que a página afirma, com as mesmas
  hipóteses. Se a prova exigir uma hipótese que a página não diz (denominador ≠ 0,
  n ≥ 1, eventos independentes, P(B) > 0), **a página está incompleta**:
  acrescente a hipótese no texto, nas duas línguas.
- Proibido `sorry`, `admit` ou `axiom` novo: `lake build` precisa passar sem
  avisos de `sorry`. Prova que não sai fica fora do repositório e a afirmação
  da página fica marcada como pendente, com aviso ao usuário.
- Prefira as táticas que deixam a prova legível e estável: `ring`, `field_simp`,
  `norm_num`, `linarith`, `nlinarith`, `simp`, `omega`, `decide`, e lemas do
  Mathlib citados pelo nome.
- Ao terminar: `cd provas && lake build` sem erros nem `sorry`, e o resultado
  citado na resposta ao usuário.

### 1.4 Arredondamento

- Faça a conta com todos os algarismos e **arredonde só o resultado final**.
  Valores intermediários exibidos podem ser arredondados, mas o passo seguinte
  usa o valor completo — e o texto diz isso quando a diferença aparece.
- Mantenha o mesmo número de casas para a mesma grandeza na página inteira.
- Probabilidades: diga a forma (0,1477 ou 14,77%) e não misture as duas na
  mesma frase sem necessidade.
- Se o arredondamento muda a conclusão (ex.: o p-valor cruza 0,05), mostre o
  valor com mais casas.

### 1.5 Resolução "à mão": completa, sem pular nada

O formato de toda resolução passo a passo:

1. **Dados**: liste cada valor com nome, símbolo e unidade, e diga de onde veio
   ("do enunciado", "calculado no passo 2").
2. **Fórmula** escrita por extenso, com cada símbolo explicado na primeira vez
   que aparece.
3. **Substituição**: a mesma fórmula com os números no lugar dos símbolos,
   antes de qualquer conta.
4. **Conta**, uma operação por linha: potências, depois produtos, depois somas.
   Frações mostram numerador e denominador separados antes de dividir. Somas de
   muitos termos mostram cada termo (de preferência numa tabela) e o total.
5. **Resultado** com unidade e o arredondamento declarado.
6. **Interpretação** em português corrente (ver §2).

Não presumir, não resumir, não pular o "óbvio":
- Nada de "fazendo as contas, obtemos…": as contas aparecem.
- Nada de "é fácil ver que…", "trivialmente", "analogamente" sem mostrar.
- Sinais, parênteses, ordem das operações e propriedades usadas são ditos
  ("pela regra do complemento", "como os eventos são independentes").
- Se um passo depende de uma condição (independência, n grande, variância
  conhecida), a condição é dita **antes** de usar o passo, e conferida.
- Tabela estatística ou função de software usada: diga qual, com qual
  argumento, e mostre o valor lido (`P(Z < −1,5) = 0,0668`, da tabela Z).

### 1.6 Coerência numérica da página

Antes de publicar, os mesmos números precisam bater em todos os lugares:
texto, fórmulas, tabelas, legendas, gráficos, saída do código, caixas de
resumo, `description` do front matter e versão na outra língua.

---

## 2. Resultados e interpretação

- Todo resultado ganha uma frase de interpretação: **o que o número diz sobre a
  situação do enunciado**, na unidade do problema ("em média, cada nota se
  afasta 1,14 ponto da média").
- Diga também **o que o número não diz** quando o erro comum é previsível:
  - intervalo de confiança: 95% é sobre o **método**, não "95% de chance de μ
    estar neste intervalo";
  - p-valor: não é a probabilidade de H₀ ser verdadeira, nem tamanho de efeito;
    "não rejeitar H₀" não prova H₀;
  - correlação não é causalidade; r mede só relação **linear**;
  - "1 em N" é média de longo prazo, não garantia em N tentativas;
  - independentes ≠ mutuamente exclusivos;
  - significância estatística ≠ importância prática.
- Contexto e limites: hipóteses do modelo, tamanho da amostra, o que mudaria o
  resultado, quando a técnica não deveria ser usada.
- Números pequenos ou enormes ganham uma imagem concreta ("1 em 151.200").

---

## 3. Rigor estatístico e matemático

- **Amostra × população**: notação distinta (x̄, s, s² × μ, σ, σ²) e divisor
  correto (n − 1 × N). Diga qual se está calculando.
- **Parametrizações**: declare sempre. Armadilhas conhecidas:
  - Julia `Exponential(θ)` usa a **escala** θ = 1/λ (`Exponential(2)` tem
    média 2, λ = 1/2); R `rexp(n, rate)` usa a taxa; SciPy usa `scale`.
  - `Normal(μ, σ)` recebe o **desvio padrão**; a notação N(μ, σ²) usa a variância.
  - Geométrica: "tentativas até o 1º sucesso" (k ≥ 1) × "fracassos antes" (k ≥ 0).
  - Binomial negativa: há várias definições; diga qual.
  - Quartis: há vários métodos (Tukey, tipo 7 do R…); diga qual, e que outro
    software pode dar outro valor.
- **Condições de uso** declaradas e conferidas antes de aplicar: independência,
  normalidade, variâncias iguais, n·p ≥ 5 e n·(1−p) ≥ 5 para aproximação normal,
  correção de continuidade (dizer se foi usada).
- "n ≥ 30" é **regra de bolso**, não teorema; diga isso quando aparecer.
- Notação consistente na página inteira; símbolos definidos antes do uso.
- Fórmulas conferidas contra uma referência (§5), não de memória.
- Nunca chamar a fórmula da equação do 2º grau de "Bhaskara": é **fórmula
  quadrática** (ou fórmula resolutiva), em todo o site.

---

## 4. Código

- **Roda como está.** Cada bloco é autossuficiente: todos os `using`/`import`,
  funções e dados que usa estão no próprio bloco (nada de depender de uma
  função definida em outro bloco). Simulações fixam a semente
  (`Random.seed!(123)`).
- **Foi executado.** Rode todo código novo ou alterado antes de publicar. Julia
  está instalado, com Distributions, StatsBase, DataFrames, Plots, StatsPlots,
  GLM e HypothesisTests. A "Saída esperada" é **copiada da execução real**,
  nunca escrita à mão nem "aproximada".
- Erros que já passaram e não podem voltar: variável com erro de digitação
  (`vendes` em vez de `vendas`), `mean` sem `using Statistics`, função usada
  num bloco e definida em outro, comentário dizendo que aplica correção de
  continuidade sem aplicar.
- **Boas práticas**: nomes de variáveis claros e no idioma da página;
  comentários explicando o porquê; nada de código morto; funções da biblioteca
  padrão em vez de reimplementações (a não ser que a conta manual seja o ponto
  didático — então mostre as duas e compare); sem laço iterativo para o que tem
  solução fechada, salvo se o objetivo for ilustrar.
- O resultado do código **bate com a conta à mão** da mesma página. Se divergir
  (semente, arredondamento, outro método de quartil), explique a diferença.
- Gráficos gerados por código: título, eixos e legenda no idioma da página.
  Se a imagem publicada foi gerada por outro código ou outra língua, diga isso
  ou gere de novo.
- Blocos usam o markup do site (`code-container`, `code-header`, botão
  "Copiar"/"Copy", `code-output` para saídas).

### 4.1 Três linguagens: Julia, R e Python

- **Todo bloco de código tem três versões equivalentes: Julia, R e Python**,
  agrupadas num seletor de linguagem (`code-tabs`, ver abaixo). O leitor
  escolhe a linguagem no cabeçalho do bloco; a escolha vale para a página
  inteira e fica salva para as próximas visitas.
- As três versões fazem **a mesma conta, com os mesmos dados e na mesma
  ordem**, e cada uma tem a **sua** saída, copiada da execução real naquela
  linguagem. As saídas precisam bater entre si (a menos da formatação) e com a
  conta à mão; se uma biblioteca usar outro método ou outra parametrização
  (quartil tipo 7 do R × outro padrão, `ddof` do NumPy, escala × taxa na
  exponencial, ordem dos parâmetros de uma distribuição), o código chama a
  função de modo a dar o mesmo resultado, ou o texto explica a diferença.
- Cada versão é idiomática na sua linguagem (vetorização no R e no NumPy,
  `data.frame`/`pandas` onde couber) e usa bibliotecas estabelecidas:
  - **R**: base R e `stats` primeiro; `ggplot2` para gráficos quando ajudar.
  - **Python**: `numpy`, `pandas`, `scipy.stats`, `statsmodels`, `matplotlib`.
  - Simulações fixam a semente em cada linguagem (`set.seed(123)`,
    `np.random.default_rng(123)`); os números sorteados diferem entre
    linguagens, e o texto diz isso quando citar um resultado simulado.
- Gráficos: a figura publicada pode vir de uma das três; as outras versões
  geram um gráfico equivalente (mesmo conteúdo, título, eixos e legenda no
  idioma da página).
- **Todas as três são executadas antes de publicar.** Julia está em
  `~/.julia`; R pelo `Rscript` do sistema; Python no ambiente virtual
  `~/.venvs/morrisonkuhlsen` (rodar com `~/.venvs/morrisonkuhlsen/bin/python`;
  tem numpy, pandas, scipy, statsmodels e matplotlib; o Python do sistema não
  tem numpy).
- Markup: um `<div class="code-tabs">` com um `<div class="code-tab"
  data-lang="julia|r|python">` por linguagem, cada um com o seu
  `code-container` e o seu `code-output`. O script `assets/js/code-tabs.js`
  monta o seletor; sem JavaScript, as três versões aparecem uma embaixo da
  outra.
- Páginas antigas ganham as versões em R e Python quando forem revisadas.

---

## 5. Referências bibliográficas e citações

Esta é a regra com tolerância zero. Uma referência falsa ou uma frase posta na
boca de quem não a disse destrói a credibilidade do site inteiro, e o leitor
iniciante não tem como desconfiar.

### 5.1 Proibido, sem exceção

- **Inventar** autor, coautor, título, ano, edição, editora, revista, volume,
  número, páginas, DOI, ISBN ou URL. Nem "completar" um dado que falta com um
  valor plausível.
- **Atribuir a alguém uma frase que essa pessoa não disse ou escreveu**, ou
  pôr entre aspas uma paráfrase como se fosse citação literal.
- **Traduzir uma citação e apresentá-la como se fosse o original.** Citação
  traduzida é marcada ("em tradução livre") e o original fica acessível.
- Citar uma obra para sustentar algo que **ela não diz**, ou que não foi
  conferido nela.
- Citar uma obra que **não foi consultada**, só porque "costuma aparecer" em
  bibliografias do assunto.
- Atribuir uma descoberta, um termo, um símbolo ou uma data sem fonte
  (ex.: "Fulano criou o conceito em 18xx").
- Juntar duas fontes numa referência, trocar autores entre obras ou misturar
  edições (ano de uma, editora de outra).
- Gerar referência ou citação "de memória". Memória de modelo não é fonte.

### 5.2 Obrigatório

- **Só obras reais e conferidas.** Antes de citar, confirme a existência e os
  dados (catálogo da editora, DOI, catálogo de biblioteca, Google Books, página
  oficial). Se não for possível confirmar, **não cite** — e diga ao usuário
  que a referência ficou de fora e por quê.
- Formato: Sobrenome, Iniciais. (Ano). *Título*. Edição. Editora. Para artigo:
  Sobrenome, Iniciais. (Ano). Título do artigo. *Revista*, volume(número),
  páginas. DOI quando houver.
- A obra citada **sustenta exatamente o que o texto afirma**. Para fato
  específico (data, primazia, fórmula, frase), cite a obra que traz esse fato,
  de preferência com página ou seção.
- **Citações literais** (entre aspas) só quando a frase foi conferida na fonte
  original ou numa fonte secundária confiável que a reproduz com referência.
  Indique autor, obra e, quando possível, página. Sem conferência: parafraseie
  **sem aspas** e sem atribuir palavras exatas ("Tukey defendia que a análise
  exploratória vem antes da confirmatória").
- **Frases célebres** têm atribuição falsa com frequência ("a Estatística é a
  gramática da ciência", "mentiras, malditas mentiras e estatísticas"…).
  Confira a origem em fonte que discuta a atribuição; se for incerta, diga
  "frase atribuída a…" ou retire.
- **Fatos históricos** (quem criou, quando, onde, com que nome) conferidos em
  fonte de história da estatística (ex.: Stigler, *The History of
  Statistics*; Hald, *A History of Mathematical Statistics from 1750 to 1930*).
  Na dúvida, suavize ("costuma ser atribuído a…") ou corte.
- Ao revisar uma página, **toda** referência e citação existente passa por
  esta verificação. O que não se confirma é corrigido ou removido, e a mudança
  vai registrada no commit.
- Quando a verificação não puder ser feita na sessão (sem acesso à fonte),
  **não publique a referência ou a citação**: deixe anotada como pendente e
  avise o usuário.
- Na versão em inglês: use o título e a edição em inglês quando a obra os tem
  (Triola, *Elementary Statistics*; Montgomery & Runger, *Applied Statistics and
  Probability for Engineers*; Devore, *Probability and Statistics for
  Engineering and the Sciences*); obra só em português ganha "(in Portuguese)".
- Links externos: só para fontes estáveis (editora, DOI, documentação oficial).

---

## 6. Texto

- Português do Brasil correto, com todos os acentos. Frases curtas e diretas.
  Explique antes de formalizar: intuição → exemplo → fórmula → caso geral.
- Termo técnico é definido na primeira vez que aparece; depois, o mesmo termo
  sempre (não alternar "desvio padrão" e "desvio-padrão" na mesma página).
- Exemplos com números simples o bastante para conferir à mão, e realistas.
- Números: em PT, vírgula decimal e ponto de milhar (0,375; 151.200); em LaTeX
  use `0{,}375` para a vírgula não ganhar espaço. Em EN, ponto decimal e
  vírgula de milhar (0.375; 151,200).
- MathJax: `$...$` inline e `$$...$$` em bloco. **Dentro de um bloco HTML**
  (`<div>`), `$$...$$` vira fórmula centrada em linha própria; para fórmula
  dentro da frase, use `$...$`.
- **Notação que conflita com a vírgula decimal** (em PT): pares, coordenadas e
  listas de decimais usam ponto e vírgula — (1,5; 2), {0,2; 0,5; 0,3}. Em EN,
  vírgula normal — (1.5, 2).
- **Intervalos**: [a, b] fechado, (a, b) aberto, [a, b) semiaberto, nas duas
  línguas (não usar ]a, b[). Em PT, com decimais: [1,5; 2,5].
- **Unidades** do SI, com espaço entre número e unidade (10 mm, 25 °C, 3 h);
  exceção: % e ° de ângulo colados (50%, 90°). Moeda: R$ 7.316,00 em PT;
  em EN, R$ 7,316.00 (a moeda continua sendo o real).
- **Grafias fixas**: "desvio padrão" (sem hífen), "p-valor", "teste t de
  Student", "qui-quadrado", "fórmula quadrática" (nunca "Bhaskara"). A lista
  completa PT ↔ EN está no §14.
- Caixas (`border-left`), cards e tabelas existentes seguem o padrão visual da
  página; não inventar um estilo novo numa página só.
- Numeração de seções, figuras e tabelas sequencial e sem repetição; legenda
  conferida contra a imagem (já houve legendas trocadas).
- Imagens: `alt` descritivo no idioma da página; legenda que diga o que olhar.

---

## 7. Tradução (PT → EN)

- Versão em inglês com **o mesmo `ref`** da página em português (é o que liga
  as duas no seletor PT/EN e no `hreflang`), `lang: en`, `permalink` em
  `/en/...` com slug em inglês, e o mesmo `parent`/`order` para entrar no menu.
- Traduz tudo: front matter (`title`, `description`), corpo, `alt`, legendas,
  tabelas, comentários e variáveis do código, saídas, rótulos dos gráficos no
  código, botão "Copiar" → "Copy".
- Notação: cara/coroa → H/T (heads/tails); números no padrão inglês (§6).
- Links internos apontam para a versão em inglês quando ela existe; senão,
  para a portuguesa com "(in Portuguese)".
- Traduzir é também **revisar** (§1–§5): erro achado vira correção nas duas
  versões, registrada no commit.
- Cada página traduzida fecha a sua issue de tradução no commit
  (`Closes #N`); a issue geral é a #116.

---

## 8. Tipos de conteúdo

- **Posts** (`_posts/`): front matter com `title`, `description`, `lang`,
  `ref`, `author`, `tags`, `mathjax: true` se houver fórmula. Capa AVIF exige o
  JPG social: `vips thumbnail assets/images/NOME.avif
  "assets/images/social/NOME.jpg[Q=82,strip]" 1200 --height 630 --crop centre`.
- **Páginas de área** (`pt/<area>.md` e `pt/<area>/*.md`): `order`, `parent`,
  `permalink` explícito.
- **Páginas avulsas** (`formulas/`, `matematica-basica/`, `calculo/`): HTML com
  cabeçalho próprio e JS de cálculo. A lógica nova é testada em Node contra
  força bruta antes do navegador. Página nova entra em `_data/standalone.yml`
  (busca), no índice da seção e na paginação dos vizinhos.
  As regras de cálculo dessas páginas estão no §13.

---

## 9. Fluxo de trabalho

1. Leia a página inteira antes de mexer.
2. Revise contra este arquivo (§1–§7 e §11–§17); verifique contas e código executando
   e, quando couber, prove em Lean (§1.2–§1.3).
3. `bundle exec jekyll build` sem erros; confira a página renderizada
   (captura de tela no Chromium headless do Playwright, em
   `~/.cache/ms-playwright/`), inclusive o tema escuro e o celular quando a
   mudança for visual.
4. Commit e push **só quando o usuário pedir**. Direto no `master`, mensagem em
   português dizendo o que mudou e o que foi corrigido. Nunca incluir
   `assets/images/image-post.png`.
5. Indexação no Search Console: ver a memória sobre o Search Console — cota de
   11 pedidos numa janela de 24 h; as páginas principais primeiro.

---

## 10. Honestidade sobre o que não foi verificado

- Diga sempre, na resposta ao usuário, **o que não foi verificado** e por quê:
  conta não refeita, código não rodado, citação não encontrada na fonte,
  imagem não vista, tema escuro não conferido, página não aberta no
  navegador.
- Nunca apresentar como verificado o que foi só lido ou suposto. "Conferi"
  quer dizer: refiz, rodei, abri ou achei na fonte.
- Na dúvida sobre um fato, uma conta ou uma atribuição, **não publique**:
  pergunte, deixe pendente ou suavize o texto até o que se sabe com certeza.
- Quando um erro meu for descoberto depois, diga qual foi, corrija nas duas
  línguas e registre no commit.

---

## 11. Dados reais e números do mundo real

- **Nunca inventar dado apresentado como real.** Número que descreve o mundo
  (participação de mercado, população, taxa de doença, preço, resultado de
  eleição, recorde) precisa de fonte conferida, citada junto do número.
- **Exemplo ilustrativo é marcado como tal** ("números ilustrativos", "um
  exemplo inventado para a conta ficar simples"). Exemplo fictício nunca
  usa nome de empresa, produto, pessoa ou lugar real como se fossem dados
  deles. Hoje há casos a corrigir: o "Android 70%, iOS 28% em 2023" de
  Gráficos Estatísticos não tem fonte.
- **Dados de bases públicas** (DATASUS, IBGE, INEP, Banco Central, IPEA…):
  citar a base, a tabela/sistema exato, o período, os filtros e a **data de
  acesso**; dizer se os dados são preliminares; citar a licença quando houver.
- **Reprodutibilidade**: todo número tirado de dados reais vem de um script
  que está no post (ou no repositório) e que reproduz o número do zero a partir
  da fonte. Quem rodar o script chega ao mesmo número publicado.
- Taxas e proporções declaram numerador, denominador e base (por 1.000
  nascidos vivos, por 100 mil habitantes). Comparações entre lugares ou anos
  dizem se a definição ou a coleta mudou no meio.
- Dados pessoais nunca: só dados agregados e anonimizados, como as bases
  públicas já os publicam.
- Números que envelhecem (preço da aposta, população, recorde) trazem a data:
  "em novembro de 2026", não "hoje".

---

## 12. Direitos autorais e plágio

- **Texto**: nunca copiar texto de livro, artigo ou site, nem traduzido. Toda
  explicação é escrita com palavras próprias; citação literal é curta, entre
  aspas, com fonte (§5).
- **Exercícios de livros** (ex.: "Questões de Livros Famosos"): enunciado
  reproduzido só se for curto e com referência completa (autor, obra, edição,
  capítulo, número do exercício); de preferência, parafraseado ("adaptado de
  …"). A resolução é sempre própria. Nunca reproduzir a solução do livro ou do
  manual de soluções.
- **Imagens**: só imagens com licença conhecida e compatível — próprias,
  geradas por código do site, domínio público ou licença livre (Creative
  Commons, Wikimedia Commons) com o crédito que a licença exige (autor,
  licença, link). Fotos de pessoas (Tukey, Galton, Pearson, Tufte…) precisam
  de origem e licença registradas; sem isso, a imagem sai.
- Registrar origem e licença de imagem de terceiros num comentário HTML ao
  lado da imagem ou na legenda.
- Ilustrações geradas por IA (capas): não imitam estilo de artista vivo
  identificável nem trazem marca, logotipo ou pessoa real.

---

## 13. Páginas interativas (JavaScript)

- **Ponto flutuante**: em JS, 0,1 + 0,2 = 0,30000000000000004. Todo valor
  exibido passa por arredondamento controlado (no número de casas declarado);
  comparações usam tolerância, não `===` entre decimais; quando a conta é
  com inteiros ou frações, faça a conta exata (inteiros, `BigInt` ou
  numerador/denominador) e só converta para decimal no fim.
- **Entradas**: toda entrada é validada. Campo vazio, texto, negativo onde não
  cabe, zero em denominador, n fora do domínio, probabilidade fora de [0, 1],
  número enorme: a página mostra uma mensagem clara e não um `NaN`,
  `Infinity` ou um resultado silenciosamente errado.
- **Casos de borda testados**: 0, 1, valores mínimos e máximos dos controles,
  empates, listas com um só elemento, denominador perto de zero.
- **O passo a passo exibido é gerado pelos mesmos números** que produzem o
  resultado: cada passo mostrado bate com o valor final (nada de passo
  "decorativo" com contas próprias).
- **Validação contra referência**: lógica nova é testada em Node contra força
  bruta ou contra Julia antes do navegador. Para distribuições (normal, t, F,
  qui-quadrado e outras), use o validador existente:
  `julia scripts/validacao/gera-referencia.jl` e
  `node scripts/validacao/compara.js` (já achou sete valores errados na
  tabela Z). Distribuição nova entra no validador.
- **Acessibilidade**: controles com `<label>` ou `aria-label`; resultado em
  região `aria-live`; tudo usável pelo teclado; contraste suficiente nos dois
  temas; nada que dependa só de cor.
- Estado na URL (quando a página já usa esse padrão) para que o link
  compartilhado reabra a mesma conta.

---

## 14. Glossário PT ↔ EN (termos padronizados)

Um termo, uma tradução, em todo o site. Os verbetes ficam em
`_data/glossario.yml` (blocos `pt:` e `en:`, cada um com os próprios slugs); termo novo entra lá e nesta
tabela. Se um termo precisar mudar, mude em todo o site de uma vez.

**Termo novo vira verbete na hora.** Sempre que um texto em trabalho (página
nova, revisão ou tradução) usar um termo técnico que ainda não está no
glossário e que o leitor iniciante precisaria consultar, o verbete é criado no
mesmo commit, sem esperar pedido:

- entra nos **dois** blocos (`pt:` e `en:`), com `termo`, `slug`, `ordem`
  (minúsculas e sem acento), `def` de uma ou duas frases (a primeira com até 30
  palavras, porque é ela que aparece na dica e no card da home) e `veja`
  apontando para a página que o usou e, se houver, para a página que o
  aprofunda;
- a definição passa pelas mesmas regras de conta e de rigor (§1–§3) de
  qualquer texto do site;
- o par PT ↔ EN entra também na tabela abaixo;
- termo genérico demais para virar dica automática nos posts (como "amostra"
  ou "evento") ganha `auto: false`;
- a resposta ao usuário lista os verbetes criados.

| Português | Inglês |
|---|---|
| média aritmética | arithmetic mean |
| média ponderada | weighted mean |
| média geométrica | geometric mean |
| média quadrática (RMS) | quadratic mean (RMS) |
| média móvel | moving average |
| média aparada | trimmed mean |
| mediana | median |
| moda | mode |
| amplitude | range |
| variância | variance |
| desvio padrão | standard deviation |
| coeficiente de variação | coefficient of variation |
| intervalo interquartil (IQR) | interquartile range (IQR) |
| quartil / decil / percentil | quartile / decile / percentile |
| assimetria / curtose | skewness / kurtosis |
| valor atípico (outlier) | outlier |
| população / amostra | population / sample |
| amostragem | sampling |
| espaço amostral | sample space |
| evento / evento complementar | event / complement |
| mutuamente exclusivos | mutually exclusive |
| eventos independentes | independent events |
| probabilidade condicional | conditional probability |
| Teorema de Bayes | Bayes' Theorem |
| variável aleatória | random variable |
| função de probabilidade | probability mass function (PMF) |
| função densidade de probabilidade | probability density function (PDF) |
| função de distribuição acumulada | cumulative distribution function (CDF) |
| esperança, valor esperado | expected value |
| distribuição normal | normal distribution |
| escore Z | Z-score |
| Teorema do Limite Central (TLC) | Central Limit Theorem (CLT) |
| estimador / estimativa | estimator / estimate |
| viés | bias |
| erro padrão | standard error |
| margem de erro | margin of error |
| intervalo de confiança | confidence interval |
| nível de confiança | confidence level |
| teste de hipótese | hypothesis test |
| hipótese nula / alternativa | null / alternative hypothesis |
| nível de significância | significance level |
| p-valor | p-value |
| erro tipo I / tipo II | Type I / Type II error |
| poder do teste | statistical power |
| graus de liberdade | degrees of freedom |
| teste t de Student | Student's t-test |
| distribuição t de Student | Student's t distribution |
| estatística de teste | test statistic |
| valor crítico | critical value |
| região de rejeição | rejection region |
| teste bilateral / unilateral | two-sided / one-sided test |
| mapa coroplético | choropleth map |
| taxa de incidência | incidence rate |
| internação (SIH/SUS) | hospital admission |
| ponto percentual | percentage point |
| variação percentual | percentage change |
| fração ideal | undivided share |
| DOI (Declaração sobre Operações Imobiliárias) | DOI (real estate transactions declaration) |
| distribuição hipergeométrica | hypergeometric distribution |
| falácia do jogador | gambler's fallacy |
| método de Monte Carlo | Monte Carlo method |
| comparações múltiplas | multiple comparisons |
| correção de continuidade | continuity correction |
| teste de aderência | goodness-of-fit test |
| limite | limit |
| limite lateral | one-sided limit |
| forma indeterminada | indeterminate form |
| função contínua | continuous function |
| teorema do confronto | squeeze theorem |
| assíntota | asymptote |
| cancelamento catastrófico | catastrophic cancellation |
| racionalização | rationalizing |
| termo em evidência | common factor |
| trinômio do 2º grau | quadratic trinomial |
| eventos mutuamente exclusivos | mutually exclusive events |
| linearidade da esperança | linearity of expectation |
| aposta simples (loteria) | single bet |
| volante (loteria) | betting slip |
| faixa de premiação | prize tier |
| arrecadação (loteria) | ticket sales |
| prêmio bruto | gross prize pool |
| concurso (loteria) | draw |
| dezena (Mega-Sena) | number |
| sena / quina / quadra | jackpot (6 hits) / five hits (quina) / four hits (quadra) |
| bolão | lottery pool |
| qui-quadrado | chi-square |
| análise de variância (ANOVA) | analysis of variance (ANOVA) |
| correlação de Pearson | Pearson correlation |
| regressão linear | linear regression |
| mínimos quadrados | least squares |
| resíduo | residual |
| fórmula quadrática | quadratic formula |
| frequência acumulada | cumulative frequency |
| estatística de ordem | order statistic |
| ponto de ruptura | breakdown point |
| robustez | robustness |
| cerca do boxplot | boxplot fence |
| bigode do boxplot | boxplot whisker |
| hinges de Tukey | Tukey's hinges |
| gráfico de violino | violin plot |
| distribuição exponencial | exponential distribution |
| distribuição log-normal | log-normal distribution |
| distribuição de Cauchy | Cauchy distribution |
| sobreajuste | overfitting |
| validação cruzada | cross-validation |
| conjunto de treino / de teste | training set / test set |
| linha de base | baseline |
| erro absoluto médio (EAM) | mean absolute error (MAE) |
| raiz do erro quadrático médio (REQM) | root mean squared error (RMSE) |
| erro percentual absoluto médio (EPAM) | mean absolute percentage error (MAPE) |
| regressão logística | logistic regression |
| matriz de confusão | confusion matrix |
| sensibilidade / especificidade | sensitivity / specificity |
| precisão (classificação) | precision |
| acurácia | accuracy |
| limiar (classificação) | threshold |
| viés de sobrevivência | survivorship bias |
| viés de seleção | selection bias |
| hipótese de Riemann | Riemann hypothesis |
| função zeta de Riemann | Riemann zeta function |
| teorema dos números primos | prime number theorem |
| integral logarítmica | logarithmic integral |

---

## 15. Temas sensíveis

- **Saúde**: exemplos de diagnóstico, doenças e testes (HIV, dengue,
  mortalidade) usam linguagem neutra e sem estigma ("pessoa que vive com
  HIV", não "aidético"); números de prevalência, sensibilidade e
  especificidade são ilustrativos e marcados como tal, ou têm fonte (§11). A
  página não dá orientação médica; quando o exemplo puder ser lido como
  conselho, diz isso ("o resultado de um teste real deve ser interpretado por
  um profissional de saúde").
- **Loterias e apostas**: o conteúdo explica a matemática, não incentiva
  apostar. Todo post sobre jogo mostra o valor esperado da aposta (negativo)
  e desfaz as falácias comuns (números "atrasados", padrões em sorteios
  independentes). Nada de "estratégia para ganhar". Preços e prêmios com data
  e fonte oficial.
- **Finanças**: risco, retorno e investimentos aparecem como exemplos de
  conceito, nunca como recomendação de compra, venda ou alocação.
- **Grupos sociais e política**: exemplos com sexo, raça, renda, religião ou
  partido usam dados com fonte (§11), sem generalizar do grupo para o
  indivíduo e sem juízo de valor.

---

## 16. URLs, SEO e links

- **URL publicada não muda.** Slug, `permalink` e nome de arquivo de página
  avulsa ficam como estão. Se a mudança for inevitável, crie o
  redirecionamento no padrão do site (página com `layout: null`,
  `sitemap: false`, `<link rel="canonical">` e `meta refresh` para a nova URL,
  como `visualization-pib-brazil-julia-en-redirect.html`).
- O mesmo vale para âncoras públicas: `slug` do glossário, `id` de seções
  linkadas de fora.
- `title` único no site, com o termo que o leitor buscaria; `description` de
  120 a 160 caracteres, que resume a página de verdade (sem prometer o que ela
  não tem) e é escrita para as duas línguas.
- Post novo com capa: JPG social 1200×630 (§8).
- **Links**: internos relativos e conferidos no build (abrir cada link novo ou
  alterado); externos só para fontes estáveis, abertos e conferidos antes de
  publicar. Link quebrado encontrado numa revisão é consertado na hora.
- Página nova ou traduzida: conferir que está no `sitemap.xml` e no
  `search.json` depois do build; pedir indexação (§9).

---

## 17. Voz e estrutura por tipo de conteúdo

- **Posts**: primeira pessoa do singular é bem-vinda ("eu passei anos sem
  entender…"); tom de conversa, com uma pergunta ou um caso concreto na
  abertura. Estrutura mínima: abertura que diz o que o leitor vai entender →
  ideia → exemplo resolvido completo (§1.5) → código quando houver → o que
  dá errado / limites → resumo → referências.
- **Páginas de área e tópicos**: impessoais e de referência ("a mediana é…").
  Estrutura mínima: definição em linguagem simples → fórmula com cada símbolo
  explicado → exemplo resolvido → interpretação → quando usar e quando não
  usar → referências.
- **Lições de Matemática elementar e Cálculo**: segunda pessoa ("você"),
  frases curtas, uma ideia por seção, calculadora com passo a passo e
  exercícios resolvidos.
- Em qualquer tipo: o leitor sai sabendo **calcular, interpretar e reconhecer
  quando não usar**. Página que só define não está pronta.

---

## 18. Processo de revisão de página existente

1. Ler a página inteira, nas duas línguas quando houver.
2. Passar por §1–§17, anotando cada problema encontrado: conta, código,
   citação, referência, dado sem fonte, imagem sem licença, notação, link.
3. Corrigir **nas duas línguas** no mesmo commit.
4. O que não puder ser resolvido na sessão (fonte inacessível, imagem que
   precisa ser refeita, decisão editorial) vira **issue** com o rótulo da
   página, a descrição do problema e o que falta para resolver.
5. Mensagem de commit em português listando **cada correção de conteúdo**
   (o que estava, o que ficou e por quê). Correção de erro que o leitor pode
   ter aprendido errado (conta, fórmula, fato) é dita com clareza.
6. Resposta ao usuário com a mesma lista e com o que ficou pendente.

---

## 19. Checklist antes de publicar

- [ ] Toda conta foi refeita por código, inclusive os intermediários.
- [ ] Fórmula ou algoritmo novo testado contra força bruta ou simulação.
- [ ] Identidade ou propriedade que a página afirma valer sempre está provada
      em `provas/` e `lake build` passa sem `sorry`.
- [ ] Resoluções à mão completas: dados → fórmula → substituição → uma conta
      por linha → resultado com unidade → interpretação.
- [ ] Arredondamento só no fim; casas decimais consistentes.
- [ ] Interpretação diz o que o resultado significa e o que não significa.
- [ ] Condições de uso declaradas e conferidas; parametrizações explícitas.
- [ ] Todo bloco de código roda sozinho; saídas copiadas da execução real.
- [ ] Código, texto, tabelas, gráficos, legendas e resumos com os mesmos números.
- [ ] Toda referência foi conferida (existe, dados corretos, sustenta o que é
      dito); nenhum autor, obra ou dado inventado.
- [ ] Toda citação entre aspas foi conferida na fonte e é do autor a quem é
      atribuída; o que não se confirmou virou paráfrase sem aspas ou saiu.
- [ ] Fatos históricos (datas, primazias, nomes) conferidos em fonte confiável.
- [ ] Numeração de seções/figuras sequencial; legendas batem com as imagens.
- [ ] Sem "Bhaskara".
- [ ] PT e EN coerentes; correções feitas nas duas.
- [ ] Notação conforme §6 (ponto e vírgula com decimais, intervalos,
      unidades) e termos conforme o glossário do §14.
- [ ] Todo dado do mundo real tem fonte, período e data de acesso; exemplos
      inventados estão marcados como ilustrativos; números reproduzíveis.
- [ ] Imagens de terceiros com origem e licença registradas; nenhum texto ou
      solução copiados.
- [ ] Página interativa: entradas inválidas tratadas, casos de borda testados,
      passo a passo coerente com o resultado, validada contra referência.
- [ ] Temas sensíveis (saúde, apostas, finanças) conforme §15.
- [ ] Nenhuma URL publicada mudou (ou há redirecionamento); links conferidos;
      `title` e `description` adequados.
- [ ] Estrutura mínima do tipo de conteúdo (§17) cumprida.
- [ ] Build sem erros e página conferida renderizada.
- [ ] A resposta ao usuário diz o que não foi verificado (§10).
