# Regnum Steak House : proposition de refonte

Maquette complète du futur site de Regnum Steak House (2 avenue Eugène Hénaff, Vaulx-en-Velin), conçue par Ouweis Mansouri pour être présentée au restaurant. **Site non officiel** : la page est marquée `noindex` et le pied de page le précise.

Site statique, sans étape de compilation : `index.html`, `assets/css/style.css`, `assets/js/app.js`. GSAP, ScrollTrigger et Lenis sont fournis dans `assets/vendor`. Les polices (Bodoni Moda, Barlow, Barlow Condensed, licence SIL OFL) sont hébergées sur le site : aucun appel à Google Fonts.

## Ce qui fonctionne vraiment

- **Réservation** : le module Zenchef du restaurant (restaurant n° 358260), le même que sur leur site actuel. Chaque bouton « Réserver » ouvre la fenêtre de réservation Zenchef par-dessus la page. Si le module ne se charge pas, le bouton ouvre la page de réservation Zenchef dans un nouvel onglet. Le bouton flottant propre à Zenchef est masqué, car le site a ses propres boutons (règle CSS `iframe[class*="zc-width-numeral"]`, à retirer pour le réafficher).
- **Newsletter** : le formulaire d'inscription Zenchef du restaurant.
- **Horaires en direct** : « Ouvert, jusqu'à 22 h 30 » ou « Fermé, ouvre à 18 h 45 », calculé à l'heure de Paris, et le jour actuel est mis en avant dans le tableau.
- **Appeler, itinéraire, plan** : liens directs ; le plan Google Maps ne se charge qu'au clic (Google dépose des cookies).

## Ce qui est une démonstration

- **Formulaires de privatisation et de contact** : rien n'est envoyé, un message l'indique. À la mise en ligne, il faudra un service d'envoi (Formspree, un formulaire Zenchef ou l'adresse e-mail du restaurant).
- **Liens légaux** : ils pointent vers les mentions légales, la politique de confidentialité et la politique de cookies du site actuel.

## Contenus : sources et points à confirmer avec le patron

- **Carte et prix** : repris de leur site actuel.
  - La bavette de veau n'y a pas de prix.
  - Le faux-filet et la côte de veau n'y ont pas de poids.
  - Pides, lahmacun, mezzes, pizzas, burgers, desserts et mocktails apparaissent sur leur Instagram mais pas sur leur carte en ligne : il faut leur carte complète.
- **Photos et vidéos** : récupérées sur leur Instagram et leur site actuel. Les vidéos sont des enregistrements d'écran, recadrés pour retirer les boutons d'Instagram et le texte incrusté. Certaines viennent peut-être d'influenceurs : pour le site définitif, il faut leurs propres images ou l'accord des auteurs. C'est l'occasion de proposer un shooting photo et vidéo.
- **Avis clients** : repris des visuels publiés sur leur Instagram (Sarah, Rukiye, Kadi, Ibtissem, Clara), avec de petites corrections d'orthographe.
- **À confirmer avant d'en parler sur le site** :
  - le halal (cité par des sites tiers, absent de leur site) ;
  - « plus de 300 places » et « le plus grand steakhouse de la région lyonnaise » (texte d'une vidéo Instagram) ;
  - le second numéro, 04 78 05 21 64, affiché dans leur fenêtre de réservation Zenchef.
- **Services et paiements** : repris de leur site actuel (terrasse, wifi, accès PMR, climatisation, privatisation ; carte bancaire, espèces, titres-restaurant, Apple Pay…).

## Avant la mise en ligne définitive

1. Retirer `<meta name="robots" content="noindex, nofollow">` dans `index.html`.
2. Remplacer les adresses de l'image de partage (`og:image`) par le domaine définitif.
3. Faire pointer regnumsteakhouse.com vers le nouvel hébergement : il faut savoir qui gère le nom de domaine (le restaurant ou Zenchef).
4. Brancher les formulaires sur un vrai service d'envoi.
5. Retirer la mention « Proposition de refonte non officielle » du pied de page.

## Médias

- `assets/video` : 5 boucles H.264 sans son (3,4 Mo au total) : hero en paysage et en portrait, puis la braise, la maturation et le four à bois.
- `assets/img` : photos en WebP, en deux tailles (`-640` pour les vignettes), logo vectorisé à partir de leur logo (`logo-regnum.svg`), favicon, icône iPhone, image de partage `og.jpg`.
