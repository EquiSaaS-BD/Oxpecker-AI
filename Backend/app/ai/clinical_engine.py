from __future__ import annotations
import os
import json
import re
from typing import Dict, Any, List, Optional
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"
MODELS_DIR = Path(__file__).resolve().parent / "models"
DEFAULT_MODEL_PATH = MODELS_DIR / "oxpecker_qwen_350mb.gguf"

# Bilingual Clinical Symptoms Mapping (Bangla <-> Clinical Symptom Tokens)
SYMPTOM_MAP = {
    "জ্বর": "high_fever",
    "তীব্র জ্বর": "high_fever",
    "fever": "high_fever",
    "মাথা ব্যথা": "severe_headache",
    "মাথাব্যথা": "severe_headache",
    "headache": "severe_headache",
    "চোখের পেছনে ব্যথা": "retro_orbital_pain",
    "চোখে ব্যথা": "retro_orbital_pain",
    "retro-orbital": "retro_orbital_pain",
    "জয়েন্টে ব্যথা": "severe_joint_pain_arthralgia",
    "জয়েন্টে ব্যথা": "severe_joint_pain_arthralgia",
    "গাঁটে ব্যথা": "severe_joint_pain_arthralgia",
    "joint pain": "severe_joint_pain_arthralgia",
    "বমি": "vomiting",
    "বমি বমি ভাব": "nausea",
    "vomiting": "vomiting",
    "nausea": "nausea",
    "র‌্যাশ": "skin_rash_maculopapular",
    "র‍্যাশ": "skin_rash_maculopapular",
    "চামড়ায় লাল দাগ": "petechiae_bleeding_spots",
    "রক্তক্ষরণ": "bleeding",
    "কাশি": "cough",
    "শুকনো কাশি": "dry_cough",
    "cough": "cough",
    "শ্বাসকষ্ট": "shortness_of_breath",
    "দম বন্ধ": "shortness_of_breath",
    "chest pain": "chest_pain",
    "বুকে ব্যথা": "chest_pain",
    "পেটে ব্যথা": "abdominal_pain",
    "ডায়রিয়া": "diarrhea",
    "পাতলা পায়খানা": "watery_diarrhea",
    "পাতলা পায়খানা": "watery_diarrhea",
    "দুর্বলতা": "fatigue",
    "ক্লান্তি": "fatigue",
    "গলা ব্যথা": "sore_throat",
}

