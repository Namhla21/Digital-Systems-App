import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Parser } from 'json2csv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for Excel Live Link
  app.get('/api/export/:type', async (req, res) => {
    const { type } = req.params;
    const { key } = req.query;

    // Simple security check
    if (key !== 'LIVING_HOPE_SECRET_2026') {
      return res.status(401).send('Unauthorized: Invalid Export Key');
    }

    try {
      const collectionName = type === 'hct' ? 'hct_records' : (type === 'lse' ? 'lse_records' : 'hcc_records');
      const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const hctFields = ['First Name', 'Surname', 'Date of Birth', 'Age', 'Sex', 'Facility', 'HIV Results', 'TB Test', 'Condoms Issued', 'HIV Counselling', 'ARV Counselling', 'Recorded By', 'Date Recorded'];
      const lseFields = ['First Name', 'Surname', 'Date of Birth', 'Age', 'Address', 'Grade', 'Club Option', 'Recorded By', 'Date Recorded'];
      const hccFields = [
        'UI', 'Folder No', 'Chronological No', 'Gov No', 'First Name', 'Surname', 'Full Name', 'Address', 'Suburb', 'Postal Code', 
        'Phone 1', 'Phone 2', 'ID Number', 'Date of Birth', 'Age', 'Gender', 'Race', 'Admission Date', 'Admissions', 'Admission From', 
        'LH Doctor', 'Wounds Arrival', 'ARV', 'TB', 'Nappy', 'Category', 'Treatment', 'Status', 'Diagnosis', 'St. Lukes', 
        'St. Luke\'s Date', 'Discharge Date', 'Wounds Discharge', 'Discharge To', 'HBC', 'Medical Aid', 'Days IPU', 'Recorded By', 'Date Recorded'
      ];

      const fields = type === 'hct' ? hctFields : (type === 'lse' ? lseFields : hccFields);
      
      const records = snapshot.docs.map(doc => {
        const data = doc.data();
        
        if (type === 'hct') {
          return {
            'First Name': data.name,
            'Surname': data.surname,
            'Date of Birth': data.dob,
            'Age': data.age,
            'Sex': data.sex,
            'Facility': data.facility,
            'HIV Results': data.results,
            'TB Test': data.tbTest,
            'Condoms Issued': data.condomsIssued,
            'HIV Counselling': data.hivCounselling,
            'ARV Counselling': data.arvCounselling,
            'Recorded By': data.createdBy,
            'Date Recorded': data.createdAt ? new Date(data.createdAt).toLocaleString() : ''
          };
        } else if (type === 'lse') {
          return {
            'First Name': data.name,
            'Surname': data.surname,
            'Date of Birth': data.dob,
            'Age': data.age,
            'Address': data.address,
            'Grade': data.grade,
            'Club Option': data.clubOption,
            'Recorded By': data.createdBy,
            'Date Recorded': data.createdAt ? new Date(data.createdAt).toLocaleString() : ''
          };
        } else if (type === 'hcc') {
          return {
            'UI': data.ui,
            'Folder No': data.folderNo,
            'Chronological No': data.chronologicalNo,
            'Gov No': data.govNo,
            'First Name': data.name,
            'Surname': data.surname,
            'Full Name': data.fullName,
            'Address': data.address,
            'Suburb': data.suburb,
            'Postal Code': data.postalCode,
            'Phone 1': data.phone1,
            'Phone 2': data.phone2,
            'ID Number': data.idNumber,
            'Date of Birth': data.dob,
            'Age': data.age,
            'Gender': data.gender,
            'Race': data.race,
            'Admission Date': data.admissionDate,
            'Admissions': data.admissions,
            'Admission From': data.admissionFrom,
            'LH Doctor': data.lhDoctor,
            'Wounds Arrival': data.woundsArrival,
            'ARV': data.arv,
            'TB': data.tb,
            'Nappy': data.nappy,
            'Category': data.category,
            'Treatment': data.treatment,
            'Status': data.status,
            'Diagnosis': data.diagnosis,
            'St. Lukes': data.stLukes,
            'St. Luke\'s Date': data.stLukesDate,
            'Discharge Date': data.dischargeDate,
            'Wounds Discharge': data.woundsDischarge,
            'Discharge To': data.dischargeTo,
            'HBC': data.hbc,
            'Medical Aid': data.medicalAid,
            'Days IPU': data.daysIpu,
            'Recorded By': data.createdBy,
            'Date Recorded': data.createdAt ? new Date(data.createdAt).toLocaleString() : ''
          };
        }
        
        return data;
      });

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(records);

      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.attachment(`LivingHope_${type.toUpperCase()}_Live_Export.csv`);
      return res.send(csv);
    } catch (error) {
      console.error('Export error:', error);
      return res.status(500).send('Internal Server Error');
    }
  });

  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(process.cwd(), 'dist'));
  
  console.log(`Starting server in ${isProd ? 'production' : 'development'} mode`);

  // Vite middleware for development
  if (!isProd) {
    console.log('Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving static files from dist...');
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
