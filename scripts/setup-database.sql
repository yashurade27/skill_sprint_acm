-- Add featured column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Insert categories
INSERT INTO categories (name, slug, description) VALUES 
('Traditional Sweets', 'sweets', 'Authentic Indian sweets made with traditional recipes'),
('Savory Snacks', 'snacks', 'Crispy and flavorful snacks perfect for any time'),
('Festival Specials', 'festival', 'Special items prepared for festivals and celebrations')
ON CONFLICT (name) DO NOTHING;

-- Verify categories
SELECT * FROM categories;