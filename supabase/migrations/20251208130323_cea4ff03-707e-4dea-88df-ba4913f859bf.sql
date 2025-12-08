-- Add has_seen_pricing flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_seen_pricing boolean NOT NULL DEFAULT false;

-- Add index for efficient querying
CREATE INDEX idx_profiles_has_seen_pricing ON public.profiles(has_seen_pricing);