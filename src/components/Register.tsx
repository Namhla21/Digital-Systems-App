import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, AlertCircle, Shield } from 'lucide-react';
import { UserProfile } from '../types';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: email.toLowerCase() === 'retabileyakhe078@gmail.com' ? 'admin' : role,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password registration is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: firebaseUser.email === 'RetabileYakhe078@gmail.com' ? 'admin' : 'staff',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto mt-12"
    >
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-500 mt-2">Join the Living Hope team</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Initial Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold ${
                  role === 'staff' 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold ${
                  role === 'admin' 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">
              * Admin roles may require verification by a system administrator.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleRegister}
          disabled={loading}
          className="w-full bg-white border-2 border-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Google Account
        </button>

        <p className="mt-8 text-center text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
