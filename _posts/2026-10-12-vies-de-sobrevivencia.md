---
layout: post
image: /assets/images/capa-sobrevivencia.avif
title: "Os aviões que voltaram: o viés de sobrevivência, de Abraham Wald aos fundos que batem o mercado"
categories: [ESTATÍSTICA, JULIA, PROBABILIDADE]
tags: [Estatística, Probabilidade, Julia]
lang: pt
ref: vies-de-sobrevivencia
author: dante-bertuzzi
description: "Por que blindar onde os aviões voltam furados é o erro: a história de Abraham Wald, a conta de Bayes por trás do viés de sobrevivência, um estimador que recupera a letalidade só com os aviões que voltaram, e o mesmo erro em fundos de investimento — com simulação em Julia."
mathjax: true
slug: vies-de-sobrevivencia-avioes-abraham-wald
---

Eu conhecia a história dos aviões da Segunda Guerra do jeito que todo mundo
conhece: os bombardeiros voltavam furados, os oficiais queriam blindar onde
havia furos, e um estatístico disse que não — a blindagem ia onde **não**
havia furos, porque os aviões atingidos ali não tinham voltado para ser
contados.

É uma história ótima. Tão ótima que eu nunca tinha feito a conta.

Este post é a conta. Ela acabou sendo uma linha do teorema de Bayes, um
estimador que eu não esperava que funcionasse tão bem, uma simulação que na
primeira tentativa não mostrou nada, e um erro meu num exemplo de fundos de
investimento que, ironicamente, era ele mesmo um viés de seleção.

## Primeiro, o que é verdade nessa história

O estatístico existiu. Abraham Wald nasceu em 1902 em Kolozsvár — na época
Hungria, hoje Cluj, na Romênia — e chegou aos Estados Unidos em 1938. Na
guerra, trabalhou no Statistical Research Group da Universidade de Columbia,
um grupo que respondia a perguntas militares com estatística e que tinha,
entre outros, Milton Friedman.[^grupo]

Os documentos também existiram. Em 1943, Wald escreveu uma série de
memorandos chamada *A Method of Estimating Plane Vulnerability Based on Damage
of Survivors*. O título já entrega o post inteiro: estimar a vulnerabilidade
dos aviões **a partir do dano dos sobreviventes**. Os memorandos ficaram
guardados até 1980, quando foram publicados.

Agora, o que eu não consigo confirmar. O diálogo com os oficiais — eles
apontando os furos, Wald apontando o vazio — é uma reconstrução posterior,
que ficou famosa principalmente pelo livro *How Not to Be Wrong*, de Jordan
Ellenberg. Pode ter acontecido mais ou menos assim; pode ser uma boa
dramatização de um relatório cheio de equações. Os memorandos, até onde li
sobre eles, são bem menos cinematográficos: modelam quantos tiros um avião
leva, onde caem e a chance de cada um derrubá-lo.

E o desenho do avião coberto de pontinhos vermelhos, que aparece em toda
apresentação sobre o assunto? É moderno. Não saiu de relatório nenhum.[^desenho]

Então a anedota é, no mínimo, embelezada. A ideia, não. A ideia está nos
memorandos: o dano que você vê nos que voltaram é informação sobre os que não
voltaram.

## A conta, com um avião de mentira

Peguei um avião e dividi em cinco regiões. Supus que um tiro tem a mesma
chance de cair em qualquer ponto da silhueta, então cada região recebe tiros
na proporção da sua área, $a_i$. E inventei a letalidade $q_i$: a chance de um
tiro naquela região derrubar o avião.

| Região | Área ($a_i$) | Letalidade de um tiro ($q_i$) |
|---|---:|---:|
| Motores | 20% | 65% |
| Cabine | 5% | 70% |
| Fuselagem | 30% | 3% |
| Asas | 35% | 4% |
| Cauda | 10% | 10% |

Esses 65% e 70% não vieram de lugar nenhum além da minha cabeça. Mas a ordem
é razoável: um tiro no motor ou no piloto é bem pior que um furo na lataria.
(E, como vou contar adiante, os números altos não foram a minha primeira
escolha.)

Mande 1.000 aviões, cada um levando **um** tiro só. Pelas áreas, 200 são
atingidos no motor. Desses, 65% caem. Voltam 70. Repetindo para todas as
regiões:

