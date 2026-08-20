---
layout: post
image: /assets/images/perth.avif
title: "Perth.jl: cronogramas de projeto que você pode calcular"
categories: [JULIA, GESTÃO DE PROJETOS]
lang: pt
tags: [Julia, Gestão de projetos]
ref: perth-jl
author: dante-bertuzzi
description: "O que é o Perth.jl, os conceitos por trás dele (EAP, CPM, folga, caminho crítico, PERT), como instalar, como funciona por dentro e um exemplo real completo: o cronograma de um estudo de tempos de atendimento, do REPL ao navegador."
mathjax: true
---

Todo mundo que já coordenou um projeto — uma pesquisa, uma obra, um TCC com prazo de banca — passou pelo mesmo momento: alguém pergunta *"e se essa etapa atrasar dois dias, o que mais anda?"*, e a resposta exige redesenhar o cronograma à mão.

O problema não é a pergunta. É que o cronograma virou **figura**. Uma planilha com barrinhas coloridas, ou um PNG exportado de alguma ferramenta, é ótima para apresentar e péssima para calcular. Ninguém consegue perguntar a uma imagem qual tarefa é o gargalo, quanto de folga sobra, ou qual a probabilidade de entregar antes do dia 30.

Este post apresenta o **Perth.jl**, um pacote Julia que escrevi justamente para tratar cronograma como aquilo que ele é: uma estrutura de dados sobre a qual se calcula. Vamos ver o conceito, a instalação, como ele funciona por dentro e, no fim, um exemplo real do começo ao fim.

<style>
/* Tabelas deste post: o tema não define espaçamento de célula, e as tabelas
   aqui são numéricas — sem padding as colunas encostam umas nas outras. */
.perth-table { overflow-x: auto; margin: 1.6em 0; }
.perth-table table { border-collapse: collapse; width: 100%; }
.perth-table th,
.perth-table td { padding: 0.45em 0.9em; border-bottom: 1px solid rgba(128,128,128,.22); text-align: left; vertical-align: top; }
.perth-table thead th { border-bottom: 2px solid rgba(128,128,128,.45); }
.perth-table td + td, .perth-table th + th { white-space: nowrap; }
.perth-table td:first-child, .perth-table th:first-child { white-space: normal; }
</style>

---

## 1. O que é o Perth.jl

O Perth.jl é um **motor de caminho crítico (CPM) em Julia, com uma interface web local acoplada**. A frase que resume o projeto é: o modelo e o cálculo vivem em Julia; o navegador é *uma vista* do plano, não a fonte da verdade.

Na prática, isso significa três coisas:

1. **Você monta o plano em código.** Tarefas, dependências, responsáveis, prazos — tudo com funções normais de Julia, versionáveis no git como qualquer script.
2. **Você faz perguntas ao plano.** `schedule!`, `critical_path`, `slack`, `workload`, `pert_finish` devolvem linhas compatíveis com [Tables.jl](https://github.com/JuliaData/Tables.jl) — ou seja, caem direto num `DataFrame`, num CSV, num gráfico.
3. **Você (e sua equipe) edita no navegador.** `Perth.run()` sobe um servidor local no espírito do [Pluto.jl](https://plutojl.org/): arrastar uma barra no Gantt altera o objeto no REPL, e alterar o objeto no REPL recarrega o navegador. É o mesmo dado, ao vivo, nos dois lados.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/perth-ui-pt.jpg" alt="Interface web do Perth.jl mostrando um gráfico de Gantt com estrutura analítica de projeto, barras de tarefas, setas de dependência e painel lateral" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura 1:</strong> a interface do Perth.jl no navegador. A mesma tela existe em cinco idiomas (português, inglês, espanhol, francês e chinês) e edita o mesmo projeto que está aberto no REPL.
  </figcaption>
</figure>

O pacote é MIT, exige Julia ≥ 1.10 e não tem nenhum passo de build no front-end: nada de `node_modules`, nada de framework. O navegador recebe HTML, CSS e JavaScript puros servidos pelo próprio Julia.

---

## 2. Os conceitos por trás

Vale gastar alguns parágrafos com o vocabulário, porque ele é o que dá sentido a cada função da API. Quem já conhece CPM pode pular para a seção 3.

### 2.1 Tarefa, EAP e rolagem

A unidade é a **tarefa**: um nome, uma data de início, uma duração, opcionalmente um responsável, um custo, um esforço e um percentual concluído. Tarefas se organizam em hierarquia através do campo `parent`, formando a **EAP** (Estrutura Analítica do Projeto, ou WBS em inglês).

Uma tarefa que tem filhas vira **resumo**: sua data e sua duração deixam de ser digitadas e passam a ser calculadas a partir das filhas. É por isso que, no exemplo mais adiante, a fase "1. Coleta e preparação" nasce com `duration = 1` e termina com 28 dias — ninguém digitou 28.

### 2.2 Dependências: quatro maneiras de dizer "depois"

A dependência padrão é **término-início**: a tarefa B só começa quando A terminar. Mas a vida real precisa de mais nuance, e o Perth aceita as variantes clássicas na própria string do identificador:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">a</span>.<span class="code-variable">id</span><span class="code-paren">]</span>           <span class="code-comment"># término-início: b começa depois que a termina</span>
<span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"$(a.id)+3"</span><span class="code-paren">]</span>    <span class="code-comment"># término-início com 3 dias de defasagem (lag)</span>
<span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"SS:$(a.id)"</span><span class="code-paren">]</span>   <span class="code-comment"># início-início: b começa quando a começa</span>
<span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"SS:$(a.id)+2"</span><span class="code-paren">]</span> <span class="code-comment"># início-início com 2 dias de defasagem</span>
<span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"FF:$(a.id)"</span><span class="code-paren">]</span>   <span class="code-comment"># término-término: b não pode terminar antes de a</span></code></pre>
  </div>
