-- Insert products with Cloudinary URLs
-- Make sure to replace category IDs if they're different

INSERT INTO products (name, description, price_cents, inventory, category_id, image_url, images, is_active, is_featured) VALUES
('Chakli', 'Crispy spiral snack made from rice and gram flour.', 12000, 50, 2, 'https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299609/products/chakli.jpg', '["https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299609/products/chakli.jpg"]', true, true),
('Besan Laddo', 'Sweet balls made with roasted gram flour and ghee.', 15000, 40, 1, 'https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299611/products/besan-laddo.jpg', '["https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299611/products/besan-laddo.jpg"]', true, true),
('Fried Modak', 'Traditional deep-fried dumplings filled with coconut and jaggery.', 18000, 30, 1, 'https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299613/products/fried-modak.jpg', '["https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299613/products/fried-modak.jpg"]', true, false),
('Karanji', 'Sweet fried pastry stuffed with coconut and dry fruits.', 16000, 35, 1, 'https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299614/products/karanji.jpg', '["https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299614/products/karanji.jpg"]', true, true),
('Poha Chivda', 'Crunchy poha mix with peanuts, curry leaves, and spices.', 10000, 60, 2, 'https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299616/products/poha-chivda.jpg', '["https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299616/products/poha-chivda.jpg"]', true, true),
('Ukdiche Modak', 'Steamed dumplings filled with jaggery and coconut.', 20000, 25, 1, 'https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299617/products/ukdiche-modak.jpg', '["https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299617/products/ukdiche-modak.jpg"]', true, true),
('Puran Poli', 'Sweet flatbread stuffed with chana dal and jaggery.', 22000, 20, 1, 'https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299619/products/puran-poli.jpg', '["https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299619/products/puran-poli.jpg"]', true, false),
('Shankarpali', 'Sweet, crunchy snack made with flour, sugar, and ghee.', 13000, 45, 2, 'https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299620/products/shankarpali.jpg', '["https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299620/products/shankarpali.jpg"]', true, false);

-- Verify the products were added
SELECT p.name, p.price_cents, p.is_featured, c.name as category 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id;