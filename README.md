# MorrisonKühlsen

Site de estatística e probabilidade, em português e inglês.

Jekyll puro — sem framework de CSS, sem jQuery, sem Node. Só Ruby, Liquid e o
Sass que já vem embutido no Jekyll. CSS e JS somam cerca de 13 KB gzipados.

## Rodar

```bash
bundle config set --local path vendor/bundle   # só na primeira vez
bundle install
bundle exec jekyll serve --config _config.yml,_config_dev.yml
```

O build de produção (com Google Analytics) é `JEKYLL_ENV=production bundle exec jekyll build`.

## Estrutura

```
_data/site.yml     rótulos, links, SEO e a barra de anúncio
_data/tools.yml    o dropdown "Ferramentas" (páginas HTML avulsas)
_data/glossario.yml os verbetes do glossário A–Z
_data/authors.yml  autores dos posts
_sass/             uma pasta por camada: tokens → reset → layout → componentes
_includes/         header, hero, busca, rodapé, sprite de ícones
_layouts/          base → home | page | post
assets/js/site.js  todo o comportamento do site, sem dependências
blog/index.html    listagem com filtro por tag
search.json        índice de busca, gerado pelo Jekyll
```

## Contratos que valem conhecer

**Menu.** Gerado a partir do front matter das páginas: `lang`, `ref`, `order`,
`parent`. Quem tem `order` aparece no menu; quem tem `parent` vira submenu.

**Mega-menu.** Toda seção com filhos abre um painel de quatro colunas:
descrição (do `description` da seção), título com seta + lista de filhos,
terceiro nível (aparece quando um filho tem netos) e chamadas, que vêm do
front matter da seção:

```yaml
menu_cta:
  - { text: "Todos os artigos", url: "/#artigos", style: "primary" }
  - { text: "Fórmulas",         url: "/formulas/home.html", style: "outline" }
```

**Header.** Duas faixas — utilidades (idioma, tema, busca) e a principal
(marca à esquerda, navegação à direita) —, 121px no total. Sobre um hero recebe
um degradê único: preto opaco até 30% da altura, linear até transparente.
Passar o cursor sobre ele o resolve em branco sólido; rolar a página compacta a
barra e some com a faixa de utilidades. O hover dos itens do menu é uma barra
sob o texto que cresce em largura — por isso o rótulo vai dentro de
`.site-nav__label`.

**Logo.** Um único SVG inline (`#i-logo` no sprite) pintado com `currentColor`.
As mesmas formas dão as duas versões da marca, porque o "Mor" é vazado: preto
no header claro, branco sobre o hero.

**Hero.** Uma página ganha hero declarando `hero_image` no front matter — é
também o que deixa o header transparente sobre ela. Para slideshow, use
`hero_slideshow` com uma lista de `{ src, alt }`.

**Post.** Coluna de leitura de 52rem centrada, com o índice na margem direita:
sub-listas fechadas, só o ramo ativo aberto, item ativo = último título que já
passou 80px abaixo do topo. Traz também assinatura com as iniciais do autor,
tags, comentários via giscus e MathJax carregado só quando o front matter traz
`mathjax: true`. O mesmo vale para as páginas de conteúdo.

`image` no front matter serve de capa social e do card na home — o post **não**
a repete no corpo, porque o texto em geral já traz a figura.

**Barra de ações do post.** Coluna fixa na margem esquerda (`post-rail.html`):
compartilhar, copiar link, tamanho do texto e voltar ao topo. A escala de
leitura fica no `localStorage`, então vale nos artigos seguintes. Some abaixo
de 64rem, junto com o índice.

**Marca d'água do rodapé.** Um SVG em data URI que se repete, com 20 fórmulas
de estatística e probabilidade em notação Unicode, numa serifada em itálico.
Sem MathJax, sem DOM extra e sem imagem para baixar. O ladrilho é de 1600px
para a repetição não saltar aos olhos na maioria das telas, e a cor é fixa
porque o fundo do rodapé também é, nos dois temas. Para trocar as fórmulas,
edite o `background-image` em `_sass/_footer.scss`.

**Tabelas Z, t e F.** As três são a tabela no meio e calculadoras nas
laterais, que grudam ao rolar; abaixo de 1400px tudo empilha, calculadoras
primeiro. Clicar numa célula preenche os campos — na t ela carrega também o α
da coluna e os graus de liberdade da linha, e na F o par (ν₁, ν₂) e o α.

