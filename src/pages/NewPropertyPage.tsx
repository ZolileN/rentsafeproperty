import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, X, MapPin, Calendar, CheckCircle } from 'lucide-react';

export function NewPropertyPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{url: string, isUploading: boolean, isUploaded: boolean}[]>([]);
  const [formData, setFormData] = useState({
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
    amenities: [] as string[],
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' },
    { value: 'cottage', label: 'Cottage' },
  ];

  const leaseTerms = [
    { value: '3', label: '3 months' },
    { value: '6', label: '6 months' },
    { value: '9', label: '9 months' },
    { value: '12', label: '12 months' },
  ];

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
  ];

  const amenitiesList = [
    { id: 'parking', label: 'Parking' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'aircon', label: 'Air Conditioning' },
    { id: 'security', label: 'Security' },
    { id: 'garden', label: 'Garden' },
    { id: 'pool', label: 'Pool' },
    { id: 'gym', label: 'Gym' },
    { id: 'pet_friendly', label: 'Pet Friendly' },
    { id: 'furnished', label: 'Furnished' },
    { id: 'alarm', label: 'Alarm' },
    { id: 'braai_place', label: 'Braai Place' }
  ];

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) {
        setError('Please sign in to upload images');
        return;
      }
      
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      // Create preview URLs for selected files
      const newPreviews = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        isUploading: false,
        isUploaded: false
      }));
      
      // Store the current length for proper indexing
      const currentLength = previewUrls.length;
      setPreviewUrls(prev => [...prev, ...newPreviews]);
      setUploading(true);
      
      // Upload each file and update status
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const previewIndex = currentLength + index;
        
        // Update status to uploading
        setPreviewUrls(prev => {
          const newPrev = [...prev];
          if (newPrev[previewIndex]) {
            newPrev[previewIndex] = { ...newPrev[previewIndex], isUploading: true };
          }
          return newPrev;
        });
        
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);
            
          // Update status to uploaded
          setPreviewUrls(prev => {
            const newPrev = [...prev];
            if (newPrev[previewIndex]) {
              newPrev[previewIndex] = { 
                ...newPrev[previewIndex], 
                isUploading: false, 
                isUploaded: true, 
                url: publicUrl 
              };
            }
            return newPrev;
          });
          
          return publicUrl;
        } catch (err) {
          // If upload fails, mark as not uploaded
          setPreviewUrls(prev => {
            const newPrev = [...prev];
            if (newPrev[previewIndex]) {
              newPrev[previewIndex] = { 
                ...newPrev[previewIndex], 
                isUploading: false,
                isUploaded: false
              };
            }
            return newPrev;
          });
          throw err;
        }
      });
      
      const urls = await Promise.all(uploadPromises);
      setImageUrls(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Error uploading images. Please try again.');
    } finally {
      setUploading(false);
    }
      };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bedrooms' || name === 'bathrooms' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Basic Info
        if (!formData.title || !formData.property_type || !formData.bedrooms || 
            !formData.bathrooms || !formData.floor_size || !formData.rent_amount || 
            !formData.available_from || !formData.lease_term) {
          setError('Please fill in all required fields');
          return false;
        }
        return true;
      case 2: // Location
        if (!formData.address || !formData.city || !formData.province) {
          setError('Please fill in all required location details');
          return false;
        }
        return true;
      case 3: // Details
        if (!formData.description) {
          setError('Please provide a property description');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!user) {
      setError('User not authenticated');
      return;
    }

    // Validate the final step before submission
    if (!validateStep(currentStep)) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Prepare the property data with proper type conversion
      const propertyData = {
        landlord_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        province: formData.province,
        postal_code: formData.postal_code?.trim() || null,
        property_type: formData.property_type,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        rent_amount: parseFloat(formData.rent_amount.toString()),
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount.toString()) : null,
        available_from: formData.available_from,
        amenities: formData.amenities,
        images: imageUrls,
        is_active: true,
        is_verified: false,
        verification_status: 'pending',
      };

      console.log('Submitting property data:', propertyData);

      const { data, error: insertError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (insertError) {
        console.error('Database error:', insertError);
        throw new Error(insertError.message || 'Failed to create property');
      }

      console.log('Property created successfully:', data);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Error creating property:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while creating the property');
    } finally {
      setLoading(false);
    }
  }

  if (!user || user.role !== 'landlord') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-card max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be a registered landlord to add properties</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Sign In as Landlord
          </a>
        </div>
      </div>
    );
  }

  const renderNavigation = ({ currentStep, loading, onPrev }: {
    currentStep: number;
    loading: boolean;
    onPrev: () => void;
  }) => (
    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 sm:mt-8">
      <div className="w-full sm:w-auto">
        <button
          type="button"
          onClick={() => currentStep === 1 ? window.location.href = '/dashboard' : onPrev()}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 border border-green-600 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors"
        >
          <X className="w-4 h-4 mr-2 flex-shrink-0" />
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>
      </div>
      
      <div className="w-full sm:w-auto">
        {(currentStep < 3) ? (
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Submit Property</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    placeholder="Modern 2-Bedroom Apartment in City Center"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    required
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    min="1"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    min="1"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    En-suite
                  </label>
                  <input
                    type="number"
                    name="ensuite"
                    min="0"
                    max={formData.bedrooms}
                    value={formData.ensuite}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parking
                  </label>
                  <input
                    type="number"
                    name="parking"
                    min="0"
                    value={formData.parking}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Size (m²)
                  </label>
                  <input
                    type="number"
                    name="floor_size"
                    min="1"
                    value={formData.floor_size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    placeholder="e.g. 75"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rent Amount (ZAR)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-700 font-medium">
                      R
                    </div>
                    <input
                      type="number"
                      name="rent_amount"
                      value={formData.rent_amount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                      placeholder="e.g. 8500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit (ZAR)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-700 font-medium">
                      R
                    </div>
                    <input
                      type="number"
                      name="deposit_amount"
                      value={formData.deposit_amount}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                      placeholder="e.g. 8500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Images
                  </label>
                  <div className="mt-1 flex justify-center px-4 sm:px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex flex-col items-center space-y-2">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Upload Images</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                        <p className="text-xs sm:text-sm text-gray-500 text-center">or drag and drop images here</p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">Supports: PNG, JPG, GIF • Max 10MB per image</p>
                    </div>
                  </div>
                  
                  {/* Image previews */}
                  {(previewUrls.length > 0 || imageUrls.length > 0) && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {previewUrls.map((item, index) => (
                        <div key={index} className="relative group">
                          <div className="relative h-32 w-full">
                            <img
                              src={item.url}
                              alt={`Property preview ${index + 1}`}
                              className={`h-full w-full object-cover rounded-lg ${
                                item.isUploading ? 'opacity-60' : 'opacity-100'
                              }`}
                            />
                            {item.isUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                              </div>
                            )}
                            {item.isUploaded && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                <Check className="w-3 h-3 inline mr-1" />
                                Uploaded
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                              // Also remove from imageUrls if it exists there
                              if (index < imageUrls.length) {
                                setImageUrls(prev => prev.filter((_, i) => i !== index));
                              }
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {uploading && <p className="mt-2 text-sm text-gray-500">Uploading images...</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available From
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="available_from"
                      value={formData.available_from}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lease Term
                  </label>
                  <select
                    name="lease_term"
                    value={formData.lease_term}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    required
                  >
                    {leaseTerms.map(term => (
                      <option key={term.value} value={term.value}>
                        {term.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                      placeholder="123 Main Street, Suburb"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                      placeholder="e.g. Cape Town"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                      required
                    >
                      <option value="">Select Province</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                      placeholder="e.g. 8001"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  placeholder="Describe your property in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity.id} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex items-center justify-center w-5 h-5 rounded border-2 ${
                          formData.amenities.includes(amenity.id)
                            ? 'bg-green-600 border-green-600 shadow-md'
                            : 'border-gray-300 hover:border-green-400'
                        } transition-all duration-200`}
                      >
                        {formData.amenities.includes(amenity.id) && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                      <span className="ml-2 text-sm text-gray-900 font-medium">
                        {amenity.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">List a New Property</h1>
          <p className="text-sm sm:text-base text-gray-600">Fill in the details below to list your property for rent</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8 px-2">
          <div className="relative">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                  <div 
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base ${
                      currentStep >= step ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    {step}
                  </div>
                  <span className="text-xs mt-1.5 text-gray-600 font-medium text-center px-1">
                    {step === 1 ? 'Basic' : step === 2 ? 'Location' : 'Details'}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute left-4 right-4 h-1.5 bg-gray-200 top-4 -z-10">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-card p-4 sm:p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (currentStep === 3) {
              handleSubmit(e);
            } else {
              nextStep();
            }
          }}>
            {renderStep()}
            {renderNavigation({
              currentStep,
              loading,
              onPrev: prevStep
            })}
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewPropertyPage;