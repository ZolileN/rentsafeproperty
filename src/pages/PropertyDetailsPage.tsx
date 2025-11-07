import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Ruler, 
  Star,
  Wifi,
  Tv,
  Utensils,
  Snowflake,
  WashingMachine,
  ParkingCircle,
  Dumbbell,
  Waves,
  Coffee,
  MonitorPlay,
  Home,
  Fence,
  Fan,
  Microwave,
  Refrigerator,
  CheckCircle,
  Clock,
  Building,
  ShowerHead,
  Bell,
  Flame,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  deposit_amount?: number;
  floor_size?: string;
  lease_term?: number;
  ensuite?: number;
  parking?: number;
  images: string[];
  amenities: string[];
  is_verified: boolean;
  // Add other properties as needed
}

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // In PropertyDetailsPage.tsx
useEffect(() => {
  const fetchProperty = async () => {
    try {
      setLoading(true);
      console.log('Fetching property with ID:', id); // Debug log
      
      // Fetch property details
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error); // More detailed error
        throw error;
      }

      console.log('Fetched property:', data); // Debug log
      setProperty(data);

      // Check if property is in user's favorites
      if (user) {
        const { data: favorite } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('property_id', id)
          .single();

        setIsFavorite(!!favorite);
      }
    } catch (error) {
      console.error('Error in fetchProperty:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    fetchProperty();
  }
}, [id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', id);
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, property_id: id }]);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!property) {
    return <div className="min-h-screen flex items-center justify-center">Property not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button and favorite toggle */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to results
            </button>
            <button
              onClick={toggleFavorite}
              className={`flex items-center ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="ml-2">{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Property content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Image gallery */}
          <div className="relative h-96 bg-gray-200">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Property details */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="w-5 h-5 mr-1" />
                  <span>{property.address}, {property.city}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-green-600">
                  R{property.rent_amount?.toLocaleString()}/month
                </div>
                {property.deposit_amount && (
                  <div className="text-sm text-gray-600 mt-1">
                    R{new Intl.NumberFormat('en-ZA').format(property.deposit_amount)} deposit
                  </div>
                )}
              </div>
            </div>

            {/* Property features */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {/* Property Type */}
              <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                <Building className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <span className="text-gray-800 font-medium capitalize">{property.property_type}</span>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                <Bed className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Bedrooms</p>
                  <span className="text-gray-800 font-medium">{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                <Bath className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Bathrooms</p>
                  <span className="text-gray-800 font-medium">{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                </div>
              </div>

              {/* En-suite */}
              {property.ensuite !== undefined && property.ensuite > 0 && (
                <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                  <ShowerHead className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">En-suite</p>
                    <span className="text-gray-800 font-medium">{property.ensuite}</span>
                  </div>
                </div>
              )}

              {/* Floor Size */}
              {property.floor_size && (
                <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                  <Ruler className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Floor Size</p>
                    <span className="text-gray-800 font-medium">{property.floor_size} m²</span>
                  </div>
                </div>
              )}

              {/* Lease Term */}
              {property.lease_term !== undefined && (
                <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                  <Calendar className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Lease Term</p>
                    <span className="text-gray-800 font-medium">{property.lease_term} months</span>
                  </div>
                </div>
              )}

              {/* Parking */}
              {property.parking !== undefined && property.parking > 0 && (
                <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
                  <ParkingCircle className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Parking</p>
                    <span className="text-gray-800 font-medium">
                      {property.parking} {property.parking === 1 ? 'Space' : 'Spaces'}
                    </span>
                  </div>
                </div>
              )}

              {/* Verified Badge */}
              {property.is_verified && (
                <div className="flex items-center bg-green-50 px-4 py-3 rounded-lg border border-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-green-600">Status</p>
                    <span className="text-green-700 font-medium">Verified Property</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">Description</h2>
              <p className="text-gray-800 text-base leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => {
                    // Map amenity names to their corresponding icons
                    const getAmenityIcon = (name: string) => {
                      const lowerName = name.toLowerCase();
                      const iconProps = { className: 'w-4 h-4 mr-2 text-blue-600' };
                      
                      if (lowerName.includes('braai') || lowerName.includes('grill')) return <Flame {...iconProps} />;
                      if (lowerName.includes('wifi') || lowerName.includes('internet')) return <Wifi {...iconProps} />;
                      if (lowerName.includes('tv')) return <Tv {...iconProps} />;
                      if (lowerName.includes('parking') || lowerName.includes('garage')) return <ParkingCircle {...iconProps} />;
                      if (lowerName.includes('air') || lowerName.includes('ac')) return <Snowflake {...iconProps} />;
                      if (lowerName.includes('pool')) return <Waves {...iconProps} />;
                      if (lowerName.includes('gym') || lowerName.includes('fitness')) return <Dumbbell {...iconProps} />;
                      if (lowerName.includes('kitchen') || lowerName.includes('cooking')) return <Utensils {...iconProps} />;
                      if (lowerName.includes('washer') || lowerName.includes('laundry')) return <WashingMachine {...iconProps} />;
                      if (lowerName.includes('coffee') || lowerName.includes('maker')) return <Coffee {...iconProps} />;
                      if (lowerName.includes('tv') || lowerName.includes('television')) return <MonitorPlay {...iconProps} />;
                      if (lowerName.includes('furnished')) return <Home {...iconProps} />;
                      if (lowerName.includes('garden') || lowerName.includes('yard')) return <Fence {...iconProps} />;
                      if (lowerName.includes('fan') || lowerName.includes('ceiling fan')) return <Fan {...iconProps} />;
                      if (lowerName.includes('microwave')) return <Microwave {...iconProps} />;
                      if (lowerName.includes('fridge') || lowerName.includes('refrigerator')) return <Refrigerator {...iconProps} />;
                      if (lowerName.includes('alarm') || lowerName.includes('security') || lowerName.includes('bell')) return <Bell {...iconProps} />;
                      
                      // Default icon if no match
                      return <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />;
                    };

                    return (
                      <div 
                        key={index}
                        className="flex items-center bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-lg transition-colors border border-gray-200"
                      >
                        {getAmenityIcon(amenity)}
                        <span className="capitalize">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact/CTA */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition">
                Contact Landlord
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}