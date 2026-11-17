# Liste de courses

Application web pour gérer une liste de courses (ajout et suppression d'articles par rayon), lancée en une commande avec Docker Compose (Node.js, PostgreSQL 18 et Adminer).

**Réalisé par :** Loubna Abbar

## Prérequis

- Docker Desktop installé et lancé

## Installation et lancement

1. Cloner le dépôt :
~~~bash
git clone https://github.com/LoubnaAbbar/docker-liste-courses.git
cd docker-liste-courses
~~~

2. Créer le fichier `.env` à partir du modèle (et y renseigner un mot de passe) :
~~~bash
cp .env.example .env
~~~

3. Démarrer l'application, la base de données et Adminer :
~~~bash
docker compose up -d --build
~~~

## Accès aux services

- **Application :** http://localhost:3000
- **Adminer :** http://localhost:8080

## Connexion à Adminer

Renseigner les valeurs définies dans le fichier `.env` :

- **Système :** PostgreSQL
- **Serveur :** `db`
- **Utilisateur :** `courses_user` (valeur de `POSTGRES_USER`)
- **Mot de passe :** valeur de `POSTGRES_PASSWORD` dans `.env`
- **Base de données :** `courses_db` (valeur de `POSTGRES_DB`)
