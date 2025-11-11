import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function MockCorpPassPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = searchParams.get('state');
  
  const [uen, setUen] = useState('202400001A');
  const [entityName, setEntityName] = useState('Demo Hawker Stall Pte Ltd');
  const [contactEmail, setContactEmail] = useState('business@demo-hawker.com');
  const [loading, setLoading] = useState(false);

  const handleMockLogin = async () => {
    setLoading(true);
    
    try {
      // Call backend mock login endpoint with state
      const params = new URLSearchParams({
        state: state || '',
        uen,
        entity_name: entityName,
        contact_email: contactEmail
      });

      // Redirect to backend mock login endpoint
      window.location.href = `http://localhost:8001/auth/corppass/mock-login?${params.toString()}`;
    } catch (error) {
      console.error('Mock login failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-xl p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Mock CorpPass Login</h2>
          <p className="mt-2 text-gray-600">Development Simulation</p>
          <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">⚠️ Development Mode:</span> Using fake credentials
            </p>
          </div>
          {state && (
            <p className="mt-2 text-xs text-gray-500 font-mono">
              Session: {state.substring(0, 16)}...
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UEN (Unique Entity Number)
            </label>
            <input
              type="text"
              value={uen}
              onChange={(e) => setUen(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 202400001A"
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be used as your license_number
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., ABC Hawker Stall Pte Ltd"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="business@example.com"
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleMockLogin}
            disabled={loading || !uen || !entityName || !contactEmail}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Authenticate with Mock CorpPass
              </>
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ How This Works</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• This simulates CorpPass authentication</li>
              <li>• Your UEN will be used as license_number</li>
              <li>• Business data will pre-fill the signup form</li>
              <li>• No real CorpPass credentials required</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          In production, you would be redirected to the actual CorpPass login page.
          This mock page is only for development and testing.
        </p>
      </div>
    </div>
  );
}
