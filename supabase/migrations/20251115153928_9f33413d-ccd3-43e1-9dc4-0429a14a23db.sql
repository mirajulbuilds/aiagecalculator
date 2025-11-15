-- Add author column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN author TEXT DEFAULT 'AI Age Calculator Team';