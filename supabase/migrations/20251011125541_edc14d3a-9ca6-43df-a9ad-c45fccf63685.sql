-- Add more fields to famous_people table for richer profiles
ALTER TABLE famous_people 
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS notable_works TEXT,
ADD COLUMN IF NOT EXISTS achievements TEXT,
ADD COLUMN IF NOT EXISTS awards TEXT,
ADD COLUMN IF NOT EXISTS death_date DATE,
ADD COLUMN IF NOT EXISTS fun_facts TEXT;

-- Add some sample data to existing records
UPDATE famous_people SET 
  nationality = CASE 
    WHEN name LIKE '%Einstein%' THEN 'German-American'
    WHEN name LIKE '%Shakespeare%' THEN 'English'
    WHEN name LIKE '%Gandhi%' THEN 'Indian'
    WHEN name LIKE '%Leonardo%' THEN 'Italian'
    WHEN name LIKE '%Newton%' THEN 'English'
    ELSE 'Unknown'
  END,
  occupation = CASE 
    WHEN name LIKE '%Einstein%' THEN 'Theoretical Physicist'
    WHEN name LIKE '%Shakespeare%' THEN 'Playwright, Poet'
    WHEN name LIKE '%Gandhi%' THEN 'Political Leader, Activist'
    WHEN name LIKE '%Leonardo%' THEN 'Polymath, Artist, Inventor'
    WHEN name LIKE '%Newton%' THEN 'Mathematician, Physicist, Astronomer'
  END
WHERE nationality IS NULL;