</div>

A defasagem (*lag*) é o número depois do `+`. O início-início com defasagem é especialmente útil para trabalho que "acompanha" outro: o ajuste de um modelo pode começar dois dias depois que a análise descritiva começou, sem esperar ela acabar.

### 2.3 CPM: as duas passadas

`schedule!(p)` roda o **Método do Caminho Crítico**. São duas varreduras do grafo de dependências.

Na **passada para frente**, cada tarefa é empurrada para o mais cedo que ela pode acontecer:

$$
ES_j = \max_{i \to j} \left( EF_i \right) + 1,
\qquad
EF_j = ES_j + d_j - 1
$$

Na **passada para trás**, partindo do fim do projeto, calcula-se o mais tarde que cada tarefa pode acontecer sem atrasar o todo:

$$
LF_i = \min_{i \to j} \left( LS_j \right) - 1,
\qquad
LS_i = LF_i - d_i + 1
$$

A diferença entre as duas é a **folga**:

$$
\text{folga}_i = LS_i - ES_i
$$

Tarefas com folga zero não podem escorregar um dia sequer sem empurrar a entrega: são o **caminho crítico**. É a informação que uma figura de cronograma nunca dá de graça.

Um detalhe importante do Perth: `schedule!` só empurra tarefas para frente, nunca puxa para trás. A data que você digitou funciona como restrição de *"não antes de"*. Isso evita que o motor invente para você um plano que começa antes do que a realidade permite.

### 2.4 Prazo não é o mesmo que data

Aqui está a decisão de projeto que mais muda a experiência de uso. Existem dois tipos de compromisso, e o Perth trata cada um do seu jeito:

- **`deadline`** — um prazo assumido com alguém de fora (a submissão do congresso, a entrega ao cliente). Ele **nunca move uma tarefa**. O que ele faz é limitar a passada para trás: se o plano não cabe, a folga da tarefa e de tudo que a alimenta fica **negativa**. O atraso aparece como número, em vez de sumir num arraste de barra.
- **`pinned`** — uma data contratada que já não se negocia (a reunião marcada, o dia da coleta em campo). O `schedule!` a deixa quieta; se o resto do plano deixou de caber a partir dali, isso aparece como um `early_start` posterior ao início da tarefa.

### 2.5 Dias úteis

