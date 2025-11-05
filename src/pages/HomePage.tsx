import { useState, useEffect } from 'react';
import { Search, Shield, CheckCircle, Home, MapPin, ChevronRight } from 'lucide-react';
import { supabase, type Property } from '../lib/supabase';
import { PropertyCard } from '../components/PropertyCard';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    loadFeaturedProperties();
    loadCities();
  }, []);

  async function loadFeaturedProperties() {
  try {
    // First try to fetch from Supabase
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    
    if (data && data.length > 0) {
      setFeaturedProperties(data);
    } else {
      // If no data from Supabase, use mock data
      const mockData = [
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
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          landlord_id: 'mock-landlord-1',
          description: 'Beautiful modern house with open plan living areas and a spacious garden.',
          province: 'Gauteng',
          postal_code: '2196',
          deposit_amount: 50000,
          available_from: new Date().toISOString(),
          verification_status: 'verified',
          amenities: ['Swimming Pool', 'Garden', 'Garage', 'Security']
        },
        {
          id: '2',
          title: 'Luxury 2 Bedroom Apartment in Sea Point',
          rent_amount: 32000,
          address: '45 Beach Road, Sea Point',
          city: 'Cape Town',
          property_type: 'apartment',
          bedrooms: 2,
          bathrooms: 2,
          images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format'],
          is_verified: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          landlord_id: 'mock-landlord-2',
          description: 'Stunning sea views from this modern apartment with premium finishes.',
          province: 'Western Cape',
          postal_code: '8005',
          deposit_amount: 64000,
          available_from: new Date().toISOString(),
          verification_status: 'verified',
          amenities: ['Sea View', 'Balcony', 'Secure Parking', 'Gym']
        },
        {
          id: '3',
          title: 'Spacious 4 Bedroom Family Home in Umhlanga',
          rent_amount: 45000,
          address: '12 Lagoon Drive, Umhlanga Rocks',
          city: 'Durban',
          property_type: 'house',
          bedrooms: 4,
          bathrooms: 3,
          images: ['https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&auto=format'],
          is_verified: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          landlord_id: 'mock-landlord-3',
          description: 'Luxurious family home with modern amenities and beautiful sea views.',
          province: 'KwaZulu-Natal',
          postal_code: '4319',
          deposit_amount: 90000,
          available_from: new Date().toISOString(),
          verification_status: 'verified',
          amenities: ['Swimming Pool', 'Garden', 'Braai Area', 'Study']
        }
      ] as Property[];
      
      setFeaturedProperties(mockData);
    }
  } catch (error) {
    console.error('Error loading properties, using mock data instead:', error);
    // The mock data is already set in the else block above
  } finally {
    setLoading(false);
  }
}

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() || location.trim()) {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (location) params.append('location', location);
      window.location.href = `/search?${params.toString()}`;
    }
  };

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

  function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setLocation(value);

    if (!value) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    const filtered = cities
      .filter((c) => c.toLowerCase().startsWith(value.toLowerCase()))
      .slice(0, 8);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setHighlightedIndex(-1);
  }

  function handleSelectSuggestion(city: string) {
    setLocation(city);
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  }

  function handleLocationKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-deep-blue-900 to-deep-blue-800 text-white py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Find Your Perfect Home with Confidence
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Verified listings. Secure transactions. Exceptional service.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row">
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-4 border-0 focus:ring-2 focus:ring-deep-blue-500 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                    placeholder="Search by property type, features..."
                  />
                </div>
              </div>
              <div className="flex-1 p-2 border-t md:border-t-0 md:border-l border-gray-100">
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
                    className="block w-full pl-10 pr-3 py-4 border-0 focus:ring-2 focus:ring-deep-blue-500 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                    placeholder="Location"
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {suggestions.map((city, idx) => (
                        <li
                          key={city}
                          className={`px-3 py-2 cursor-pointer text-sm ${idx === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
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
              <div className="p-2">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 px-8 rounded-lg transition duration-200 flex items-center justify-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RentSafe?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to making your rental experience safe, simple, and stress-free.
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
                title: "Secure Payments",
                description: "Your transactions are protected with bank-level security and escrow services."
              },
              {
                icon: <Home className="h-8 w-8 text-emerald-600" />,
                title: "Trusted Landlords",
                description: "We vet all property owners to ensure you&apos;re working with reliable professionals."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
              <p className="text-gray-600 mt-2">Verified and ready for you to move in</p>
            </div>
            <a href="/search" className="text-deep-blue-700 hover:text-deep-blue-900 font-medium flex items-center">
              View all <ChevronRight className="ml-1 h-5 w-5" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No properties available</h3>
              <p className="mt-1 text-gray-500">Check back later for new listings</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-deep-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to find your perfect home?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy renters who found their perfect home with RentSafe.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/search"
              className="bg-white text-deep-blue-900 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition duration-200 inline-flex items-center justify-center"
            >
              Browse Properties
            </a>
            <a
              href="/signup"
              className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 font-medium py-3 px-8 rounded-lg transition duration-200 inline-flex items-center justify-center"
            >
              Sign Up Free
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
