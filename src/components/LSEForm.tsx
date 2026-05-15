import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Save, ArrowLeft, CheckCircle2, Search, User, X } from 'lucide-react';
import { UserProfile, LSERecord } from '../types';
import { calculateAge } from '../lib/utils';

interface Props {
  user: UserProfile;
}

export default function LSEForm({ user }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingStudents, setExistingStudents] = useState<LSERecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isExistingStudent, setIsExistingStudent] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    dob: '',
    age: '',
    address: '',
    grade: '',
    clubOption: 'Afternoon',
    attendanceDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchStudents = async () => {
      const q = query(collection(db, 'lse_records'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LSERecord));
      
      // Filter unique students by name, surname and dob
      const uniqueStudents: LSERecord[] = [];
      const seen = new Set();
      
      records.forEach(r => {
        const key = `${r.name.toLowerCase()}|${r.surname.toLowerCase()}|${r.dob}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueStudents.push(r);
        }
      });
      
      setExistingStudents(uniqueStudents);
    };
    fetchStudents();
  }, []);

  const handleSelectStudent = (student: LSERecord) => {
    setFormData({
      ...formData,
      name: student.name,
      surname: student.surname,
      dob: student.dob,
      age: String(student.age),
      address: student.address,
      grade: student.grade,
    });
    setIsExistingStudent(true);
    setShowSearch(false);
    setSearchQuery('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      dob: '',
      age: '',
      address: '',
      grade: '',
      clubOption: 'Afternoon',
      attendanceDate: new Date().toISOString().split('T')[0]
    });
    setIsExistingStudent(false);
  };

  const filteredStudents = existingStudents.filter(s => 
    `${s.name} ${s.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Optimistic save
      addDoc(collection(db, 'lse_records'), {
        ...formData,
        age: Number(formData.age),
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      }).catch(err => {
        console.error('Background write failed:', err);
      });

      setSubmitted(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Error saving record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </motion.div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        {!navigator.onLine ? 'Saved Manually!' : 'Record Saved!'}
      </h2>
      <p className="text-slate-500">
        {!navigator.onLine 
          ? 'This record is saved on your device and will sync when you have internet.' 
          : 'Redirecting you back to the dashboard...'}
      </p>
    </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto"
    >
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-purple-600 p-8 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">LSE Program Form</h2>
              <p className="text-purple-100 text-sm">Life Skills Education Record</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all font-bold text-sm"
          >
            <Search className="w-4 h-4" />
            {isExistingStudent ? 'Change Student' : 'Find Existing Student'}
          </button>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-50 border-b border-slate-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                
                {searchQuery && (
                  <div className="mt-4 space-y-2">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <button
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-purple-500 hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{student.name} {student.surname}</div>
                              <div className="text-xs text-slate-500">DOB: {student.dob} • {student.grade}</div>
                            </div>
                          </div>
                          <div className="text-purple-600 font-bold text-xs uppercase tracking-wider">Select</div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-400 text-sm italic">
                        No students found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">1</span>
                Student Information
              </h3>
              {isExistingStudent && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                >
                  <X className="w-3 h-3" />
                  Clear Selection
                </button>
              )}
            </div>
            
            {isExistingStudent && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-100">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-purple-900">Existing Student Selected</div>
                  <div className="text-xs text-purple-600 font-medium">Static details are locked. Just select the attendance date and club.</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${isExistingStudent ? 'md:col-span-2' : ''}`}>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attendance Date</label>
                <input
                  type="date"
                  required
                  value={formData.attendanceDate}
                  onChange={(e) => setFormData({...formData, attendanceDate: e.target.value})}
                  className="w-full px-4 py-3 border border-purple-200 bg-purple-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-purple-900"
                />
              </div>
              {!isExistingStudent && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Surname</label>
                    <input
                      type="text"
                      required
                      value={formData.surname}
                      onChange={(e) => setFormData({...formData, surname: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => {
                        const newDob = e.target.value;
                        setFormData({
                          ...formData, 
                          dob: newDob,
                          age: calculateAge(newDob)
                        });
                      }}
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                      <input
                        type="number"
                        required
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Grade</label>
                      <input
                        type="text"
                        required
                        value={formData.grade}
                        onChange={(e) => setFormData({...formData, grade: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        placeholder="e.g. Grade 10"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                    <textarea
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">2</span>
              Club Selection
            </h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Which club is the student attending?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Holiday', 'Afternoon'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({...formData, clubOption: option as any})}
                    className={`flex items-center justify-between px-6 py-4 rounded-2xl font-bold border-2 transition-all ${
                      formData.clubOption === option 
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-purple-200'
                    }`}
                  >
                    <span>{option} Club</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      formData.clubOption === option ? 'border-white bg-white/20' : 'border-slate-200'
                    }`}>
                      {formData.clubOption === option && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-100 hover:bg-purple-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading 
                ? (navigator.onLine ? 'Saving Record...' : 'Saving Locally...') 
                : 'Save LSE Record'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