| Região | Atingidos | Voltam | Parcela dos furos no hangar |
|---|---:|---:|---:|
| Motores | 200 | 70 | 8,7% |
| Cabine | 50 | 15 | 1,9% |
| Fuselagem | 300 | 291 | 36,3% |
| Asas | 350 | 336 | 41,9% |
| Cauda | 100 | 90 | 11,2% |
| **Total** | **1.000** | **802** | **100%** |

Os motores levaram 20% dos tiros e aparecem com 8,7% dos furos. A fuselagem
levou 30% e aparece com 36,3%.

Quem está no hangar contando furos vê a fuselagem e as asas como as partes
"mais atingidas". E elas são exatamente as que menos importam.

## Isso tem nome, e o nome é Bayes

A última coluna da tabela não é "onde os tiros caem". É "onde os tiros caem,
**sabendo que o avião voltou**". Pelo
[teorema de Bayes](/formulas/teorema-bayes.html):

$$
P(\text{motor} \mid \text{voltou})
= \frac{P(\text{voltou} \mid \text{motor})\, P(\text{motor})}{P(\text{voltou})}
= \frac{0{,}35 \times 0{,}20}{0{,}802} = 0{,}087.
$$

São três números diferentes andando juntos: onde os tiros caem,
$P(\text{região})$; quanto cada região aguenta, $P(\text{voltou} \mid
\text{região})$; e o que o hangar mede, $P(\text{região} \mid \text{voltou})$.
A fórmula diz exatamente como o terceiro deforma o primeiro: cada região é
encolhida na proporção de $1 - q_i$. Quanto mais letal, mais ela some.

É o erro clássico da
[probabilidade condicional](/formulas/probabilidade-condicional.html) —
trocar $P(A \mid B)$ por $P(A)$ — com um agravante. Normalmente dá para
perceber que existe um $B$. Aqui, o $B$ é "chegou até aqui", e **todo mundo
que você consegue observar** o satisfaz. A condição fica invisível.

## Dá para desfazer (isso eu não esperava)

Eu achava que a lição de Wald terminava em "cuidado, os dados estão
enviesados". Não termina. Como o viés tem uma forma conhecida, dá para
desfazê-lo.

Na versão de um tiro por avião, se você sabe quantos aviões saíram
($N = 1.000$) e a área de cada região, a conta é quase ofensiva de tão
simples:

$$
\hat{q}_i = 1 - \frac{s_i}{N\, a_i},
\qquad\text{por exemplo}\qquad
\hat{q}_{\text{motor}} = 1 - \frac{70}{1.000 \times 0{,}20} = 0{,}65.
$$

Aqui $s_i$ é quantos aviões voltaram furados na região $i$. Se ninguém
caísse, essa região deveria aparecer em $N a_i$ aviões. O que falta é a
letalidade.

Avião de verdade leva mais de um tiro, e Wald tratou esse caso. O que faço
abaixo é uma versão simplificada minha, não a fórmula dele.[^formula]
Suponha que o número de tiros de cada missão é Poisson com média $\lambda$ e
que cada tiro cai e age de forma independente. Uma propriedade da Poisson,
a decomposição, faz o trabalho pesado: os tiros letais e os não letais de cada
região viram contagens Poisson independentes umas das outras. Daí:

- um avião volta se não levar nenhum tiro letal:
  $P(\text{voltar}) = e^{-\lambda Q}$, com $Q = \sum_i a_i q_i$;
- e, entre os que voltam, os furos na região $i$ continuam Poisson, com média
  $\lambda a_i (1 - q_i)$ por avião.

Com $N$ missões, $S$ aviões de volta e $H$ furos neles, as duas equações dão
até o $\lambda$, que ninguém observa diretamente:

$$
\hat{\lambda} = \frac{H}{S} + \ln\frac{N}{S},
\qquad
\hat{q}_i = 1 - \frac{h_i}{S\,\hat{\lambda}\,a_i},
$$

com $h_i$ o número de furos na região $i$ entre os que voltaram. Tudo do lado
direito é coisa que se conta no hangar ou na papelada: quantos saíram, quantos
voltaram, onde estão os furos e o tamanho de cada região.

Quando cheguei nessa fórmula, desconfiei dela. Então simulei.

## A simulação que não mostrou nada

Desenhei um bombardeiro de quatro motores visto de cima, sorteei tiros
uniformemente sobre a silhueta e mandei 10.000 missões, com 2 tiros por missão
em média. Na primeira versão, dei 30% de letalidade aos motores e 35% à
cabine. Pareciam números respeitáveis.