Com o [BusinessDays.jl](https://github.com/JuliaFinance/BusinessDays.jl) carregado, `set_calendar!(p, "Brazil")` faz o motor contar durações em **dias úteis**, feriados nacionais incluídos. Uma tarefa de cinco dias que começa numa quinta termina na quarta seguinte, e o 2 de novembro não conta.

### 2.6 Recursos: capacidade e esforço

Cada pessoa pode declarar uma `capacity` — quanto trabalho ela absorve num dia útil — e cada tarefa um `effort`, na mesma unidade. Com os dois números, `workload(p)` devolve a carga diária por pessoa e `overallocations(p)` aponta os dias em que alguém foi alocado além do que cabe. `level!(p)` vai além e reprograma: empurra o que tem folga até ninguém estourar a capacidade, começando por quem tem *mais* folga — de modo que o caminho crítico e as tarefas com prazo são as últimas a ceder.

### 2.7 PERT: quando a duração é um chute

Duração é quase sempre uma estimativa. O PERT formaliza isso pedindo três números por tarefa — otimista $o$, mais provável $m$ e pessimista $p$ — e resumindo-os numa duração esperada e num desvio padrão:

$$
t_e = \frac{o + 4m + p}{6},
\qquad
\sigma = \frac{p - o}{6}
$$

A variância se acumula ao longo do caminho crítico, e o término do projeto passa a ter uma distribuição em vez de uma data:

$$
\sigma_{\text{projeto}} = \sqrt{\sum_{i \,\in\, \text{crítico}} \sigma_i^2},
\qquad
P(\text{término} \le D) = \Phi\!\left( \frac{D - E}{\sigma_{\text{projeto}}} \right)
$$

O Perth implementa a fórmula clássica (`pert_finish`, `finish_probability`, `pert_date`) e também uma **simulação de Monte Carlo** (`pert_simulate`) que sorteia durações de todas as tarefas estimadas e roda o CPM milhares de vezes. A diferença entre as duas respostas é instrutiva, e vamos ver isso acontecer no exemplo.

---

## 3. Instalação

O pacote está no registro geral, então:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Pkg</span>
<span class="code-function">Pkg</span>.<span class="code-function">add</span><span class="code-paren">(</span><span class="code-string">"Perth"</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Três dependências são opcionais e detectadas automaticamente — o pacote funciona sem elas, e ganha recursos com elas:

<div class="perth-table" markdown="1">

| Pacote | O que habilita |
|---|---|
| `BusinessDays` | calendários de dias úteis (`set_calendar!(p, "Brazil")`) |
| `CairoMakie` | figuras estáticas do Gantt (`ganttplot`, `save_chart`) |
| `QRCoders` | QR code do link quando você compartilha na rede local |

</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">Pkg</span>.<span class="code-function">add</span><span class="code-paren">(</span><span class="code-paren">[</span><span class="code-string">"BusinessDays"</span>, <span class="code-string">"CairoMakie"</span>, <span class="code-string">"QRCoders"</span><span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

Para abrir a interface:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Perth</span>

<span class="code-function">Perth</span>.<span class="code-function">run</span><span class="code-paren">(</span><span class="code-paren">)</span>          <span class="code-comment"># abre http://localhost:8123 no navegador</span></code></pre>
  </div>
</div>

E um plano mínimo, só para sentir a API:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">Perth</span>

<span class="code-variable">p</span> <span class="code-operator">=</span> <span class="code-function">create_project</span><span class="code-paren">(</span><span class="code-string">"Meu primeiro plano"</span><span class="code-paren">)</span>

<span class="code-variable">a</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Escrever o roteiro"</span>; <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">9</span>, <span class="code-number">1</span><span class="code-paren">)</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">5</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span><span class="code-paren">)</span>
<span class="code-variable">b</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Gravar"</span>;             <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">3</span>, <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">a</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span><span class="code-paren">)</span>
<span class="code-variable">c</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Editar"</span>;             <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">4</span>, <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">b</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span><span class="code-paren">)</span>

<span class="code-function">schedule!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>
<span class="code-function">project_finish</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

---

## 4. Como funciona por dentro

A arquitetura cabe em um desenho:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">arquitetura</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>REPL  ──►  AppState (memória + contador de revisão)  ◄──  API HTTP
             │                                                  ▲
             ▼                                                  │
      JSON em ~/.perth                                  Navegador (JS/CSS puros)
      espelho .perth.jl                                 presença via WebSocket</code></pre>
  </div>
</div>

O estado do projeto vive em memória, num `AppState` com um contador de revisão. O REPL escreve nele chamando as funções da API; o navegador escreve nele por HTTP. O contador de revisão é o que faz o navegador perceber que algo mudou do outro lado e recarregar — e o WebSocket carrega a presença (os cursores de quem mais está olhando o plano).

Em disco, cada projeto é um JSON em `~/.perth/` (mude com a variável `PERTH_DATA_DIR` ou com `Perth.run(data_dir = ...)`). Além dele, existe o formato `.perth.jl`, que é o plano escrito como código Julia legível — feito para entrar no git e produzir *diffs* que uma pessoa consegue ler:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">Perth</span>.<span class="code-function">save</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"planos/estudo.perth.jl"</span><span class="code-paren">)</span>   <span class="code-comment"># texto legível, versionável no git</span>
<span class="code-variable">q</span> <span class="code-operator">=</span> <span class="code-function">Perth</span>.<span class="code-function">load</span><span class="code-paren">(</span><span class="code-string">"planos/estudo.perth.jl"</span><span class="code-paren">)</span>  <span class="code-comment"># leitor restrito, sem eval</span>

<span class="code-function">set_file_path!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"planos/estudo.perth.jl"</span><span class="code-paren">)</span>   <span class="code-comment"># espelho automático a cada mudança</span></code></pre>
  </div>
</div>

O leitor de `.perth.jl` é restrito: ele aceita apenas os construtores do próprio pacote (`Project`, `GanttTask`, `Person`, `Date` e alguns outros) e **não usa `eval`**. Abrir o arquivo de um colega não executa o código dele.

