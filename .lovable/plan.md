

## Plan de correction : Abonnements Stripe

### Problème racine
1. **Le webhook `stripe-webhook` n'est pas configuré dans Stripe** → la base de données n'est jamais mise à jour après paiement
2. **`check-subscription` échoue** avec "missing sub claim" → le frontend ne peut pas lire le statut
3. **Le bouton "Gérer mon abonnement"** est masqué car `subscribed` est toujours `false`

### Étapes de correction

#### Étape 1 — Configurer le webhook dans Stripe Dashboard
Action manuelle requise de ta part :
- Va dans [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
- Ajoute un endpoint avec l'URL : `https://kyqzdmysziiqvxyxdind.supabase.co/functions/v1/stripe-webhook`
- Sélectionne les événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copie le "Signing secret" généré (commence par `whsec_...`)
- Vérifie que la valeur du secret `STRIPE_WEBHOOK_SECRET` correspond bien à ce signing secret (si tu en as créé un nouveau, il faudra mettre à jour le secret)

#### Étape 2 — Corriger `check-subscription`
L'erreur "missing sub claim" vient de l'utilisation de `supabaseClient.auth.getUser(token)` avec le service role client. La correction :
- Utiliser `SUPABASE_ANON_KEY` au lieu de `SUPABASE_SERVICE_ROLE_KEY` pour le client d'authentification, ou
- Créer un second client avec l'anon key uniquement pour valider le token utilisateur
- Garder le service role client pour les opérations d'écriture sur `profiles`

**Fichier modifié** : `supabase/functions/check-subscription/index.ts`

#### Étape 3 — Ajouter un fallback direct en base
Modifier `useAuth.tsx` pour qu'en cas d'échec de `check-subscription`, le frontend lise directement `subscription_status` et `has_active_subscription` depuis la table `profiles` via le client Supabase. Cela garantit que même si la Edge Function échoue, le statut est affiché correctement.

**Fichier modifié** : `src/hooks/useAuth.tsx`

#### Étape 4 — Adapter `SubscriptionSection` aux nouvelles colonnes
Utiliser `subscription_plan` pour afficher "Hebdomadaire" ou "Mensuel" au lieu du générique "Premium". Le bouton "Gérer mon abonnement" sera visible dès que le statut est actif.

**Fichier modifié** : `src/components/SubscriptionSection.tsx`

### Résumé des fichiers modifiés
| Fichier | Modification |
|---|---|
| `supabase/functions/check-subscription/index.ts` | Corriger l'authentification du token utilisateur |
| `src/hooks/useAuth.tsx` | Ajouter fallback direct sur `profiles` |
| `src/components/SubscriptionSection.tsx` | Afficher le nom du plan (hebdo/mensuel) |

### Action manuelle requise
Tu devras configurer le webhook dans le Stripe Dashboard (Étape 1) pour que les paiements futurs mettent à jour la base de données en temps réel.

