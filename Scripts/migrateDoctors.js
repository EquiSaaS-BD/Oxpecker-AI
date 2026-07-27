const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'Doctors-list.json');
const outputPath = path.join(__dirname, 'src/lib/doctorsDb.json');

try {
  const rawData = fs.readFileSync(inputPath, 'utf8');
  const doctors = JSON.parse(rawData);

  const mappedDoctors = doctors.map((doc, index) => {
    const rating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1);
    const reviews = Math.floor(Math.random() * 400) + 50;

    return {
      id: `doc-${index + 1}`,
      name: doc.name || "Unknown Doctor",
      specialty: doc.specialty || "General",
      rating: parseFloat(rating),
      reviews: reviews,
      image: doc.profile_photo_url || "",
      availability: "Available Today",
      price: doc.consultation_fees || "Contact for fee",
      hospital: doc.chamber_information || "Shustota Network",
      experience: doc.years_of_experience || "5+ Years",
      verified: true
    };
  });

  fs.writeFileSync(outputPath, JSON.stringify(mappedDoctors, null, 2), 'utf8');
  console.log(`Successfully mapped ${mappedDoctors.length} doctors to ${outputPath}`);
} catch (err) {
  console.error("Error migrating doctors:", err);
}
