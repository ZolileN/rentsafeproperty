import { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, MapPin, Filter, Home as HomeIcon, Building2, Building, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Property } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PropertyCard } from '../components/PropertyCard';

const propertyTypes = [
  { id: 'apartment', name: 'Apartment', icon: <Building2 className="w-5 h-5" /> },
  { id: 'house', name: 'House', icon: <HomeIcon className="w-5 h-5" /> },
  { id: 'townhouse', name: 'Townhouse', icon: <Building className="w-5 h-5" /> },
];

type SearchFilters = {
  city: string;
  propertyType: string;
  minRent: string;
  maxRent: string;
  bedrooms: string;
};

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1);

  const initialFilters = useMemo<SearchFilters>(() => ({
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    bedrooms: searchParams.get('bedrooms') || ''
  }), [searchParams]);

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const { user } = useAuth();

  const fetchProperties = async (): Promise<Property[]> => {
    try {
      console.log('Fetching properties...');
      
      // Base query for active properties
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_active', true);
      
      // Apply search filters from URL parameters
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      
      if (filters.minRent) {
        query = query.gte('rent_amount', Number(filters.minRent));
      }
      
      if (filters.maxRent) {
        query = query.lte('rent_amount', Number(filters.maxRent));
      }
      
      if (filters.bedrooms) {
        query = query.gte('bedrooms', Number(filters.bedrooms));
      }
      
      // If user is not an admin or landlord, only show verified properties
      if (!user || (user.role !== 'admin' && user.role !== 'landlord')) {
        query = query.eq('is_verified', true);
      }
      
      // Add ordering
      query = query.order('created_at', { ascending: false });
      
      const { data: properties, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched properties:', properties);
      return properties || [];
    } catch (error) {
      console.error('Error in fetchProperties:', error);
      return [];
    }
  };

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading properties...');
      const data = await fetchProperties();
      console.log('Setting properties:', data);
      setProperties(data);
      
      // Set up real-time subscription for property changes
      console.log('Setting up subscription...');
      // Create a filter for the subscription based on user role
      const subscriptionFilter = user?.role === 'admin' || user?.role === 'landlord'
      ? 'is_active=eq.true'
      : 'is_active=eq.true,is_verified=eq.true';
      const subscription = supabase
        .channel('public:properties')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'properties',
            filter: subscriptionFilter
          }, 
          (payload) => {
            console.log('Received change:', payload);
            // Refresh properties when there are changes
            fetchProperties().then(data => {
              console.log('Updated properties after change:', data);
              setProperties(data);
            });
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('Subscription error:', err);
            return;
          }
          console.log('Subscription status:', status);
        });
      
      // Cleanup subscription on unmount
      return () => {
        console.log('Unsubscribing...');
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCities = useCallback(async () => {
    const cities = [
      'Sandton, Johannesburg',
      'Sea Point, Cape Town',
      'Durban North, Durban',
      'Rosebank, Johannesburg',
      'Centurion, Pretoria',
      'Umhlanga, Durban',
      'Green Point, Cape Town',
      'Bryanston, Johannesburg',
      'Fourways, Johannesburg',
      'V&A Waterfront, Cape Town',
      'Midrand, Johannesburg',
      'Camps Bay, Cape Town'
    ];
    setCities(Array.from(new Set(cities)).sort());
  }, []);

  // Update URL when filters change and load properties when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Update URL without causing a page reload
    navigate(`?${params.toString()}`, { replace: true });
    
    // Load properties with current filters
    const loadFilteredProperties = async () => {
      try {
        setLoading(true);
        const data = await fetchProperties();
        setProperties(data);
      } catch (error) {
        console.error('Error loading filtered properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFilteredProperties();
  }, [filters, navigate]);

  // Load initial data
  useEffect(() => {
    loadProperties();
    loadCities();
  }, [loadProperties, loadCities]);

  const applyFilters = useCallback((properties: Property[]) => {
    return properties.filter(property => {
      // Filter by city - using address and city fields
      const location = `${property.address} ${property.city}`.toLowerCase();
      if (filters.city && !location.includes(filters.city.toLowerCase())) {
        return false;
      }
      
      // Filter by property type
      if (filters.propertyType && 
          property.property_type.toLowerCase() !== filters.propertyType.toLowerCase()) {
        return false;
      }
      
      // Filter by price range
      if (filters.minRent && property.rent_amount < Number(filters.minRent)) {
        return false;
      }
      if (filters.maxRent && property.rent_amount > Number(filters.maxRent)) {
        return false;
      }
      
      // Filter by number of bedrooms
      if (filters.bedrooms && property.bedrooms < Number(filters.bedrooms)) {
        return false;
      }
      
      return true;
    });
  }, [filters]);

  // Update properties when filters change
  useEffect(() => {
    const loadFilteredProperties = async () => {
      try {
        setLoading(true);
        const data = await fetchProperties();
        const filtered = applyFilters(data);
        setProperties(filtered);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFilteredProperties();
  }, [filters, applyFilters]);

  const clearFilters = useCallback(() => {
  const newFilters = {
    city: '',
    propertyType: '',
    minRent: '',
    maxRent: '',
    bedrooms: '',
  };
  
  setFilters(newFilters);
  
  // Reset URL parameters
  const params = new URLSearchParams();
  navigate('?' + params.toString(), { replace: true });
}, [navigate]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => Boolean(value));
  }, [filters]);


  function handleSelectCity(city: string) {
    setFilters(prev => ({ ...prev, city }));
    setShowCitySuggestions(false);
    setCitySuggestions([]);
    setHighlightedCityIndex(-1);
  }

  function handleCityKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showCitySuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedCityIndex((prev) => Math.min(prev + 1, citySuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedCityIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightedCityIndex >= 0 && highlightedCityIndex < citySuggestions.length) {
        e.preventDefault();
        handleSelectCity(citySuggestions[highlightedCityIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowCitySuggestions(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
          {/* Hero Section with Background Image */}
          <div className="relative w-full h-[500px] overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 w-screen left-1/2 -translate-x-1/2">
              <img
                src="/hero.png"
                alt="Luxury apartment building with modern architecture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto h-full flex flex-col justify-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-8 drop-shadow-lg">
            Find the place of your dreams
          </h1>
          
          {/* Property Type Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFilters(prev => ({ ...prev, propertyType: type.id }))}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  filters.propertyType === type.id ? 'bg-emerald-600' : 'hover:bg-gray-700/50'
                }`}
              >
                {type.icon}
                <span>{type.name}</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
            <div className="flex flex-col md:flex-row">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  onKeyDown={handleCityKeyDown}
                  placeholder="Search by city or area..."
                  className="w-full pl-10 pr-10 py-4 bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
                />
                {filters.city && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilters(prev => ({ ...prev, city: '' }));
                      setShowCitySuggestions(false);
                      setCitySuggestions([]);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                    {citySuggestions.map((city, idx) => (
                      <li
                        key={city}
                        className={`px-4 py-2 hover:bg-gray-700 text-gray-200 cursor-pointer ${
                          idx === highlightedCityIndex ? 'bg-gray-700' : ''
                        }`}
                        onClick={() => handleSelectCity(city)}
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 font-medium transition-colors"
                onClick={() => {}}
              >
                <Search className="w-5 h-5 inline-block mr-2" />
                Search Homes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
  <div>
    <h2 className="text-2xl font-bold text-white">
      {properties.length} Properties Found
    </h2>
    <p className="text-gray-300">in {filters.city || 'South Africa'}</p>
  </div>
  
  <div className="flex flex-wrap items-center gap-3">
    <div className="relative">
      <select
        value={filters.bedrooms}
        onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
        className="appearance-none bg-gray-800 border border-gray-700 rounded-md pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">Bedrooms: Any</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
      </select>
    </div>
    
    <div className="relative">
      <select
        value={filters.maxRent}
        onChange={(e) => setFilters(prev => ({ ...prev, maxRent: e.target.value }))}
        className="appearance-none bg-gray-800 border border-gray-700 rounded-md pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">Max Price: Any</option>
        <option value="5000">R5,000</option>
        <option value="10000">R10,000</option>
        <option value="15000">R15,000</option>
        <option value="20000">R20,000+</option>
      </select>
    </div>
    
    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-200 hover:bg-gray-700">
      <Filter className="w-4 h-4" />
      <span>More Filters</span>
    </button>

    {hasActiveFilters && (
      <button 
        onClick={clearFilters}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300"
      >
        <span>Clear All</span>
      </button>
    )}
  </div>
</div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.length > 0 ? (
              properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => navigate(`/property/${property.id}`)}
                />
              ))
            ) : (
              <div className="col-span-3 bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-700">
                <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Properties Found</h3>
                <p className="text-gray-400">Try adjusting your search filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}