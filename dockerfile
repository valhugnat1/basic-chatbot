# ÉTAPE 1: Construire l'application Vue.js
# Utilise une image Node.js légère (Alpine) pour la phase de construction
FROM node:lts-alpine as build-stage

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances du projet
RUN npm install

# Copie le reste des fichiers de l'application
COPY . .

# Lance le script de build pour générer les fichiers statiques
RUN npm run build

# ---

# ÉTAPE 2: Servir l'application avec Nginx
# Utilise une image Nginx très légère pour la production
FROM nginx:stable-alpine as production-stage

# Copie les fichiers statiques construits depuis l'étape précédente vers le répertoire public de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copie le fichier de configuration Nginx personnalisé
# Ce fichier doit se trouver dans un dossier 'nginx' à côté de votre Dockerfile
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose le port 80 pour accéder à l'application
EXPOSE 80

# Commande pour démarrer le serveur Nginx lorsque le conteneur démarre
CMD ["nginx", "-g", "daemon off;"]
