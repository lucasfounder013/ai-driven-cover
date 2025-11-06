-- Add columns for tracking email sending information
ALTER TABLE public.cover_letters 
ADD COLUMN application_email_sent_date timestamp with time zone,
ADD COLUMN application_email_recipient text,
ADD COLUMN followup_email_sent_date timestamp with time zone,
ADD COLUMN followup_email_recipient text;