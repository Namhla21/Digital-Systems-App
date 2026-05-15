export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface HCTRecord {
  id?: string;
  name: string;
  surname: string;
  dob: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  facility: string;
  results: 'Positive' | 'Negative';
  tbTest: 'YES' | 'NO';
  condomsIssued: number;
  hivCounselling: 'YES' | 'NO';
  arvCounselling: 'YES' | 'NO';
  createdBy: string;
  createdAt: string;
}

export interface LSERecord {
  id?: string;
  name: string;
  surname: string;
  dob: string;
  age: number;
  address: string;
  grade: string;
  clubOption: 'Holiday' | 'Afternoon';
  attendanceDate?: string;
  createdBy: string;
  createdAt: string;
}

export interface HCCRecord {
  id?: string;
  ui: string;
  folderNo: string;
  chronologicalNo: string;
  govNo: string;
  name: string;
  surname: string;
  fullName: string;
  address: string;
  suburb: string;
  postalCode: string;
  phone1: string;
  phone2: string;
  idNumber: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  race: string;
  admissionDate: string;
  admissions: string;
  admissionFrom: string;
  lhDoctor: string;
  woundsArrival: 'Yes' | 'No';
  arv: 'Yes' | 'No';
  tb: 'Yes' | 'No';
  nappy: 'Yes' | 'No';
  category: string;
  treatment: string;
  status: 'In-patient' | 'Discharged' | 'Deceased';
  diagnosis: string;
  stLukes: 'Yes' | 'No';
  stLukesDate: string;
  dischargeDate: string;
  woundsDischarge: 'Yes' | 'No';
  dischargeTo: string;
  hbc: 'Yes' | 'No';
  medicalAid: 'Yes' | 'No';
  daysIpu: number;
  createdBy: string;
  createdAt: string;
}
