#!/usr/bin/env bash
# Procura subdomínios pendurados: CNAME que aponta para fora do site.
#
# Em 2026 o homepage.morrisonkuhlsen.com tinha um CNAME para
# morrisonkulsenn.github.io (outra conta, outra grafia) e chegou a servir um
# cassino indexado pelo Google sob o nosso domínio. Quem controlar o destino
# de um CNAME desses controla o subdomínio.
#
# Os nomes vêm dos logs de Certificate Transparency (crt.sh), que listam todo
# subdomínio que já ganhou certificado, somados aos de CONHECIDOS abaixo para
# o caso de o crt.sh estar fora do ar. A resolução usa o DNS do Google por
# HTTPS, para não depender do dig.
#
#     bash scripts/checa-dns.sh
#
# Sai com 1 se algum CNAME aponta para um destino fora de PERMITIDOS.
set -euo pipefail

DOMINIO="morrisonkuhlsen.com"
CONHECIDOS="homepage www"
PERMITIDOS="morrisonkuhlsen.com. morrisonkuhlsen.github.io."

nomes=""
ct=""
# O crt.sh vive sobrecarregado: três tentativas antes de desistir dele.
for tentativa in 1 2 3; do
  ct=$(curl -sf -m 90 "https://crt.sh/?q=%25.${DOMINIO}&output=json") && break
  ct=""
  sleep $((tentativa * 10))
done
if [ -n "$ct" ]; then
  nomes=$(printf '%s' "$ct" | python3 -c '
import json, sys
for c in json.load(sys.stdin):
    for n in c["name_value"].split("\n"):
        print(n.strip().lower())')
else
  echo "::warning::crt.sh não respondeu; checando só os subdomínios conhecidos."
fi
for s in $CONHECIDOS; do nomes+=$'\n'"$s.$DOMINIO"; done

falhas=0
for nome in $(printf '%s\n' "$nomes" | grep -v '^\*' | grep "\.${DOMINIO}$" | sort -u); do
  alvos=$(curl -sf -m 20 "https://dns.google/resolve?name=${nome}&type=CNAME" | python3 -c '
import json, sys
d = json.load(sys.stdin)
print(" ".join(a["data"].lower() for a in d.get("Answer", []) if a["type"] == 5))')
  if [ -z "$alvos" ]; then
    echo "ok     $nome (sem CNAME)"
    continue
  fi
  for alvo in $alvos; do
    if [[ " $PERMITIDOS " == *" $alvo "* ]]; then
      echo "ok     $nome -> $alvo"
    else
      echo "::error::$nome tem CNAME para $alvo, fora do site. Remova o registro no painel de DNS."
      falhas=1
    fi
  done
done
exit $falhas
