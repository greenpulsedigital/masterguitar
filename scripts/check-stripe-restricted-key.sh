#!/usr/bin/env bash
# Vérifie quelles opérations une clé Stripe RESTREINTE de TEST autorise (story s19).
# Usage : read -rs STRIPE_RK; export STRIPE_RK; bash scripts/check-stripe-restricted-key.sh
# La clé n'est jamais affichée. Mode TEST uniquement.
set -u

if [ -z "${STRIPE_RK:-}" ]; then echo "STRIPE_RK est vide : lance d'abord  read -rs STRIPE_RK; export STRIPE_RK"; exit 1; fi
case "$STRIPE_RK" in
  rk_test_*) ;;
  sk_test_*) echo "Attention : c'est une clé secrète COMPLÈTE de test (sk_test_), pas une clé restreinte : le test n'aurait aucun sens."; exit 1 ;;
  *_live_*)  echo "Refus : clé LIVE détectée. Utilise uniquement une clé de test (rk_test_...)."; exit 1 ;;
  *)         echo "Format de clé inattendu (attendu : rk_test_...)."; exit 1 ;;
esac

API="https://api.stripe.com/v1"
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
WH_ID=""

mask() { sed -E 's/(rk|sk|pk)_(test|live)_[A-Za-z0-9_*]+/\1_\2_***/g; s/whsec_[A-Za-z0-9_*]+/whsec_***/g'; }

# call LABEL METHOD PATH [curl -d args...] -> remplit $TMP, affiche statut + erreur Stripe éventuelle
call() {
  local label="$1" method="$2" path="$3"; shift 3
  local code
  code=$(curl -sS -o "$TMP" -w "%{http_code}" -X "$method" "$API$path" -u "$STRIPE_RK:" "$@") || { echo "[$label] erreur réseau"; return 1; }
  if [ "$code" = "200" ]; then
    printf "[OK ] %-34s HTTP %s\n" "$label" "$code"
    return 0
  fi
  printf "[REFUS] %-32s HTTP %s\n" "$label" "$code"
  python3 - "$TMP" <<'PY' | mask | sed 's/^/        /'
import json,sys
try:
    e=json.load(open(sys.argv[1])).get("error",{})
    print("type:",e.get("type")); print("code:",e.get("code")); print("message:",e.get("message"))
except Exception as ex:
    print("réponse illisible:",ex)
PY
  return 1
}
field() { python3 -c "import json,sys; d=json.load(open('$TMP')); print(d.get('$1',''))"; }

echo "== 1. Lire le compte (GET /v1/account)"
if call "lire le compte" GET /account; then
  python3 - "$TMP" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print("        champs renvoyés :", ", ".join(sorted(d.keys())))
print("        livemode présent :", "livemode" in d, "| id commence par acct_ :", str(d.get("id","")).startswith("acct_"))
PY
fi

echo "== 2. Créer une Checkout Session (POST /v1/checkout/sessions)"
SESSION=""
if call "créer une Checkout Session" POST /checkout/sessions \
  -d mode=payment \
  -d "line_items[0][price_data][currency]=eur" \
  -d "line_items[0][price_data][product_data][name]=Test s19" \
  -d "line_items[0][price_data][unit_amount]=1000" \
  -d "line_items[0][quantity]=1" \
  -d "success_url=https://example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}" \
  -d "cancel_url=https://example.com/cancel"; then SESSION="$(field id)"; fi

echo "== 3. Relire la Checkout Session (GET /v1/checkout/sessions/{id})"
if [ -n "$SESSION" ]; then call "lire la Checkout Session" GET "/checkout/sessions/$SESSION"; else echo "[SKIP] pas de session créée à l'étape 2"; fi

echo "== 4. Créer un endpoint webhook (POST /v1/webhook_endpoints)"
if call "créer un endpoint webhook" POST /webhook_endpoints \
  -d "url=https://example.com/api/webhooks/stripe/test-s19" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=checkout.session.async_payment_succeeded"; then
  WH_ID="$(field id)"
  python3 - "$TMP" <<'PY'
import json,sys
d=json.load(open(sys.argv[1])); s=d.get("secret")
print("        secret de signature renvoyé à la création :", "OUI (longueur %d, préfixe %s)"%(len(s), s[:6]) if s else "NON")
PY
fi

echo "== 5. Relire l'endpoint (GET /v1/webhook_endpoints/{id})"
if [ -n "$WH_ID" ]; then
  if call "lire l'endpoint webhook" GET "/webhook_endpoints/$WH_ID"; then
    python3 - "$TMP" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print("        secret renvoyé à la relecture :", "OUI (inattendu)" if d.get("secret") else "NON (conforme : il n'est donné qu'à la création)")
PY
  fi
else echo "[SKIP] pas d'endpoint créé à l'étape 4"; fi

echo "== 6. Lister les endpoints (GET /v1/webhook_endpoints)"
if call "lister les endpoints webhook" GET "/webhook_endpoints?limit=100"; then
  python3 - "$TMP" "$WH_ID" <<'PY2'
import json,sys
d=json.load(open(sys.argv[1])); ids=[e.get("id") for e in d.get("data",[])]
print("        endpoints listés :", len(ids), "| endpoint de l'étape 4 présent :", (sys.argv[2] in ids) if sys.argv[2] else "sans objet")
print("        secret présent dans la liste :", "OUI (inattendu)" if any(e.get("secret") for e in d.get("data",[])) else "NON (conforme)")
PY2
fi

echo "== 7. Supprimer l'endpoint (DELETE /v1/webhook_endpoints/{id})"
if [ -n "$WH_ID" ]; then
  if call "supprimer l'endpoint webhook" DELETE "/webhook_endpoints/$WH_ID"; then WH_ID=""; fi
else echo "[SKIP] pas d'endpoint à supprimer"; fi

if [ -n "$WH_ID" ]; then
  echo
  echo "!! L'endpoint $WH_ID n'a PAS été supprimé : supprime-le à la main dans Stripe (mode test > Développeurs > Webhooks)."
fi
echo
echo "Terminé. Les sessions de test créées expirent seules ; rien n'a été payé."
