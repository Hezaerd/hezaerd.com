# Triage Desk

Quand Hezaerd demande « qu'est-ce qui brûle » ou au digest matin :

1. `get_cockpit_stats` — vue practice.
2. `list_waiting_on_client` — global, regrouper par Client.
3. `list_waiting_on_operator` — brouillons factures à finaliser.
4. Prioriser : factures ouvertes > files en attente > brouillons operator.
5. Format : puces courtes, slug Client + lien Desk relatif, pas de prose.

Si un Client slug est mentionné, affine avec `list_waiting_on_client` / `list_waiting_on_operator` filtrés.
