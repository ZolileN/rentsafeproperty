import { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Property } from '../lib/supabase';
import { mockProperties } from '../utils/scraper';
import { PropertyCard } from '../components/PropertyCard';

// Define the filter types for better type safety
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

  // Initialize filters from URL parameters
  const initialFilters = useMemo<SearchFilters>(() => ({
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    bedrooms: searchParams.get('bedrooms') || ''
  }), [searchParams]);

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const fetchProperties = async (): Promise<Property[]> => {
    // Map mock data to Property interface from supabase.ts
    return mockProperties.map(prop => ({
      id: prop.id,
      landlord_id: 'mock-landlord-id',
      title: prop.title,
      description: prop.description || 'No description available',
      address: prop.location,
      city: prop.location.split(', ')[1] || prop.location,
      province: 'Gauteng',
      postal_code: null,
      property_type: prop.type.toLowerCase() as 'house' | 'apartment' | 'townhouse' | 'room',
      bedrooms: prop.bedrooms,
      bathrooms: prop.bedrooms > 1 ? 2 : 1,
      rent_amount: Number(prop.price.replace(/[^0-9]/g, '')),
      deposit_amount: 0,
      available_from: new Date().toISOString(),
      is_verified: true,
      verification_status: 'verified',
      images: [prop.imageUrl],
      amenities: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  };

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProperties();
      setProperties(data);
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

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Update URL without causing a page reload
    navigate(`?${params.toString()}`, { replace: true });
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
    setFilters({
      city: '',
      propertyType: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => Boolean(value));
  }, [filters]);

  function handleCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, city: value }));
    
    // Reset other city-related states
    setShowCitySuggestions(false);
    setCitySuggestions([]);
    setHighlightedCityIndex(-1);

    if (!value) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setHighlightedCityIndex(-1);
      return;
    }

    const searchTerm = value.toLowerCase();
    const filtered = cities
      .filter((c) => c.toLowerCase().includes(searchTerm))
      .sort((a, b) => {
        // Sort by how early the search term appears in the city name
        const aIndex = a.toLowerCase().indexOf(searchTerm);
        const bIndex = b.toLowerCase().indexOf(searchTerm);
        return aIndex - bIndex || a.length - b.length;
      })
      .slice(0, 5);

    setCitySuggestions(filtered);
    setShowCitySuggestions(filtered.length > 0);
    setHighlightedCityIndex(-1);
  }

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Home</h1>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <X size={16} />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City Search */}
            <div className="relative">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="city"
                  value={filters.city}
                  onChange={handleCityChange}
                  onKeyDown={handleCityKeyDown}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by city or area"
                />
                {showCitySuggestions && (
                  <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {citySuggestions.map((city, index) => (
                      <li
                        key={city}
                        className={`${
                          index === highlightedCityIndex ? 'bg-gray-100' : ''
                        } text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100`}
                        onClick={() => handleSelectCity(city)}
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                id="propertyType"
                value={filters.propertyType}
                onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
                <option value="room">Room</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="minRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R</span>
                  </div>
                  <input
                    type="number"
                    id="minRent"
                    value={filters.minRent}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRent: e.target.value }))}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Min"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="maxRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R</span>
                  </div>
                  <input
                    type="number"
                    id="maxRent"
                    value={filters.maxRent}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxRent: e.target.value }))}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <select
                id="bedrooms"
                value={filters.bedrooms}
                onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found <span className="font-semibold text-gray-900">{properties.length}</span> verified properties
              </p>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={() => { window.location.href = `/property/${property.id}`; }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600">Try adjusting your search filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}