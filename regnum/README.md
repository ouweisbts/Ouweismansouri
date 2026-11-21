# Regnum Steak House : proposition de refonte

Maquette complète du futur site de Regnum Steak House (2 avenue Eugène Hénaff, Vaulx-en-Velin), conçue par Ouweis Mansouri pour être présentée au restaurant. **Site non officiel** : les pages sont marquées `noindex`, et le pied de page comme la page légale le précisent.

Site statique, sans étape de compilation :
- `index.html`, la page d'accueil ;
- `mentions-legales.html` : éditeur, hébergement, crédits, droits des images et des polices, accessibilité ;
- `confidentialite.html` : données personnelles, services tiers, cookies, newsletter, mineurs, droits, suppression des données ;
- `conditions.html` : conditions générales, réservation, annulation et remboursements, privatisation, prix et carte, avis, médiation ;
- `assets/css/style.css` et `assets/js/app.js`.

GSAP, ScrollTrigger et Lenis sont fournis dans `assets/vendor`. Les polices (Bodoni Moda, Barlow, Barlow Condensed, licence SIL OFL) sont hébergées sur le site : aucun appel à Google Fonts.

## Ce qui fonctionne vraiment

- **Réservation** : le module Zenchef du restaurant (n° 358260), le même que sur leur site actuel.
  - Il ne se charge qu'au premier clic sur un bouton « Réserver », puis ouvre sa fenêtre de réservation par-dessus la page.
  - Si le module ne se charge pas, le bouton mène à la page de réservation Zenchef.
  - Ses options de statistiques sont désactivées (`data-disable-ga4`, `data-disable-gtm`, `data-send-page-views`).
  - Son bouton flottant est masqué, puisque le site a ses propres boutons.
- **Newsletter** : le formulaire d'inscription Zenchef du restaurant, ouvert au clic.
- **Horaires en direct**, à l'heure de Paris, avec le jour actuel mis en avant.
- **Appeler, itinéraire, plan** : le plan Google Maps ne se charge qu'au clic.

## Ce qui est une démonstration

Les formulaires de privatisation et de contact n'envoient rien, et un message le dit. À la mise en ligne, il faudra les relier à un service d'envoi : Formspree, un formulaire Zenchef ou l'e-mail du restaurant. Il faudra alors ajouter son adresse dans `form-action` de la politique de sécurité.

## Écran : la page ne bouge jamais sur les côtés

Trois protections :
- `html` refuse le défilement horizontal et le rebond (`overflow-x:hidden`, `overscroll-behavior-x:none`) ;
- au doigt, la page n'accepte que le défilement vertical et le zoom (`touch-action:pan-y pinch-zoom`) ;
- seuls les deux carrousels se balaient horizontalement.

Test au doigt simulé sur 11 appareils, de 320 px à l'iPad, en portrait et en paysage : la page reste à la largeur de l'écran et ne se décale pas. Un témoin volontairement cassé est bien détecté, ce qui confirme que le test est fiable.

## SEO

- Titre de 54 caractères et description de 153 caractères.
- Un seul `h1` et une hiérarchie de titres sans saut.
- Toutes les images ont un texte alternatif et leurs dimensions.
- `canonical` et `og:url` pointent vers le domaine du restaurant ; `robots.txt` et `sitemap.xml` sont prêts pour ce domaine.
- Données structurées schema.org `Restaurant` : adresse, coordonnées GPS, horaires, réservation (`ReserveAction` vers Zenchef), services, moyens de paiement et carte complète avec les 15 plats et leurs prix (`hasMenu`).
- Image du haut de page préchargée selon la forme de l'écran, vidéos chargées à la demande, polices préchargées.
- Le mot « halal » n'est pas utilisé tant qu'il n'est pas confirmé : c'est pourtant une recherche importante pour leur clientèle.

## Sécurité

- **Politique de sécurité des contenus (CSP)** dans les pages : scripts limités au site, à Zenchef et au petit script d'en-tête autorisé par son empreinte, aucun style en ligne, cadres limités à Zenchef et Google Maps, `object-src 'none'`, `base-uri 'self'`.
- **Fichier `_headers`** prêt pour un hébergeur qui le lit (Netlify, Cloudflare Pages) : CSP, interdiction d'affichage dans un cadre (`frame-ancestors 'none'`, `X-Frame-Options`), HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. GitHub Pages l'ignore.
- **Formulaires** : longueurs maximales, piège invisible contre les robots, aucune donnée envoyée tant qu'aucun service n'est branché.
- **Aucun stockage sur l'appareil du visiteur** : ni cookie, ni `localStorage`, ni `sessionStorage`.

## Points juridiques : la liste des 20

