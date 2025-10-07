-- Create categories table for famous people
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create famous_people table
CREATE TABLE public.famous_people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  bio TEXT,
  photo_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.famous_people ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no authentication required)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Famous people are viewable by everyone" 
ON public.famous_people 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_famous_people_updated_at
BEFORE UPDATE ON public.famous_people
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial categories
INSERT INTO public.categories (name) VALUES
  ('Internet Celebrity'),
  ('Actor'),
  ('Dancer'),
  ('Sportsperson'),
  ('Musician'),
  ('Politician'),
  ('Writer'),
  ('Scientist');

-- Insert some sample famous people
INSERT INTO public.famous_people (name, date_of_birth, bio, photo_url, category_id) VALUES
  (
    'Elon Musk',
    '1971-06-28',
    'Business magnate, entrepreneur, and investor. CEO of SpaceX and Tesla.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
    (SELECT id FROM public.categories WHERE name = 'Internet Celebrity')
  ),
  (
    'Leonardo DiCaprio',
    '1974-11-11',
    'American actor and film producer known for his roles in Titanic, The Wolf of Wall Street, and more.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Leonardo_Dicaprio_Cannes_2019.jpg/440px-Leonardo_Dicaprio_Cannes_2019.jpg',
    (SELECT id FROM public.categories WHERE name = 'Actor')
  ),
  (
    'Cristiano Ronaldo',
    '1985-02-05',
    'Portuguese professional footballer widely regarded as one of the greatest players of all time.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg/440px-Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_%28cropped%29.jpg',
    (SELECT id FROM public.categories WHERE name = 'Sportsperson')
  ),
  (
    'Taylor Swift',
    '1989-12-13',
    'American singer-songwriter known for narrative songs about her personal life and one of the best-selling music artists.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png/440px-191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png',
    (SELECT id FROM public.categories WHERE name = 'Musician')
  ),
  (
    'Shakira',
    '1977-02-02',
    'Colombian singer and dancer known for hits like "Hips Don''t Lie" and "Waka Waka".',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Shakira_2020_%28cropped_2%29.jpg/440px-Shakira_2020_%28cropped_2%29.jpg',
    (SELECT id FROM public.categories WHERE name = 'Dancer')
  ),
  (
    'Emma Watson',
    '1990-04-15',
    'British actress and activist best known for playing Hermione Granger in the Harry Potter series.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Emma_Watson_2013.jpg/440px-Emma_Watson_2013.jpg',
    (SELECT id FROM public.categories WHERE name = 'Actor')
  );