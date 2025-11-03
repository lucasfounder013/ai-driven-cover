-- Add duration fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN duration_min integer,
ADD COLUMN duration_max integer;