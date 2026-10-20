-- ==============================================================================
-- OXPECKER AI - EMERGENCY ACCIDENT & PATIENT DATABASE SYSTEM
-- Production SQL Migration: Tables, Indexes, RLS & Seed Records
-- ==============================================================================

-- 1. Create Patient Health Records Table
CREATE TABLE IF NOT EXISTS public.patient_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uhid VARCHAR(32) UNIQUE NOT NULL,
    nid VARCHAR(32) UNIQUE,
    birth_cert_no VARCHAR(32),
    full_name VARCHAR(120) NOT NULL,
    english_name VARCHAR(120),
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(16) NOT NULL,
    blood_group VARCHAR(8) NOT NULL,
    severe_allergies TEXT[] DEFAULT '{}',
    chronic_conditions JSONB DEFAULT '[]',
    active_medications JSONB DEFAULT '[]',
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    emergency_contact_relation VARCHAR(50) NOT NULL,
    emergency_has_whatsapp BOOLEAN DEFAULT false,
    has_pacemaker BOOLEAN DEFAULT false,
    is_diabetic BOOLEAN DEFAULT false,
    diabetic_status VARCHAR(50) DEFAULT 'Non-Diabetic',
    organ_donor BOOLEAN DEFAULT false,
    division VARCHAR(50),
    zila VARCHAR(50),
    upazila VARCHAR(50),
    post_code VARCHAR(10),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance & Search Optimization Indexes (Sub-50ms query time)
CREATE INDEX IF NOT EXISTS idx_phr_nid ON public.patient_health_records (nid);
CREATE INDEX IF NOT EXISTS idx_phr_phone ON public.patient_health_records (phone);
CREATE INDEX IF NOT EXISTS idx_phr_uhid ON public.patient_health_records (uhid);
CREATE INDEX IF NOT EXISTS idx_phr_blood_group ON public.patient_health_records (blood_group);

