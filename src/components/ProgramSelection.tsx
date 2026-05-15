import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { HeartPulse, GraduationCap, ShieldCheck, ArrowRight, Stethoscope } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
}

export default function ProgramSelection({ user }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-slate-800 mb-2">Hello, {user.email.split('@')[0]}</h2>
        <p className="text-slate-500 text-lg">Select a program to start recording data or manage the system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/hct" className="group">
          <motion.div 
            whileHover={{ y: -5 }}
            className="h-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all flex flex-col"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <HeartPulse className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">HCT Program</h3>
            <p className="text-slate-500 mb-8 flex-grow">
              HIV Counseling and Testing. Record patient demographics, test results, and counseling status.
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
              <span>Start Form</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>
        </Link>

        <Link to="/lse" className="group">
          <motion.div 
            whileHover={{ y: -5 }}
            className="h-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-100/50 transition-all flex flex-col"
          >
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
              <GraduationCap className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">LSE Program</h3>
            <p className="text-slate-500 mb-8 flex-grow">
              Life Skills Education. Track student attendance for holiday and afternoon clubs.
            </p>
            <div className="flex items-center gap-2 text-purple-600 font-bold group-hover:gap-4 transition-all">
              <span>Start Form</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>
        </Link>

        <Link to="/hcc" className="group">
          <motion.div 
            whileHover={{ y: -5 }}
            className="h-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all flex flex-col"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
              <Stethoscope className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">HCC Program</h3>
            <p className="text-slate-500 mb-8 flex-grow">
              Home Community Care. Detailed patient admission, diagnosis, and treatment tracking.
            </p>
            <div className="flex items-center gap-2 text-indigo-600 font-bold group-hover:gap-4 transition-all">
              <span>Start Form</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>
        </Link>

        {(user.role === 'admin' || user.email.toLowerCase() === 'retabileyakhe078@gmail.com') && (
          <Link to="/admin" className="group md:col-span-2">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ y: -5 }}
              className="bg-slate-900 p-10 rounded-3xl shadow-2xl border-4 border-blue-500 hover:shadow-blue-200 transition-all flex flex-col md:flex-row items-center gap-8"
            >
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-10 h-10 text-blue-400" />
              </div>
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h3>
                <p className="text-slate-400">
                  View all records, manage user roles, and export data to Excel for reporting.
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:gap-4 transition-all">
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </motion.div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
