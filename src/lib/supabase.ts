import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'tenant' | 'landlord' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postal_code: string | null;
  property_type: 'house' | 'apartment' | 'townhouse' | 'room';
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  deposit_amount: number;
  available_from: string;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  images: string[];
  amenities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  property_id: string;
  tenant_id: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'withdrawn';
  employment_status: string | null;
  monthly_income: number | null;
  move_in_date: string | null;
  message: string | null;
  reference_contacts: Array<{ name: string; phone: string; relationship: string }>;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}
