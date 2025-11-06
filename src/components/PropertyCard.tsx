import { MapPin, Bed, Bath, CheckCircle, Heart } from 'lucide-react';
import { Property } from '../lib/supabase';
// Remove the Link import since it's not being used

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const imageUrl = property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div 
      className="bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-700"
      onClick={onClick}
    >
      <div className="relative h-56">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <button 
            className="p-2 bg-gray-800/80 rounded-full shadow-md hover:bg-gray-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite functionality
            }}
          >
            <Heart className="w-5 h-5 text-gray-300 hover:text-red-500" />
          </button>
        </div>
        {property.is_verified && (
          <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-white">{property.title}</h3>
          <span className="text-lg font-bold text-emerald-500">
            {formatPrice(property.rent_amount)}
            <span className="text-sm font-normal text-gray-400">/month</span>
          </span>
        </div>
        
        <p className="text-gray-300 text-sm mt-1 flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          {property.address}
        </p>
        
        <div className="flex items-center mt-4 text-sm text-gray-400">
          <span className="flex items-center mr-4">
            <Bed className="w-4 h-4 mr-1" />
            {property.bedrooms} beds
          </span>
          <span className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            {property.bathrooms} baths
          </span>
        </div>
      </div>
    </div>
  );
}