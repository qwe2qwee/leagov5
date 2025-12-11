   -- Create the deleted_users table to track account deletion requests
CREATE TABLE IF NOT EXISTS public.deleted_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.deleted_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own deletion request
CREATE POLICY "Users can insert their own deletion request" ON public.deleted_users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Optional: Create policy to allow users to view their own deletion request (if needed)
CREATE POLICY "Users can view their own deletion requests" ON public.deleted_users
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Notify about the table creation
COMMENT ON TABLE public.deleted_users IS 'Table to track user account deletion requests';
