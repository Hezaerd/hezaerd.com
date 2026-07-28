# CMS — architecture & decisions

> **Archivé (2026-07-28)** — Feature CMS retirée du produit actif. Conservé pour une éventuelle reprise client par client. L'implémentation reste accessible via l'historique git.

Contexte figé lors d'une session grilling (2026-07-28). Ce document n'est **pas** un plan d'exécution — c'est la source de vérité pour reprendre la feature dans une autre session.

Voir aussi : [Portal CONTEXT.md](../../apps/portal/CONTEXT.md) (vocabulaire domaine), [ADR 0003](../../apps/portal/docs/adr/0003-operator-desk-client-only-workspace.md).

---

## Résumé

CMS optionnel activable par l'OP pour chaque Client. Chaque site client est une **app custom** (repo GitHub séparé) qui consomme `@hezaerd/cms` (npm privé). Le client édite des **champs guidés** dans Portal (Area « Mon site ») ; la prod publique ne touche jamais Convex à runtime.

Analytics (`insights`) = feature séparée, hors scope CMS — même pattern optionnel, session grilling à part.

---

## Naming

| Couche | Valeur |
|--------|--------|
| Flag Convex / code | `features.cms` |
| Routes Portal | `/op/clients/{slug}/cms`, `/w/{slug}/cms` |
| Desk OP (section + toggle) | « CMS » |
| Area client (nav) | « Mon site » |
| Package SDK | `@hezaerd/cms` |

Ne pas exposer « CMS » dans la nav client. Ne pas utiliser « Website » comme nom de feature.

---

## Décisions verrouillées (grilling)

### 1. Modèle de site — **A : app custom par client**

- Un repo GitHub par client (pas de renderer multi-tenant unique).
- Layout = code ; le CMS ne touche qu'aux spots déclarés.
- Package partagé `@hezaerd/cms` : `<EditableText>`, `<EditableImage>`, `registerFields()`.

### 2. Delivery contenu — **C : hybride prod / preview**

- **Prod publique** : contenu **baked** depuis un snapshot published (R2). Zéro fetch Convex, zéro `useQuery` CMS côté client public.
- **Preview** : route `/preview` sur le site client, SSR avec valeurs **draft** depuis Convex.
- **Publish** : atomique — draft → snapshot R2 versionné + purge CDN Cloudflare.

### 3. Registre de champs — **A : code-first**

- Le dev déclare les clés + types + contraintes dans le site client.
- Au deploy CI : `registerSchema({ slug, fields })` vers Convex (token dédié).
- L'OP configure labels / defaults sur le desk ; le client édite les **valeurs** dans Portal.
- Impossible d'ajouter un champ qui n'existe pas dans le code. Champs retirés → `deprecated`, pas supprimés.

### 4. Publish artifact — **B : snapshot R2 + purge CDN**

- Publish écrit `cms/{slug}/published/v{N}.json` (+ URLs images immuables).
- Pas de rebuild pour un changement de contenu — rebuild seulement pour changement de **layout** (code).
- Images : namespace R2 `cms/` (distinct de `file-requests/`).

### 5. Hosting — **A : Cloudflare Pages par client (compte Hezaerd)**

- Un projet CF Pages par client ; bande passante isolée par projet.
- R2 pour snapshots + assets CMS.
- Vercel OK pour portfolio / portal / brand — pas pour la flotte client.
- CI : GitHub Actions → `wrangler pages deploy` (code) ; webhook publish contenu → snapshot + purge (sans rebuild).

### 6. Repos — **B : repo GitHub par client dès le jour 1**

- Template : `hezaerd/client-site-template`.
- Handoff client possible sans extraire d'un monorepo.

### 7. Distribution SDK — **A : npm privé (GitHub Packages)**

- `@hezaerd/cms` publié depuis `hezaerd.com/packages/cms` (à créer) sur tag semver.
- Convex reste centralisé dans `packages/backend` — les repos clients n'embarquent pas le backend.

### 8. Schema sync — **A : register au deploy CI**

- Mutation Convex signée post-build.
- Deploy token **par client**, scoped `{ slug, action: registerSchema }`, révocable depuis le desk OP.

### 9. Preview auth — **A : `/preview?token=…` sur le site client**

- JWT court (~15 min), émis par Portal au clic « Prévisualiser ».
- Worker CF valide le token ; injecte draft au SSR.
- `noindex`, non linké publiquement. Prod route ne lit jamais draft.

### 10. Images — **A : upload Portal → R2**

- Variants WebP/AVIF générés **à l'upload** selon contraintes schema (`aspect`, `maxWidth`, `priority`).
- HTML public : dimensions connues, `fetchpriority="high"` si hero.

### 11. v1 field types — **A : text + image seulement**

- `text` : `maxLength`, option multiline.
- `image` : `aspect`, `maxWidth`, `priority`.
- Pas markdown, pas repeaters, pas page builder en v1.

---

## Architecture (diagramme)

```
Repo client (GitHub)
  └─ @hezaerd/cms (npm privé)
       ├─ registerFields() → CI → Convex registerSchema (deploy token)
       └─ EditableText / EditableImage → lit snapshot R2 en prod

Portal (Convex)
  ├─ draft values (client édite dans « Mon site »)
  ├─ publish → snapshot R2 + purge CDN CF
  └─ JWT preview → /preview sur le site client

CF Pages (1 projet / client) + R2
  ├─ prod routes : snapshot published (cache immutable)
  └─ /preview : SSR draft + JWT (noindex)
```

---

## Web vitals — contraintes perf

| Risque | Mitigation |
|--------|------------|
| Fetch Convex à runtime en prod | Interdit — HTML depuis snapshot R2 |
| Waterfall client-side CMS | Aucun — pas de hooks data CMS dans le bundle public |
| Images lourdes (LCP) | Variants à l'upload ; URLs immuables ; `priority` sur hero |
| Publish lent | Pas de rebuild contenu — JSON versionné + purge CDN |
| Preview pollue prod | Route isolée, JWT, noindex |

Prod = perf d'un site statique. Le CMS n'existe qu'au moment publish + preview.

---

## Modèle de données (implémenté puis retiré 2026-07-28)

Shape cible (git history pour l'implé) :

**Convex**

- `cmsFieldSchemas` — enregistré au deploy : `{ clientId, fieldKey, type, constraints, label?, deprecated? }`
- `cmsFieldValues` — draft par champ : `{ clientId, fieldKey, draftValue, updatedAt }`
- `cmsDeployTokens` — token par client pour CI registerSchema
- Publish copie draft → snapshot JSON sur R2 ; incrémente version

**R2**

- `cms/{slug}/published/v{N}.json` — snapshot public
- `cms/{slug}/assets/{fieldKey}/{hash}.webp` — images immuables

**Snapshot published (exemple)**

```json
{
  "version": 3,
  "publishedAt": 1730000000000,
  "fields": {
    "hero.title": "River Café",
    "hero.photo": "https://cdn…/cms/river-cafe/assets/hero.photo/abc.webp"
  }
}
```

---

## Analytics (insights)

Feature parallèle, non couverte ici. Même philosophie : outil custom activable par l'OP, label client « Statistiques », pas « Analytics ». Grilling séparé quand on attaque la pipeline de données.

---

## Références session

Décisions prises une par une ; ne pas réimplémenter tant que ce doc n'est pas relu en début de session suivante.
