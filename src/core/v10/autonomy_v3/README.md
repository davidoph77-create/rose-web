# Rose V10-009 — Autonomy Loop V3

Cette version relie les briques V10 déjà construites dans une boucle
d'autonomie contrôlée.

## Capacités

- analyse cognitive d'une demande ;
- construction automatique d'un plan ;
- génération d'actions ;
- sélection des agents via leurs capacités ;
- exécution par MessageBus ;
- validation obligatoire pour certaines actions sensibles ;
- politique d'autonomie configurable ;
- nombre maximal de cycles ;
- journalisation d'une décision dans Memory Engine V2 ;
- progression optionnelle d'un objectif ;
- Runtime Module ;
- self-test complet.

## Sécurité

V10-009 n'accorde PAS à Rose une autonomie illimitée.

Par défaut :
- les actions Web externes demandent validation ;
- les actions calendrier demandent validation ;
- les actions entreprise demandent validation ;
- le nombre de cycles est limité ;
- un agent absent bloque l'action au lieu de l'inventer.

## Fonctionnement

Demande
→ Cognitive Layer
→ Planner V3
→ Actions
→ Contrôle de politique
→ Validation éventuelle
→ Agents
→ Memory / Goal progress