O desenho dos furos ficou... um avião furado. Por igual. Os motores tinham
um pouco menos de furos que o resto, mas nada que alguém notasse olhando.

Demorei um pouco para entender que a simulação não estava errada. Ela estava
me ensinando uma coisa: o hangar só esconde muito quando a região é **muito**
letal. A densidade de furos de cada região entre os sobreviventes é
proporcional a $1 - q_i$. Com 30% de letalidade, os motores aparecem com 70%
da densidade de uma região inofensiva — diferença real, mas discreta. Para o
"vazio" famoso aparecer, um tiro ali precisa ser quase sempre fatal.

Subi para 65% e 70%. Ainda não é o vazio do desenho famoso — para isso
seria preciso chegar perto de 100% —, mas a diferença já salta aos olhos:

<figure>
  <a href="/assets/images/sobrevivencia-avioes.png" title="Abrir em tamanho original">
  <img src="/assets/images/sobrevivencia-avioes.avif" alt="À esquerda, a silhueta de um bombardeiro de quatro motores vista de cima, com 1.100 pontos vermelhos marcando furos dos aviões que voltaram: fuselagem, asas e cauda cheias de furos, motores e cabine com poucos. À direita, barras comparando a letalidade verdadeira de um tiro em cada região com a estimada só a partir dos que voltaram: motores 65% e 65,1%, cabine 70% e 69,9%, fuselagem 3% e 2,0%, asas 4% e 4,3%, cauda 10% e 14,5%" />
  </a>
  <figcaption>
    <strong>Figura 1:</strong> à esquerda, furos dos aviões que voltaram; motores e cabine aparecem com cerca de um terço dos furos das outras regiões, porque a maioria dos aviões atingidos ali não voltou. À direita, a letalidade de cada região: em cinza, a verdadeira; em azul, a estimada pelas fórmulas acima usando só os sobreviventes. Clique na imagem para vê-la em tamanho original.
  </figcaption>
</figure>

Voltaram 6.425 dos 10.000 aviões, com 10.022 furos. Por unidade de área, a
fuselagem tem 1,96 furo por avião; os motores, 0,70. Quase três vezes menos.

E a fórmula de que eu desconfiava deu $\hat{\lambda} = 2{,}002$, contra o
verdadeiro 2:

| Região | Letalidade verdadeira | Estimada só com os que voltaram |
|---|---:|---:|
| Motores | 65% | 65,1% |
| Cabine | 70% | 69,9% |
| Fuselagem | 3% | 2,0% |
| Asas | 4% | 4,3% |
| Cauda | 10% | 14,5% |

As regiões que importam saem praticamente exatas. A cauda erra feio, e por
um motivo meio contraintuitivo: letalidade baixa é estimada como "o pouquinho
que falta" de uma contagem grande, então uma flutuação pequena vira um erro
relativo enorme. Com mais missões, melhora.

O núcleo da simulação:

```julia
using Random

a = [0.218, 0.058, 0.257, 0.340, 0.126]   # área: motores, cabine, fuselagem, asas, cauda
q = [0.65, 0.70, 0.03, 0.04, 0.10]        # chance de um tiro derrubar o avião
λ, N = 2.0, 10_000
regiao(rng) = findfirst(>=(rand(rng) * sum(a)), cumsum(a))

function poisson(rng, λ)
    L, k, p = exp(-λ), 0, 1.0
    while (p *= rand(rng)) > L; k += 1; end
    k
end

rng = Xoshiro(1943)
h, S = zeros(Int, 5), 0
for _ in 1:N
    tiros = [regiao(rng) for _ in 1:poisson(rng, λ)]
    any(rand(rng) < q[r] for r in tiros) && continue   # abatido: não entra na conta
    global S += 1
    for r in tiros; h[r] += 1; end
end

λ̂ = sum(h) / S + log(N / S)
q̂ = 1 .- h ./ (S * λ̂ .* a)
```

Essa versão curta sorteia a região direto pelas áreas, em vez de sortear um
ponto na silhueta, então os números saem um pouco diferentes dos da tabela
(com ela, os motores dão 0,657). As conclusões não mudam.[^bugs]

## Fundos que batem o mercado (e o meu erro)

