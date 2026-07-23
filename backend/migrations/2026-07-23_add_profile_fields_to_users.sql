-- Ajouter les champs de profil à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS prenom text,
ADD COLUMN IF NOT EXISTS telephone text,
ADD COLUMN IF NOT EXISTS adresse text;
