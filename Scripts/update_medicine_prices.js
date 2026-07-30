const fs = require('fs');
const path = require('path');

const inputFilePath = path.join(__dirname, '../organized_medicine_data/organized/medicines.json');
const outputFilePath = path.join(__dirname, '../organized_medicine_data/organized/medicines_2026.json');

console.log('Reading 2022 medicine data...');
const data = JSON.parse(fs.readFileSync(inputFilePath, 'utf-8'));

// Helper arrays to identify categories
const category1_otc = ['paracetamol', 'antacid', 'ibuprofen', 'diclofenac', 'cetirizine', 'fexofenadine', 'loratadine', 'vitamin', 'calcium', 'zinc', 'ascorbic acid', 'magnesium', 'domperidone'];
const category2_antibiotic = ['amoxicillin', 'azithromycin', 'cefixime', 'cefuroxime', 'ciprofloxacin', 'ceftriaxone', 'levofloxacin', 'metronidazole', 'doxycycline', 'flucloxacillin', 'meropenem', 'injection', 'iv', 'im'];
const category3_cardiac_diabetic = ['metformin', 'sitagliptin', 'linagliptin', 'glimepiride', 'gliclazide', 'empagliflozin', 'losartan', 'valsartan', 'olmesartan', 'amlodipine', 'bisoprolol', 'atorvastatin', 'rosuvastatin', 'clopidogrel', 'insulin'];
const category4_gastric = ['omeprazole', 'pantoprazole', 'esomeprazole', 'rabeprazole', 'dexlansoprazole'];

function getIncreaseRate(medicine) {
    const generic = (medicine.generic_name || '').toLowerCase();
    const dosage = (medicine.dosage_form || '').toLowerCase();
    const title = (medicine.brand_name || '').toLowerCase();
    
    const textToSearch = generic + ' ' + dosage + ' ' + title;

    // 2. Antibiotics & Injections (65% increase)
    if (category2_antibiotic.some(kw => textToSearch.includes(kw))) return 0.65;
    
    // 3. Diabetes, BP, Heart (40% increase)
    if (category3_cardiac_diabetic.some(kw => textToSearch.includes(kw))) return 0.40;
    
    // 4. Gastric (Capsule/Tablet) (30% increase)
    if (category4_gastric.some(kw => textToSearch.includes(kw))) return 0.30;
    
    // 1. OTC & Common (75% increase)
    if (category1_otc.some(kw => textToSearch.includes(kw))) return 0.75;
    
    // 5. Others (40% increase)
    return 0.40;
}

function processPriceString(priceString, rate) {
    if (!priceString) return priceString;
    // Look for numbers following the taka symbol '৳ '
    return priceString.replace(/৳\s*([\d,\.]+)/g, (match, price) => {
        const numPrice = parseFloat(price.replace(/,/g, ''));
        if (isNaN(numPrice)) return match;
        const newPrice = Math.ceil(numPrice * (1 + rate));
        return `৳ ${newPrice.toFixed(2)}`;
    });
}

console.log(`Processing ${data.data.length} medicines...`);

data.data = data.data.map(medicine => {
    const rate = getIncreaseRate(medicine);
    const updatedContainer = processPriceString(medicine.package_container, rate);
    const updatedSize = processPriceString(medicine.package_size, rate);
    
    return {
        ...medicine,
        estimated_price_2026: updatedContainer,
        estimated_price_2026_package_size: updatedSize,
        applied_increase_rate: `${(rate * 100).toFixed(0)}%`
    };
});

data.generated_at_2026 = new Date().toISOString();

console.log('Writing updated 2026 data...');
fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), 'utf-8');

console.log('Successfully generated medicines_2026.json with updated MRP!');