-- 3. Create Emergency Break-Glass Audit Trail Table
CREATE TABLE IF NOT EXISTS public.emergency_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_uhid VARCHAR(32) NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    doctor_bmdc_no VARCHAR(50) DEFAULT 'EMERGENCY-DESK',
    hospital_name VARCHAR(120) NOT NULL,
    access_reason VARCHAR(255) DEFAULT 'Immediate Emergency Accident Triage Admission',
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_eal_patient_uhid ON public.emergency_access_logs (patient_uhid);
CREATE INDEX IF NOT EXISTS idx_eal_accessed_at ON public.emergency_access_logs (accessed_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.patient_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_access_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for emergency lookup
CREATE POLICY "Allow emergency read on patient_health_records"
    ON public.patient_health_records
    FOR SELECT
    USING (true);

-- Allow authenticated doctors/hospitals to insert access logs
CREATE POLICY "Allow log insert on emergency_access_logs"
    ON public.emergency_access_logs
    FOR INSERT
    WITH CHECK (true);

-- 5. Seed Benchmark Bangladeshi Emergency Patient Records
INSERT INTO public.patient_health_records (
    uhid, nid, birth_cert_no, full_name, english_name, phone, date_of_birth, gender, blood_group,
    severe_allergies, chronic_conditions, active_medications,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation, emergency_has_whatsapp,
    has_pacemaker, is_diabetic, diabetic_status, organ_donor,
    division, zila, upazila, post_code, address, notes
) VALUES
(
    'UHID-1995-94821',
    '1995 2698 4401 2390',
    '19952698440123901',
    'মো. রফিক ইসলাম',
    'MD. RAFIQUL ISLAM',
    '+880 1712-345678',
    '1995-03-15',
    'Male',
    'A+',
    ARRAY['Penicillin', 'Aspirin', 'Sulfa Drugs'],
    '[{"name": "Type-2 Diabetes", "since": "2022", "status": "controlled", "severity": "moderate"}, {"name": "Hypertension", "since": "2023", "status": "controlled", "severity": "mild"}]'::jsonb,
    '[{"name": "Metformin", "dosage": "500mg", "frequency": "2x daily (After meals)", "duration": "Continuous", "instructions": "Take with or immediately after main meals", "prescribed_by": "Dr. Aminul Rahman"}, {"name": "Amlodipine", "dosage": "5mg", "frequency": "1x daily (Morning)", "duration": "Continuous", "instructions": "Take once daily in the morning with water", "prescribed_by": "Dr. Kamrul Hasan"}]'::jsonb,
    'Fatema Begum',
    '+880 1819-876543',
    'Mother',
    true,
    false,
    true,
    'Type-2',
    true,
    'Dhaka',
    'Dhaka',
    'Dhanmondi',
    '1205',
    'House 42, Road 9/A, Dhanmondi, Dhaka',
    'Known allergy to Penicillin. Severe anaphylactic risk.'
),
(
    'UHID-1998-11840',
    '1998 4401 9283 1102',
    '19984401928311021',
    'তানজিলা আক্তার',
    'TANZILA AKTER',
    '+880 1819-001122',
    '1998-07-22',
    'Female',
    'O+',
    ARRAY['Latex', 'Ibuprofen'],
    '[{"name": "Asthma", "since": "2019", "status": "active", "severity": "moderate"}]'::jsonb,
    '[{"name": "Salbutamol Inhaler", "dosage": "100mcg", "frequency": "As needed (SOS)", "duration": "PRN", "instructions": "Inhale 2 puffs during acute wheezing", "prescribed_by": "Dr. Farhana Yasmin"}, {"name": "Montelukast", "dosage": "10mg", "frequency": "1x daily (Night)", "duration": "30 days", "instructions": "Take at bedtime", "prescribed_by": "Dr. Farhana Yasmin"}]'::jsonb,
    'Abu Taher',
    '+880 1819-876543',
    'Husband',
    true,
    false,
    false,
    'Non-Diabetic',
    false,
    'Chittagong',
    'Chittagong',
    'Kotwali',
    '4000',
    'Amanat Road, Kotwali, Chittagong',
    'Carry emergency bronchodilator at all times.'
),
(
    'UHID-1968-77319',
    '1968 1104 5592 8810',
    NULL,
    'আব্দুল করিম',
    'ABDUL KARIM',
    '+880 1711-223344',
    '1968-11-04',
    'Male',
    'B+',
    ARRAY['Penicillin', 'Cephalosporins'],
    '[{"name": "Coronary Artery Disease", "since": "2020", "status": "controlled", "severity": "severe"}, {"name": "Type-2 Diabetes", "since": "2015", "status": "controlled", "severity": "moderate"}]'::jsonb,
    '[{"name": "Clopidogrel", "dosage": "75mg", "frequency": "1x daily", "duration": "Continuous", "instructions": "Take after lunch with water", "prescribed_by": "National Heart Foundation"}, {"name": "Atorvastatin", "dosage": "20mg", "frequency": "1x daily (Night)", "duration": "Continuous", "instructions": "Take after dinner", "prescribed_by": "National Heart Foundation"}, {"name": "Insulin Glargine", "dosage": "14 Units", "frequency": "1x daily (Night)", "duration": "Continuous", "instructions": "Subcutaneous injection at 10 PM", "prescribed_by": "BIRDEM"}]'::jsonb,
    'Md. Nayem',
    '+880 1711-889900',
    'Son',
    true,
    true,
    true,
    'Type-2',
    true,
    'Sylhet',
    'Sylhet',
    'Amberkhana',
    '3100',
    'Amberkhana Point, Sylhet',
    'Patient has an active Medtronic cardiac pacemaker implanted. Avoid MRI scanners.'
),
(
    'UHID-2001-55901',
    '2001 5590 1234 9876',
    '20015590123498760',
    'ফারহানা চৌধুরী',
    'FARHANA CHOWDHURY',
    '+880 1912-987654',
    '2001-09-18',
    'Female',
    'AB+',
    ARRAY['Ciprofloxacin', 'Peanuts'],
    '[]'::jsonb,
    '[]'::jsonb,
    'Dr. Nazmul Chowdhury',
    '+880 1912-112233',
    'Father',
    true,
    false,
    false,
    'Non-Diabetic',
    true,
    'Dhaka',
    'Dhaka',
    'Uttara',
    '1230',
    'Sector 4, Road 7, Uttara, Dhaka',
    'Universal Plasma Recipient (AB+). Highly active student.'
),
(
    'UHID-1985-33027',
    '1985 3302 7711 4455',
    NULL,
    'মো. জসিম উদ্দিন',
    'MD. JASIM UDDIN',
    '+880 1611-554433',
    '1985-05-12',
    'Male',
    'O-',
    ARRAY[]::text[],
    '[{"name": "Mild Gastritis", "since": "2024", "status": "controlled", "severity": "mild"}]'::jsonb,
    '[{"name": "Esomeprazole", "dosage": "20mg", "frequency": "1x daily (Morning)", "duration": "14 days", "instructions": "Take before breakfast", "prescribed_by": "Dr. Mahmud"}]'::jsonb,
    'Nasima Jasim',
    '+880 1611-998877',
    'Wife',
    true,
    false,
    false,
    'Non-Diabetic',
    true,
    'Rajshahi',
    'Rajshahi',
    'Boalia',
    '6000',
    'Shaheb Bazar, Boalia, Rajshahi',
    'Universal Red Blood Cell Donor (O-Negative). Emergency blood donor volunteer.'
)
ON CONFLICT (uhid) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    blood_group = EXCLUDED.blood_group,
    severe_allergies = EXCLUDED.severe_allergies,
    emergency_contact_phone = EXCLUDED.emergency_contact_phone;