E como toda função de consulta devolve linhas Tables.jl, o plano conversa com o resto do ecossistema sem adaptador:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">CSV</span>, <span class="code-function">DataFrames</span>

<span class="code-function">CSV</span>.<span class="code-function">write</span><span class="code-paren">(</span><span class="code-string">"tarefas.csv"</span>, <span class="code-function">DataFrame</span><span class="code-paren">(</span><span class="code-function">tasktable</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span><span class="code-paren">)</span><span class="code-paren">)</span>
<span class="code-function">write</span><span class="code-paren">(</span><span class="code-string">"submissao.ics"</span>, <span class="code-function">icalendar</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span><span class="code-paren">)</span>       <span class="code-comment"># marcos e prazos no calendário</span></code></pre>
  </div>
</div>

---

## 5. Exemplo real: um estudo de tempos de atendimento

Vamos ao caso concreto. Um pronto-socorro autorizou um estudo sobre **tempos de atendimento**: extrair os registros do sistema, descrever os tempos, ajustar um modelo de filas M/M/c, simular cenários de escala e escrever o artigo. A equipe tem três pessoas. Existe um compromisso externo: a **submissão ao congresso em 30 de outubro de 2026**.

A pergunta que o cronograma precisa responder não é "como isso fica bonito num slide". É: *dá para entregar?*

### 5.1 O plano

Começamos pelo projeto, pelo calendário e pela equipe. As capacidades estão em horas por dia útil, e os esforços das tarefas virão na mesma unidade:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">BusinessDays</span>, <span class="code-function">Perth</span>

<span class="code-variable">inicio</span> <span class="code-operator">=</span> <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">9</span>, <span class="code-number">1</span><span class="code-paren">)</span>
<span class="code-variable">p</span> <span class="code-operator">=</span> <span class="code-function">create_project</span><span class="code-paren">(</span><span class="code-string">"Estudo de tempos de atendimento — Pronto-socorro"</span><span class="code-paren">)</span>
<span class="code-function">set_calendar!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Brazil"</span><span class="code-paren">)</span>          <span class="code-comment"># durações passam a ser dias úteis</span>

<span class="code-function">people!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-paren">[</span>
    <span class="code-paren">(</span><span class="code-variable">name</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span>,   <span class="code-variable">role</span> <span class="code-operator">=</span> <span class="code-string">"Coordenadora"</span>, <span class="code-variable">team</span> <span class="code-operator">=</span> <span class="code-string">"Pesquisa"</span>, <span class="code-variable">capacity</span> <span class="code-operator">=</span> <span class="code-number">8</span><span class="code-paren">)</span>,
    <span class="code-paren">(</span><span class="code-variable">name</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span>, <span class="code-variable">role</span> <span class="code-operator">=</span> <span class="code-string">"Analista"</span>,     <span class="code-variable">team</span> <span class="code-operator">=</span> <span class="code-string">"Dados"</span>,    <span class="code-variable">capacity</span> <span class="code-operator">=</span> <span class="code-number">8</span><span class="code-paren">)</span>,
    <span class="code-paren">(</span><span class="code-variable">name</span> <span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-variable">role</span> <span class="code-operator">=</span> <span class="code-string">"Estatística"</span>,  <span class="code-variable">team</span> <span class="code-operator">=</span> <span class="code-string">"Pesquisa"</span>, <span class="code-variable">capacity</span> <span class="code-operator">=</span> <span class="code-number">8</span><span class="code-paren">)</span>,
<span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

A primeira fase — coleta e preparação. Repare que todas as tarefas nascem em `inicio`: é o `schedule!` do fim que vai espalhá-las pelas dependências.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">f1</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"1. Coleta e preparação"</span>; <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span><span class="code-paren">)</span>

<span class="code-variable">etica</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Protocolo e aprovação no comitê de ética"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">10</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f1</span>.<span class="code-variable">id</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">20</span><span class="code-paren">)</span>

<span class="code-variable">extrair</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Extração dos registros do sistema"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">3</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f1</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">etica</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">18</span><span class="code-paren">)</span>

<span class="code-variable">limpar</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Limpeza e checagem de consistência"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">5</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f1</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">extrair</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">30</span><span class="code-paren">)</span>

<span class="code-variable">base</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Base pronta"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">milestone</span> <span class="code-operator">=</span> <span class="code-builtin">true</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f1</span>.<span class="code-variable">id</span>, <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">limpar</span>.<span class="code-variable">id</span><span class="code-paren">]</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

