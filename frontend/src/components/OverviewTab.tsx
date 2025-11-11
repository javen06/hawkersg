// OverviewTab.tsx
import { useEffect, useRef, useState } from 'react';
import { Star, Eye, Menu as MenuIcon, Settings } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface OverviewTabProps {
  stallStatus: 'open' | 'closed';
  setStallStatus: (status: 'open' | 'closed') => void;
}

export default function OverviewTab({ stallStatus, setStallStatus }: OverviewTabProps) {
  const { getBusinessProfile } = useData();
  const [businessStall, setBusinessStall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getBusinessProfile("CE23807B000"); // hardcoded license
        setBusinessStall(data);
        setStallStatus(data.isOpen ? 'open' : 'closed');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [getBusinessProfile, setStallStatus]);

  if (loading) return <div className="text-center py-12 text-gray-600">Loading stall data...</div>;

  if (!businessStall) {
    return (
      <div className="text-center py-12">
        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No stall found</h3>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Stall Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{businessStall.rating}</div>
          <div className="text-gray-600 text-sm">Average Rating</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{businessStall.reviewCount}</div>
          <div className="text-gray-600 text-sm">Total Reviews</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <MenuIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{businessStall.menu.length}</div>
          <div className="text-gray-600 text-sm">Menu Items</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${stallStatus === 'open' ? 'bg-green-500' : 'bg-red-500'}`} />
          <div className="text-lg font-bold text-gray-900">{stallStatus === 'open' ? 'Open' : 'Closed'}</div>
          <div className="text-gray-600 text-sm">Current Status</div>
        </div>
      </div>

      {/* Stall Info */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stall: {businessStall.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img src={businessStall.images[0]} alt={businessStall.name} className="w-full h-48 object-cover rounded-lg" />
          </div>
          <div className="space-y-3">
            <p><strong>Cuisine:</strong> {businessStall.cuisine}</p>
            <p><strong>Location:</strong> {businessStall.location}</p>
            <p><strong>Description:</strong> {businessStall.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
