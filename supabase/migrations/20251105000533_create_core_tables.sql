/*
  # RentSafe Core Database Schema

  ## Overview
  Creates the foundational database structure for the RentSafe rental verification platform.

  ## New Tables Created

  ### 1. `users`
  Stores all user accounts across the platform (tenants, landlords, admins)
  - `id` (uuid, primary key) - User identifier
  - `email` (text, unique) - User email address
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact phone number
  - `role` (text) - User role: 'tenant', 'landlord', 'admin'
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `verification_profiles`
  Stores identity verification data for users
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to users table
  - `id_number` (text) - South African ID number (encrypted)
  - `verification_status` (text) - Status: 'pending', 'verified', 'rejected', 'expired'
  - `verification_method` (text) - Method used: 'smile_id', 'onfido', 'manual'
  - `verified_at` (timestamptz) - Verification completion timestamp
  - `verification_data` (jsonb) - Additional verification metadata
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `properties`
  Property listings created by landlords
  - `id` (uuid, primary key)
  - `landlord_id` (uuid, foreign key) - Links to users table
  - `title` (text) - Property title
  - `description` (text) - Detailed description
  - `address` (text) - Full street address
  - `city` (text) - City/town
  - `province` (text) - South African province
  - `postal_code` (text) - Postal code
  - `property_type` (text) - Type: 'house', 'apartment', 'townhouse', 'room'
  - `bedrooms` (integer) - Number of bedrooms
  - `bathrooms` (integer) - Number of bathrooms
  - `rent_amount` (decimal) - Monthly rent in ZAR
  - `deposit_amount` (decimal) - Security deposit in ZAR
  - `available_from` (date) - Availability date
  - `is_verified` (boolean) - Property ownership verified
  - `verification_status` (text) - Status: 'pending', 'verified', 'rejected'
  - `images` (jsonb) - Array of image URLs
  - `amenities` (jsonb) - Array of amenities
  - `is_active` (boolean) - Listing is active/visible
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `applications`
  Rental applications submitted by tenants
  - `id` (uuid, primary key)
  - `property_id` (uuid, foreign key) - Links to properties
  - `tenant_id` (uuid, foreign key) - Links to users
  - `status` (text) - Status: 'pending', 'reviewed', 'approved', 'rejected', 'withdrawn'
  - `employment_status` (text) - Tenant's employment status
  - `monthly_income` (decimal) - Monthly income in ZAR
  - `move_in_date` (date) - Preferred move-in date
  - `message` (text) - Application message/cover letter
  - `reference_contacts` (jsonb) - Array of reference contacts
  - `reviewed_at` (timestamptz) - When landlord reviewed
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `leases`
  Active rental agreements
  - `id` (uuid, primary key)
  - `property_id` (uuid, foreign key)
  - `landlord_id` (uuid, foreign key)
  - `tenant_id` (uuid, foreign key)
  - `application_id` (uuid, foreign key)
  - `start_date` (date) - Lease start date
  - `end_date` (date) - Lease end date
  - `monthly_rent` (decimal) - Agreed monthly rent
  - `deposit_amount` (decimal) - Security deposit
  - `status` (text) - Status: 'draft', 'pending_signature', 'active', 'expired', 'terminated'
  - `lease_document_url` (text) - Signed lease document URL
  - `signed_by_tenant_at` (timestamptz)
  - `signed_by_landlord_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `payments`
  Payment transaction records
  - `id` (uuid, primary key)
  - `lease_id` (uuid, foreign key)
  - `payer_id` (uuid, foreign key) - User making payment
  - `amount` (decimal) - Payment amount in ZAR
  - `payment_type` (text) - Type: 'rent', 'deposit', 'verification_fee'
  - `payment_method` (text) - Method: 'ozow', 'payfast', 'eft'
  - `status` (text) - Status: 'pending', 'completed', 'failed', 'refunded'
  - `transaction_reference` (text) - External payment reference
  - `payment_date` (timestamptz) - When payment was made
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `messages`
  In-app messaging between users
  - `id` (uuid, primary key)
  - `sender_id` (uuid, foreign key)
  - `recipient_id` (uuid, foreign key)
  - `property_id` (uuid, foreign key, optional)
  - `application_id` (uuid, foreign key, optional)
  - `content` (text) - Message content
  - `is_read` (boolean) - Read status
  - `read_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 8. `reviews`
  User reviews and ratings
  - `id` (uuid, primary key)
  - `lease_id` (uuid, foreign key)
  - `reviewer_id` (uuid, foreign key) - User writing review
  - `reviewee_id` (uuid, foreign key) - User being reviewed
  - `rating` (integer) - Rating 1-5
  - `review_type` (text) - Type: 'tenant_to_landlord', 'landlord_to_tenant'
  - `comment` (text) - Review text
  - `created_at` (timestamptz)

  ### 9. `reports`
  Fraud and abuse reports
  - `id` (uuid, primary key)
  - `reporter_id` (uuid, foreign key)
  - `reported_user_id` (uuid, foreign key)
  - `reported_property_id` (uuid, foreign key, optional)
  - `reason` (text) - Report reason
  - `description` (text) - Detailed description
  - `status` (text) - Status: 'pending', 'under_review', 'resolved', 'dismissed'
  - `admin_notes` (text) - Admin review notes
  - `resolved_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS (Row Level Security) enabled
  - Policies created for each user role with appropriate access controls
  - Data is protected based on user identity and ownership
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create verification_profiles table
CREATE TABLE IF NOT EXISTS verification_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  id_number text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verification_method text CHECK (verification_method IN ('smile_id', 'onfido', 'manual')),
  verified_at timestamptz,
  verification_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  province text NOT NULL,
  postal_code text,
  property_type text NOT NULL CHECK (property_type IN ('house', 'apartment', 'townhouse', 'room')),
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0,
  rent_amount decimal(10, 2) NOT NULL,
  deposit_amount decimal(10, 2) NOT NULL,
  available_from date NOT NULL,
  is_verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  images jsonb DEFAULT '[]'::jsonb,
  amenities jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'withdrawn')),
  employment_status text,
  monthly_income decimal(10, 2),
  move_in_date date,
  message text,
  reference_contacts jsonb DEFAULT '[]'::jsonb,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id, tenant_id)
);

-- Create leases table
CREATE TABLE IF NOT EXISTS leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE RESTRICT NOT NULL,
  landlord_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
  tenant_id uuid REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  monthly_rent decimal(10, 2) NOT NULL,
  deposit_amount decimal(10, 2) NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'terminated')),
  lease_document_url text,
  signed_by_tenant_at timestamptz,
  signed_by_landlord_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid REFERENCES leases(id) ON DELETE CASCADE,
  payer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10, 2) NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('rent', 'deposit', 'verification_fee')),
  payment_method text CHECK (payment_method IN ('ozow', 'payfast', 'eft')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_reference text,
  payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id uuid REFERENCES leases(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_type text NOT NULL CHECK (review_type IN ('tenant_to_landlord', 'landlord_to_tenant')),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lease_id, reviewer_id)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reported_property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_property ON applications(property_id);
CREATE INDEX IF NOT EXISTS idx_applications_tenant ON applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_leases_property ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_landlord ON leases(landlord_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_payments_lease ON payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view other users basic info"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for verification_profiles table
CREATE POLICY "Users can view own verification"
  ON verification_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification"
  ON verification_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification"
  ON verification_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for properties table
CREATE POLICY "Anyone can view active verified properties"
  ON properties FOR SELECT
  TO authenticated
  USING (is_active = true AND is_verified = true);

CREATE POLICY "Landlords can view own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can create properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (auth.uid() = landlord_id);

-- RLS Policies for applications table
CREATE POLICY "Tenants can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = tenant_id);

CREATE POLICY "Landlords can view applications for their properties"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = applications.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = tenant_id)
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Landlords can update applications for their properties"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = applications.property_id
      AND properties.landlord_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = applications.property_id
      AND properties.landlord_id = auth.uid()
    )
  );

-- RLS Policies for leases table
CREATE POLICY "Tenants can view own leases"
  ON leases FOR SELECT
  TO authenticated
  USING (auth.uid() = tenant_id);

CREATE POLICY "Landlords can view own leases"
  ON leases FOR SELECT
  TO authenticated
  USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can create leases for their properties"
  ON leases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own leases"
  ON leases FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Tenants can update lease signatures"
  ON leases FOR UPDATE
  TO authenticated
  USING (auth.uid() = tenant_id)
  WITH CHECK (auth.uid() = tenant_id);

-- RLS Policies for payments table
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = payer_id);

CREATE POLICY "Landlords can view payments for their leases"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leases
      WHERE leases.id = payments.lease_id
      AND leases.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = payer_id);

-- RLS Policies for messages table
CREATE POLICY "Users can view sent messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can view received messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- RLS Policies for reviews table
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their leases"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM leases
      WHERE leases.id = reviews.lease_id
      AND (leases.tenant_id = auth.uid() OR leases.landlord_id = auth.uid())
    )
  );

-- RLS Policies for reports table
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_profiles_updated_at BEFORE UPDATE ON verification_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profiles when users sign up
-- This function handles new user creation and ensures a profile exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table to auto-create profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow users to insert their own profile if it doesn't exist
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);