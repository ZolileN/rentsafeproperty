import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, CheckCircle, Home, MapPin, ChevronRight, Star, Heart, Building2, Building, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Property } from '../lib/supabase';
import { PropertyCard } from '../components/PropertyCard';
import { useAuth } from '../contexts/AuthContext';

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [propertyType, setPropertyType] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const propertyTypes = [
    { id: 'apartment', name: 'Apartment', icon: <Building2 className="w-5 h-5" /> },
    { id: 'house', name: 'House', icon: <Home className="w-5 h-5" /> },
    { id: 'townhouse', name: 'Townhouse', icon: <Building className="w-5 h-5" /> },
  ];

  useEffect(() => {
    loadFeaturedProperties();
    loadCities();
  }, []);

  async function loadFeaturedProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFeaturedProperties(data);
      } else {
        // Fallback mock data
        // Inside the loadFeaturedProperties function, replace the fallback mock data with:
setFeaturedProperties([
  {
    id: '1',
    title: 'Modern 3 Bedroom House in Sandton',
    rent_amount: 25000,
    address: '123 Main St, Sandton',
    city: 'Johannesburg',
    property_type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format'],
    is_verified: true,
    created_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: '2',
    title: 'Luxury 2 Bedroom Apartment in Sea Point',
    rent_amount: 18000,
    address: '45 Beach Road, Sea Point',
    city: 'Cape Town',
    property_type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format'],
    is_verified: true,
    created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    is_active: true
  },
  {
    id: '3',
    title: 'Spacious Family Home in Umhlanga',
    rent_amount: 32000,
    address: '12 Lagoon Drive, Umhlanga Rocks',
    city: 'Durban',
    property_type: 'house',
    bedrooms: 4,
    bathrooms: 3,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format'],
    is_verified: true,
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    is_active: true
  }
]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCities() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('city')
        .eq('is_active', true)
        .eq('is_verified', true);

      if (error) throw error;

      const unique = Array.from(new Set((data || []).map((r: { city: string }) => r.city).filter(Boolean)));
      unique.sort((a, b) => a.localeCompare(b));
      setCities(unique);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  }

  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() && !location.trim() && !propertyType && !minRent && !maxRent && !bedrooms) return;

    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (location) params.append('location', location);
    if (propertyType) params.append('propertyType', propertyType);
    if (minRent) params.append('minRent', minRent);
    if (maxRent) params.append('maxRent', maxRent);
    if (bedrooms) params.append('bedrooms', bedrooms);
    
    if (!user) {
      // Redirect to login with the intended search URL
      navigate(`/login?redirect=/search?${params.toString()}`);
    } else {
      navigate(`/search?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setPropertyType('');
    setMinRent('');
    setMaxRent('');
    setBedrooms('');
  };

  const hasActiveFilters = searchQuery || location || propertyType || minRent || maxRent || bedrooms;

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    if (value) {
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    }
  };

  const handleSelectSuggestion = (city: string) => {
    setLocation(city);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative w-full bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero.png"
            alt="Beautiful home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/50" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 py-24 sm:py-32 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Perfect Home
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-200">
              Discover the best properties for rent in South Africa
            </p>
          </div>

          {/* Property Type Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setPropertyType(type.id === propertyType ? '' : type.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  propertyType === type.id ? 'bg-emerald-600' : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                {type.icon}
                <span>{type.name}</span>
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto border border-gray-700">
            <form onSubmit={handleSearch} className="flex flex-col">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-2">
                  <label htmlFor="search" className="sr-only">Search properties</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-4 bg-gray-800/50 border-0 focus:ring-2 focus:ring-emerald-500 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                      placeholder="Search by property type, features..."
                    />
                  </div>
                </div>
                
                <div className="flex-1 p-2 border-t md:border-t-0 md:border-l border-gray-700">
                  <label htmlFor="location" className="sr-only">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      value={location}
                      onChange={handleLocationChange}
                      onKeyDown={handleLocationKeyDown}
                      onFocus={() => setShowSuggestions(suggestions.length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      autoComplete="off"
                      className="block w-full pl-10 pr-3 py-4 bg-gray-800/50 border-0 focus:ring-2 focus:ring-emerald-500 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                      placeholder="Location"
                    />

                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute z-20 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {suggestions.map((city, idx) => (
                          <li
                            key={city}
                            className={`px-3 py-2 cursor-pointer text-sm ${
                              idx === highlightedIndex ? 'bg-emerald-600 text-white' : 'hover:bg-gray-700 text-gray-200'
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSuggestion(city);
                            }}
                          >
                            {city}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
            </div> {/* Close the flex container */}
            
            <div className="p-2 md:p-3 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 px-4 py-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
                
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-2 px-4 py-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                    <span>Clear</span>
                  </button>
                )}
                
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
              
              {/* Advanced Filters */}
              {showFilters && (
                <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="minRent" className="block text-sm font-medium text-gray-300 mb-1">
                        Min Rent (ZAR)
                      </label>
                      <input
                        type="number"
                        id="minRent"
                        value={minRent}
                        onChange={(e) => setMinRent(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Min"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maxRent" className="block text-sm font-medium text-gray-300 mb-1">
                        Max Rent (ZAR)
                      </label>
                      <input
                        type="number"
                        id="maxRent"
                        value={maxRent}
                        onChange={(e) => setMaxRent(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Max"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-300 mb-1">
                        Bedrooms
                      </label>
                      <select
                        id="bedrooms"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Featured Properties</h2>
            <p className="mt-4 text-xl text-gray-200">Hand-picked properties just for you</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <div 
                  key={property.id} 
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="cursor-pointer"
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/search"
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-8 rounded-lg transition duration-200 flex items-center justify-center"
            >
              View all properties
              <ChevronRight className="ml-2 -mr-1 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Why Choose RentSafe?</h2>
            <p className="mt-4 text-xl text-gray-200">
              We're committed to making your rental experience safe, simple, and stress-free.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-emerald-600" />,
                title: "Verified Listings",
                description: "Every property is personally verified by our team to ensure accuracy and quality."
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-emerald-600" />,
                title: "Trusted Landlords",
                description: "We work with verified landlords who meet our strict quality standards."
              },
              {
                icon: <Home className="h-8 w-8 text-emerald-600" />,
                title: "Wide Selection",
                description: "Find the perfect home from our extensive collection of properties."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 mb-4 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-white text-center mb-2">{feature.title}</h3>
                <p className="text-gray-200 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
<section className="relative bg-gray-900">
  {/* Background Image */}
  <div className="absolute inset-0 opacity-30">
    <img
      src="/featured.png"
      alt="Featured properties"
      className="w-full h-full object-cover"
    />
  </div>
  
  <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8 text-center">
  <div className="max-w-3xl mx-auto">
    <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
      <span className="block">Ready to move in?</span>
    </h2>
    <p className="mt-4 text-xl text-gray-200">
      Browse through our verified listings and find the perfect place to call home.
    </p>
    <div className="mt-12">
      <Link
        to="/search"
        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-8 rounded-lg transition duration-200 flex items-center justify-center"
      >
        Browse properties
        <ChevronRight className="ml-2 -mr-1 w-5 h-5" />
      </Link>
    </div>
  </div>
</div>
</section>
    </div>
  );
}

export default HomePage;
