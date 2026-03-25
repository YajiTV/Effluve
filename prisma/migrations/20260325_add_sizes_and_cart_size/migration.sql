-- Add sizes field to products
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `sizes` VARCHAR(100) NULL;

-- Add size field to cart_items and update unique constraint
ALTER TABLE `cart_items` ADD COLUMN IF NOT EXISTS `size` VARCHAR(10) NOT NULL DEFAULT '';
-- Create new index first so MySQL has a backing index for the FK before we drop the old one
ALTER TABLE `cart_items` ADD UNIQUE INDEX IF NOT EXISTS `uniq_cart_user_product_size` (`user_id`, `product_id`, `size`);
ALTER TABLE `cart_items` DROP INDEX IF EXISTS `uniq_cart_user_product`;