A segunda fase. Aqui aparece o início-início com defasagem: o ajuste do modelo começa dois dias depois que a análise descritiva começou, porque os dois se retroalimentam. E a revisão bibliográfica é um ramo paralelo, que só precisa estar pronta a tempo da redação:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">f2</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"2. Análise"</span>; <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span><span class="code-paren">)</span>

<span class="code-variable">descritiva</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Análise descritiva dos tempos"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">4</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f2</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">base</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">24</span><span class="code-paren">)</span>

<span class="code-variable">modelo</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Ajuste do modelo de filas M/M/c"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">6</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f2</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-string">"SS:$(descritiva.id)+2"</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">42</span><span class="code-paren">)</span>

<span class="code-variable">simulacao</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Simulação de cenários de escala"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">5</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Bruno"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f2</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">modelo</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">30</span><span class="code-paren">)</span>

<span class="code-variable">biblio</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Revisão bibliográfica"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">6</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f2</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">base</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">18</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

A terceira fase, com o prazo do congresso amarrado ao marco final:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">f3</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"3. Comunicação"</span>; <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span><span class="code-paren">)</span>

<span class="code-variable">redacao</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Redação do artigo"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">8</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Ana"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f3</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">descritiva</span>.<span class="code-variable">id</span>, <span class="code-variable">simulacao</span>.<span class="code-variable">id</span>, <span class="code-variable">biblio</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">48</span><span class="code-paren">)</span>

<span class="code-variable">revisao</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Revisão interna"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">3</span>, <span class="code-variable">assignee</span> <span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f3</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">redacao</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">effort</span> <span class="code-operator">=</span> <span class="code-number">15</span><span class="code-paren">)</span>

<span class="code-variable">submissao</span> <span class="code-operator">=</span> <span class="code-function">add_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"Submissão ao congresso"</span>;
    <span class="code-variable">start</span> <span class="code-operator">=</span> <span class="code-variable">inicio</span>, <span class="code-variable">milestone</span> <span class="code-operator">=</span> <span class="code-builtin">true</span>, <span class="code-variable">parent</span> <span class="code-operator">=</span> <span class="code-variable">f3</span>.<span class="code-variable">id</span>,
    <span class="code-variable">dependencies</span> <span class="code-operator">=</span> <span class="code-paren">[</span><span class="code-variable">revisao</span>.<span class="code-variable">id</span><span class="code-paren">]</span>, <span class="code-variable">deadline</span> <span class="code-operator">=</span> <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">10</span>, <span class="code-number">30</span><span class="code-paren">)</span><span class="code-paren">)</span>

<span class="code-function">schedule!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

### 5.2 A primeira pergunta

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">project_finish</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">saída</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>2026-11-04</code></pre>
  </div>
</div>

O plano termina em **4 de novembro**. O congresso fecha em **30 de outubro**. Já temos um problema — e, mais importante, temos um problema *medido*.

<figure style="display: flex; flex-direction: column; align-items: center; margin: 2.5em 0 2em 0;">
  <img src="/assets/images/perth-gantt-estudo.png" alt="Gráfico de Gantt do estudo de tempos de atendimento, com as três fases, as barras das tarefas, as setas de dependência e as tarefas críticas destacadas em vermelho" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);" />
  <figcaption class="img-caption-contrast">
    <strong>Figura 2:</strong> o mesmo plano renderizado com <code>save_chart(p, "gantt-estudo.png")</code>, via CairoMakie. As barras com contorno vermelho estão no caminho crítico; a única sem contorno é a revisão bibliográfica.
  </figcaption>
</figure>

### 5.3 Onde está a folga

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">DataFrames</span>

