import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Check, 
  X, 
  Calendar, 
  ArrowLeft, 
  Home as HomeIcon, 
  Building, 
  Warehouse,
  Bath as BathIcon,
  Wifi, 
  Tv, 
  Utensils, 
  Snowflake, 
  Dumbbell, 
  Car, 
  PawPrint,
  Microwave,
  Bell, 
  Lock, 
  Wind,
  Sofa,
  Upload, 
  Loader2,
  WashingMachine
} from 'lucide-react';
import { toast } from 'react-toastify';
type PropertyType = 'apartment' | 'house' | 'townhouse' | 'room';

interface FormData {
  title: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  property_type: PropertyType;
  bedrooms: number | string;
  bathrooms: number | string;
  ensuite: number | string;
  parking: number | string;
  floor_size: string;
  rent_amount: string;
  deposit_amount: string;
  available_from: string;
  lease_term: string;
  amenities: string[];
}

export function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [, setLoading] = useState(true);
  const [saving] = useState(false);  // Or remove it entirely if not needed
  const [uploading, setUploading] = useState(false);
  const [, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{url: string, isUploading: boolean, isUploaded: boolean}[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    property_type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    ensuite: 0,
    parking: 0,
    floor_size: '',
    rent_amount: '',
    deposit_amount: '',
    available_from: '',
    lease_term: '12',
    amenities: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch property data when component mounts
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data: property, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!property) throw new Error('Property not found');

        // Format the data to match the form structure
        setFormData({
          title: property.title || '',
          description: property.description || '',
          address: property.address || '',
          city: property.city || '',
          province: property.province || '',
          postal_code: property.postal_code || '',
          property_type: (property.property_type as PropertyType) || 'apartment',
          bedrooms: property.bedrooms || 1,
          bathrooms: property.bathrooms || 1,
          ensuite: property.ensuite || 0,
          parking: property.parking || 0,
          floor_size: property.floor_size?.toString() || '',
          rent_amount: property.rent_amount?.toString() || '',
          deposit_amount: property.deposit_amount?.toString() || '',
          available_from: property.available_from?.split('T')[0] || '',
          lease_term: property.lease_term?.toString() || '12',
          amenities: property.amenities || [],
        });

        // Set existing images if any
        if (property.images && property.images.length > 0) {
          setImageUrls(property.images);
          setPreviewUrls(property.images.map((url: string) => ({
            url,
            isUploading: false,
            isUploaded: true
          })));
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property data');
        toast.error('Failed to load property data');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

const propertyTypes = [
  { id: 'apartment' as const, name: 'Apartment', icon: <HomeIcon className="h-5 w-5" /> },
  { id: 'house' as const, name: 'House', icon: <HomeIcon className="h-5 w-5" /> },
  { id: 'townhouse' as const, name: 'Townhouse', icon: <Building className="h-5 w-5" /> },
  { id: 'room' as const, name: 'Room', icon: <Warehouse className="h-5 w-5" /> },
];

const amenitiesList = [
    { id: 'wifi', name: 'WiFi', icon: <Wifi className="h-5 w-5" /> },
    { id: 'tv', name: 'TV', icon: <Tv className="h-5 w-5" /> },
    { id: 'kitchen', name: 'Kitchen', icon: <Utensils className="h-5 w-5" /> },
    { id: 'air_conditioning', name: 'Air Conditioning', icon: <Snowflake className="h-5 w-5" /> },
    { id: 'heating', name: 'Heating', icon: <Wind className="h-5 w-5" /> },
    { id: 'washer', name: 'Washer', icon: <WashingMachine className="h-5 w-5" /> },
    { id: 'dryer', name: 'Dryer', icon: <WashingMachine className="h-5 w-5 transform scale-x-[-1]" /> },
    { id: 'microwave', name: 'Microwave', icon: <Microwave className="h-5 w-5" /> },
    { id: 'refrigerator', name: 'Refrigerator', icon: <Snowflake className="h-5 w-5" /> },
    { id: 'furnished', name: 'Furnished', icon: <Sofa className="h-5 w-5" /> },
    { id: 'gym', name: 'Gym', icon: <Dumbbell className="h-5 w-5" /> },
    { id: 'parking', name: 'Parking', icon: <Car className="h-5 w-5" /> },
    { id: 'pet_friendly', name: 'Pet Friendly', icon: <PawPrint className="h-5 w-5" /> },
    { id: 'pool', name: 'Pool', icon: <BathIcon className="h-5 w-5" /> },
    { id: 'security', name: 'Security', icon: <Lock className="h-5 w-5" /> },
    { id: 'smoke_alarm', name: 'Smoke Alarm', icon: <Bell className="h-5 w-5" /> },
  ];

// Add these handler functions inside the component, before the return statement
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  if (value === '' || /^[0-9\b]+$/.test(value)) {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
};

const handleAmenityToggle = (amenityId: string) => {
  setFormData(prev => ({
    ...prev,
    amenities: prev.amenities.includes(amenityId)
      ? prev.amenities.filter(id => id !== amenityId)
      : [...prev.amenities, amenityId]
  }));
};

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `property_images/${fileName}`;

  setUploading(true);

  try {
    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    setImageUrls(prev => [...prev, publicUrl]);
    setPreviewUrls(prev => [
      ...prev,
      { url: publicUrl, isUploading: false, isUploaded: true }
    ]);
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image');
  } finally {
    setUploading(false);
  }
};

const removeImage = (index: number) => {
  setImageUrls(prev => prev.filter((_, i) => i !== index));
  setPreviewUrls(prev => prev.filter((_, i) => i !== index));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitError('');

  if (!user) {
    setError('You must be logged in to update a property');
    setIsSubmitting(false);
    return;
  }

  try {
    const updates = {
      ...formData,
      rent_amount: parseFloat(formData.rent_amount),
      deposit_amount: parseFloat(formData.deposit_amount),
      bedrooms: parseInt(formData.bedrooms.toString(), 10),
      bathrooms: parseFloat(formData.bathrooms.toString()),
      ensuite: parseInt(formData.ensuite.toString(), 10),
      parking: parseInt(formData.parking.toString(), 10),
      floor_size: formData.floor_size ? parseInt(formData.floor_size, 10) : null,
      images: imageUrls,
      is_verified: false,
      verification_status: 'pending',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    toast.success('Property updated successfully!');
    navigate('/dashboard/properties'); // Navigate back to properties page
  } catch (err) {
    const error = err as Error;
    console.error('Error updating property:', error);
    setSubmitError(error.message || 'Failed to update property');
    toast.error('Failed to update property');
  } finally {
    setIsSubmitting(false);
  }
};

// Replace the current return statement with this one
return (
  <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-emerald-600 hover:text-emerald-800 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your property details below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden mt-6 p-6">
            <div>
                <h2 className="text-lg font-medium text-gray-100">Basic Information</h2>
                <p className="mt-1 text-sm text-gray-300">
                Provide the basic details about your property.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mt-4">
                <div className="sm:col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                    Property Title
                    </label>
                    <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                />
                </div>

                <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-white">
                    Description
                    </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <p className="mt-2 text-sm text-white-500">
                  Write a few sentences about your property.
                </p>
              </div>

             <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-white">Property Type</label>
                <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {propertyTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`
                        relative rounded-lg border-2 p-4 flex flex-col items-center
                        transition-all duration-200 cursor-pointer
                        ${
                          formData.property_type === type.id
                            ? 'border-emerald-500 bg-emerald-900/20'
                            : 'border-gray-600 hover:border-emerald-500 hover:bg-gray-700/50'
                        }
                        hover:shadow-lg hover:shadow-emerald-500/20
                      `}
                      onClick={() => setFormData(prev => ({ ...prev, property_type: type.id }))}
                    >
                      <div className="text-emerald-400 mb-2">
                        {type.icon}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {type.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location Details */}
        {currentStep === 2 && (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden mt-6 p-6">
            <div>
              <h2 className="text-lg font-medium text-grey-100">Location</h2>
              <p className="mt-1 text-sm text-gray-300">
                Where is your property located?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mt-4">
              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-grey-300">
                  Full Address
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    required
                  />
                </div>
              </div> 

              <div className="sm:col-span-3">
                <label htmlFor="city" className="block text-sm font-medium text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={formData.city}
                  onChange={handleInputChange}
                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="province" className="block text-sm font-medium text-gray-300">
                  Province
                </label>
                <select
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                >
                  <option value="">Select a province</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                  <option value="Western Cape">Western Cape</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Property Details */}
        {currentStep === 3 && (
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden mt-6 p-6">
            <div>
              <h2 className="text-lg font-medium text-gray-100">Property Details</h2>
              <p className="mt-1 text-sm text-gray-300">
                Provide more details about your property.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-300">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  id="bedrooms"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleNumberInputChange}
                  className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-300">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  id="bathrooms"
                  min="0"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={handleNumberInputChange}
                  className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="ensuite" className="block text-sm font-medium text-gray-300">
                  En-suite Bathrooms
                </label>
                <input
                  type="number"
                  name="ensuite"
                  id="ensuite"
                  min="0"
                  value={formData.ensuite}
                  onChange={handleNumberInputChange}
                  className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="parking" className="block text-sm font-medium text-gray-300">
                  Parking Spaces
                </label>
                <input
                  type="number"
                  name="parking"
                  id="parking"
                  min="0"
                  value={formData.parking}
                  onChange={handleNumberInputChange}
                  className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="floor_size" className="block text-sm font-medium text-gray-300">
                  Floor Size (m²)
                </label>
                <input
                  type="number"
                  name="floor_size"
                  id="floor_size"
                  min="0"
                  value={formData.floor_size}
                  onChange={handleNumberInputChange}
                  className="qblock w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Pricing & Availability */}
        {currentStep === 4 && (
          <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden mt-6 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-100">Pricing & Availability</h2>
              <p className="mt-1 text-sm text-gray-300">
                Set the rental price and availability for your property.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                    <label htmlFor="rent_amount" className="block text-sm font-medium text-gray-300">
                        Monthly Rent (ZAR)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 sm:text-sm">R</span>
                        </div>
                        <input
                        type="text"
                        name="rent_amount"
                        id="rent_amount"
                        value={formData.rent_amount}
                        onChange={handleNumberInputChange}
                        className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm pl-8"
                        placeholder={formData.rent_amount ? '' : '0.00'}
                        required
                        />
                    </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-300">
                        Deposit (ZAR)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 sm:text-sm">R</span>
                        </div>
                        <input
                        type="text"
                        name="deposit_amount"
                        id="deposit_amount"
                        value={formData.deposit_amount}
                        onChange={handleNumberInputChange}
                        className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm pl-8"
                        placeholder={formData.deposit_amount ? '' : '0.00'}
                        required
                        />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="available_from" className="block text-sm font-medium text-gray-300">
                            Available From
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            {!formData.available_from && (
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            )}
                            <input
                            type="date"
                            name="available_from"
                            id="available_from"
                            value={formData.available_from}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm ${
                                formData.available_from ? 'pl-3' : 'pl-10'
                            }`}
                            required
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="lease_term" className="block text-sm font-medium text-gray-300">
                        Lease Term (months)
                        </label>
                        <select
                        id="lease_term"
                        name="lease_term"
                        value={formData.lease_term}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        >
                        <option value="1">1 month</option>
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="24">24 months</option>
                        </select>
                    </div>
                </div>
            </div>
        )}

        {/* Step 5: Amenities */}
        {currentStep === 5 && (
          <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden mt-6 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-100">Amenities</h2>
              <p className="mt-1 text-sm text-gray-300">
                Select all the amenities your property offers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {amenitiesList.map((amenity) => (
                <div
                  key={amenity.id}
                  className={`relative rounded-lg border p-4 flex flex-col items-center space-y-2 cursor-pointer transition-colors ${
                    formData.amenities.includes(amenity.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-green-200 hover:border-green-500'
                  }`}
                  onClick={() => handleAmenityToggle(amenity.id)}
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-emerald-600">
                    {amenity.icon}
                  </div>
                  <span className="text-sm font-medium text-green-500 text-center">
                    {amenity.name}
                  </span>
                  {formData.amenities.includes(amenity.id) && (
                    <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Photos */}
        {currentStep === 6 && (
          <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden mt-6 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-100">Photos</h2>
              <p className="mt-1 text-sm text-gray-300">
                Upload high-quality photos of your property. The first image will be the cover photo.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {previewUrls.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt={`Property ${index + 1}`}
                      className="h-32 w-full rounded-md object-cover"
                    />
                    {!preview.isUploading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {preview.isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ))}

                <label
                  htmlFor="property-images"
                  className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-600">Upload Photo</span>
                    <span className="text-xs text-gray-500">Max 10MB</span>
                  </div>
                  <input
                    id="property-images"
                    name="property-images"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading || previewUrls.length >= 10}
                  />
                </label>
              </div>

              {previewUrls.length === 0 && (
                <p className="text-sm text-gray-500">
                  No photos uploaded yet. Add at least one photo of your property.
                </p>
              )}

              {previewUrls.length > 0 && previewUrls.length < 3 && (
                <p className="text-sm text-amber-600">
                  Tip: Adding at least 3 photos can increase your property's appeal.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                'Update Property'
              )}
            </button>
          )}
        </div>
      </form>

      {/* Progress Steps */}
        <div className="mt-8">
          <nav className="flex items-center justify-center" aria-label="Progress">
            <ol className="flex items-center space-x-8">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <li key={step} className="relative">
                  {step < currentStep ? (
                    <button
                      onClick={() => setCurrentStep(step)}
                      className="group flex items-center"
                    >
                      <span className="flex items-center h-9">
                        <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 group-hover:bg-emerald-700">
                          <Check className="w-5 h-5 text-white" />
                        </span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-emerald-600">
                        {step === 1 && 'Basic Info'}
                        {step === 2 && 'Location'}
                        {step === 3 && 'Details'}
                        {step === 4 && 'Pricing'}
                        {step === 5 && 'Amenities'}
                        {step === 6 && 'Photos'}
                      </span>
                    </button>
                  ) : step === currentStep ? (
                    <button
                      onClick={() => setCurrentStep(step)}
                      className="flex items-center"
                      aria-current="step"
                    >
                      <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-emerald-600 bg-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      </span>
                      <span className="ml-4 text-sm font-medium text-emerald-600">
                        {step === 1 && 'Basic Info'}
                        {step === 2 && 'Location'}
                        {step === 3 && 'Details'}
                        {step === 4 && 'Pricing'}
                        {step === 5 && 'Amenities'}
                        {step === 6 && 'Photos'}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(step)}
                      className="group flex items-center"
                    >
                      <span className="flex items-center h-9">
                        <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                          <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                        </span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-700">
                        {step === 1 && 'Basic Info'}
                        {step === 2 && 'Location'}
                        {step === 3 && 'Details'}
                        {step === 4 && 'Pricing'}
                        {step === 5 && 'Amenities'}
                        {step === 6 && 'Photos'}
                      </span>
                    </button>
                  )}

                  {step < 6 && (
                    <div
                      className="absolute top-4 left-7 -ml-px w-8 h-0.5 bg-gray-300"
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
        {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-center">Saving changes...</p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            </div>
          )}
  </div>
);
}

export default EditPropertyPage;