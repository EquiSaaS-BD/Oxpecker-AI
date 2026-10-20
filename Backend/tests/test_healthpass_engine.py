"""
Unit tests for HealthPass Biometric AI Matching Engine and Schemas.
"""
from __future__ import annotations

import math
import uuid
from datetime import datetime

from app.schemas.healthpass import (
    BreakGlassRequest,
    FaceMatchRequest,
    HealthPassResponse,
    HealthPassSearchItem,
    HealthPassUpdateRequest,
)
from app.services.face_recognition import (
    FaceMatchEngine,
    calculate_cosine_similarity,
    calculate_euclidean_distance,
    extract_features_from_base64_fallback,
    normalize_vector,
)


def test_cosine_similarity():
    """Test standard and edge case vector cosine calculations."""
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    assert math.isclose(calculate_cosine_similarity(v1, v2), 1.0, rel_tol=1e-5)

    v3 = [0.0, 1.0, 0.0]
    assert math.isclose(calculate_cosine_similarity(v1, v3), 0.0, rel_tol=1e-5)

    v4 = [-1.0, 0.0, 0.0]
    assert math.isclose(calculate_cosine_similarity(v1, v4), -1.0, rel_tol=1e-5)

    # Empty vectors
    assert calculate_cosine_similarity([], []) == 0.0


def test_vector_normalization():
    """Test that vectors normalize to unit length."""
    raw = [3.0, 4.0]
    norm = normalize_vector(raw)
    length = math.sqrt(sum(x ** 2 for x in norm))
    assert math.isclose(length, 1.0, rel_tol=1e-5)


def test_face_match_engine():
    """Test candidate ranking and thresholding."""
    query = normalize_vector([0.9, 0.1, 0.05, 0.3])
    match_high = normalize_vector([0.89, 0.11, 0.04, 0.31])  # Very close
    match_low = normalize_vector([0.1, 0.8, 0.6, 0.1])      # Different

    dataset = [
        {"patient_id": "p1", "face_vector": match_high, "card": {"card_number": "HP-2026-00001"}},
        {"patient_id": "p2", "face_vector": match_low, "card": {"card_number": "HP-2026-00002"}},
    ]

    ranked = FaceMatchEngine.rank_candidates(query, dataset, threshold=0.75)
    assert len(ranked) == 1
    assert ranked[0]["patient_id"] == "p1"
    assert ranked[0]["is_high_confidence"] is True
    assert ranked[0]["confidence_percentage"] > 95.0


def test_fallback_feature_extraction():
    """Test reproducible deterministic embedding generation from base64 string."""
    fake_img_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    feat = extract_features_from_base64_fallback(fake_img_b64, dimensions=128)
    assert len(feat) == 128
    length = math.sqrt(sum(x ** 2 for x in feat))
    assert math.isclose(length, 1.0, rel_tol=1e-5)


def test_pydantic_schemas():
    """Test Pydantic schema validation."""
    bg_req = BreakGlassRequest(
        reason="Severe unconscious polytrauma in ER Ward 4",
        hospital_name="Dhaka Medical College Hospital",
        doctor_license="BMDC-74921",
    )
    assert bg_req.reason.startswith("Severe")

    hp_update = HealthPassUpdateRequest(
        personal_phone="+8801712345678",
        parent_phone="+8801812345678",
        has_personal_whatsapp=True,
        has_parent_whatsapp=True,
        blood_group="B+",
        allergies=["Penicillin", "Dust"],
        organ_donor=True,
    )
    assert hp_update.blood_group == "B+"
    assert hp_update.has_parent_whatsapp is True


if __name__ == "__main__":
    test_cosine_similarity()
    test_vector_normalization()
    test_face_match_engine()
    test_fallback_feature_extraction()
    test_pydantic_schemas()
    print("ALL HEALTHPASS ENGINE UNIT TESTS PASSED SUCCESSFULLY!")