Na tabela F, atenção: a primeira coluna é **ν₂**, o denominador, e as dezoito
colunas são **ν₁**, o numerador. Os rótulos vinham trocados; conferido contra
os 2016 valores publicados, a leitura invertida errava por mais de 90000%.

`assets/js/stat-calc-core.js` é o que elas dividem: normal (erfc de Chebyshev
e Φ⁻¹ de Acklam com um passo de Halley), t de Student e F de Snedecor (as duas
pela beta incompleta, com quantil por bisseção), o desenho da curva, a notação
em KaTeX, o estado na URL e o tema. Cada página traz só as suas calculadoras —
`ztable-calculators.js`, `ttable-calculators.js` e `ftable-calculators.js`.

O desenho descobre o pico amostrando a densidade, em vez de assumi-lo em zero:
a F é assimétrica, e com ν₁ = 1 ela vai ao infinito na origem.

Os valores **não** são lidos da tabela: são calculados, e por isso valem para
qualquer z, α ou ν, inclusive os que a tabela não lista. A implementação da t
foi conferida contra os 610 valores publicados na própria página e a da F
contra os 2016 da dela, todas dentro do arredondamento das tabelas.

O estado vive na URL — `?z=`, `?z1=&z2=`, `?p=&tail=`, `?x=&mu=&sd=` na Z e
`?t=&df=`, `?a=&adf=&ctail=`, `?xbar=&mu=&s=&n=` na t —, o que torna um
resultado compartilhável. A paleta está em tokens `--zt-*` no topo de
`assets/css/ztable-styles.css`, com tema claro por `prefers-color-scheme`,
botão que fixa a escolha e folha de impressão.

A coluna Z escreve o negativo com o sinal tipográfico − (U+2212), em que
`parseFloat` devolve NaN — cuidado ao mexer no JS dela. E `ttable.html` e
`ftable.html` usam CRLF, ao contrário do resto do repositório.

**Páginas avulsas.** As tabelas z/t/F, o alfabeto grego, as 23 fórmulas
interativas, o quiz e o problema semanal são HTML solto, fora do ciclo do
Jekyll — são aplicações com CSS e JS próprios, não conteúdo. Ficam assim de
propósito. Para entrarem na busca há `_data/standalone.yml`, gerado a partir
do `<title>` e do `<meta description>` de cada arquivo; regenere-o quando
adicionar uma página nova.

**Glossário.** `/pt/glossario`, montado por `glossary.html` a partir de
`_data/glossario.yml` — 71 verbetes de uma ou duas frases, cada um com âncora
própria e links para o artigo que aprofunda o termo. Cada item traz `ordem`, a
chave de ordenação sem acento: o `sort` do Liquid compara por código de
caractere e mandaria "Álgebra" para depois de "Z". O `slug` é a âncora **e** a
URL no índice de busca, então mudá-lo quebra link publicado — acrescente um
verbete novo em vez de renomear. A página declara um `DefinedTermSet` em
JSON-LD, que é como o buscador entende um glossário, e o filtro do topo casa
sem acento, como a busca do site. A estrutura do arquivo já é por idioma, para
o dia em que houver a versão em inglês.

**Busca.** `search.json` e um matcher próprio em `site.js`. Não usa Lunr: o
pipeline padrão dele faz *stemming* em inglês, o que atrapalha num site
majoritariamente em português. Casar prefixos de token sem acento acerta mais
em ~70 documentos. Abre com Ctrl+K ou `/`, filtra pelo idioma da página e
destaca o trecho que casou. O índice é buscado uma vez, na primeira abertura. Além de posts, páginas
e ferramentas, entra um item por verbete do glossário, apontando para a
âncora — quem busca um termo quer cair nele, não no topo da página.

**Cores dos posts.** Os posts trazem CSS próprio no `<style>`. As cores de
superfície, texto e borda que eles fixavam viraram tokens `--mk-*`, definidos
em `_sass/_tokens.scss` para os dois temas — por isso o modo escuro funciona
dentro dos artigos. Seis posts trazem regras `.dark-mode …` escritas para o
tema antigo; a classe é religada junto com `data-theme`, então essas cores
voltaram a valer.

