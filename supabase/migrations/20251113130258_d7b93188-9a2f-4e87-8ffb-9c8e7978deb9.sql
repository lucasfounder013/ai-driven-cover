-- Add profile_data column to store profile information used during generation
ALTER TABLE cover_letters 
ADD COLUMN profile_data jsonb;