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
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700 transform hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="relative h-56">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <button 
            className="p-2 bg-white/80 rounded-full shadow-md hover:bg-gray-700 transition-colors"
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
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-semibold text-black line-clamp-2 min-h-[2.5rem] overflow-hidden">
            {property.title}
          </h3>
          <span className="text-lg font-bold text-emerald-500 whitespace-nowrap pl-2">
            {formatPrice(property.rent_amount)}
            <span className="text-sm font-normal text-gray-400">/month</span>
          </span>
        </div>
        
        <p className="text-black text-sm mt-2 flex items-start">
          <MapPin className="w-4 h-4 mt-0.5 mr-1.5 text-black flex-shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </p>
        
        {property.description && (
          <p className="text-black text-sm mt-3 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        )}
        
        <div className="flex items-center mt-4 text-sm text-black">
          <span className="flex items-center mr-4">
            <Bed className="w-4 h-4 mr-1.5 text-black" />
            {property.bedrooms} beds
          </span>
          <span className="flex items-center">
            <Bath className="w-4 h-4 mr-1.5 text-black" />
            {property.bedrooms || 0 > 1 ? 'baths' : 'bath'}
          </span>
        </div>
      </div>
    </div>
  );
}