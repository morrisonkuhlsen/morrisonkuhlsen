# Uma página por teste do catálogo, em /testes-estatisticos/<id>/.
#
# Tudo sai de _data/testes_estatisticos.yml, a mesma fonte da tabela e da
# árvore; aqui só se prepara o que o Liquid faria mal (links das variantes,
# caminhos na árvore de decisão, anterior e próximo) e o layout
# teste-estatistico.html monta a página. A prioridade alta faz as páginas
# existirem antes do jekyll-sitemap, que roda por último.
module MK
  class PaginasTestes < Jekyll::Generator
    safe true
    priority :high

    # Como cada lista de uma folha da árvore se lê do lado do teste citado.
    MENCOES = {
      "confira" => "Para conferir um pressuposto antes de",
      "depois" => "Como pós-teste, se H₀ for rejeitada, depois de",
      "tambem" => "Como alternativa a",
    }.freeze

    def generate(site)
      cat = site.data["testes_estatisticos"]
      arvore = site.data["arvore_testes"]
      return unless cat

      por_id = cat["testes"].to_h { |t| [t["id"], t] }
      formulas = (site.data["standalone"] || []).to_h { |f| [f["url"], f["title"]] }

      # Mesma ordem de leitura da tabela (script.js): o bloco principal linha a
      # linha, depois as faixas.
      ordem = cat["testes"].select { |t| t["row"] }.sort_by { |t| [t["row"], t["col"]] } +
              cat["testes"].select { |t| t["strip"] }.sort_by { |t| [t["strip"], t["pos"]] }

      caminhos = Hash.new { |h, k| h[k] = [] }
      mencoes = Hash.new { |h, k| h[k] = Hash.new { |g, tipo| g[tipo] = [] } }
      percorrer(arvore, [], caminhos, mencoes) if arvore

      ordem.each_with_index do |t, i|
        fam = cat["familias"][t["fam"]]
        linha = t["row"] ? cat["linhas"][t["row"] - 1] : nil
        url = ->(id) { "/testes-estatisticos/#{id}/" }

        variantes = (t["vars"] || []).map do |texto, ref|
          alvo = ref && por_id[ref]
          next { "texto" => texto } unless alvo
          if texto.start_with?(alvo["nome"])
            { "link" => alvo["nome"], "url" => url[ref], "depois" => texto[alvo["nome"].length..] }
          else
            { "antes" => "#{texto}: ", "link" => alvo["nome"], "url" => url[ref] }
          end
        end

        veja = (t["veja"] || []).filter_map do |slug|
          u = "/formulas/#{slug}.html"
          { "titulo" => formulas[u], "url" => u } if formulas[u]
        end

        pagina = Jekyll::PageWithoutAFile.new(site, site.source, "testes-estatisticos/#{t['id']}", "index.html")
        pagina.data.merge!(
          "layout" => "teste-estatistico",
          "lang" => "pt",
          "title" => t["titulo"],
          "description" => "#{t['quando']} Veja a hipótese nula, os pressupostos, a fórmula e o código em R e Python.",
          "tags" => "teste estatístico #{fam['nome'].downcase} #{t['nome']}",
          "teste" => t,
          "n" => i + 1,
          "total" => ordem.size,
          "familia" => fam,
          "linha" => linha,
          "variantes" => variantes,
          "veja" => veja,
          "tabela" => tabela(t["dist"].to_s),
          "caminhos" => caminhos[t["id"]],
          "mencoes" => mencoes[t["id"]].map do |tipo, ids|
            { "tipo" => tipo, "testes" => ids.map { |id| { "nome" => por_id[id]["nome"], "url" => url[id] } } }
          end,
          "anterior" => i.positive? ? { "nome" => ordem[i - 1]["nome"], "url" => url[ordem[i - 1]["id"]] } : nil,
          "proximo" => ordem[i + 1] ? { "nome" => ordem[i + 1]["nome"], "url" => url[ordem[i + 1]["id"]] } : nil
        )
        site.pages << pagina
      end
    end

    private

    # Desce a árvore guardando as perguntas e respostas do caminho. Uma folha
    # dá um caminho ao seu teste; os testes citados nela (confira, depois,
    # tambem) ganham uma menção a esse teste, agrupada pelo tipo.
    def percorrer(no, trilha, caminhos, mencoes)
      (no["opcoes"] || []).each do |op|
        passo = trilha + [{ "pergunta" => no["pergunta"], "resposta" => op["rotulo"] }]
        if op["teste"]
          caminhos[op["teste"]] << passo
          MENCOES.each do |chave, rotulo|
            (op[chave] || []).each do |id|
              lista = mencoes[id][rotulo]
              lista << op["teste"] unless lista.include?(op["teste"])
            end
          end
        else
          percorrer(op, passo, caminhos, mencoes)
        end
      end
    end

    # A tabela do site com os valores críticos da distribuição de referência,
    # como em tabela() do script.js.
    def tabela(dist)
      if dist.start_with?("t(") then { "nome" => "t", "url" => "/ttable.html" }
      elsif dist.match?(/\AF\b/) then { "nome" => "F", "url" => "/ftable.html" }
      elsif dist.start_with?("χ²") then { "nome" => "χ²", "url" => "/chitable.html" }
      elsif dist.include?("N(0, 1)") then { "nome" => "Z", "url" => "/ztable.html" }
      end
    end
  end
end
