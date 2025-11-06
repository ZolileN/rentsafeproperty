import { useState, useEffect } from 'react';
import { User, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Add this import

export function SignUpPage() {
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate(); // Add this line

  // Redirect if already logged in
  useEffect(() => {
    if (user && !success) {
      navigate('/'); // Update this line
    }
  }, [user, success, navigate]); // Add navigate to dependencies

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName, role);
      setSuccess(true);
      // Give a moment for the auth state to update
      setTimeout(() => {
        navigate('/'); // Update this line
      }, 500);
      // ... rest of your code
    } catch (error) {
      setError('Failed to create an account');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-700">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="RentSafe Logo" className="h-24 w-auto" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
            <p className="text-gray-400">Join RentSafe today</p>
          </div>
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('tenant')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                role === 'tenant'
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                  : 'border-gray-600 text-gray-400 hover:border-gray-500'
              }`}
            >
              <User className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm font-semibold">Tenant</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('landlord')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                role === 'landlord'
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                  : 'border-gray-600 text-gray-400 hover:border-gray-500'
              }`}
            >
              <Building className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm font-semibold">Landlord</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition text-gray-300"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition text-gray-300"
                placeholder="jackson@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition text-gray-300"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 text-red-300 p-3 rounded-lg text-sm border border-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                Account created successfully! Redirecting...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-400 text-white py-3 rounded-lg font-semibold hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300">
            <strong>Next step:</strong> After creating your account, you'll need to complete identity verification to access all features.
          </p>
        </div>
      </div>
    </div>
  );
}
