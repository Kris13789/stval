-- Set product_id = 4 for G4 plate variants (id 49–75). Run in Supabase SQL Editor.

UPDATE variants
SET product_id = 4
WHERE id BETWEEN 49 AND 75;
