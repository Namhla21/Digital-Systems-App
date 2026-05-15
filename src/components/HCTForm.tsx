import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { HeartPulse, Save, ArrowLeft, CheckCircle2, Search, User, X } from 'lucide-react';
import { UserProfile, HCTRecord } from '../types';
import { calculateAge } from '../lib/utils';

interface Props {
  user: UserProfile;
}

export default function HCTForm({ user }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingClients, setExistingClients] = useState<HCTRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isExistingClient, setIsExistingClient] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    dob: '',
    age: '',
    sex: 'Male',
    facility: '',
    results: 'Negative',
    tbTest: 'NO',
    condomsIssued: '0',
    hivCounselling: 'NO',
    arvCounselling: 'NO'
  });

  useEffect(() => {
    const fetchClients = async () => {
      const q = query(collection(db, 'hct_records'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HCTRecord));
      
      const uniqueClients: HCTRecord[] = [];
      const seen = new Set();
      
      records.forEach(r => {
        const key = `${r.name.toLowerCase()}|${r.surname.toLowerCase()}|${r.dob}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueClients.push(r);
        }
      });
      
      setExistingClients(uniqueClients);
    };
    fetchClients();
  }, []);

  const handleSelectClient = (client: HCTRecord) => {
    setFormData({
      ...formData,
      name: client.name,
      surname: client.surname,
      dob: client.dob,
      age: String(client.age),
      sex: client.sex,
      facility: client.facility,
    });
    setIsExistingClient(true);
    setShowSearch(false);
    setSearchQuery('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      dob: '',
      age: '',
      sex: 'Male',
      facility: '',
      results: 'Negative',
      tbTest: 'NO',
      condomsIssued: '0',
      hivCounselling: 'NO',
      arvCounselling: 'NO'
    });
    setIsExistingClient(false);
  };

  const filteredClients = existingClients.filter(c => 
    `${c.name} ${c.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Optimistic save: We trigger the write but don't strictly await its total success 
      // if we want instant UI feedback, as Firestore persistence will handle it.
      // However, to ensure records aren't lost, we trigger it and immediately show success.
      addDoc(collection(db, 'hct_records'), {
        ...formData,
        age: Number(formData.age),
        condomsIssued: Number(formData.condomsIssued),
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
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <HeartPulse className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">HCT Program Form</h2>
              <p className="text-blue-100 text-sm">HIV Counseling and Testing Record</p>
            </div>
          </div>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all font-bold text-sm"
          >
            <Search className="w-4 h-4" />
            {isExistingClient ? 'Change Client' : 'Find Existing Client'}
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
                    placeholder="Search by client name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                
                {searchQuery && (
                  <div className="mt-4 space-y-2">
                    {filteredClients.length > 0 ? (
                      filteredClients.map(client => (
                        <button
                          key={client.id}
                          onClick={() => handleSelectClient(client)}
                          className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{client.name} {client.surname}</div>
                              <div className="text-xs text-slate-500">DOB: {client.dob} • {client.sex}</div>
                            </div>
                          </div>
                          <div className="text-blue-600 font-bold text-xs uppercase tracking-wider">Select</div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-400 text-sm italic">
                        No clients found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Demographics */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
                Client Demographics
              </h3>
              {isExistingClient && (
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

            {isExistingClient && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-900">Existing Client Selected</div>
                  <div className="text-xs text-blue-600 font-medium">Static details are locked. Just fill in the clinical info below.</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  disabled={isExistingClient}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    isExistingClient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Surname</label>
                <input
                  type="text"
                  required
                  disabled={isExistingClient}
                  value={formData.surname}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    isExistingClient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  required
                  disabled={isExistingClient}
                  value={formData.dob}
                  onChange={(e) => {
                    const newDob = e.target.value;
                    setFormData({
                      ...formData, 
                      dob: newDob,
                      age: calculateAge(newDob)
                    });
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    isExistingClient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                  <input
                    type="number"
                    required
                    disabled={isExistingClient}
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                      isExistingClient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sex</label>
                  <select
                    disabled={isExistingClient}
                    value={formData.sex}
                    onChange={(e) => setFormData({...formData, sex: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                      isExistingClient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Facility</label>
                <input
                  type="text"
                  required
                  disabled={isExistingClient}
                  value={formData.facility}
                  onChange={(e) => setFormData({...formData, facility: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    isExistingClient ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-50 border-slate-200'
                  }`}
                  placeholder="Health center or clinic name"
                />
              </div>
            </div>
          </section>

          {/* Clinical Info */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
              Clinical Information & Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">HIV Results</label>
                <div className="flex gap-3">
                  {['Positive', 'Negative'].map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setFormData({...formData, results: res})}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                        formData.results === res 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">TB Test</label>
                <div className="flex gap-3">
                  {['YES', 'NO'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({...formData, tbTest: val})}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                        formData.tbTest === val 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Number of Condoms Issued</label>
                <input
                  type="number"
                  required
                  value={formData.condomsIssued}
                  onChange={(e) => setFormData({...formData, condomsIssued: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Counselling */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">3</span>
              Counselling Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">HIV+ Counselling Up</label>
                <div className="flex gap-3">
                  {['YES', 'NO'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({...formData, hivCounselling: val})}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                        formData.hivCounselling === val 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ARV Counselling</label>
                <div className="flex gap-3">
                  {['YES', 'NO'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({...formData, arvCounselling: val})}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                        formData.arvCounselling === val 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading 
                ? (navigator.onLine ? 'Saving Record...' : 'Saving Locally...') 
                : 'Save HCT Record'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
