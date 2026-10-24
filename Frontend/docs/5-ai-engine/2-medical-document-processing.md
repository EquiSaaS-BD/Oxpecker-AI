# Medical image processing and medicine price comparisons

## Upload behavior

Prescription and medical report uploads accept JPEG, PNG, and WebP images up to 8 MB. A signed-in Supabase session and explicit consent are required. The consent prompt explains that the image is sent to the configured vision provider and that the image and resulting transcription are stored under the uploader's account. Records remain until the owner deletes them. A clinician or pharmacist must confirm every prescription field before acting on it.

Medical-document scans are sent only to Azure AI: Azure OpenAI vision first, then Azure Computer Vision OCR. These routes do not forward prescription images to the optional Gemini, OpenAI, or Groq providers used by other image features. Configure a vision-capable Azure OpenAI deployment, or the Azure Vision OCR fallback. If Azure services are unavailable, the upload fails without saving an unreviewable transcription.

Prescription scans request structured OCR transcription of visible names and instructions, image readability, qualitative per-field visual confidence, exact visual evidence snippets, and uncertain fields. Confidence is not a calibrated probability or a medicine-identity verification. Unreadable content must remain null; the model must not infer generics, dosages, schedule, price, or alternatives. If the OCR-only Azure Computer Vision fallback is used, raw OCR text is returned separately and medicine fields remain unfilled for manual review. The original scan is shown beside the extracted text, including in saved Reports. Its authenticated image endpoint is owner-scoped and marked private/no-store.

Patients can edit OCR fields after comparing them with the source image, then save the transcription correction to their own encrypted record. This only records that the text was checked against the image; it does not approve the prescription or a medical decision. Price comparisons are withheld until the user confirms this image check, then recomputed from the corrected transcription.

The Prisma schema now targets Azure Database for PostgreSQL. The upload routes encrypt both the image and transcription with AES-256-GCM before writing them to the `MedicalDocument` table. Configure `MEDICAL_DOCUMENT_ENCRYPTION_KEY` as a stable 32-byte key (64 hexadecimal characters or base64 for 32 bytes) in the deployment secret manager. Back up the key securely; records cannot be decrypted if it is lost or changed. Do not place the production key in source control. Prescription OCR text is redacted from persisted browser chat history and excluded from subsequent chat AI requests; use the encrypted saved record for later review.

The PostgreSQL migration covers the current Prisma models only. Supabase Auth and many existing profile, booking, and emergency-data queries are still active. Do not disable or delete the Supabase project until those callers and required data have been migrated and verified separately.

Apply the database change with `npx prisma migrate deploy` from `Frontend` after setting `DATABASE_URL`, then generate the client with `npx prisma generate`. `GET /api/medical-documents` lists the signed-in user's last 50 saved analyses; `GET /api/medical-documents?image=...` returns the encrypted-at-rest original only to its owner with private/no-store headers. `PATCH /api/medical-documents` saves user-confirmed OCR text corrections to an owned prescription only. `DELETE /api/medical-documents?id=...` deletes a record owned by that account.

## Price catalog behavior

Medicine price cards identify the catalog source and its `generated_at` snapshot timestamp. Snapshots older than 30 days are marked stale. The bundled MedEx Bangladesh dataset is a snapshot, not a live price feed; update the dataset through a separately reviewed catalog refresh process.

Prescription price comparisons use only exact normalized generic name, strength, dosage form, and package-size matches. The system does not infer unclear fields or present a match when a required field is missing. Prices retain their source basis (per unit or per package); a price difference is shown only when both brands use the same basis.
