import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, AlertTriangle, Home, FileText, Plus, Search } from 'lucide-react';
import { VerificationStatus } from '../types/database.types';

interface Property {
  id: string;
  title: string;
  address: string;
  rent_amount: number;
  images?: string[];
  // Add other property fields as needed
}
interface Application {
  id: string;
  property_title: string;
  status: 'pending' | 'approved' | 'rejected';
  landlord_name: string;
  created_at: string;
  // Add other application fields as needed
}
const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_started');

  const loadLandlordProperties = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadTenantApplications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadVerificationStatus = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setVerificationStatus(data?.verification_status || 'not_started');
    } catch (error) {
      console.error('Error loading verification status:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      if (user.role === 'landlord') {
        await loadLandlordProperties();
      } else if (user.role === 'tenant') {
        await loadTenantApplications();
        await loadVerificationStatus();
      }
      setLoading(false);
    };

    loadData();
  }, [user, loadLandlordProperties, loadTenantApplications, loadVerificationStatus]);

  const renderVerificationBanner = () => {
    if (user?.role !== 'tenant' || verificationStatus === 'verified') return null;

    return (
      <div className="mb-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {verificationStatus === 'rejected' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : verificationStatus === 'pending' ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium">
                {verificationStatus === 'rejected' 
                  ? 'Verification Rejected' 
                  : verificationStatus === 'pending' 
                    ? 'Verification in Progress' 
                    : 'Verify Your Identity'}
              </h3>
              <div className="mt-2 text-sm text-gray-700">
                {verificationStatus === 'rejected' ? (
                  <p>Your identity verification was rejected. Please try again with clearer documents.</p>
                ) : verificationStatus === 'pending' ? (
                  <p>Your verification is being reviewed. This usually takes 1-2 business days.</p>
                ) : (
                  <p>Verify your identity to access all features and increase your chances of approval.</p>
                )}
                <div className="mt-4">
                  <Link
                    to="/verify-identity"
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                      verificationStatus === 'rejected' 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : verificationStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {verificationStatus === 'rejected' 
                      ? 'Resubmit Verification' 
                      : verificationStatus === 'pending'
                      ? 'View Status'
                      : 'Start Verification'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLandlordDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Properties</h2>
        <Link
          to="/property/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-100">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{property.address}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">R{property.rent_amount}/mo</span>
                  <Link
                    to={`/property/${property.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No properties yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first property.
          </p>
          <div className="mt-6">
            <Link
              to="/property/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Property
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  const renderTenantDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Applications</h2>
        <p className="text-gray-600">Track the status of your rental applications</p>
      </div>

      {renderVerificationBanner()}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : applications.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => (
              <li key={application.id}>
                <Link
                  to={`/application/${application.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {application.property_title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : application.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {application.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <FileText className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {application.landlord_name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Applied on{' '}
                          <time dateTime={application.created_at}>
                            {new Date(application.created_at).toLocaleDateString()}
                          </time>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No applications</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't applied to any properties yet.
          </p>
          <div className="mt-6">
            <Link
              to="/search"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Search className="-ml-1 mr-2 h-5 w-5" />
              Browse Properties
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.full_name || 'User'}!
        </p>
      </div>

      {user?.role === 'landlord' ? renderLandlordDashboard() : renderTenantDashboard()}
    </div>
  );
};

export default DashboardPage;