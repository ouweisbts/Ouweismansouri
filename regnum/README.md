# Regnum Steak House : proposition de refonte

Maquette complète du futur site de Regnum Steak House (2 avenue Eugène Hénaff, Vaulx-en-Velin), conçue par Ouweis Mansouri pour être présentée au restaurant. **Site non officiel** : les pages sont marquées `noindex`, et le pied de page comme la page légale le précisent.

Site statique, sans étape de compilation :
- `index.html`, la page d'accueil ;
- `mentions-legales.html`, les mentions légales, les données personnelles, les cookies, les avis, la carte, la médiation et l'accessibilité ;
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

## Points juridiques

La page `mentions-legales.html` couvre les points suivants :
- les mentions légales (LCEN), avec les informations de leur site actuel : REGNUM, capital de 10 000 €, RCS Lyon 911 036 812, SIRET 911 036 812 00012, TVA FR36 911 036 812 ;
- l'éditeur et l'hébergeur de la maquette ;
- les crédits et la propriété intellectuelle ;
- le RGPD : finalités, bases légales, durées, destinataires, droits, CNIL ;
- les cookies : aucun, et les services tiers chargés à la demande ;
- les avis clients (Code de la consommation) ;
- les informations de la carte : prix TTC service compris, origine des viandes, allergènes ;
- la médiation de la consommation ;
- l'accessibilité (WCAG 2.1 AA, auto-évaluation).

Sur la page d'accueil, une note sous la carte rappelle les prix, l'origine des viandes et les allergènes. Une autre, sous les avis, précise qu'ils sont reproduits mot pour mot et non vérifiés. Sous chaque formulaire, un rappel pointe vers la politique de confidentialité.

**À compléter avec le patron** (surligné en rouge sur la page légale) :
- la forme juridique ;
- l'e-mail ;
- le directeur de la publication ;
- l'hébergeur définitif ;
- le médiateur de la consommation.

Leurs mentions légales actuelles ne donnent pas non plus ces informations.

## À confirmer avant toute publication officielle

- **Images** : accord écrit pour toutes les photos et vidéos (certaines viennent peut-être d'influenceurs), et accord des personnes reconnaissables (le chef notamment). Sinon, prévoir un shooting.
- **Carte** :
  - la carte complète (pides, pizzas, burgers, desserts, mocktails), absente de leur site actuel ;
  - le prix de la bavette de veau ;
  - le poids du faux-filet et de la côte de veau.
- **Affichages obligatoires en salle** : l'origine des viandes et la liste des allergènes doivent bien être disponibles en salle, comme l'annonce le site.
- **Halal** : à confirmer avant d'en parler.
- **« Plus de 300 places »** : à confirmer.
- **Second numéro** : le 04 78 05 21 64, affiché dans leur fenêtre Zenchef.

## Mise en ligne définitive

1. Retirer `<meta name="robots" content="noindex, nofollow">` des deux pages.
2. Retirer l'encadré « Version de démonstration » de la page légale et la mention « Proposition de refonte non officielle » du pied de page.
3. Remplacer l'adresse de l'image de partage (`og:image`) par le domaine définitif.
4. Faire pointer regnumsteakhouse.com vers le nouvel hébergement (savoir qui gère le nom de domaine : le restaurant ou Zenchef), puis placer `robots.txt`, `sitemap.xml` et `_headers` à la racine.
5. Brancher les formulaires sur un vrai service d'envoi.
6. Compléter les informations surlignées de la page légale.
7. Déclarer le site dans Google Search Console et mettre à jour la fiche Google du restaurant avec le nouveau site.

## Médias

- `assets/video` : 5 boucles H.264 sans son (3,4 Mo au total), recadrées sans les boutons ni le texte d'Instagram.
- `assets/img` : photos en WebP en deux tailles, logo vectorisé (`logo-regnum.svg`), favicon, icône iPhone, image de partage `og.jpg`.
- À la demande du client, deux photos ont été retirées : l'enseigne sur le mur végétal et l'entrée avec l'olivier.
