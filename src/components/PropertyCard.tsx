import { MapPin, Bed, Bath, CheckCircle, Heart } from 'lucide-react';
import { Property } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const imageUrl = property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800';
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Link to={`/property/${property.id}`} className="block">
    <div
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200"
      onClick={onClick}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Favorite Button */}
        <button 
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors duration-200"
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite functionality
          }}
        >
          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 fill-transparent hover:fill-red-500 transition-colors" />
        </button>
        
        {/* Verified Badge */}
        {property.is_verified && (
          <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-xs font-medium shadow-md">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        )}
        
        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 bg-deep-blue-900/90 text-white px-3 py-1.5 rounded-md font-semibold text-sm backdrop-blur-sm">
          {formatPrice(property.rent_amount)}<span className="text-xs font-normal">/month</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
            {property.title}
          </h3>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1.5 text-deep-blue-700" />
          <span className="line-clamp-1">
            {property.address || `${property.city}, ${property.province}`}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-gray-700 text-sm mb-4">
          <div className="flex items-center space-x-1.5">
            <Bed className="w-4.5 h-4.5 text-deep-blue-700" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Bath className="w-4 h-4 text-deep-blue-700" />
            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          <span className="capitalize text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">
            {property.property_type}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {property.description}
        </p>

        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-deep-blue-900">Available</span> • {new Date(property.available_from).toLocaleDateString('en-ZA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <button 
            className="text-deep-blue-700 hover:text-deep-blue-900 text-sm font-medium flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              // Handle view details
            }}
          >
            View details
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    </Link>
  );
}
