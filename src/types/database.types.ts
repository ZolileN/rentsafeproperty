export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'not_started';

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: 'id' | 'passport' | 'drivers_license';
  document_number: string;
  document_url: string;
  status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'tenant' | 'landlord' | 'admin';
  phone_number?: string;
  date_of_birth?: string;
  is_identity_verified: boolean;
  verification_status: VerificationStatus;
  verification_document_id?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: VerificationStatus;
  document_id: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}
export interface Property {
  id: string;
  title: string;
  description: string;
  rent_amount: number;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  size_sqm: number;
  images: string[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  landlord_id: string;
  deposit_amount?: number;
  available_from?: string;
  furnishing?: 'furnished' | 'unfurnished' | 'part_furnished';
  parking_spaces?: number;
  pet_friendly?: boolean;
  utilities_included?: boolean;
  lease_term_months?: number;
}