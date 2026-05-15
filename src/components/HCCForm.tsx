import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, Save, ArrowLeft, CheckCircle2, Search, User, X } from 'lucide-react';
import { UserProfile, HCCRecord } from '../types';
import { calculateAge } from '../lib/utils';

interface Props {
  user: UserProfile;
}

export default function HCCForm({ user }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingPatients, setExistingPatients] = useState<HCCRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  
  const [formData, setFormData] = useState({
    ui: '',
    folderNo: '',
    chronologicalNo: '',
    govNo: '',
    name: '',
    surname: '',
    fullName: '',
    address: '',
    suburb: '',
    postalCode: '',
    phone1: '',
    phone2: '',
    idNumber: '',
    dob: '',
    age: '',
    gender: 'Male',
    race: '',
    admissionDate: '',
    admissions: '',
    admissionFrom: '',
    lhDoctor: '',
    woundsArrival: 'No',
    arv: 'No',
    tb: 'No',
    nappy: 'No',
    category: '',
    treatment: '',
    status: 'In-patient',
    diagnosis: '',
    stLukes: 'No',
    stLukesDate: '',
    dischargeDate: '',
    woundsDischarge: 'No',
    dischargeTo: '',
    hbc: 'No',
    medicalAid: 'No',
    daysIpu: ''
  });

  useEffect(() => {
    const fetchPatients = async () => {
      const q = query(collection(db, 'hcc_records'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HCCRecord));
      
      const uniquePatients: HCCRecord[] = [];
      const seen = new Set();
      
      records.forEach(r => {
        const key = `${r.name.toLowerCase()}|${r.surname.toLowerCase()}|${r.dob}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniquePatients.push(r);
        }
      });
      
      setExistingPatients(uniquePatients);
    };
    fetchPatients();
  }, []);

  const handleSelectPatient = (patient: HCCRecord) => {
    setFormData({
      ...formData,
      ui: patient.ui || '',
      folderNo: patient.folderNo || '',
      chronologicalNo: patient.chronologicalNo || '',
      govNo: patient.govNo || '',
      name: patient.name,
      surname: patient.surname,
      fullName: patient.fullName || '',
      address: patient.address || '',
      suburb: patient.suburb || '',
      postalCode: patient.postalCode || '',
      phone1: patient.phone1 || '',
      phone2: patient.phone2 || '',
      idNumber: patient.idNumber || '',
      dob: patient.dob || '',
      age: String(patient.age || ''),
      gender: patient.gender || 'Male',
      race: patient.race || '',
    });
    setIsExistingPatient(true);
    setShowSearch(false);
    setSearchQuery('');
  };

  const resetForm = () => {
    setFormData({
      ui: '',
      folderNo: '',
      chronologicalNo: '',
      govNo: '',
      name: '',
      surname: '',
      fullName: '',
      address: '',
      suburb: '',
      postalCode: '',
      phone1: '',
      phone2: '',
      idNumber: '',
      dob: '',
      age: '',
      gender: 'Male',
      race: '',
      admissionDate: '',
      admissions: '',
      admissionFrom: '',
      lhDoctor: '',
      woundsArrival: 'No',
      arv: 'No',
      tb: 'No',
      nappy: 'No',
      category: '',
      treatment: '',
      status: 'In-patient',
      diagnosis: '',
      stLukes: 'No',
      stLukesDate: '',
      dischargeDate: '',
      woundsDischarge: 'No',
      dischargeTo: '',
      hbc: 'No',
      medicalAid: 'No',
      daysIpu: ''
    });
    setIsExistingPatient(false);
  };

  const filteredPatients = existingPatients.filter(p => 
    `${p.name} ${p.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Optimistic save
      addDoc(collection(db, 'hcc_records'), {
        ...formData,
        age: Number(formData.age),
        daysIpu: Number(formData.daysIpu),
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
        {!navigator.onLine ? 'Saved Manually!' : 'HCC Record Saved!'}
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
      className="max-w-4xl mx-auto pb-12"
    >
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">HCC Program Form</h2>
              <p className="text-indigo-100 text-sm">Patient Admission & Care Record</p>
            </div>
          </div>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all font-bold text-sm"
          >
            <Search className="w-4 h-4" />
            {isExistingPatient ? 'Change Patient' : 'Find Existing Patient'}
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
                    placeholder="Search by patient name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                
                {searchQuery && (
                  <div className="mt-4 space-y-2">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map(patient => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{patient.name} {patient.surname}</div>
                              <div className="text-xs text-slate-500">DOB: {patient.dob} • {patient.gender}</div>
                            </div>
                          </div>
                          <div className="text-indigo-600 font-bold text-xs uppercase tracking-wider">Select</div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-400 text-sm italic">
                        No patients found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Patient Identification */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">1</span>
                Patient Identification
              </h3>
              {isExistingPatient && (
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

            {isExistingPatient && (
              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-indigo-900">Existing Patient Selected</div>
                  <div className="text-xs text-indigo-600 font-medium">Identification and Personal details are locked.</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">UI</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.ui}
                  onChange={(e) => setFormData({...formData, ui: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Folder No</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.folderNo}
                  onChange={(e) => setFormData({...formData, folderNo: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chronological No</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.chronologicalNo}
                  onChange={(e) => setFormData({...formData, chronologicalNo: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gov No</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.govNo}
                  onChange={(e) => setFormData({...formData, govNo: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>
          </section>

          {/* Personal Details */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">2</span>
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  disabled={isExistingPatient}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Surname</label>
                <input
                  type="text"
                  required
                  disabled={isExistingPatient}
                  value={formData.surname}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Suburb</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.suburb}
                  onChange={(e) => setFormData({...formData, suburb: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Postal Code</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone 1</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.phone1}
                  onChange={(e) => setFormData({...formData, phone1: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone 2</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.phone2}
                  onChange={(e) => setFormData({...formData, phone2: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Number</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DOB</label>
                <input
                  type="date"
                  disabled={isExistingPatient}
                  value={formData.dob}
                  onChange={(e) => {
                    const newDob = e.target.value;
                    setFormData({
                      ...formData, 
                      dob: newDob,
                      age: calculateAge(newDob)
                    });
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    disabled={isExistingPatient}
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                  <select
                    disabled={isExistingPatient}
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Race</label>
                <input
                  type="text"
                  disabled={isExistingPatient}
                  value={formData.race}
                  onChange={(e) => setFormData({...formData, race: e.target.value})}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    isExistingPatient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>
          </section>

          {/* Admission Details */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">3</span>
              Admission Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admission Date</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admissions</label>
                <input
                  type="text"
                  value={formData.admissions}
                  onChange={(e) => setFormData({...formData, admissions: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admission From</label>
                <input
                  type="text"
                  value={formData.admissionFrom}
                  onChange={(e) => setFormData({...formData, admissionFrom: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">LH Doctor</label>
                <input
                  type="text"
                  value={formData.lhDoctor}
                  onChange={(e) => setFormData({...formData, lhDoctor: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option>In-patient</option>
                  <option>Discharged</option>
                  <option>Deceased</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diagnosis</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Treatment</label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {['woundsArrival', 'arv', 'tb', 'nappy'].map((field) => (
                <div key={field}>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="flex gap-1">
                    {['Yes', 'No'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData({...formData, [field]: val})}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          (formData as any)[field] === val 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-slate-100 text-slate-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Discharge & Follow-up */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">4</span>
              Discharge & Follow-up
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discharge Date</label>
                <input
                  type="date"
                  value={formData.dischargeDate}
                  onChange={(e) => setFormData({...formData, dischargeDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Discharge To</label>
                <input
                  type="text"
                  value={formData.dischargeTo}
                  onChange={(e) => setFormData({...formData, dischargeTo: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Days IPU</label>
                <input
                  type="number"
                  value={formData.daysIpu}
                  onChange={(e) => setFormData({...formData, daysIpu: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">St. Lukes Date</label>
                <input
                  type="date"
                  value={formData.stLukesDate}
                  onChange={(e) => setFormData({...formData, stLukesDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {['stLukes', 'woundsDischarge', 'hbc', 'medicalAid'].map((field) => (
                <div key={field}>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="flex gap-1">
                    {['Yes', 'No'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData({...formData, [field]: val})}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          (formData as any)[field] === val 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-slate-100 text-slate-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading 
                ? (navigator.onLine ? 'Saving Record...' : 'Saving Locally...') 
                : 'Save HCC Record'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
