/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, enableNetwork, disableNetwork } from './firebase';
import { UserProfile } from './types';
import { LogOut, User as UserIcon, ClipboardList, ShieldCheck, HeartPulse, GraduationCap, Wifi, WifiOff, Presentation as PresentationIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import Login from './components/Login';
import Register from './components/Register';
import HCTForm from './components/HCTForm';
import LSEForm from './components/LSEForm';
import HCCForm from './components/HCCForm';
import AdminPanel from './components/AdminPanel';
import ProgramSelection from './components/ProgramSelection';
import PitchPresentation from './components/PitchPresentation';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      enableNetwork(db);
    };
    const handleOffline = () => {
      setIsOffline(true);
      disableNetwork(db);
    };

    if (!navigator.onLine) {
      disableNetwork(db);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          // Force admin role for the owner email even if database is out of sync
          if (data.email.toLowerCase() === 'retabileyakhe078@gmail.com' && data.role !== 'admin') {
            const updatedUser = { ...data, role: 'admin' as const };
            setUser(updatedUser);
            // Optionally update the database too
            updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' });
          } else {
            setUser(data);
          }
        } else {
          // Handle case where user exists in Auth but not in Firestore
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: (firebaseUser.email?.toLowerCase() === 'retabileyakhe078@gmail.com') ? 'admin' : 'staff',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse" />
          <img 
            src="/LH_Logo.png" 
            alt="Living Hope" 
            className="w-48 h-auto relative object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-8 text-slate-400 font-medium tracking-widest text-xs uppercase"
        >
          Loading System...
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Offline Indicator Bar */}
        <AnimatePresence>
          {isOffline && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 sticky top-0 z-[60]"
            >
              <WifiOff className="w-4 h-4" />
              You are currently offline. Records will be saved locally and sync automatically when internet returns.
            </motion.div>
          )}
        </AnimatePresence>

        {user && (
          <nav className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-3 group">
                  <img 
                    src="/LH_Logo.png" 
                    alt="Living Hope" 
                    className="h-12 w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </Link>

                {(user.role === 'admin' || user.email.toLowerCase() === 'retabileyakhe078@gmail.com') && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <Link 
                  to="/pitch" 
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all"
                >
                  <PresentationIcon className="w-4 h-4" />
                  System Pitch
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.email}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                
                <button
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </nav>
        )}

        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/login" 
                element={!user ? <Login /> : <Navigate to="/" />} 
              />
              <Route 
                path="/register" 
                element={!user ? <Register /> : <Navigate to="/" />} 
              />
              <Route 
                path="/" 
                element={user ? <ProgramSelection user={user} /> : <WelcomePage />} 
              />
              <Route 
                path="/hct" 
                element={user ? <HCTForm user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/lse" 
                element={user ? <LSEForm user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/hcc" 
                element={user ? <HCCForm user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/admin" 
                element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} 
              />
              <Route 
                path="/pitch" 
                element={<PitchPresentation />} 
              />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

function WelcomePage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center"
    >
      <div className="mb-12 relative">
        <div className="absolute -inset-8 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
        <img 
          src="/LH_Logo.png" 
          alt="Living Hope Logo" 
          className="w-full max-w-md relative object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">
        Welcome to <span className="text-blue-600">Living Hope</span>
      </h1>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link 
          to="/login" 
          className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 text-center"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="flex-1 bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 hover:-translate-y-1 transition-all active:scale-95 text-center"
        >
          Register
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <Link 
          to="/pitch" 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors group"
        >
          <PresentationIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          View System Pitch & Overview
        </Link>
      </motion.div>

    </motion.div>
  );
}

