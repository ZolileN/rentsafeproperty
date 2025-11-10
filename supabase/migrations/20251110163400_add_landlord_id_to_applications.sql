-- Add landlord_id column to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS landlord_id uuid REFERENCES users(id) ON DELETE CASCADE;

-- Backfill existing applications with the correct landlord_id from the properties table
UPDATE applications a
SET landlord_id = p.landlord_id
FROM properties p
WHERE a.property_id = p.id;

-- Make the column required after backfilling
ALTER TABLE applications ALTER COLUMN landlord_id SET NOT NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_landlord_id ON applications(landlord_id);

-- Update RLS policies to include landlord_id
DROP POLICY IF EXISTS "Landlords can view applications for their properties" ON applications;
CREATE POLICY "Landlords can view applications for their properties"
  ON applications FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = applications.property_id 
    AND properties.landlord_id = auth.uid()
  ));