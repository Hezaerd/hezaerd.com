# Marion — modèles AI Gateway (recherche)

**Research note · 2026-08-03 · Part of [#31](https://github.com/hezaerd/hezaerd.com/issues/31)**

Scope : choix de modèles pour faire tourner **Marion v1** maintenant — chat Discord operator (tools Desk), résumés session Convex, embeddings RAG/threads. Tout passe par **Vercel AI Gateway** (`@ai-sdk/gateway`), pas d’appels OpenAI directs.

Sources : [catalogue Gateway REST](https://ai-gateway.vercel.sh/v1/models) (snapshot 2026-08-03), [Models & Providers](https://vercel.com/docs/ai-gateway/models-and-providers), [AI SDK Gateway provider](https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway), [Eve pricing (#35 research)](../portal/docs/research/colleague-eve-vercel-pricing-limits.md).

---

## Executive summary

| Rôle | Modèle recommandé | Alternative budget | Pourquoi |
|------|-------------------|--------------------|----------|
| **Chat Discord + tools** | `openai/gpt-5.4-mini` | `openai/gpt-4o-mini` | Spec #35 / default Eve ; bon tool-use ; 400k ctx ; fallback Gateway vers 4o-mini |
| **Résumés session (cron)** | `openai/gpt-5.4-nano` | `openai/gpt-4o-mini` | Background cheap ; qualité suffisante pour puces mémoire |
| **Embeddings RAG + threads** | `openai/text-embedding-3-small` | — | 1536 dims déjà indexées ; `$0.02/M` tokens Gateway ; ne pas changer sans migration vector |

**Une seule clé** : `AI_GATEWAY_API_KEY` (Marion Vercel + Convex). Plus de `OPENAI_API_KEY`.

Estimation coût modèles seuls (volume low de #35) : **~$1–5/mo** tokens ; le reste = fee Vercel Pro + infra Eve.

---

## Architecture modèles

```text
Discord / Eve (apps/marion)
  └─ model string → AI Gateway (AI_GATEWAY_API_KEY ou OIDC Vercel prod)
       └─ openai/gpt-5.4-mini (+ fallback openai/gpt-4o-mini)

Convex (packages/backend)
  └─ createGateway({ apiKey: AI_GATEWAY_API_KEY })
       ├─ chat summarize → openai/gpt-5.4-nano
       └─ embed → openai/text-embedding-3-small → RAG + colleagueMessages vector
```

Eve route déjà les model IDs `creator/model` via Gateway en prod ([Eve model resolution](https://vercel.com/docs/eve/pricing)). Convex n’est pas sur Vercel → **obligatoire** d’utiliser `@ai-sdk/gateway` + clé API dans les env Convex.

---

## Catalogue — candidats évalués (Gateway, 2026-08-03)

Prix = USD **par token** (input / output) depuis `GET https://ai-gateway.vercel.sh/v1/models`.

### Chat operator (tools + français + Desk)

| Modèle | Input | Output | Contexte | Notes Marion |
|--------|-------|--------|----------|--------------|
| **`openai/gpt-5.4-mini`** ✅ | $0.75/M | $4.5/M | 400k | **Default prod** — aligné spec #35, Eve scaffold |
| `openai/gpt-4o-mini` ✅ fb | $0.15/M | $0.6/M | 128k | **Fallback** — éprouvé, moins cher, ctx plus court |
| `openai/gpt-5.4-nano` | $0.2/M | $1.25/M | 400k | Trop léger pour tools complexes ; OK en summarize |
| `openai/gpt-5.6-luna` | $0.2/M | $1.2/M | 1M | Très cheap ; qualité tool FR non validée ici |
| `google/gemini-2.5-flash-lite` | $0.1/M | $0.4/M | 1M | Moins cher que 4o-mini ; routing Google |
| `anthropic/claude-haiku-4.5` | $1/M | $5/M | 200k | ~5× plus cher que 5.4-mini input ; bon FR |

**Non retenus v1** : `gpt-5.4` / Sonnet / Opus (overkill operator solo), modèles reasoning lents (digest latency), modèles free tier (`ling-3.0-flash-free`) — dispo instable pour prod.

### Résumés session (background, ~15 min cron)

| Modèle | Input | Output | Verdict |
|--------|-------|--------|---------|
| **`openai/gpt-5.4-nano`** ✅ | $0.2/M | $1.25/M | **Default** — tâche structurée, pas de tools |
| `openai/gpt-4o-mini` | $0.15/M | $0.6/M | OK si nano indispo |

### Embeddings

| Modèle | Input | Dims | Verdict |
|--------|-------|------|---------|
| **`openai/text-embedding-3-small`** ✅ | $0.02/M | 1536 | **Default** — index vector Convex existant |
| `google/text-multilingual-embedding-002` | $0.025/M | ? | Meilleur multilingue possible mais **migration dims** |
| `openai/text-embedding-3-large` | $0.13/M | 3072 | 6× plus cher ; pas utile v1 |

---

## Recommandation opérationnelle

### Démarrer maintenant (prod)

```bash
# Marion Vercel + Convex
AI_GATEWAY_API_KEY=...

# Optionnel — defaults dans le code si absent
MARION_CHAT_MODEL=openai/gpt-5.4-mini
MARION_CHAT_MODEL_FALLBACK=openai/gpt-4o-mini
MARION_SUMMARIZE_MODEL=openai/gpt-5.4-nano
MARION_EMBEDDING_MODEL=openai/text-embedding-3-small
```

### Dev local

1. Créer une clé sur [AI Gateway → API Keys](https://vercel.com/d?to=/%5Bteam%5D/%7E/ai-gateway)
2. `apps/marion/.env.local` : `AI_GATEWAY_API_KEY=...`
3. Convex dashboard : même clé + `MARION_SERVICE_SECRET`
4. `bun run dev:backend` + `bun run dev:marion`

Eve valide la clé au setup ([`AI_GATEWAY_API_KEY`](https://vercel.com/docs/eve/pricing)). En prod Vercel, OIDC peut remplacer la clé ; `AI_GATEWAY_API_KEY` reste prioritaire.

### Upgrade path (si 5.4-mini frustrante)

1. Monter chat → `openai/gpt-5.4` (5× input cost) pour une semaine de test
2. Ou swap → `google/gemini-2.5-flash-lite` si latence/coût prime
3. Garder fallback `gpt-4o-mini` dans `modelOptions.gateway.models`

### Ce qu’il ne faut pas faire v1

- Changer d’embedding sans migration vector index
- Modèle reasoning (`o3`, `thinking`) pour digest matin — latence + coût
- BYOK OpenAI direct — une clé Gateway suffit, 0% markup ([pricing](https://vercel.com/docs/ai-gateway/pricing))

---

## Implémentation repo

| Fichier | Rôle |
|---------|------|
| `packages/backend/convex/lib/marion/gateway.ts` | `createGateway` + IDs modèles |
| `packages/backend/convex/lib/marion/rag.ts` | RAG embeddings via Gateway |
| `apps/marion/agent/agent.ts` | Eve chat model + fallback Gateway |
| `apps/marion/agent/lib/models.ts` | Env overrides chat |

---

## Sources

| Source | URL |
|--------|-----|
| AI Gateway — models API | https://ai-gateway.vercel.sh/v1/models |
| AI Gateway — models & providers | https://vercel.com/docs/ai-gateway/models-and-providers |
| AI SDK — Gateway provider | https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway |
| Eve — pricing (Gateway meters) | https://vercel.com/docs/eve/pricing |
| Colleague cost research | `apps/portal/docs/research/colleague-eve-vercel-pricing-limits.md` |
