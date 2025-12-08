-- Add generation tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_generations_count integer NOT NULL DEFAULT 0;

-- Add subscription status tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_active_subscription boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone DEFAULT NULL;

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(has_active_subscription);