Troque aviões por fundos de investimento. Fundo que vai mal perde cotista,
encolhe e um dia é fechado ou engolido por outro. Quem abre hoje uma base de
fundos e calcula o desempenho médio dos últimos quinze anos está no hangar,
contando furos dos que voltaram.

Para medir o tamanho disso, simulei 500 fundos **sem talento nenhum**. O
retorno de cada um acima do mercado, a cada ano, sai de uma normal com média
zero e desvio de 6 pontos. Nenhum gestor é melhor que outro; é tudo sorte. E,
a cada ano, os 8% com pior retorno acumulado fecham.

Quinze anos depois, sobram 143. A média anual deles fica **1,65 ponto acima
do mercado**. Todos os 143, sem exceção, têm média positiva.

Para mostrar o contraste, calculei a média "de todos, inclusive os que
fecharam". Deu −1,98%.

Fiquei olhando para esse número um tempo. Os fundos não têm talento nenhum —
nem bom, nem ruim. A média verdadeira é zero por construção. De onde vinham
esses −2%?

Vinham de mim. Eu tinha tirado a média de cada fundo e depois a média das
médias. Só que um fundo que fechou no segundo ano tem na média dele
exatamente os dois anos ruins que o fizeram fechar — e mais nada. A regra de
fechamento escolhe **quando** cada fundo para de ser contado, e parar logo
depois de um tombo puxa a média para baixo. Eu estava "corrigindo" o viés de
sobrevivência com outro viés de seleção.

A conta certa olha cada ano de cada fundo enquanto ele existiu — 4.459
fundo-anos — e dá **+0,04 ponto**. Zero, como deveria.

<figure>
  <a href="/assets/images/sobrevivencia-fundos.png" title="Abrir em tamanho original">
  <img src="/assets/images/sobrevivencia-fundos.avif" alt="À esquerda, 500 trajetórias de retorno acumulado acima do mercado ao longo de 15 anos: as linhas cinzentas terminam num ponto quando o fundo fecha, quase sempre abaixo de zero, e as azuis, dos 143 sobreviventes, terminam acima de zero. À direita, duas barras: os sobreviventes rendem em média 1,65% ao ano acima do mercado; todos os anos de todos os fundos, 0,04%" />
  </a>
  <figcaption>
    <strong>Figura 2:</strong> à esquerda, os 500 fundos; os cinzentos fecham no ponto em que terminam, os azuis chegam aos 15 anos. À direita, o retorno médio que a base de dados mostra (só os sobreviventes) e o verdadeiro (todos os anos de todos os fundos). Clique na imagem para vê-la em tamanho original.
  </figcaption>
</figure>

Nos dados reais, isso é conhecido desde os anos 1990: estudos de desempenho
que usam só os fundos vivos superestimam o retorno, e as bases sérias passaram
a guardar o histórico dos encerrados justamente por causa disso. O meu tropeço
com a média das médias mostra que não basta incluir os mortos: é preciso
incluí-los do jeito certo.

## Outros hangares

**Os gênios que largaram a faculdade.** Bill Gates, Steve Jobs e Mark
Zuckerberg largaram a faculdade e ficaram bilionários. Eles viraram exemplo
porque deram certo; quem largou e não deu certo não é chamado para palestrar.
A comparação que interessa é entre todos que largaram e todos que concluíram,
e nessa o diploma continua associado a renda maior.

**Os gatos que caem do décimo andar.** Um estudo veterinário de 1987 com gatos
que caíram de prédios em Nova York encontrou menos lesões graves nos que
caíram de mais de sete andares do que nos que caíram de alturas
intermediárias. A explicação proposta é física: o gato atinge a velocidade
terminal, relaxa e cai espalhado. Pode ser. Mas tem um candidato óbvio a avião
que não voltou: um gato que morre na queda do décimo andar dificilmente é
levado ao veterinário, e não entra nos dados da clínica. Não sei quanto de
cada explicação é verdade, e desconfio que ninguém sabe ao certo.[^gatos]

**"Antigamente se construía melhor."** Os prédios antigos que ainda estão de
pé são os que foram bem construídos. Os ruins já caíram ou viraram
estacionamento. Vale igual para "a música de antigamente era melhor": a gente
ouve o que sobreviveu a décadas de peneira, não a média do que tocava no
rádio em 1978.

**Os estudos que chegam à revista.** Se só os resultados significativos são
publicados, a literatura científica vira um hangar: os efeitos parecem maiores
e mais consistentes do que são, porque os estudos que não acharam nada ficaram
na gaveta.

