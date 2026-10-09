# Catálogo de testes estatísticos em português e inglês, e uma página por
# teste em cada língua (/testes-estatisticos/<id>/ e
# /en/statistical-tests/<slug>/).
#
# A estrutura vem toda de _data/testes_estatisticos.yml e
# _data/arvore_testes.yml. Os arquivos _en.yml trazem só os textos em inglês;
# daqui saem site.data["catalogo_en"] e site.data["arvore_en"], com a mesma
# forma dos portugueses (os ids viram os slugs em inglês), que as páginas em
# inglês usam no lugar deles. Falta de tradução derruba o build.
#
# Para as páginas, prepara-se o que o Liquid faria mal (links das variantes,
# caminhos na árvore, anterior e próximo) e o layout teste-estatistico.html
# monta o resto. A prioridade alta faz tudo existir antes do jekyll-sitemap,
# que roda por último.
module MK
  class PaginasTestes < Jekyll::Generator
    safe true
    priority :high

    CAMPOS_EN = %w[nome titulo quando h0 pres reporte codigo].freeze

    def generate(site)
      cat = site.data["testes_estatisticos"]
      arvore = site.data["arvore_testes"]
      return unless cat && arvore

      cat_en, arvore_en, slug = ingles(site, cat, arvore)
      site.data["catalogo_en"] = cat_en
      site.data["arvore_en"] = arvore_en

      ui = site.data["testes_ui"]
      pt = gerar(site, cat, arvore, "pt", ui["pt"], formulas(site, "pt"))
      en = gerar(site, cat_en, arvore_en, "en", ui["en"], formulas(site, "en"))
      # Cada página aponta para a versão na outra língua (hreflang).
      pt.each do |id, pagina|
        outra = en[slug[id]]
        pagina.data["traducao"] = outra.url
        outra.data["traducao"] = pagina.url
      end
    end

    private

    # Título de cada fórmula interativa da língua, pelo nome do arquivo.
    def formulas(site, lang)
      prefixo = lang == "en" ? "/en/formulas/" : "/formulas/"
      (site.data["standalone"] || []).each_with_object({}) do |f, h|
        next unless f["lang"] == lang && f["url"].start_with?(prefixo) && f["url"].end_with?(".html")
        h[f["url"].delete_prefix(prefixo).delete_suffix(".html")] = f["title"]
      end
    end

    # Fórmula em português → em inglês, lida dos hreflang das páginas em
    # inglês (que o scripts/gera-formulas-en.py escreve).
    def formulas_en(site)
      Dir[File.join(site.source, "en/formulas/*.html")].each_with_object({}) do |arq, h|
        pt = File.read(arq)[%r{hreflang="pt-BR" href="[^"]*/formulas/([\w-]+)\.html"}, 1]
        h[pt] = File.basename(arq, ".html") if pt
      end
    end

    def ingles(site, cat, arvore)
      tr = site.data["testes_estatisticos_en"] or raise "Falta _data/testes_estatisticos_en.yml"
      frases = site.data["arvore_testes_en"] or raise "Falta _data/arvore_testes_en.yml"
      fpt_en = formulas_en(site)

      slug = cat["testes"].to_h do |t|
        e = tr["testes"][t["id"]] or raise "Sem tradução para o teste #{t['id']}"
        [t["id"], e["slug"]]
      end

      testes = cat["testes"].map do |t|
        e = tr["testes"][t["id"]]
        (CAMPOS_EN + ["slug"]).each { |c| raise "#{t['id']}: falta #{c} em inglês" if e[c].nil? }
        n = Marshal.load(Marshal.dump(t))
        CAMPOS_EN.each { |c| n[c] = e[c] }
        n["id"] = e["slug"]
        n["dist"] = e["dist"] if e["dist"]
        n["tex"] = e["tex"] if e["tex"]
        if t["efeito"]
          raise "#{t['id']}: falta efeito em inglês" unless e["efeito"]
          n["efeito"] = t["efeito"].merge(e["efeito"])
        end
        raise "#{t['id']}: vars em inglês não batem" unless (e["vars"] || []).size == t["vars"].size
        n["vars"] = t["vars"].zip(e["vars"] || []).map { |(_, ref), texto| [texto, ref && slug.fetch(ref)] }
        n["page"] = fpt_en[t["page"]] if t["page"]
        n.delete("page") unless n["page"]
        n["veja"] = (t["veja"] || []).filter_map { |s| fpt_en[s] }
        n
      end

      familias = cat["familias"].to_h do |k, f|
        e = tr["familias"][k] or raise "Sem tradução para a família #{k}"
        [k, f.merge(e)]
      end
      raise "linhas em inglês não batem" unless tr["linhas"].size == cat["linhas"].size

      traduzir = lambda do |no|
        n = {}
        %w[pergunta rotulo nota].each do |c|
          next unless no[c]
          n[c] = frases[no[c]] or raise "Árvore sem tradução: #{no[c]}"
        end
        n["teste"] = slug.fetch(no["teste"]) if no["teste"]
        %w[confira depois tambem].each { |c| n[c] = no[c].map { |id| slug.fetch(id) } if no[c] }
        n["opcoes"] = no["opcoes"].map(&traduzir) if no["opcoes"]
        n
      end

      cat_en = cat.merge("familias" => familias, "linhas" => tr["linhas"], "testes" => testes)
      [cat_en, traduzir.(arvore), slug]
    end

    def gerar(site, cat, arvore, lang, ui, formulas)
      por_id = cat["testes"].to_h { |t| [t["id"], t] }
      url = ->(id) { "#{ui['base']}#{id}/" }

      # Mesma ordem de leitura da tabela (script.js): o bloco principal linha a
      # linha, depois as faixas.
      ordem = cat["testes"].select { |t| t["row"] }.sort_by { |t| [t["row"], t["col"]] } +
              cat["testes"].select { |t| t["strip"] }.sort_by { |t| [t["strip"], t["pos"]] }

      caminhos = Hash.new { |h, k| h[k] = [] }
      mencoes = Hash.new { |h, k| h[k] = Hash.new { |g, tipo| g[tipo] = [] } }
      percorrer(arvore, [], caminhos, mencoes)

      paginas = {}
      ordem.each_with_index do |t, i|
        fam = cat["familias"][t["fam"]]

        variantes = (t["vars"] || []).map do |texto, ref|
          alvo = ref && por_id[ref]
          next { "texto" => texto } unless alvo
          if texto.start_with?(alvo["nome"])
            { "link" => alvo["nome"], "url" => url[ref], "depois" => texto[alvo["nome"].length..] }
          else
            { "antes" => "#{texto}: ", "link" => alvo["nome"], "url" => url[ref] }
          end
        end

        pagina = Jekyll::PageWithoutAFile.new(site, site.source, url[t["id"]].delete_prefix("/").chomp("/"), "index.html")
        pagina.data.merge!(
          "layout" => "teste-estatistico",
          "lang" => lang,
          "title" => t["titulo"],
          "description" => "#{t['quando']} #{ui['desc_fim']}",
          "tags" => "#{ui['tags']} #{fam['nome'].downcase} #{t['nome']}",
          "ui" => ui,
          "teste" => t,
          "n" => i + 1,
          "familia" => fam,
          "linha" => t["row"] ? cat["linhas"][t["row"] - 1] : nil,
          "variantes" => variantes,
          "formula" => t["page"] && "#{ui['formulas']}#{t['page']}.html",
          "veja" => (t["veja"] || []).filter_map do |s|
            { "titulo" => formulas[s], "url" => "#{ui['formulas']}#{s}.html" } if formulas[s]
          end,
          "tabela" => tabela(t["dist"].to_s, ui),
          "caminhos" => caminhos[t["id"]],
          "mencoes" => mencoes[t["id"]].map do |tipo, ids|
            { "tipo" => ui["mencao"][tipo], "testes" => ids.map { |id| { "nome" => por_id[id]["nome"], "url" => url[id] } } }
          end,
          "anterior" => i.positive? ? { "nome" => ordem[i - 1]["nome"], "url" => url[ordem[i - 1]["id"]] } : nil,
          "proximo" => ordem[i + 1] ? { "nome" => ordem[i + 1]["nome"], "url" => url[ordem[i + 1]["id"]] } : nil
        )
        site.pages << pagina
        paginas[t["id"]] = pagina
      end
      paginas
    end

    # Desce a árvore guardando as perguntas e respostas do caminho. Uma folha
    # dá um caminho ao seu teste; os testes citados nela (confira, depois,
    # tambem) ganham uma menção a esse teste, agrupada pelo tipo.
    def percorrer(no, trilha, caminhos, mencoes)
      (no["opcoes"] || []).each do |op|
        passo = trilha + [{ "pergunta" => no["pergunta"], "resposta" => op["rotulo"] }]
        if op["teste"]
          caminhos[op["teste"]] << passo
          %w[confira depois tambem].each do |tipo|
            (op[tipo] || []).each do |id|
              lista = mencoes[id][tipo]
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
    def tabela(dist, ui)
      t = if dist.start_with?("t(") then ["t", "/ttable.html"]
          elsif dist.match?(/\AF\b/) then ["F", "/ftable.html"]
          elsif dist.start_with?("χ²") then ["χ²", "/chitable.html"]
          elsif dist.include?("N(0, 1)") then ["Z", "/ztable.html"]
          end
      t && { "nome" => ui["tabela"].sub("%", t[0]), "url" => t[1] }
    end
  end
end
