# Medical image processing and medicine price comparisons

## Upload behavior

Prescription and medical report uploads accept JPEG, PNG, and WebP images up to 8 MB. A signed-in Supabase session and explicit consent are required. The consent prompt explains that the image is sent to the configured vision provider and that the image and resulting transcription are stored under the uploader's account. A clinician or pharmacist must confirm uncertain text before acting on it.

The upload routes encrypt both the image and transcription with AES-256-GCM before writing them to MySQL. Configure `MEDICAL_DOCUMENT_ENCRYPTION_KEY` as a stable 32-byte key (64 hexadecimal characters or base64 for 32 bytes) in the deployment secret manager. Back up the key securely; records cannot be decrypted if it is lost or changed. Do not place the production key in source control.

Apply the database change with `npx prisma migrate deploy` from `Frontend` after setting `DATABASE_URL`, then generate the client with `npx prisma generate`. `GET /api/medical-documents` lists the signed-in user's last 50 saved analyses. `DELETE /api/medical-documents?id=...` deletes a record owned by that account.

## Price catalog behavior

Medicine price cards identify the catalog source and its `generated_at` snapshot timestamp. Snapshots older than 30 days are marked stale. The bundled MedEx Bangladesh dataset is a snapshot, not a live price feed; update the dataset through a separately reviewed catalog refresh process.

Prescription price comparisons use only exact normalized generic name, strength, dosage form, and package-size matches. The system does not infer unclear fields or present a match when a required field is missing. Prices retain their source basis (per unit or per package); a price difference is shown only when both brands use the same basis.
