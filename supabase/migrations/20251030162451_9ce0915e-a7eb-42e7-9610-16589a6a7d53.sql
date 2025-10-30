-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create cover_letters table
CREATE TABLE public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_description TEXT,
  cv_text TEXT,
  generated_letter TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on cover_letters
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- Create policies for cover_letters
CREATE POLICY "Users can view their own letters"
  ON public.cover_letters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own letters"
  ON public.cover_letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own letters"
  ON public.cover_letters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own letters"
  ON public.cover_letters FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON public.cover_letters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();