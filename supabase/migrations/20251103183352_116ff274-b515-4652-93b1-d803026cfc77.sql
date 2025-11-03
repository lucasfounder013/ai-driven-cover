-- Add desired_position and available_from fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN desired_position text,
ADD COLUMN available_from date;