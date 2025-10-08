-- Remove duplicate famous people (keep only the first entry for each name)
DELETE FROM famous_people 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
    FROM famous_people
  ) t WHERE rn > 1
);

-- Remove AI-generated photo URLs
UPDATE famous_people SET photo_url = NULL WHERE photo_url IS NOT NULL;