<span class="code-function">DataFrame</span><span class="code-paren">(</span><span class="code-function">slack</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="perth-table" markdown="1">

| Tarefa | Início cedo | Fim cedo | Folga | Crítica | Gargalo |
|---|---|---|---|---|---|
| Protocolo e aprovação no comitê de ética | 2026-09-01 | 2026-09-15 | −2 | sim | não |
| Extração dos registros do sistema | 2026-09-16 | 2026-09-18 | −2 | sim | não |
| Limpeza e checagem de consistência | 2026-09-21 | 2026-09-25 | −2 | sim | não |
| Base pronta | 2026-09-28 | 2026-09-28 | −2 | sim | **sim** |
| Análise descritiva dos tempos | 2026-09-29 | 2026-10-02 | −2 | sim | **sim** |
| Revisão bibliográfica | 2026-09-29 | 2026-10-06 | **5** | não | não |
| Ajuste do modelo de filas M/M/c | 2026-10-01 | 2026-10-08 | −2 | sim | não |
| Simulação de cenários de escala | 2026-10-09 | 2026-10-16 | −2 | sim | não |
| Redação do artigo | 2026-10-19 | 2026-10-28 | −2 | sim | não |
| Revisão interna | 2026-10-29 | 2026-11-03 | −2 | sim | não |
| Submissão ao congresso | 2026-11-04 | 2026-11-04 | −2 | sim | não |

</div>

Três leituras dessa tabela:

**A folga negativa é o prazo falando.** Nenhuma tarefa foi movida por causa do `deadline` — o plano é exatamente o mesmo. O que mudou é que a passada para trás agora tem um teto: 30 de outubro. Toda a cadeia que desemboca na submissão está **dois dias úteis atrasada**, e o número aparece em cada linha, não só na última.

**Uma única tarefa tem folga.** A revisão bibliográfica pode escorregar cinco dias úteis sem consequência nenhuma. É a única coisa do plano que dá para despriorizar sem custo — e isso não era óbvio olhando o Gantt.

**O gargalo tem nome.** A coluna `bottleneck` marca tarefas críticas das quais mais de uma outra depende. "Base pronta" e "Análise descritiva" são os dois pontos onde um atraso não se propaga por um caminho, e sim por dois. São os lugares onde vale colocar atenção antes de acontecer.

E o atraso, em dias de calendário:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">deadline_slip</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">saída</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>1-element Vector{NamedTuple}:
 (id = "93a7d306", name = "Submissão ao congresso", deadline = Date("2026-10-30"),
  finish = Date("2026-11-04"), slip_days = 5)</code></pre>
  </div>
</div>

Repare na diferença entre os dois números: a folga é **−2 dias úteis** e o atraso é **5 dias corridos**. Não há contradição — entre 30 de outubro (sexta) e 4 de novembro há cinco dias de calendário, mas apenas dois dias úteis, porque 2 de novembro é feriado. A folga do CPM é medida no calendário do projeto; o atraso, no calendário da vida.

### 5.4 Quem está sobrecarregado

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">overallocations</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">saída</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>1-element Vector{NamedTuple}:
 (assignee = "Clara",
  task1 = "026b2caf", task1_name = "Análise descritiva dos tempos",
  task2 = "4b5172e8", task2_name = "Ajuste do modelo de filas M/M/c",
  from = Date("2026-10-01"), to = Date("2026-10-02"))</code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">filter</span><span class="code-paren">(</span><span class="code-variable">r</span> <span class="code-operator">-&gt;</span> <span class="code-variable">r</span>.<span class="code-variable">assignee</span> <span class="code-operator">=</span><span class="code-operator">=</span> <span class="code-string">"Clara"</span>, <span class="code-function">workload</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span><span class="code-paren">)</span> <span class="code-operator">|</span><span class="code-operator">&gt;</span> <span class="code-function">DataFrame</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">saída</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>  assignee   date        tasks   effort   capacity   over
  Clara      2026-09-29      1      6.0        8.0    false
  Clara      2026-09-30      1      6.0        8.0    false
  Clara      2026-10-01      2     13.0        8.0    true
  Clara      2026-10-02      2     13.0        8.0    true
  Clara      2026-10-05      1      7.0        8.0    false
  ...</code></pre>
  </div>
</div>

Clara tem capacidade de 8 horas por dia útil. Nos dias 1 e 2 de outubro, a análise descritiva (6 h/dia) e o ajuste do modelo (7 h/dia) se sobrepõem: **13 horas em um dia de 8**. A sobreposição foi criada por nós, quando escrevemos `"SS:$(descritiva.id)+2"` — a dependência início-início é conveniente para o cronograma e desconfortável para quem executa. O plano parecia razoável; a conta não fecha.

### 5.5 E se a duração for um chute?

Até aqui as durações foram tratadas como fatos. Não são. "Aprovação no comitê de ética em 10 dias" é otimismo institucionalizado, e "extração dos registros em 3 dias" depende de um setor de TI que ninguém controla. Vamos declarar as três pontas:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">set_estimate!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">etica</span>.<span class="code-variable">id</span>,    <span class="code-number">8</span>, <span class="code-number">10</span>, <span class="code-number">20</span><span class="code-paren">)</span>   <span class="code-comment"># otimista, mais provável, pessimista</span>
<span class="code-function">set_estimate!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">extrair</span>.<span class="code-variable">id</span>,  <span class="code-number">2</span>,  <span class="code-number">3</span>, <span class="code-number">10</span><span class="code-paren">)</span>
<span class="code-function">set_estimate!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">modelo</span>.<span class="code-variable">id</span>,   <span class="code-number">4</span>,  <span class="code-number">6</span>, <span class="code-number">14</span><span class="code-paren">)</span>
<span class="code-function">set_estimate!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">redacao</span>.<span class="code-variable">id</span>,  <span class="code-number">5</span>,  <span class="code-number">8</span>, <span class="code-number">15</span><span class="code-paren">)</span>

