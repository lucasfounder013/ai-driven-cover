-- Change available_from from date to text to allow free text input
ALTER TABLE public.profiles 
ALTER COLUMN available_from TYPE text USING available_from::text;