class ClinicalAIEngine:
    """
    Oxpecker AI Clinical Inference Engine
    Fine-tuned on 150 Diseases in Bangladesh according to WHO & DGHS Protocols.
    """

    def __init__(self):
        self.llama_model = None
        self.diseases_data: List[Dict[str, Any]] = []
        self.unique_diseases: Dict[str, Dict[str, Any]] = {}
        self.otc_medicines: Dict[str, Any] = {}
        self.model_loaded = False
        self._load_datasets()
        self._try_load_gguf()

    def _load_datasets(self):
        json_path = DATA_DIR / "oxpecker_150_diseases_verified_dataset.json"
        if json_path.exists():
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    self.diseases_data = json.load(f)
                    for item in self.diseases_data:
                        d_name = item.get("disease_name", "")
                        if d_name and d_name not in self.unique_diseases:
                            self.unique_diseases[d_name] = item
            except Exception as e:
                print(f"[ClinicalAI] Warning loading diseases dataset: {e}")

        otc_path = DATA_DIR / "oxpecker_otc_first_aid_medicines.json"
        if otc_path.exists():
            try:
                with open(otc_path, "r", encoding="utf-8") as f:
                    self.otc_medicines = json.load(f)
            except Exception as e:
                print(f"[ClinicalAI] Warning loading OTC dataset: {e}")

    def _try_load_gguf(self):
        model_path = os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH))
        if os.path.exists(model_path):
            try:
                from llama_cpp import Llama
                self.llama_model = Llama(
                    model_path=model_path,
                    n_ctx=1024,
                    n_threads=2,
                    verbose=False,
                )
                self.model_loaded = True
                print(f"[ClinicalAI] Successfully loaded GGUF clinical model from {model_path}")
            except Exception as e:
                print(f"[ClinicalAI] GGUF model load fallback ({e}). Using DGHS 150-disease clinical matcher.")
        else:
            print(f"[ClinicalAI] GGUF model not in {model_path}. Using DGHS 150-disease clinical matcher.")

    def get_supported_diseases(self) -> List[Dict[str, str]]:
        return [
            {
                "id": str(idx + 1),
                "name": d.get("disease_name", ""),
                "bengali_name": d.get("bengali_name", ""),
                "category": d.get("category", ""),
                "triage_level": d.get("triage_level", "ROUTINE")
            }
            for idx, d in enumerate(self.unique_diseases.values())
        ]

    def diagnose(self, symptoms_query: str, age: Optional[int] = None, vitals: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        # Neural inference if GGUF is mounted
        if self.model_loaded and self.llama_model:
            try:
                prompt = (
                    "Below is an instruction that describes a task, paired with an input that provides further context. "
                    "Write a response that appropriately completes the request.\n\n"
                    "### Instruction:\n"
                    "Evaluate the reported patient symptoms, identify the most probable disease, assess triage urgency, and provide clinical guidelines.\n\n"
                    f"### Input:\nReported Symptoms: {symptoms_query}\n\n"
                    "### Response:\n"
                )
                output = self.llama_model(prompt, max_tokens=300, stop=["<|endoftext|>", "###"], echo=False)
                return self._parse_neural_output(output["choices"][0]["text"].strip(), symptoms_query)
            except Exception as e:
                print(f"[ClinicalAI] Neural error: {e}")

        # Deterministic DGHS 150 Disease Matcher
        return self._rule_based_diagnosis(symptoms_query)

    def _rule_based_diagnosis(self, query: str) -> Dict[str, Any]:
        query_norm = query.lower()
        extracted_tokens = set()

        for bn_key, token in SYMPTOM_MAP.items():
            if bn_key in query_norm:
                extracted_tokens.add(token)

        words = set(re.findall(r'[\w]+', query_norm))
        for w in words:
            if w in SYMPTOM_MAP:
                extracted_tokens.add(SYMPTOM_MAP[w])

        best_match = None
        highest_score = 0
        matched_symptoms_list = []

        for disease_name, entry in self.unique_diseases.items():
            score = 0
            curr_matched = []

            # Check direct name mentions
            if disease_name.lower() in query_norm or entry.get("bengali_name", "") in query:
                score += 60
                curr_matched.append("Direct disease mention")

            # Check symptom overlaps
            d_symptoms = [s.strip().lower() for s in entry.get("active_symptoms_summary", "").split(";")]
            for token in extracted_tokens:
                for ds in d_symptoms:
                    if token in ds or ds in token:
                        score += 20
                        curr_matched.append(ds)

            # Check raw word overlap
            for w in words:
                if len(w) >= 4 and any(w in ds for ds in d_symptoms):
                    score += 5

            if score > highest_score:
                highest_score = score
                best_match = entry
                matched_symptoms_list = list(set(curr_matched))

        if best_match and highest_score >= 20:
            triage = best_match.get("triage_level", "Moderate")
            triage_std = "EMERGENCY" if "emergency" in triage.lower() or "severe" in triage.lower() else ("URGENT" if "mod" in triage.lower() or "urgent" in triage.lower() else "ROUTINE")

            return {
                "engine": "Oxpecker-Clinical-DGHS-150",
                "condition": f"{best_match.get('disease_name')} ({best_match.get('bengali_name')})",
                "category": best_match.get("category", "General Clinical"),
                "triage_urgency": triage_std,
                "confidence_score": min(round(highest_score / 80.0, 2), 0.98),
                "clinical_protocol": best_match.get("clinical_reference", "WHO & DGHS Bangladesh Clinical Guidelines"),
                "primary_symptoms_matched": matched_symptoms_list if matched_symptoms_list else [query],
                "advice": self._get_triage_advice(triage_std, best_match.get("disease_name")),
                "red_flags": [
                    "শ্বাসে কষ্ট বা অতিরিক্ত দ্রুত শ্বাস",
                    "তীব্র ও অবিরাম পেটে ব্যথা বা বমি",
                    "চামড়ার নিচে রক্তক্ষরণ বা কালশিটে দাগ",
                    "বিভ্রান্তি, চরম দুর্বলতা বা অজ্ঞান হয়ে পড়া"
                ] if triage_std in ["EMERGENCY", "URGENT"] else ["লক্ষণ ৪ দিনের বেশি স্থায়ী হলে চিকিৎসকের পরামর্শ নিন"]
            }

        return {
            "engine": "Oxpecker-Clinical-DGHS-150",
            "condition": "General Symptoms Assessment (সাধারণ লক্ষণ মূল্যায়ন)",
            "category": "Primary Care / Triage Assessment",
            "triage_urgency": "ROUTINE",
            "confidence_score": 0.50,
            "clinical_protocol": "DGHS Bangladesh Primary Healthcare Standard",
            "primary_symptoms_matched": [query],
            "advice": "লক্ষণগুলো পরিষ্কারভাবে মূল্যায়নের জন্য নিকটস্থ নিবন্ধিত চিকিৎসকের পরামর্শ নিন। প্রচুর তরল খাবার গ্রহণ করুন ও পর্যাপ্ত বিশ্রাম নিন।",
            "red_flags": ["উচ্চ জ্বর", "শ্বাসকষ্ট", "তীব্র রক্তক্ষরণ"]
        }

    def _parse_neural_output(self, text: str, query: str) -> Dict[str, Any]:
        res = {
            "engine": "Oxpecker-Qwen-2.5-0.5B-GGUF",
            "raw_output": text,
            "query": query,
            "triage_urgency": "ROUTINE",
            "condition": "Clinical Assessment",
            "clinical_protocol": "DGHS Bangladesh Guidelines"
        }
        for line in text.split("\n"):
            line = line.strip()
            if line.startswith("Probable Condition:"):
                res["condition"] = line.replace("Probable Condition:", "").strip()
            elif line.startswith("Diagnostic Category:"):
                res["category"] = line.replace("Diagnostic Category:", "").strip()
            elif line.startswith("Triage Urgency:"):
                res["triage_urgency"] = line.replace("Triage Urgency:", "").strip()
            elif line.startswith("Clinical Protocol:"):
                res["clinical_protocol"] = line.replace("Clinical Protocol:", "").strip()
        return res

    def _get_triage_advice(self, triage: str, disease: str) -> str:
        if triage == "EMERGENCY":
            return f"⚠️ জরুরী সতর্কতা: {disease}-এর লক্ষণসমূহ আশঙ্কাজনক। অবিলম্বে নিকটস্থ জরুরি বিভাগ (Emergency Ward) অথবা মেডিকেল কলেজ হাসপাতালে রোগীকে নিয়ে যান।"
        elif triage == "URGENT":
            return f"🔔 দ্রুত পরামর্শ: এটি {disease}-এর প্রাথমিক পর্যায় নির্দেশ করতে পারে। ২৪ ঘণ্টার মধ্যে একজন বিশেষজ্ঞ ডাক্তার বা স্বাস্থ্য কমপ্লেক্সে চিকিৎসা পরামর্শ নিন এবং প্রচুর তরল খাবার গ্রহণ করুন।"
        elif triage == "HOME_CARE":
            return f"💧 প্রাথমিক যত্ন: প্রচুর খাবার স্যালাইন ও তরল পান করুন, পর্যাপ্ত বিশ্রাম নিন এবং তাপমাত্রা পর্যবেক্ষণ করুন।"
        return f"নিয়মিত চিকিৎসকের পরামর্শ অনুযায়ী {disease}-এর টেস্ট ও ওষুধ গ্রহণ করুন।"

clinical_engine = ClinicalAIEngine()
