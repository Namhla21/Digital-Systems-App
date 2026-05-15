import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  FileSpreadsheet, 
  HeartPulse, 
  GraduationCap, 
  Search, 
  Download,
  Filter,
  ChevronRight,
  UserCog,
  Link as LinkIcon,
  Copy,
  Info,
  Stethoscope,
  CloudOff,
  CloudCheck,
  Trash2
} from 'lucide-react';
import { HCTRecord, LSERecord, HCCRecord, UserProfile } from '../types';
import * as XLSX from 'xlsx';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'hct' | 'lse' | 'hcc' | 'users' | 'live'>('hct');
  const [hctRecords, setHctRecords] = useState<HCTRecord[]>([]);
  const [lseRecords, setLseRecords] = useState<LSERecord[]>([]);
  const [hccRecords, setHccRecords] = useState<HCCRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasPendingSync, setHasPendingSync] = useState(false);

  useEffect(() => {
    setLoading(true);
    let hctLoaded = false;
    let lseLoaded = false;
    let hccLoaded = false;
    let usersLoaded = false;

    const handleFirestoreError = (error: any, operation: string, path: string) => {
      const errInfo = {
        error: error?.message || String(error),
        operationType: operation,
        path: path,
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          emailVerified: auth.currentUser?.emailVerified,
          isAnonymous: auth.currentUser?.isAnonymous,
        }
      };
      console.error(`Firestore Error [${operation} on ${path}]:`, JSON.stringify(errInfo));
    };

    const checkLoading = () => {
      if (hctLoaded && lseLoaded && hccLoaded && usersLoaded) {
        setLoading(false);
      }
    };
    
    // Real-time listener for HCT
    const qHct = query(collection(db, 'hct_records'), orderBy('createdAt', 'desc'));
    const unsubHct = onSnapshot(qHct, (snapshot) => {
      setHctRecords(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HCTRecord)));
      if (snapshot.metadata.hasPendingWrites) setHasPendingSync(true);
      hctLoaded = true;
      checkLoading();
    }, (error) => {
      handleFirestoreError(error, 'list', 'hct_records');
      hctLoaded = true;
      checkLoading();
    });

    // Real-time listener for LSE
    const qLse = query(collection(db, 'lse_records'), orderBy('createdAt', 'desc'));
    const unsubLse = onSnapshot(qLse, (snapshot) => {
      setLseRecords(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LSERecord)));
      lseLoaded = true;
      checkLoading();
    }, (error) => {
      handleFirestoreError(error, 'list', 'lse_records');
      lseLoaded = true;
      checkLoading();
    });

    // Real-time listener for HCC
    const qHcc = query(collection(db, 'hcc_records'), orderBy('createdAt', 'desc'));
    const unsubHcc = onSnapshot(qHcc, (snapshot) => {
      setHccRecords(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HCCRecord)));
      hccLoaded = true;
      checkLoading();
    }, (error) => {
      handleFirestoreError(error, 'list', 'hcc_records');
      hccLoaded = true;
      checkLoading();
    });

    // Real-time listener for Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ ...d.data() } as UserProfile)));
      usersLoaded = true;
      checkLoading();
    }, (error) => {
      handleFirestoreError(error, 'list', 'users');
      usersLoaded = true;
      checkLoading();
    });

    // Fallback to stop loading if something hangs
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubHct();
      unsubLse();
      unsubHcc();
      unsubUsers();
      clearTimeout(timeout);
    };
  }, []);

  const exportToExcel = () => {
    if (activeTab === 'users') {
      const exportData = users.map(u => ({
        'Email': u.email,
        'Role': u.role,
        'Joined Date': new Date(u.createdAt).toLocaleString()
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'USERS');
      XLSX.writeFile(workbook, `LivingHope_Users_${new Date().toISOString().split('T')[0]}.xlsx`);
      return;
    }

    const data = activeTab === 'hct' ? hctRecords : (activeTab === 'lse' ? lseRecords : hccRecords);
    
    // Map data to readable headers for Excel
    const exportData = data.map((record) => {
      if (activeTab === 'hct') {
        const r = record as HCTRecord;
        return {
          'First Name': r.name,
          'Surname': r.surname,
          'Date of Birth': r.dob,
          'Age': r.age,
          'Sex': r.sex,
          'Facility': r.facility,
          'HIV Results': r.results,
          'TB Test': r.tbTest,
          'Condoms Issued': r.condomsIssued,
          'HIV Counselling': r.hivCounselling,
          'ARV Counselling': r.arvCounselling,
          'Recorded By': getUserEmail(r.createdBy),
          'Date Recorded': new Date(r.createdAt).toLocaleString()
        };
      } else if (activeTab === 'lse') {
        const r = record as LSERecord;
        return {
          'First Name': r.name,
          'Surname': r.surname,
          'Date of Birth': r.dob,
          'Age': r.age,
          'Address': r.address,
          'Grade': r.grade,
          'Club Option': r.clubOption,
          'Attendance Date': r.attendanceDate || new Date(r.createdAt).toLocaleDateString(),
          'Total Attendance': lseAttendanceMap[`${r.name.toLowerCase()}|${r.surname.toLowerCase()}|${r.dob}`] || 0,
          'Recorded By': getUserEmail(r.createdBy),
          'Date Recorded': new Date(r.createdAt).toLocaleString()
        };
      } else {
        const r = record as HCCRecord;
        return {
          'UI': r.ui,
          'Folder No': r.folderNo,
          'Chronological No': r.chronologicalNo,
          'Gov No': r.govNo,
          'First Name': r.name,
          'Surname': r.surname,
          'Full Name': r.fullName,
          'Address': r.address,
          'Suburb': r.suburb,
          'Postal Code': r.postalCode,
          'Phone 1': r.phone1,
          'Phone 2': r.phone2,
          'ID Number': r.idNumber,
          'Date of Birth': r.dob,
          'Age': r.age,
          'Gender': r.gender,
          'Race': r.race,
          'Admission Date': r.admissionDate,
          'Admissions': r.admissions,
          'Admission From': r.admissionFrom,
          'LH Doctor': r.lhDoctor,
          'Wounds Arrival': r.woundsArrival,
          'ARV': r.arv,
          'TB': r.tb,
          'Nappy': r.nappy,
          'Category': r.category,
          'Treatment': r.treatment,
          'Status': r.status,
          'Diagnosis': r.diagnosis,
          'St. Lukes': r.stLukes,
          'St. Luke\'s Date': r.stLukesDate,
          'Discharge Date': r.dischargeDate,
          'Wounds Discharge': r.woundsDischarge,
          'Discharge To': r.dischargeTo,
          'HBC': r.hbc,
          'Medical Aid': r.medicalAid,
          'Days IPU': r.daysIpu,
          'Recorded By': getUserEmail(r.createdBy),
          'Date Recorded': new Date(r.createdAt).toLocaleString()
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab.toUpperCase());
    XLSX.writeFile(workbook, `LivingHope_${activeTab.toUpperCase()}_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const updateUserRole = async (uid: string, newRole: 'admin' | 'staff') => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Check permissions.');
    }
  };

  const deleteRecord = async (collectionName: 'hct_records' | 'lse_records' | 'hcc_records', id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this record? This action cannot be undone.')) return;
    
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, collectionName, id));
      // State will auto-update via onSnapshot listeners
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record. You might not have permission.');
    }
  };

  const filteredHCT = hctRecords.filter(r => 
    (r.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (r.surname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.facility?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredLSE = lseRecords.filter(r => 
    (r.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (r.surname?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredHCC = hccRecords.filter(r => 
    (r.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (r.surname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.diagnosis?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
  
  const lseAttendanceMap = lseRecords.reduce((acc, r) => {
    const key = `${r.name.toLowerCase()}|${r.surname.toLowerCase()}|${r.dob}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getUserEmail = (uid: string) => {
    // If it's already an email (from future records), return it
    if (uid.includes('@')) return uid;
    const user = users.find(u => u.uid === uid);
    return user ? user.email : uid;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  const liveLinkHct = `${window.location.origin}/api/export/hct?key=LIVING_HOPE_SECRET_2026`;
  const liveLinkLse = `${window.location.origin}/api/export/lse?key=LIVING_HOPE_SECRET_2026`;
  const liveLinkHcc = `${window.location.origin}/api/export/hcc?key=LIVING_HOPE_SECRET_2026`;

  return (
    <div className="space-y-8">
      {/* Sync Status Alert */}
      {(hctRecords.some(r => r.id.length > 20 && !hctRecords.find(x => x.id === r.id)) || hasPendingSync) && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <CloudOff className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-amber-900">Syncing Records...</div>
              <div className="text-xs text-amber-700">Some records are saved on this device but waiting for internet to upload. They will appear in Excel after syncing.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Pending Sync</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Admin Control Panel
          </h2>
          <p className="text-slate-500">Manage records, users, and export data for reporting.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
            />
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-200 rounded-2xl w-fit">
        {[
          { id: 'hct', label: 'HCT Records', icon: HeartPulse },
          { id: 'lse', label: 'LSE Records', icon: GraduationCap },
          { id: 'hcc', label: 'HCC Records', icon: Stethoscope },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'live', label: 'Excel Live Link', icon: LinkIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'live' && (
              <div className="p-8 max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Excel Live Link Setup</h3>
                    <p className="text-slate-500 text-sm">Connect your desktop Excel directly to the Living Hope database.</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8">
                  <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    How to use in Excel:
                  </h4>
                  <ol className="list-decimal list-inside space-y-3 text-blue-900/80 text-sm font-medium">
                    <li>Open **Excel** on your computer.</li>
                    <li>Go to the **Data** tab in the top menu.</li>
                    <li>Click **Get Data** &gt; **From Other Sources** &gt; **From Web**.</li>
                    <li>Paste the link below and click **OK**.</li>
                    <li>Excel will now pull all data. Click **Refresh** anytime to get the latest records!</li>
                  </ol>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-2">HCT Program Live Link</label>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={liveLinkHct}
                        className="flex-1 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono text-slate-500"
                      />
                      <button 
                        onClick={() => copyToClipboard(liveLinkHct)}
                        className="bg-white border border-slate-200 p-2 rounded-xl hover:bg-slate-100 transition-all"
                      >
                        <Copy className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-2">LSE Program Live Link</label>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={liveLinkLse}
                        className="flex-1 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono text-slate-500"
                      />
                      <button 
                        onClick={() => copyToClipboard(liveLinkLse)}
                        className="bg-white border border-slate-200 p-2 rounded-xl hover:bg-slate-100 transition-all"
                      >
                        <Copy className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-2">HCC Program Live Link</label>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={liveLinkHcc}
                        className="flex-1 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono text-slate-500"
                      />
                      <button 
                        onClick={() => copyToClipboard(liveLinkHcc)}
                        className="bg-white border border-slate-200 p-2 rounded-xl hover:bg-slate-100 transition-all"
                      >
                        <Copy className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hct' && (
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 font-bold text-slate-600 text-sm">Client Name</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">DOB</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Age</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Sex</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Facility</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">HIV Result</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">TB Test</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Condoms</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">HIV Couns.</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">ARV Couns.</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Recorded By</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Date</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHCT.map((record) => (
                    <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{record.name} {record.surname}</div>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{record.dob}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.age}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.sex}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.facility}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          record.results === 'Positive' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {record.results}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{record.tbTest}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.condomsIssued}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.hivCounselling}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.arvCounselling}</td>
                      <td className="p-4 text-slate-500 text-xs font-medium">{getUserEmail(record.createdBy)}</td>
                      <td className="p-4 text-slate-400 text-xs">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteRecord('hct_records', record.id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'lse' && (
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 font-bold text-slate-600 text-sm">Student Name</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Total Attendance</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">DOB</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Age</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Grade</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Club Option</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Address</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Recorded By</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Attendance Date</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLSE.map((record) => (
                    <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{record.name} {record.surname}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          {lseAttendanceMap[`${record.name.toLowerCase()}|${record.surname.toLowerCase()}|${record.dob}`] || 0} visits
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{record.dob}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.age}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.grade}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                          {record.clubOption}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-sm truncate max-w-xs">{record.address}</td>
                      <td className="p-4 text-slate-500 text-xs font-medium">{getUserEmail(record.createdBy)}</td>
                      <td className="p-4 text-slate-400 text-xs font-bold text-purple-600">
                        {record.attendanceDate || new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteRecord('lse_records', record.id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'hcc' && (
              <table className="w-full text-left border-collapse min-w-[4500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 font-bold text-slate-600 text-sm">UI</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Folder No</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Chronological No</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Gov No</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">First Name</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Surname</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Full Name</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Address</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Suburb</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Postal Code</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Phone 1</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Phone 2</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">ID Number</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">DOB</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Age</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Gender</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Race</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Admission Date</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Admissions</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Admission From</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">LH Doctor</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Wounds Arrival</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">ARV</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">TB</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Nappy</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Category</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Treatment</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Status</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Diagnosis</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">St. Lukes</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">St. Luke's Date</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Discharge Date</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Wounds Discharge</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Discharge To</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">HBC</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Medical Aid</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Days IPU</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Recorded By</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Date</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHCC.map((record) => (
                    <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                      <td className="p-4 text-slate-600 text-sm">{record.ui}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.folderNo}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.chronologicalNo}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.govNo}</td>
                      <td className="p-4 font-bold text-slate-800">{record.name}</td>
                      <td className="p-4 font-bold text-slate-800">{record.surname}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.fullName}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.address}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.suburb}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.postalCode}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.phone1}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.phone2}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.idNumber}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.dob}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.age}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.gender}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.race}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.admissionDate}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.admissions}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.admissionFrom}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.lhDoctor}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.woundsArrival}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.arv}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.tb}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.nappy}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.category}</td>
                      <td className="p-4 text-slate-600 text-sm max-w-xs truncate">{record.treatment}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          record.status === 'In-patient' ? 'bg-blue-100 text-blue-700' : 
                          record.status === 'Discharged' ? 'bg-green-100 text-green-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-sm max-w-xs truncate">{record.diagnosis}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.stLukes}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.stLukesDate}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.dischargeDate}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.woundsDischarge}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.dischargeTo}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.hbc}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.medicalAid}</td>
                      <td className="p-4 text-slate-600 text-sm">{record.daysIpu}</td>
                      <td className="p-4 text-slate-500 text-xs font-medium">{getUserEmail(record.createdBy)}</td>
                      <td className="p-4 text-slate-400 text-xs">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-10px_0_10_rgba(0,0,0,0.05)]">
                        <button
                          onClick={() => deleteRecord('hcc_records', record.id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'users' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 font-bold text-slate-600 text-sm">User Email</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Current Role</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Joined Date</th>
                    <th className="p-4 font-bold text-slate-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateUserRole(user.uid, user.role === 'admin' ? 'staff' : 'admin')}
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all"
                          >
                            <UserCog className="w-3 h-3" />
                            Toggle Role
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
