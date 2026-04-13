
-- Enable extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create email_sequence table
CREATE TABLE public.email_sequence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  first_name text,
  j0_sent boolean NOT NULL DEFAULT false,
  j1_sent boolean NOT NULL DEFAULT false,
  j3_sent boolean NOT NULL DEFAULT false,
  j7_sent boolean NOT NULL DEFAULT false,
  j14_sent boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.email_sequence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email sequence"
ON public.email_sequence FOR SELECT
USING (auth.uid() = user_id);

-- Trigger function to insert into email_sequence on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_email_sequence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.email_sequence (user_id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created_email_sequence
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_email_sequence();
