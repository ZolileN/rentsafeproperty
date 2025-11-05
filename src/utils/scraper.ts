export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  imageUrl: string;
  url: string;
  type: string;
  listingType: 'rent' | 'sale';
  description?: string;
}

// Explicitly type the array and ensure all properties match the Property interface
export const mockProperties = [
  {
    id: '1',
    title: 'Modern 3 Bedroom House in Sandton',
    price: 'R 25,000 p/m',
    location: 'Sandton, Johannesburg',
    bedrooms: 3,
    bathrooms: 2,
    area: '180 m²',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format',
    url: '/property/1',
    type: 'House',
    listingType: 'rent',
    description: 'Beautiful modern house with open plan living areas and a spacious garden.'
  },
  {
    id: '2',
    title: 'Luxury 2 Bedroom Apartment in Sea Point',
    price: 'R 32,000 p/m',
    location: 'Sea Point, Cape Town',
    bedrooms: 2,
    bathrooms: 2,
    area: '95 m²',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format',
    url: '/property/2',
    type: 'Apartment',
    listingType: 'rent',
    description: 'Stunning sea views from this modern apartment with premium finishes.'
  },
  {
    id: '3',
    title: 'Spacious 4 Bedroom Family Home',
    price: 'R 45,000 p/m',
    location: 'Durban North, Durban',
    bedrooms: 4,
    bathrooms: 3,
    area: '280 m²',
    imageUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&auto=format',
    url: '/property/3',
    type: 'House',
    listingType: 'rent',
    description: 'Perfect family home with a pool and large entertainment area.'
  },
  {
    id: '4',
    title: 'Modern 1 Bedroom Apartment',
    price: 'R 12,500 p/m',
    location: 'Rosebank, Johannesburg',
    bedrooms: 1,
    bathrooms: 1,
    area: '65 m²',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-37c2adfaf22a?w=800&auto=format',
    url: '/property/4',
    type: 'Apartment',
    listingType: 'rent',
    description: 'Stylish and modern apartment in the heart of Rosebank.'
  },
  {
    id: '5',
    title: '3 Bedroom Townhouse with Garden',
    price: 'R 18,000 p/m',
    location: 'Centurion, Pretoria',
    bedrooms: 3,
    bathrooms: 2,
    area: '160 m²',
    imageUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&auto=format',
    url: '/property/5',
    type: 'Townhouse',
    listingType: 'rent',
    description: 'Low-maintenance living with a private garden in a secure estate.'
  },
  {
    id: '6',
    title: 'Luxury Penthouse with Sea View',
    price: 'R 65,000 p/m',
    location: 'Umhlanga, Durban',
    bedrooms: 3,
    bathrooms: 3,
    area: '280 m²',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format',
    url: '/property/6',
    type: 'Penthouse',
    listingType: 'rent',
    description: 'Breathtaking sea views from this luxurious penthouse with premium finishes.'
  },
  {
    id: '7',
    title: '2 Bedroom Apartment in Green Point',
    price: 'R 28,000 p/m',
    location: 'Green Point, Cape Town',
    bedrooms: 2,
    bathrooms: 2,
    area: '85 m²',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format',
    url: '/property/7',
    type: 'Apartment',
    listingType: 'rent',
    description: 'Modern apartment in a secure complex with great amenities.'
  },
  {
    id: '8',
    title: '5 Bedroom Family Home with Cottage',
    price: 'R 55,000 p/m',
    location: 'Bryanston, Johannesburg',
    bedrooms: 5,
    bathrooms: 4,
    area: '420 m²',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format',
    url: '/property/8',
    type: 'House',
    listingType: 'rent',
    description: 'Spacious family home with a separate cottage, perfect for guests or a home office.'
  }
] as const satisfies Property[];

export async function fetchProperties(): Promise<Property[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return only rental properties
  return mockProperties.filter(property => property.listingType === 'rent');
}

export async function fetchPropertyById(id: string): Promise<Property | undefined> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  const property = mockProperties.find(property => property.id === id);
  // Only return if it's a rental property
  return property?.listingType === 'rent' ? property : undefined;
}

export async function searchProperties(query: string): Promise<Property[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const searchTerm = query.toLowerCase();
  return mockProperties.filter(
    property =>
      property.listingType === 'rent' && (
        property.title.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.type.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm)
      )
  );
}