As regras de tabela do tema usam `:where(.prose)`, de especificidade zero, para
que o CSS do post sempre vença: quem escreveu a tabela decide como ela fica.

**Tema escuro.** Botão na faixa de utilidades. O tema vai em `data-theme` no
`<html>`, é aplicado por um script inline no `<head>` — antes da folha de
estilo, senão a página pisca branca —, fica no `localStorage` e é repassado ao
giscus por `postMessage`. Só os tokens mudam; nenhuma regra de componente sabe
do tema. `--code-bg` e `--footer-bg` ficam escuros nos dois de propósito.

**Tokens.** Toda cor, tamanho e espaçamento vive em `_sass/_tokens.scss` como
custom property. Mudar a identidade do site é mexer em um arquivo só.

**Ícones.** `_includes/icons.html` é um sprite SVG inline. Para usar:
`<svg><use href="#i-search"></use></svg>`.

**SEO.** `_includes/head.html` monta título, descrição, canonical, hreflang
(casado pelo `ref`), OpenGraph, Twitter Card e ícones. Dados estruturados em
`schema.html` — WebSite sempre, Article e BreadcrumbList nos posts — montados
com `jsonify`, para que título com aspas ou acento não quebre o JSON.
Configuração em `_data/site.yml → seo` e `_config.yml → google_analytics`.

**Barras dispensáveis.** A de anúncio (`_data/site.yml → announcement`) é fixa
no topo e publica a própria altura em `--annbar-h`, de onde o header e o
conteúdo se deslocam; o aviso de cookies fica embaixo. As duas nascem escondidas
no HTML e só aparecem se ainda não foram dispensadas, para não piscar.

**Leia também.** `related.html`, no fim do post: três cartões escolhidos por
tags em comum. Em vez de ordenar por pontuação — o `sort` do Liquid não é
estável e o desempate por data se perderia —, varre os candidatos uma vez por
nível de afinidade, do maior para o menor; como `site.posts` já vem do mais
novo para o mais antigo, dentro de cada nível o recente entra primeiro.
Sobrando vaga, completa com os últimos posts do idioma. Só Liquid, sem plugin.

**Impressão.** `_sass/_print.scss`, a última folha importada — por isso vence
as outras sem `!important`. Sai só o artigo: header, rodapé, índice, barra de
ações, comentários, relacionados e o card de anúncio ficam de fora, os tokens
voltam ao claro mesmo no tema escuro, títulos não caem no pé da página e
figuras, tabelas e fórmulas não se partem entre folhas. Links externos ganham
o endereço entre parênteses, e o `.print-source` no cabeçalho traz a URL do
artigo — no papel é por ela que o leitor volta. Para mostrar algo só na
impressão, use `.print-only`.

**Card de anúncio.** `ad-widget.html`, só no layout de post: fixo no canto
inferior direito, some abaixo de 48rem e é dispensável (`mk-adcard` no
localStorage). Os slots ficam empilhados na mesma célula de um grid e se
revezam por opacidade — o JS só troca a classe `is-on`, o crossfade é CSS. O
relógio para com a aba em segundo plano e sob o cursor, para a troca não
acontecer no meio do clique. Configuração em `_data/site.yml → ads`:

```yaml
ads:
  rotate: 9000
  slots:
    - url: /blog
      site: "morrisonkuhlsen.com"
      images: [...]        # sorteia a capa; `image` fixa uma só
      headline: { pt: [...], en: [...] }
      text:     { pt: "...", en: "..." }
```

## Dependências externas

Três, todas carregadas de forma não bloqueante:

| O quê | Onde | Por quê |
|---|---|---|
| Source Sans 3 | todas as páginas | única família do site |
| Bootstrap Icons | só post e página | os posts usam `bi-*` no corpo |
| MathJax | só com `mathjax: true` | fórmulas |

## Publicação

GitHub Pages via `.github/workflows/deploy.yml`, disparado por push em `master`
e pelos crons de publicação agendada. O domínio vem do `CNAME`.

## O que ainda falta

- [ ] As páginas avulsas não têm hreflang — não há contraparte em outro
      idioma para apontar. OpenGraph e Twitter Card já estão lá.

## Licença

MIT — veja [LICENSE](LICENSE). O conteúdo dos posts e as imagens não estão
cobertos por ela.
