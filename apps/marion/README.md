# Marion v1 — Eve agent operator Discord

Deploy Vercel séparé du Portal. Convex partagé via `@hezaerd/backend`.

## Modèles (AI Gateway)

Recommandation détaillée : [`docs/research/marion-ai-gateway-models.md`](docs/research/marion-ai-gateway-models.md).

| Rôle | Default |
|------|---------|
| Chat Discord + tools | `openai/gpt-5.4-mini` (fallback `openai/gpt-4o-mini`) |
| Résumés session Convex | `openai/gpt-5.4-nano` |
| Embeddings RAG/threads | `openai/text-embedding-3-small` |

Tout passe par **Vercel AI Gateway** — pas d’appel OpenAI direct.

## Env (Vercel Marion)

| Variable | Description |
|----------|-------------|
| `AI_GATEWAY_API_KEY` | Clé Gateway (dev local + override prod) |
| `CONVEX_URL` | URL deployment Convex Portal |
| `MARION_SERVICE_SECRET` | Secret server-to-server (identique côté Convex) |
| `DISCORD_*` | Bot + allowlist operator |
| `MARION_CHAT_MODEL` | Optionnel — override modèle chat |
| `MARION_CHAT_MODEL_FALLBACK` | Optionnel — fallback Gateway |
| `MARION_SUMMARIZE_MODEL` | Optionnel — résumés cron Convex |
| `MARION_EMBEDDING_MODEL` | Optionnel — embeddings (garder 1536 dims) |

Côté **Convex** : `AI_GATEWAY_API_KEY`, `MARION_SERVICE_SECRET`, et les overrides `MARION_*` si besoin.

## Dev

```bash
bun run dev:backend   # terminal 1
bun run dev:marion    # terminal 2
```

Créer `apps/marion/.env.local` depuis `.env.example`.

## Discord setup

Interactions endpoint : `https://<marion-vercel>/eve/v1/discord`

Commande slash `/ask` avec option `message` (string, required) — voir [Eve Discord docs](https://eve.dev/docs/channels/discord).

DM bot 1:1 ; seuls les IDs dans `DISCORD_OPERATOR_USER_IDS` passent l'allowlist.

## Scope v1

- Read Desk complet (tools → actions `marionRead`)
- Write RAG + threads only (`marionMemory`)
- Digest 8h Montreal (cron daily — Hobby Vercel). Proactivité horaire : Pro ou scheduler externe
- Pas sandbox, pas Hermes, pas tchat client
