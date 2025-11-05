-- Add columns for application email and follow-up email
ALTER TABLE cover_letters
ADD COLUMN application_email text,
ADD COLUMN followup_email text;