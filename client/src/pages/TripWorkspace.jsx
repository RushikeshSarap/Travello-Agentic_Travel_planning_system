import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, DollarSign, 
  Clock, Plus, ChevronRight, MessageSquare, 
  ArrowLeft, Share2, MoreHorizontal, Search
} from 'lucide-react';
import api from '../utils/api';

const TripWorkspace = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('itinerary');
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveryResults, setDiscoveryResults] = useState([]);

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    try {
      const { data } = await api.get(`/trips/${id}`);
      setTrip(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch trip', err);
    }
  };

  const handleAddDestination = async (dest) => {
    try {
      await api.post('/trips/destination', { 
        tripId: id, 
        name: dest.name, 
        location: dest.location, 
        description: dest.description 
      });
      fetchTripData();
      setActiveTab('itinerary');
    } catch (err) {
      console.error('Failed to add destination', err);
    }
  };

  const handleDiscoverySearch = async () => {
    try {
      const { data } = await api.get(`/trips/search?query=${searchQuery}`);
      setDiscoveryResults(data);
    } catch (err) {
      console.error('Discovery search failed', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen font-bold">Loading your workspace...</div>;
  if (!trip) return <div className="p-8">Trip not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{trip.title}</h1>
              <p className="text-sm text-gray-500 font-medium">{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'No dates set'}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {['itinerary', 'budget', 'discovery', 'collaboration'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-bold capitalize border-b-2 transition-all ${
                activeTab === tab 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-8">
          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              {trip.destinations?.map((dest) => (
                <div key={dest.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-bold text-gray-900">{dest.name}</h2>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-500 font-bold uppercase">{dest.location}</span>
                  </div>
                  <div className="p-0">
                    {/* Add activity placeholder */}
                    <button className="w-full py-4 text-sm text-primary-600 font-bold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 border-b border-dashed border-gray-100">
                       <Plus size={16} /> Add Activity here
                    </button>
                  </div>
                </div>
              ))}
              {trip.destinations?.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                   <h3 className="text-xl font-bold text-gray-400">No destinations yet.</h3>
                   <button onClick={() => setActiveTab('discovery')} className="mt-4 text-primary-600 font-bold underline">Search for places to visit</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Budget Analysis</h2>
               <div className="grid grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                     <p className="text-xs text-gray-400 font-bold uppercase mb-2">Allocated</p>
                     <p className="text-3xl font-black text-gray-900">${trip.budget}</p>
                  </div>
               </div>
               <p className="mt-8 text-sm text-gray-500 italic">Total spending tracking is calculated automatically from activities added to your itinerary.</p>
            </div>
          )}

          {activeTab === 'discovery' && (
             <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                   <div className="relative flex items-center">
                      <Search className="absolute left-4 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for attractions, restaurants..."
                        className="w-full bg-gray-50 border-0 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleDiscoverySearch()}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {discoveryResults.map((res, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-primary-300 transition-all">
                         <div>
                            <h4 className="font-bold text-gray-900">{res.name}</h4>
                            <p className="text-sm text-gray-500">{res.location}</p>
                         </div>
                         <button 
                           onClick={() => handleAddDestination(res)}
                           className="bg-primary-50 text-primary-600 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-600 hover:text-white"
                         >
                            <Plus size={20} />
                         </button>
                      </div>
                   ))}
                </div>
             </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary-600" /> Participants
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
                  Y
                </div>
                <span className="text-sm font-medium text-gray-700">You (Owner)</span>
              </div>
              {trip.participants?.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs uppercase">
                    {p.name?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{p.name || p.email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TripWorkspace;
