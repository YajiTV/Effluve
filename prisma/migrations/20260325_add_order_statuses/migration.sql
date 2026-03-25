-- Ajout des statuts de préparation/expédition/livraison à la commande
ALTER TABLE `orders`
  MODIFY COLUMN `payment_status`
    ENUM('pending_payment','paid','preparing','shipped','delivered','cancelled')
    NOT NULL DEFAULT 'pending_payment';
