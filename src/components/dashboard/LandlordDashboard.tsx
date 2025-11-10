import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  DollarSign, 
  Users,
  Settings,
  LogOut,
  AlertCircle,
  Loader2,
  Bell,
  Building
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Property, Application } from '../../types/database.types';

interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'terminated' | 'expired';
  property_title: string;
  tenant_name: string;
}

export function LandlordDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date 60 days from now for lease expiration filter
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
        const formattedDate = sixtyDaysFromNow.toISOString().split('T')[0];
        
        const [propertiesRes, applicationsRes, leasesRes] = await Promise.all([
          supabase
            .from('properties')
            .select('*')
            .eq('landlord_id', user.id),
          supabase
            .from('applications')
            .select('*')
            .eq('landlord_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('leases')
            .select(`
              *,
              property:property_id (title),
              tenant:tenant_id (full_name)
            `)
            .eq('landlord_id', user.id)
            .eq('status', 'active')
            .lte('end_date', formattedDate)
            .order('end_date', { ascending: true })
        ]);

        if (propertiesRes.error) throw propertiesRes.error;
        if (applicationsRes.error) throw applicationsRes.error;
        if (leasesRes.error) throw leasesRes.error;

        // Transform leases data to include property title and tenant name
        const formattedLeases = leasesRes.data?.map(lease => ({
          ...lease,
          property_title: lease.property?.title || 'Unknown Property',
          tenant_name: lease.tenant?.full_name || 'Unknown Tenant'
        })) || [];

        setProperties(propertiesRes.data || []);
        setApplications(applicationsRes.data || []);
        setLeases(formattedLeases);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Calculate stats from actual data
  const stats = [
    { 
      name: 'Total Properties', 
      value: properties.length.toString(), 
      icon: Home, 
      change: '+0',
      changeType: 'increase' 
    },
    { 
      name: 'Pending Applications', 
      value: applications.filter(app => app.status === 'pending').length.toString(), 
      icon: FileText, 
      change: '+0', 
      changeType: 'increase' 
    },
    { 
      name: 'Monthly Revenue', 
      value: `R${properties.reduce((sum, prop) => sum + (prop.monthly_rent || 0), 0).toLocaleString()}`, 
      icon: DollarSign, 
      change: '+0%', 
      changeType: 'increase' 
    },
    { 
      name: 'Active Tenants', 
      value: applications.filter(app => app.status === 'approved').length.toString(), 
      icon: Users, 
      change: '+0', 
      changeType: 'increase' 
    },
  ];

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`text-2xl font-bold ${!sidebarOpen && 'hidden'}`}>RentSafe</h1>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        <nav className="mt-10">
          {[
            { name: 'Dashboard', icon: Home, href: '/dashboard' },
            { name: 'Properties', icon: Building, href: '/dashboard/properties' },
            { name: 'Applications', icon: FileText, href: '/dashboard/applications' },
            { name: 'Payments', icon: DollarSign, href: '/dashboard/payments' },
            { name: 'Tenants', icon: Users, href: '/dashboard/tenants' },
            { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
          ].map((item) => (
            <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }: { isActive: boolean }) => 
                  `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white ${
                    isActive ? 'bg-gray-900' : ''
                  } ${!sidebarOpen ? 'justify-center' : ''}`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>{item.name}</span>
              </NavLink>
          ))}
          <button
            onClick={signOut}
            className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Sign Out</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="bg-white shadow-sm">
          <div className="w-full px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button 
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 relative"
                onClick={() => {}} // Add notification click handler
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
                {applications.some(app => app.status === 'pending') && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <main className="flex-1 overflow-y-auto p-6 w-full">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
            {stats.map((stat) => (
              <div key={stat.name} className="p-5 bg-white rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                    <stat.icon className="h-6 w-6" />
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
                            stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Pending Applications */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Applications</h2>
              <div className="space-y-4">
                {applications
                  .filter(app => app.status === 'pending')
                  .slice(0, 5)
                  .map((app) => {
                    const appDate = new Date(app.created_at);
                    const formattedDate = appDate.toLocaleDateString();
                    
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {app.property_title || `Property ${app.property_id.substring(0, 5)}`}
                            </p>
                            <p className="text-xs text-gray-500">{formattedDate}</p>
                          </div>
                        </div>
                        <Link 
                          to={`/dashboard/applications/${app.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </div>
                    );
                  })}
                {applications.filter(app => app.status === 'pending').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No pending applications</p>
                )}
                {applications.filter(app => app.status === 'pending').length > 5 && (
                  <div className="text-center mt-2">
                    <Link 
                      to="/dashboard/applications?status=pending"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View all pending applications
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Lease Expirations */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Lease Expirations</h2>
              <div className="space-y-4">
                {leases
                  .filter(lease => new Date(lease.end_date) > new Date())
                  .slice(0, 5)
                  .map((lease) => {
                    const endDate = new Date(lease.end_date);
                    const daysUntilExpiry = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={lease.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {lease.property_title}
                          </p>
                          <p className="text-xs text-gray-500">
                            Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'} • {endDate.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Tenant: {lease.tenant_name}</p>
                        </div>
                        <Link 
                          to={`/dashboard/leases/${lease.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Details
                        </Link>
                      </div>
                    );
                  })}
                {leases.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming lease expirations</p>
                ) : leases.filter(lease => new Date(lease.end_date) > new Date()).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No leases expiring in the next 60 days</p>
                )}
                {leases.length > 5 && (
                  <div className="text-center mt-2">
                    <Link 
                      to="/dashboard/leases?filter=upcoming"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View all leases
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <div className="mt-4 space-y-4">
              {applications.slice(0, 3).map((app) => {
                const appDate = new Date(app.created_at);
                const formattedDate = appDate.toLocaleDateString();
                const formattedTime = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={app.id} className="flex items-start pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        New {app.status} application for {app.property_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formattedDate} at {formattedTime}
                      </p>
                    </div>
                  </div>
                );
              })}
              {applications.length === 0 && (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default LandlordDashboard;