-- Add column for tracking company response status
ALTER TABLE public.cover_letters 
ADD COLUMN response_status text DEFAULT 'no_response' CHECK (response_status IN ('no_response', 'positive', 'negative'));