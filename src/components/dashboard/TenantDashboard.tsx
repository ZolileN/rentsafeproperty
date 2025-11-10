import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  AlertCircle,
  Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Application {
  id: string;
  property_id: string;
  property_title: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  property_image?: string;
}

export function TenantDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
                property:properties (
                id,
                title,
                image_url
                )
            `)
            .eq('tenant_id', user.id)
            .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Fix the property access
            const formattedApplications = data.map(app => {
            // Handle the case where property is an array
            const property = Array.isArray(app.property) ? app.property[0] : app.property;
            
            return {
                id: app.id,
                property_id: property?.id || '',
                property_title: property?.title || 'Unknown Property',
                status: app.status,
                created_at: app.created_at,
                property_image: property?.image_url
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

  const stats = [
    { 
      name: 'Applications', 
      value: applications.length.toString(), 
      icon: FileText, 
      change: '+0', 
      changeType: 'increase' 
    },
    { 
      name: 'Approved', 
      value: applications.filter(a => a.status === 'approved').length.toString(), 
      icon: CheckCircle, 
      change: '+0', 
      changeType: 'increase' 
    },
    { 
      name: 'Pending', 
      value: applications.filter(a => a.status === 'pending').length.toString(), 
      icon: Clock, 
      change: '0', 
      changeType: 'stable' 
    },
    { 
      name: 'Rejected', 
      value: applications.filter(a => a.status === 'rejected').length.toString(), 
      icon: XCircle, 
      change: '0', 
      changeType: 'stable' 
    },
  ];

  const filteredApplications = applications.filter(app => 
    app.property_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.email?.split('@')[0] || 'Tenant'}</p>
          </div>
          <div className="mt-4 md:mt-0 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'increase' ? 'text-green-600' : 
                            stat.changeType === 'decrease' ? 'text-red-600' : 'text-yellow-600'
                          }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Applications */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Applications</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your recent rental applications and their status
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <div key={app.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {app.property_image ? (
                        <img
                          className="h-16 w-16 rounded-md object-cover"
                          src={app.property_image}
                          alt={app.property_title}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                          <Home className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          {app.property_title}
                        </h4>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Applied on {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Link
                        to={`/property/${app.property_id}`}
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        View Property
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? 'No applications match your search.'
                    : "You haven't applied to any properties yet."}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Link
                      to="/search"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Browse Properties
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}