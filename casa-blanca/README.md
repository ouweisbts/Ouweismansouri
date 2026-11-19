# La Casa Blanca by Ouweis

Site vitrine d'un restaurant **imaginaire** de cuisine réconfortante haut de gamme
(pizzas, spaghettis, pennes, burgers, 100 % fait maison). Concept personnel d'Ouweis
Mansouri : direction artistique, copywriting, design et code.

Direction : « Gastronomie nocturne & chaleureuse ». Noir charbon `#0D0D0D`, expresso
`#161210`, ambre `#C88A36` et or brossé `#D4AF37`, crème `#F5F2EB`, rouge carmin `#8B1E1E`
en touches. Titres en Cormorant Garamond, textes en Plus Jakarta Sans. Surfaces en verre
dépoli, filets dorés, grain photo.

## Structure

`index.html` — 11 temps :

1. **Hero** : four à bois en vidéo plein écran, fumée réelle en surimpression, carte
   flottante du plat signature, bandeau défilant.
2. **Manifeste** : texte éditorial, chiffres clés, deux vidéos décalées en parallaxe.
3. **Les quatre piliers** : défilement horizontal épinglé sur ordinateur, cartes à
   balayer au doigt sur mobile.
4. **La carte** : 4 onglets accessibles au clavier, 17 plats, lignes pointillées
   jusqu'aux prix.
5. **L'obsession du détail** : grille de six boucles vidéo en gros plan.
6. **Le menu Casa** : menu en trois temps.
7. **La vision** : texte du fondateur, signature, cercle vidéo entouré d'un texte qui tourne.
8. **L'expérience** : la salle en vidéo plein écran, privatisation.
9. **Avis** : carrousel automatique, avec flèches, points et balayage.
10. **Réservation** : convives, date, horaires selon les jours d'ouverture, coordonnées.
11. **Pied de page** : lettre d'information, horaires, adresse, Instagram, mentions légales.

Fichiers :

- `assets/css/style.css` — tous les styles (variables de palette en tête), sans étape de compilation
- `assets/js/app.js` — gestion des vidéos, défilement fluide, intro, piliers, onglets,
  carrousel, réservation, lettre, curseur, boutons magnétiques, parallaxe, apparitions
- `assets/vendor/` — GSAP 3.12.5, ScrollTrigger et Lenis 1.1.13, copiés localement
- `assets/video/` — 17 boucles MP4 (H.264, 720p, sans son, 14 Mo au total)
- `assets/img/` — une affiche par vidéo (`.webp`, première image), image de partage `og.jpg`, favicon
- `PROMPTS.md` — prompts de génération d'images, si l'on veut un jour remplacer des
  vidéos par des visuels sur mesure

## Vidéos

Sources : [Mixkit](https://mixkit.co/license/#videoFree), licence gratuite, usage commercial
autorisé. Chaque plan est coupé, étalonné avec le même réglage (noirs profonds, hautes
lumières ambrées, vignettage), puis compressé. Une vidéo ne se charge qu'à l'approche de
l'écran et ne joue que lorsqu'elle est visible. Avec « réduire les animations » ou le mode
économie de données, seules les affiches s'affichent.

## Formulaires

La réservation et la lettre d'information sont des démonstrations : rien n'est envoyé ni
enregistré. Pour un vrai restaurant, il suffirait de brancher leur envoi sur un service de
réservation et d'e-mailing.

## Accessibilité

- Onglets de la carte au clavier (flèches, Début, Fin), boîte de dialogue native pour les
  mentions légales, focus visibles, vidéos décoratives masquées aux lecteurs d'écran.
- Sans JavaScript, tout le contenu reste lisible (la carte s'affiche en entier) ; seuls les
  formulaires en ont besoin.
- Bouton « Réserver une table » toujours accessible sur mobile. Il s'efface quand le bouton
  du hero ou le formulaire sont à l'écran.
