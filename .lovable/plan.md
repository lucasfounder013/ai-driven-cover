

## Plan de correction

### Problème 1 : `check-subscription` crashe avec "Invalid time value"
La fonction trouve bien ton abonnement Stripe actif mais plante en construisant la date `subscription_end`. L'API Stripe (version `2025-08-27.basil`) retourne possiblement `current_period_end` dans un format inattendu. Il faut ajouter une protection autour de la conversion de date.

**Fichier** : `supabase/functions/check-subscription/index.ts`
- Ajouter un try/catch autour de `new Date(subscription.current_period_end * 1000)` avec un fallback à `null`
- Logger la valeur brute de `current_period_end` pour comprendre le format

### Problème 2 : Le webhook n'est jamais appelé
Aucun log = Stripe n'envoie rien à ton endpoint. Causes possibles :
- URL incorrecte dans le Stripe Dashboard
- Événements non sélectionnés
- Le webhook pointe vers l'ancienne URL

**Action manuelle** : Vérifie dans ton [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) que :
- L'URL est exactement : `https://kyqzdmysziiqvxyxdind.supabase.co/functions/v1/stripe-webhook`
- Les 3 événements sont cochés : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Le statut du webhook est "Enabled" (pas "Disabled")
- Si tu vois des tentatives échouées dans l'onglet "Attempts", partage l'erreur

### Problème 3 : Mise à jour immédiate de la base
Même une fois `check-subscription` corrigé, la DB n'a jamais été mise à jour pour ton abonnement actuel. La correction de la fonction résoudra cela au prochain appel (chargement du Dashboard).

### Résumé des modifications
| Fichier | Modification |
|---|---|
| `supabase/functions/check-subscription/index.ts` | Protéger la conversion de date, logger `current_period_end` brut |

### Résultat attendu
Après le fix, le prochain chargement du Dashboard appellera `check-subscription`, qui mettra à jour `profiles` avec `subscription_status = 'active'`, `subscription_plan = 'weekly'`, et le Dashboard affichera "Hebdomadaire" au lieu de "Gratuit".