<span class="code-function">schedule!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>
<span class="code-function">pert</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span> <span class="code-operator">|</span><span class="code-operator">&gt;</span> <span class="code-function">DataFrame</span></code></pre>
  </div>
</div>

<div class="perth-table" markdown="1">

| Tarefa | $o$ | $m$ | $p$ | $t_e$ | $\sigma$ | Duração no plano |
|---|---|---|---|---|---|---|
| Protocolo e aprovação no comitê de ética | 8 | 10 | 20 | 11,33 | 2,00 | 11 |
| Extração dos registros do sistema | 2 | 3 | 10 | 4,00 | 1,33 | 4 |
| Ajuste do modelo de filas M/M/c | 4 | 6 | 14 | 7,00 | 1,67 | 7 |
| Redação do artigo | 5 | 8 | 15 | 8,67 | 1,67 | 9 |

</div>

Por padrão, `set_estimate!` já aplica a duração esperada ao plano (passe `apply = false` para só registrar a estimativa). E isso, sozinho, já entrega um recado: **o plano original era otimista em toda tarefa estimada**. As caudas pessimistas são longas o bastante para puxar cada $t_e$ acima do "mais provável" que tínhamos digitado.

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">pert_finish</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">saída</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>(expected = Date("2026-11-10"), sd_days = 3.3665, variance = 11.333,
 critical = 10, estimated = 4)</code></pre>
  </div>
</div>

O término esperado escorregou de 4 para **10 de novembro**, com desvio padrão de 3,4 dias. Agora dá para fazer a pergunta que interessa:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">finish_probability</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">10</span>, <span class="code-number">30</span><span class="code-paren">)</span><span class="code-paren">)</span>   <span class="code-comment"># a data que prometemos</span>
<span class="code-function">finish_probability</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-function">Date</span><span class="code-paren">(</span><span class="code-number">2026</span>, <span class="code-number">11</span>, <span class="code-number">20</span><span class="code-paren">)</span><span class="code-paren">)</span>
<span class="code-function">pert_date</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-number">0.8</span><span class="code-paren">)</span>                          <span class="code-comment"># a data que dá para prometer</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">saída</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>0.0005
0.9985
2026-11-13</code></pre>
  </div>
</div>

A probabilidade de cumprir o prazo de 30 de outubro é de **0,05%**. Não é "difícil": é não. E a data que dá para prometer com 80% de confiança é **13 de novembro** — duas semanas depois do combinado. Esse é o número que se leva para uma conversa com o orientador ou com o cliente, porque ele não é uma opinião sobre otimismo alheio.

Vale ainda comparar a fórmula com a simulação:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-variable">sim</span> <span class="code-operator">=</span> <span class="code-function">pert_simulate</span><span class="code-paren">(</span><span class="code-variable">p</span>; <span class="code-variable">n</span> <span class="code-operator">=</span> <span class="code-number">10_000</span><span class="code-paren">)</span>

<span class="code-paren">(</span><span class="code-variable">sim</span>.<span class="code-variable">p10</span>, <span class="code-variable">sim</span>.<span class="code-variable">p50</span>, <span class="code-variable">sim</span>.<span class="code-variable">p80</span>, <span class="code-variable">sim</span>.<span class="code-variable">p90</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">saída</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>(Date("2026-11-10"), Date("2026-11-11"), Date("2026-11-16"), Date("2026-11-17"))</code></pre>
  </div>
</div>

A fórmula clássica dá P80 em **13 de novembro**; o Monte Carlo dá **16 de novembro**. A diferença tem nome: **viés de convergência** (*merge bias*). A fórmula propaga variância apenas ao longo do caminho crítico de hoje; a simulação sorteia todos os caminhos, e um ramo paralelo com pouca folga e estimativa larga tem chance real de virar o crítico. Sempre que houver caminhos quase críticos, a fórmula é otimista — e o tamanho dessa diferença é uma medida direta de quanto o plano depende de tudo dar certo em paralelo.

### 5.6 O que muda se aquilo atrasar?

A pergunta do começo do post, agora respondida em duas linhas:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">update_task!</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-variable">extrair</span>.<span class="code-variable">id</span>; <span class="code-variable">duration</span> <span class="code-operator">=</span> <span class="code-number">8</span><span class="code-paren">)</span>   <span class="code-comment"># a extração empacou no TI</span>
<span class="code-function">schedule!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>

<span class="code-function">project_finish</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>
<span class="code-function">deadline_slip</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">saída</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code>2026-11-16

1-element Vector{NamedTuple}:
 (id = "93a7d306", name = "Submissão ao congresso", deadline = Date("2026-10-30"),
  finish = Date("2026-11-16"), slip_days = 17)</code></pre>
  </div>