## Como não cair nessa

O viés de sobrevivência é um tipo de [viés](/pt/glossario#vies) de seleção, e
tem a propriedade mais irritante de todas: aumentar a amostra não ajuda. Mil
aviões a mais no hangar dão a mesma resposta errada, só que com mais
confiança.

O que ajuda é mudar a pergunta:

- **Quem não chegou aqui?** Antes de qualquer média, pergunte que processo
  decidiu quem entra nos dados, e se esse processo depende justamente do que
  você quer medir.
- **Qual é o denominador?** Quantos aviões saíram, quantos fundos foram
  abertos, quantas pessoas largaram a faculdade. Sem a população de partida,
  não dá para saber o que se perdeu no caminho.
- **Dá para modelar a perda?** Foi o que Wald fez. Em ensaios clínicos, a
  análise por intenção de tratar mantém no grupo quem abandonou o tratamento.
  Na análise de sobrevivência, métodos como o de Kaplan-Meier existem para
  aproveitar a informação de quem saiu do estudo antes do fim — como no
  [post sobre as orcas](/orcas-residentes-do-sul-demografia-julia-kaplan-meier/).
- **E a minha correção, tem viés também?** Essa eu aprendi com os fundos.

---

A parte da história de Wald de que eu mais gosto não é a esperteza da
resposta. É que ela troca a pergunta. Os oficiais perguntavam onde os aviões
eram atingidos. A pergunta útil era onde um avião podia ser atingido e ainda
voltar.

A distância entre as duas é uma probabilidade condicional. E quase todo erro
de sobrevivência — inclusive o meu, com os fundos — é alguém lendo
$P(A \mid \text{sobreviveu})$ como se fosse $P(A)$.

## Referências

- Wald, A. (1980). *A Reprint of "A Method of Estimating Plane Vulnerability
  Based on Damage of Survivors"*. Center for Naval Analyses, CRC 432. Os
  memorandos originais são de 1943.
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's Work on Aircraft
  Survivability. *Journal of the American Statistical Association*, 79(386),
  259–267.
- Wallis, W. A. (1980). The Statistical Research Group, 1942–1945. *Journal of
  the American Statistical Association*, 75(370), 320–330.
- Ellenberg, J. (2014). *How Not to Be Wrong: The Power of Mathematical
  Thinking*. Penguin Press.
- Brown, S. J.; Goetzmann, W.; Ibbotson, R. G.; Ross, S. A. (1992).
  Survivorship Bias in Performance Studies. *The Review of Financial Studies*,
  5(4), 553–580.
- Elton, E. J.; Gruber, M. J.; Blake, C. R. (1996). Survivor Bias and Mutual
  Fund Performance. *The Review of Financial Studies*, 9(4), 1097–1120.
- Whitney, W. O.; Mehlhaff, C. J. (1987). High-rise syndrome in cats. *Journal
  of the American Veterinary Medical Association*, 191(11), 1399–1403.

[^grupo]: O relato de dentro do grupo é o artigo de W. Allen Wallis, que o dirigiu, publicado em 1980 (nas referências). Vale a leitura: é o retrato de um grupo de estatísticos respondendo, sob prazo de guerra, perguntas muito práticas sobre munição, inspeção e tiro.

[^desenho]: Ele circula na internet como se fosse um diagrama de época. Não é: foi feito décadas depois, para ilustrar exatamente esta história. A Figura 1 deste post também é moderna, só que tem a vantagem de vir de uma simulação que dá para conferir.

[^formula]: O tratamento de Wald, descrito em detalhe no artigo de Mangel e Samaniego (1984), é mais geral e mais cuidadoso. A minha versão com a Poisson é a mais curta que eu consegui escrever e que ainda funciona, o que não é a mesma coisa que ser a dele.

[^bugs]: Confissão: a primeira versão desse trecho não rodava. Tinha um `S += 1` sem o `global`, que o Julia não aceita num laço no nível do script, e um sorteio que às vezes caía fora de todas as regiões, porque as áreas somavam 0,999 e não 1. Só descobri porque copiei o código do post e rodei de novo — que é exatamente o que eu recomendaria a qualquer leitor.

[^gatos]: O próprio estudo sugere a explicação física. A hipótese de sobrevivência é levantada por outros, e as duas não se excluem. O que dá para dizer com segurança é que dados de clínica veterinária não são uma amostra de todos os gatos que caem.
