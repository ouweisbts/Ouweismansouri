# La Casa Blanca by Ouweis

Site vitrine d'un restaurant **imaginaire** de cuisine réconfortante haut de gamme
(pizzas, spaghettis, pennes, burgers, 100 % fait maison). Concept personnel d'Ouweis
Mansouri : direction artistique, copywriting, design et code.

Direction : « Gastronomie nocturne & chaleureuse » — noir charbon `#0D0D0D`, expresso
`#161210`, ambre `#C88A36` et or brossé `#D4AF37`, crème `#F5F2EB`, rouge carmin `#8B1E1E`
en touches. Titres en Cormorant Garamond, textes en Plus Jakarta Sans.

## Structure

- `index.html` — la page, en 6 sections : hero, manifeste, carte signature (4 onglets),
  galerie « L'obsession du détail », expérience et privatisation, réservation, puis le pied de page
- `assets/css/style.css` — tous les styles (variables de palette en tête de fichier), sans étape de compilation
- `assets/js/app.js` — interactions : défilement fluide, intro, onglets, réservation,
  curseur, boutons magnétiques, parallaxe, apparitions
- `assets/vendor/` — GSAP 3.12.5, ScrollTrigger et Lenis 1.1.13, copiés localement
- `assets/img/` — visuels (voir ci-dessous) et favicon
- `PROMPTS.md` — les prompts de génération des visuels (Midjourney v6.1 / Flux)

## Visuels

Chaque image est placée dans un cadre `.media`. Tant que le fichier manque, le cadre
affiche une illustration d'attente (halo ambré et légende). Quand un visuel complémentaire
manque, l'image indiquée dans `data-fallback` prend sa place.

| Fichier | Format | Emplacements |
| --- | --- | --- |
| `hero-pizza.webp` | 16:9 | hero, galerie |
| `manifeste-mains.webp` | 4:5 | manifeste |
| `manifeste-produits.webp` | 4:5 | manifeste (et repli de `detail-sel`) |
| `plat-spaghetti.webp` | 4:5 | carte (spaghettis), galerie (et repli de `plat-penne`) |
| `plat-burger.webp` | 4:5 | carte (burgers), galerie (et repli de `detail-brioche`) |
| `salle.webp` | 3:2 | expérience |
| `plat-penne.webp` *(facultatif)* | 4:5 | carte (pennes), galerie |
| `plat-pizza.webp` *(facultatif)* | 4:5 | carte (pizzas) |
| `detail-brioche.webp` *(facultatif)* | 1:1 | galerie |
| `detail-sel.webp` *(facultatif)* | 1:1 | galerie |

Une vidéo de hero (`assets/video/hero.mp4`) peut être ajoutée en remplissant `data-video`
sur `.hero__media`.

## Réservation

Le module (convives, date, horaire selon les jours d'ouverture, coordonnées) est une
démonstration : rien n'est envoyé ni enregistré. Pour un vrai restaurant, il suffirait de
brancher l'envoi du formulaire sur un service de réservation.

## Accessibilité et performance

- Onglets de la carte au clavier (flèches, Début, Fin), boîte de dialogue native pour les
  mentions légales, focus visibles.
- Animations désactivées pour les visiteurs qui préfèrent moins de mouvement. Sans
  JavaScript, tout le contenu reste lisible (la carte s'affiche en entier) ; seul le module
  de réservation en a besoin.
- Images chargées à la demande, sauf celle du hero, qui est préchargée.
- Bouton « Réserver une table » toujours accessible sur mobile. Il s'efface quand le bouton
  du hero ou le formulaire sont à l'écran.