</div>

A extração passando de 3 para 8 dias joga a submissão para 16 de novembro: **17 dias de atraso** sobre o prazo. O `update_task!` percorreu a cadeia inteira sem que ninguém redesenhasse nada.

É aqui que o Perth deixa de ser um desenhador de Gantt. O cronograma responde porque ele é dado, e não figura.

### 5.7 Levando o plano para a equipe

Com o plano fechado, `Perth.run()` abre a mesma coisa no navegador — e, se a equipe estiver na mesma rede, dá para compartilhar:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">Perth</span>.<span class="code-function">run</span><span class="code-paren">(</span><span class="code-variable">share</span> <span class="code-operator">=</span> <span class="code-builtin">true</span><span class="code-paren">)</span>          <span class="code-comment"># publica o Gantt na rede local, com QR code</span>
<span class="code-function">Perth</span>.<span class="code-function">key!</span><span class="code-paren">(</span><span class="code-string">"estudo-2026"</span><span class="code-paren">)</span>        <span class="code-comment"># exige chave de acesso para editar</span>
<span class="code-function">Perth</span>.<span class="code-function">view_key!</span><span class="code-paren">(</span><span class="code-string">"estudo-2026-v"</span><span class="code-paren">)</span> <span class="code-comment"># link só de leitura, para mostrar ao orientador</span>
<span class="code-function">Perth</span>.<span class="code-function">share!</span><span class="code-paren">(</span><span class="code-builtin">false</span><span class="code-paren">)</span>              <span class="code-comment"># desliga a transmissão sem derrubar o servidor</span></code></pre>
  </div>
</div>

Cada máquina conectada aparece como um cursor com nome e IP, no estilo de programação em par, e há um chat integrado. Também dá para virar o plano em quadro Kanban:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-function">kanban_from_project!</span><span class="code-paren">(</span><span class="code-variable">p</span><span class="code-paren">)</span>          <span class="code-comment"># cada tarefa do plano vira um cartão</span>
<span class="code-function">Perth</span>.<span class="code-function">kanban</span><span class="code-paren">(</span><span class="code-variable">share</span> <span class="code-operator">=</span> <span class="code-builtin">true</span><span class="code-paren">)</span>       <span class="code-comment"># quadro colaborativo na rede local</span></code></pre>
  </div>
</div>

Cartões vindos do plano ficam **ligados** à tarefa de origem: arrastar um cartão para "concluído" completa a tarefa correspondente no Gantt, ao vivo.

E a figura da seção 5.2 sai com duas linhas:

<div class="code-container">
  <div class="code-header">
    <div class="code-lang">julia</div>

    <button class="copy-button" onclick="copyCode(this)" aria-label="Copiar código">
      Copiar
    </button>
  </div>

  <div class="code-content">
    <pre><code><span class="code-keyword">using</span> <span class="code-module">CairoMakie</span>

<span class="code-function">save_chart</span><span class="code-paren">(</span><span class="code-variable">p</span>, <span class="code-string">"gantt-estudo.png"</span><span class="code-paren">)</span></code></pre>
  </div>
</div>

---

## 6. O que o Perth.jl não é

Ser honesto sobre limites economiza frustração:

- **Não é multiusuário por identidade.** O controle de acesso é por rede e por chave, não por login. Duas pessoas editando o mesmo campo resolvem no *último a escrever vence*.
- **Não deve ser exposto à internet.** É uma ferramenta de rede local, para uma sala de gente que já confia uma na outra. Não coloque a porta 8123 num IP público.
- **Não faz nivelamento de recursos automático.** `level!` existe e é uma heurística defensável (menor folga primeiro), mas nivelamento é um problema NP-difícil: o resultado é bom, não é ótimo.
- **Não substitui MS Project ou Primavera** em organizações que precisam de governança corporativa, múltiplos calendários por recurso e trilha de auditoria formal. O alvo é outro: quem já trabalha em Julia e quer que o cronograma seja mais um objeto no `workspace`.

---

## 7. Para continuar

O Perth.jl está no registro geral (`] add Perth`) e o código, os exemplos comentados e o changelog estão no repositório:

- **Repositório:** [github.com/dantebertuzzi/Perth.jl](https://github.com/dantebertuzzi/Perth.jl)
- **Anúncio e discussão:** [tópico no Discourse do Julia](https://discourse.julialang.org/t/ann-perth-jl-project-schedules-you-can-compute-on-with-a-browser-ui-attached/138797)
- **Pacote:** [Perth no JuliaHub](https://juliahub.com/ui/Packages/General/Perth)

Sugestões, dúvidas e relatos de uso são muito bem-vindos — abra uma *issue* no repositório ou comente aqui embaixo.
