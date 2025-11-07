import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { VerificationStatus } from '../../types/database.types';
import { CheckCircle } from 'lucide-react';

type DocumentType = 'id' | 'passport' | 'drivers_license';

type VerificationRequest = {
  user_id: string;
  document_type: string;
  document_number: string;
  document_url: string;
  status: 'pending' | 'verified' | 'rejected';
};

export function IdentityVerificationForm() {
  const [documentType, setDocumentType] = useState<DocumentType>('id');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_started');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load verification status on mount
  useEffect(() => {
    const loadVerificationStatus = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('verification_status')
          .eq('id', user.id)
          .single();
        
        if (data?.verification_status) {
          setVerificationStatus(data.verification_status);
        }
      }
    };

    loadVerificationStatus();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFile || !documentNumber || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload the document
      const fileExt = documentFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, documentFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Create verification request in the database
      const { error: verificationError } = await supabase
        .from('verification_requests')
        .insert<VerificationRequest>([{
          user_id: user.id,
          document_type: documentType,
          document_number: documentNumber,
          document_url: filePath,
          status: 'pending'
        }]);

      if (verificationError) throw verificationError;

      // 3. Update user's verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setVerificationStatus('pending');
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit verification');
      setVerificationStatus('not_started');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success state if verification is pending
  if (verificationStatus === 'pending') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Verification Submitted</h2>
        <p className="text-gray-600 mb-6">
          Your identity verification is being processed. This usually takes 1-2 business days.
          You'll be notified once your verification is complete.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Show verification form
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Identity Verification</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="id">National ID</option>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver's License</option>
          </select>
        </div>

        <div>
          <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Document Number
          </label>
          <input
            type="text"
            id="documentNumber"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter document number"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Document (Front)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    required
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                {documentFile ? documentFile.name : 'PNG, JPG, PDF up to 10MB'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-blue-400'
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Verification'}
          </button>
        </div>
      </form>
    </div>
  );
}