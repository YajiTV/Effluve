-- Ajout du champ stock sur les produits
ALTER TABLE `products` ADD COLUMN `stock` INT NOT NULL DEFAULT 0;
