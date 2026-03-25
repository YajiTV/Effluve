ALTER TABLE `orders` ADD COLUMN `stripe_invoice_id` varchar(255) NULL;
ALTER TABLE `orders` ADD COLUMN `stripe_invoice_url` varchar(1024) NULL;
