import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Plus, MapPin, Calendar, Users, DollarSign, MessageSquare, LogOut } from 'lucide-react'

import TripWorkspace from './pages/TripWorkspace'
import Auth from './pages/Auth'
import AIAssistant from './components/AIAssistant'
import api from './utils/api'

function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Link to="/" className="bg-primary-600 p-2 rounded-lg">
          <MapPin className="text-white w-6 h-6" />
        </Link>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">Travello</span>
      </div>
      <div className="flex items-center gap-6 text-gray-600 font-medium">
        {user ? (
          <>
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span className="text-sm font-bold text-gray-400">|</span>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-200">
                {user.name?.[0] || 'U'}
              </div>
              <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-primary-600 transition-colors">Login</Link>
            <Link to="/register" className="bg-primary-600 text-white px-5 py-2 rounded-full hover:bg-primary-700 transition-all shadow-md shadow-primary-200 font-semibold">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

function Dashboard() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await api.get('/trips');
        setTrips(data);
      } catch (err) {
        console.error('Failed to fetch trips', err);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Travel Workspace</h1>
          <p className="text-gray-500 text-lg">Organize your next adventures and group trips in one place.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Calendar className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Active Trips</p>
              <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trips.map((trip) => (
          <Link key={trip.id} to={`/trips/${trip.id}`} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden cursor-pointer block">
            <div className="h-48 bg-primary-600/10 relative overflow-hidden flex items-center justify-center">
               <MapPin size={48} className="text-primary-600 opacity-20" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
               <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{trip.title}</h3>
                  <p className="text-sm opacity-90">{trip.description || 'No description'}</p>
               </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign size={18} className="text-green-500" />
                  <span className="font-bold">${trip.budget}</span>
                </div>
                <span className="text-primary-600 font-bold text-sm group-hover:underline">Manage Trip →</span>
              </div>
            </div>
          </Link>
        ))}

        <div className="bg-gray-50 rounded-2xl border-4 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 group hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer">
           <div className="bg-white p-4 rounded-full shadow-md group-hover:scale-110 transition-transform mb-4">
              <Plus size={32} className="text-primary-500" />
           </div>
           <h3 className="text-xl font-bold text-gray-700">Plan New Adventure</h3>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#FDFDFF] text-gray-900 font-sans selection:bg-primary-100 selection:text-primary-900">
        <Navbar user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Auth type="login" onLogin={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Auth type="register" onLogin={setUser} />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/trips/:id" element={user ? <TripWorkspace /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        
        {user && (
          <>
            <div className="fixed bottom-8 right-8 z-[100]">
               <button 
                 onClick={() => setIsAIOpen(true)}
                 className="bg-primary-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-primary-700 hover:scale-105 transition-all flex items-center gap-3 font-bold ring-4 ring-primary-100"
               >
                  <MessageSquare className="w-6 h-6" />
                  {isAIOpen ? 'Talking to AI...' : 'Ask AI Travel Agent'}
               </button>
            </div>
            <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
          </>
        )}
      </div>
    </Router>
  )
}

export default App