| # | Point | Où et comment |
|---|---|---|
| 1 | Mentions légales | `mentions-legales.html`, avec les informations de leur site actuel : REGNUM, capital de 10 000 €, RCS Lyon 911 036 812, SIRET 911 036 812 00012, TVA FR36 911 036 812 |
| 2 | Confidentialité | `confidentialite.html` : responsable, finalités, bases légales, durées, destinataires, droits, CNIL |
| 3 | Conditions générales | `conditions.html` |
| 4 | Remboursements | `conditions.html#annulation` : annulation sans frais, empreinte bancaire ou acompte affichés avant validation, remboursement, pas de droit de rétractation (art. L221-28, 12° du Code de la consommation) |
| 5 | Politique cookies | `confidentialite.html#cookies`, tableau par service |
| 6 | Bandeau cookies | Pas de bandeau, et c'est voulu : le site ne dépose aucun cookie à l'arrivée (testé : 0 cookie, 0 stockage, 0 requête extérieure avant un clic). L'accord est demandé là où il le faut, sur le plan Google Maps. Si un outil de mesure d'audience est ajouté, un bandeau avec « Accepter » et « Refuser » de même taille devient obligatoire avant tout dépôt |
| 7 | Consentements | Plan : information puis bouton « Accepter et afficher le plan ». Newsletter : inscription volontaire, aucune case cochée d'avance. Pas de case à cocher inutile sur les formulaires, dont la base légale n'est pas le consentement |
| 8 | Zéro donnée inutile | Champs facultatifs signalés, aucun choix présélectionné, aucun compte, aucune donnée bancaire |
| 9 | Audit des outils tiers | `confidentialite.html#tiers` : Zenchef, Google Maps, GitHub Pages, hébergeur final, liens Instagram, Facebook et Google ; polices et bibliothèques hébergées sur le site |
| 10 | Zéro piège | Pas de compte à rebours, de fausse rareté, de fenêtre surgissante ni de case précochée ; annuler est aussi simple que réserver ; l'état « ouvert » vient des vrais horaires |
| 11 | Zéro frais caché | Prix TTC service compris, suppléments affichés, réservation gratuite ; la bavette de veau, sans prix connu, est retirée de la carte en ligne |
| 12 | Zéro faux avis | Avis reproduits mot pour mot, mention « non vérifiés », lien vers tous les avis Google |
| 13 | Zéro promesse non prouvée | Chaque affirmation vient du restaurant (voir le tableau ci-dessous) ; « halal » et « plus de 300 places » ne sont pas utilisés ; photos présentées comme suggestions |
| 14 | Texte alternatif | Toutes les images, vérifié par axe-core |
| 15 | Contrastes | Au moins 4,5 pour 1 sur tous les textes : gris secondaire éclairci, rouge un peu plus vif pour les petits textes (`--rouge-txt`), le rouge du logo reste sur les boutons |
| 16 | Navigation clavier | Test complet : chaque arrêt visible avec sa marque de focus, clavier gardé dans les fenêtres, Échap rend le focus, carrousels accessibles aux flèches |
| 17 | Accord des parents | `confidentialite.html#mineurs` : moins de 15 ans, accord d'un parent (art. 45 de la loi Informatique et Libertés) ; aucune image d'un mineur sans accord écrit |
| 18 | Lien de désinscription | Annoncé sous le bouton newsletter et dans la politique : un clic, sans justification |
| 19 | Droits des polices et images | Licences OFL des polices dans `assets/fonts`, licences GSAP et Lenis dans `assets/vendor`, crédits dans les mentions ; images à faire valider par écrit |
| 20 | Suppression des données | `confidentialite.html#suppression` : marche à suivre en 3 étapes, réponse sous un mois |

### D'où viennent les affirmations du site

| Affirmation | Source |
|---|---|
| Toutes les viandes grillées au charbon de bois, servies avec salade, frites et sauce | Carte de leur site actuel |
| Côte de bœuf dry aged de 750 g à 80,90 € | Carte de leur site actuel |
| Tandır : agneau mijoté au feu de bois pendant 8 heures | Carte de leur site actuel |
| Armoire de maturation et mur de sel, pides au four à bois | Leurs vidéos Instagram |
| Terrasse, wifi, accès PMR, climatisation, privatisation, moyens de paiement, bus | Fiche de leur site actuel |
| Horaires, 7 jours sur 7 | Leur site actuel |

**À compléter avec le patron** (surligné en rouge sur les pages légales) :
- la forme juridique, l'e-mail et le directeur de la publication ;
- l'hébergeur définitif ;
- le médiateur de la consommation ;
- les conditions de réservation : délai d'annulation, empreinte bancaire ou acompte, durée de maintien de la table, délai de remboursement.

Leurs mentions légales actuelles ne donnent pas non plus ces informations.

## À confirmer avant toute publication officielle

- **Images** : accord écrit pour toutes les photos et vidéos (certaines viennent peut-être d'influenceurs), et accord des personnes reconnaissables (le chef notamment). Sinon, prévoir un shooting.
- **Carte** :
  - la carte complète (pides, pizzas, burgers, desserts, mocktails), absente de leur site actuel ;
  - le prix de la bavette de veau, retirée de la carte en ligne en attendant ;
  - le poids du faux-filet et de la côte de veau.
- **Affichages obligatoires en salle** : l'origine des viandes et la liste des allergènes doivent bien être disponibles en salle, comme l'annonce le site.
- **Halal** : à confirmer avant d'en parler.
- **« Plus de 300 places »** : à confirmer.
- **Second numéro** : le 04 78 05 21 64, affiché dans leur fenêtre Zenchef.

## Mise en ligne définitive

1. Retirer `<meta name="robots" content="noindex, nofollow">` des quatre pages.
2. Retirer l'encadré « Version de démonstration » des trois pages légales et la mention « Proposition de refonte non officielle » des pieds de page.
3. Remplacer l'adresse de l'image de partage (`og:image`) par le domaine définitif.
4. Faire pointer regnumsteakhouse.com vers le nouvel hébergement (savoir qui gère le nom de domaine : le restaurant ou Zenchef), puis placer `robots.txt`, `sitemap.xml` et `_headers` à la racine.
5. Brancher les formulaires sur un vrai service d'envoi.
6. Compléter les informations surlignées de la page légale.
7. Déclarer le site dans Google Search Console et mettre à jour la fiche Google du restaurant avec le nouveau site.

## Médias

- `assets/video` : 5 boucles H.264 sans son (3,4 Mo au total), recadrées sans les boutons ni le texte d'Instagram.
- `assets/img` : photos en WebP en deux tailles, logo vectorisé (`logo-regnum.svg`), favicon, icône iPhone, image de partage `og.jpg`.
- À la demande du client, deux photos ont été retirées : l'enseigne sur le mur végétal et l'entrée avec l'olivier.
