import { useAuth } from '../contexts/AuthContext';
import { LandlordDashboard } from '../components/dashboard/LandlordDashboard';
import { TenantDashboard } from '../components/dashboard/TenantDashboard';

export function DashboardPage() {
  const { user } = useAuth();
  
  // Show different dashboards based on user role
  if (user?.role === 'landlord') {
    return <LandlordDashboard />;
  } else {
    return <TenantDashboard />;
  }
}

// Remove the duplicate Property interface
// interface Property {
//   id: string;
//   title: string;
//   description: string;
//   rent_amount: number;
//   address: string;
//   city: string;
//   province: string;
//   postal_code: string;
//   property_type: string;
//   bedrooms: number;
//   bathrooms: number;
//   size_sqm: number;
//   images: string[];
// }
