"""
Unit tests for the Clinical AI Engine (150 diseases, 9,600 verified cases, DGHS protocols).
"""
from app.ai.clinical_engine import clinical_engine, SYMPTOM_MAP


def test_dataset_loaded():
    """Ensure all 150 diseases are loaded into memory."""
    assert len(clinical_engine.unique_diseases) == 150, (
        f"Expected 150 diseases, got {len(clinical_engine.unique_diseases)}"
    )
    supported = clinical_engine.get_supported_diseases()
    assert len(supported) == 150


def test_symptom_mapping_bengali():
    """Test Bengali symptom mapping."""
    query = "আমার প্রচণ্ড জ্বর এবং মাথা ব্যথা ও কাশি হচ্ছে"
    matched_tokens = [token for k, token in SYMPTOM_MAP.items() if k in query]
    assert len(matched_tokens) >= 2
    assert "high_fever" in matched_tokens
    assert "severe_headache" in matched_tokens or "cough" in matched_tokens


def test_symptom_mapping_english():
    """Test English symptom mapping."""
    query = "Patient has high fever, vomiting and joint pain"
    matched_tokens = [token for k, token in SYMPTOM_MAP.items() if k in query.lower()]
    assert "high_fever" in matched_tokens
    assert "vomiting" in matched_tokens


def test_rule_based_diagnosis():
    """Test diagnosis with dengue-like symptoms."""
    diag = clinical_engine.diagnose("তীব্র জ্বর, মাথা ব্যথা, চোখের পেছনে ব্যথা এবং জয়েন্টে ব্যথা")
    assert diag is not None
    assert diag["confidence_score"] >= 0.5
    assert "Dengue" in diag["condition"] or "জরুরী" in diag.get("advice", "") or "পরামর্শ" in diag.get("advice", "")
    assert diag["engine"] == "Oxpecker-Clinical-DGHS-150"
    assert "red_flags" in diag


def test_category_grounding():
    """Test diagnosis with category scoping."""
    # Test symptom category
    diag_sym = clinical_engine.diagnose("বমি ভাব ও পাতলা পায়খানা", category="symptoms")
    assert diag_sym is not None
    assert diag_sym["confidence_score"] >= 0.4

    # Test medicine category
    diag_med = clinical_engine.diagnose("প্যারাসিটামল সেবনবিধি", category="medicines")
    assert diag_med is not None
    assert "Medicines" in diag_med["category"]

    # Test prescription category
    diag_rx = clinical_engine.diagnose("প্রেসক্রিপশনের অ্যান্টিবায়োটিক ডোজ", category="prescriptions")
    assert diag_rx is not None
    assert "Prescription" in diag_rx["category"]

    # Test nutrition category
    diag_nut = clinical_engine.diagnose("ডায়াবেটিসের পুষ্টিকর খাবার", category="nutrition")
    assert diag_nut is not None
    assert "Nutrition" in diag_nut["category"]

    # Test hospitals category
    diag_hosp = clinical_engine.diagnose("নিকটস্থ আইসিইউ হাসপাতাল", category="hospitals")
    assert diag_hosp is not None
    assert "Hospital" in diag_hosp["category"] or "Facilities" in diag_hosp["category"]


def test_9600_cases_dataset():
    """Verify that all 9,600 verified patient cases are loaded and aggregate symptoms mapped."""
    assert len(clinical_engine.diseases_data) == 9600
    assert len(clinical_engine.disease_symptoms_aggregate) == 150
    # Every disease should have aggregated symptom tokens from its verified cases
    for disease_name, tokens in clinical_engine.disease_symptoms_aggregate.items():
        assert len(tokens) > 0, f"Disease {disease_name} has no symptom tokens"


def test_empty_symptoms_fallback():
    """Test diagnosis when no symptoms are provided."""
    diag = clinical_engine.diagnose("")
    assert diag is not None
    assert diag["condition"].startswith("General Symptoms Assessment")
    assert diag["triage_urgency"] == "ROUTINE"

    # With category fallback
    diag_cat = clinical_engine.diagnose("", category="hospitals")
    assert "Healthcare Facilities" in diag_cat["category"]


if __name__ == "__main__":
    test_dataset_loaded()
    test_9600_cases_dataset()
    test_symptom_mapping_bengali()
    test_symptom_mapping_english()
    test_rule_based_diagnosis()
    test_category_grounding()
    test_empty_symptoms_fallback()
    print("ALL CLINICAL AI ENGINE UNIT TESTS PASSED SUCCESSFULLY!")
