import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Property } from '../lib/supabase';
import { mockProperties } from '../utils/scraper';
import { PropertyCard } from '../components/PropertyCard';

export function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  
  const fetchProperties = async (): Promise<Property[]> => {
    // Map mock data to Property interface from supabase.ts
    return mockProperties.map(prop => ({
      id: prop.id,
      landlord_id: 'mock-landlord-id', // Required by Property interface
      title: prop.title,
      description: prop.description || 'No description available',
      address: prop.location, // Using location as address
      city: prop.location.split(', ')[1] || prop.location, // Extract city from location
      province: 'Gauteng', // Default value
      postal_code: null,
      property_type: prop.type.toLowerCase() as 'house' | 'apartment' | 'townhouse' | 'room',
      bedrooms: prop.bedrooms,
      bathrooms: prop.bedrooms > 1 ? 2 : 1, // Default to 2 bathrooms for properties with >1 bedroom
      rent_amount: Number(prop.price.replace(/[^0-9]/g, '')), // Convert price string to number
      deposit_amount: 0, // Default value
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
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    minRent: '',
    maxRent: '',
    bedrooms: '',
  });
  const [cities, setCities] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1);

  const loadCities = useCallback(async () => {
    // Mock cities from our property data
    const cities = [
  'Sandton, Johannesburg',
  'Sea Point, Cape Town',
  'Durban North, Durban',
  'Rosebank, Johannesburg',
  'Centurion, Pretoria',
  'Umhlanga, Durban',
  'Green Point, Cape Town',
  'Bryanston, Johannesburg',  // Added comma here
  'Fourways, Johannesburg',
  'V&A Waterfront, Cape Town',
  'Midrand, Johannesburg',
  'Camps Bay, Cape Town'
];
    setCities(Array.from(new Set(cities)).sort());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loc = params.get('location') || params.get('city') || '';
    if (loc) setFilters(prev => ({ ...prev, city: loc }));

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
    
    // Filter by property type - using property_type
    if (filters.propertyType && 
        property.property_type.toLowerCase() !== filters.propertyType.toLowerCase()) {
      return false;
    }
    
    // Filter by price range - using rent_amount
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

  function handleSearch() {
    setLoading(true);
    loadProperties();
  }

  function handleCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, city: value }));

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
    setFilters({ ...filters, city });
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Home</h1>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by city or location..."
                    value={filters.city}
                    onChange={handleCityChange}
                    onKeyDown={handleCityKeyDown}
                    onFocus={() => setShowCitySuggestions(citySuggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {citySuggestions.map((city, idx) => (
                        <li
                          key={city}
                          className={`px-4 py-3 cursor-pointer text-sm flex items-center ${idx === highlightedCityIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectCity(city);
                          }}
                        >
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                >
                  <option value="">All Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="room">Room</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Rent</label>
                <input
                  type="number"
                  value={filters.minRent}
                  onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Rent</label>
                <input
                  type="number"
                  value={filters.maxRent}
                  onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSearch}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Filter className="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>

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
                    onClick={() => window.location.href = `/property/${property.id}`}
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

