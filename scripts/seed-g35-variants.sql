-- Insert G35 plate variants. Run in Supabase SQL Editor.
-- Assumes images are in bucket variant_images, folder g35plates.
-- Next id = 24, product_id = 3.

INSERT INTO variants (id, product_id, color, image_url) VALUES
  (24, 3, 'Black Camo', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/black-camo.png'),
  (25, 3, 'Black G35', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/black-g35.png'),
  (26, 3, 'Black Loop', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/black-loop.png'),
  (27, 3, 'Blue Camo', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/blue-camo.png'),
  (28, 3, 'Blue G35', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/blue-g35.png'),
  (29, 3, 'Blue Loop', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/blue-loop.png'),
  (30, 3, 'Gray Camo', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/gray-camo.png'),
  (31, 3, 'Gray G35', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/gray-g35.png'),
  (32, 3, 'Gray Loop', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/gray-loop.png'),
  (33, 3, 'Green Camo', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/green-camo.png'),
  (34, 3, 'Green G35', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/green-g35.png'),
  (35, 3, 'Green Loop', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/green-loop.png'),
  (36, 3, 'Orange Camo', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/orange-camo.png'),
  (37, 3, 'Orange G35', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/orange-g35.png'),
  (38, 3, 'Orange Loop', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/orange-loop.png'),
  (39, 3, 'Pink Camo', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/pink-camo.png'),
  (40, 3, 'Pink G35', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/pink-g35.png'),
  (41, 3, 'Purple Camo', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/purple-camo.png'),
  (42, 3, 'Purple G35', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/purple-g35.png'),
  (43, 3, 'Red Camo', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/red-camo.png'),
  (44, 3, 'Red G35', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/red-g35.png'),
  (45, 3, 'Red Loop', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/red-loop.png'),
  (46, 3, 'Yellow Camo', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/yellow-camo.png'),
  (47, 3, 'Yellow G35', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/yellow-g35.png'),
  (48, 3, 'Yellow Loop', 'https://hmmipguhjbklimihatii.supabase.co/storage/v1/object/public/variant_images/g35plates/yellow-loop.png');
