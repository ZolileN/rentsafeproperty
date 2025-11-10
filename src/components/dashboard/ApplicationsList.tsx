import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Application {
  id: string;
  property_id: string;
  property_title: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  email: string;
  phone: string;
  full_name: string;
  message?: string;
}

export function ApplicationsList() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            created_at,
            email,
            phone,
            full_name,
            message,
            property:properties (
              id,
              title
            )
          `)
          .eq('landlord_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const formattedApplications = data.map(app => {
        // Get the first property if it exists
        const property = Array.isArray(app.property) ? app.property[0] : app.property;
        
        return {
            id: app.id,
            property_id: property?.id || '',
            property_title: property?.title || 'Unknown Property',
            status: app.status,
            created_at: app.created_at,
            email: app.email,
            phone: app.phone,
            full_name: app.full_name,
            message: app.message
        };
        });

        setApplications(formattedApplications);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user?.id]);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status } : app
      ));
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <div className="mt-2 text-sm text-red-700">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="font-medium text-red-700 hover:text-red-600 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rental Applications</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage rental applications for your properties.
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {applications.length === 0 ? (
          <div className="text-center p-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any rental applications yet.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {applications.map((app) => (
              <li key={app.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {getStatusIcon(app.status)}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-blue-600 hover:text-blue-500">
                              <Link to={`/property/${app.property_id}`}>
                                {app.property_title}
                              </Link>
                            </h3>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            <p>{app.full_name} • {app.email} • {app.phone}</p>
                            <p className="mt-1">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'approved')}
                        disabled={app.status === 'approved'}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                          app.status === 'approved' 
                            ? 'bg-green-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'rejected')}
                        disabled={app.status === 'rejected'}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                          app.status === 'rejected' 
                            ? 'bg-red-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  {app.message && (
                    <div className="mt-3 pl-16">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Message: </span>
                        {app.message}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}