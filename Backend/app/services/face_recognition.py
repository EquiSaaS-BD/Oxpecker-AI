"""
Oxpecker AI - Facial Recognition & Biometric Vector Matching Engine
Provides high-performance vector mathematics (cosine similarity, normalization,
distance metrics) for emergency patient identification in trauma and ER situations.
"""
from __future__ import annotations

import base64
import hashlib
import math
from typing import Any, List, Optional, Tuple


def calculate_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Calculate the cosine similarity between two N-dimensional facial embedding vectors.
    Formula: (A · B) / (||A|| * ||B||)
    Returns a score between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized facial features).
    """
    if not vec_a or not vec_b:
        return 0.0
    
    # Handle dimension mismatch safely
    min_len = min(len(vec_a), len(vec_b))
    if min_len == 0:
        return 0.0

    dot_product = sum(vec_a[i] * vec_b[i] for i in range(min_len))
    norm_a = math.sqrt(sum(vec_a[i] ** 2 for i in range(min_len)))
    norm_b = math.sqrt(sum(vec_b[i] ** 2 for i in range(min_len)))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    similarity = dot_product / (norm_a * norm_b)
    # Clamp to [-1.0, 1.0] to prevent floating point overshoot
    return max(-1.0, min(1.0, float(similarity)))


def calculate_euclidean_distance(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Calculate Euclidean L2 distance between two facial vectors.
    Lower distance indicates closer facial likeness.
    """
    if not vec_a or not vec_b:
        return float("inf")
    
    min_len = min(len(vec_a), len(vec_b))
    if min_len == 0:
        return float("inf")

    dist_sq = sum((vec_a[i] - vec_b[i]) ** 2 for i in range(min_len))
    return math.sqrt(dist_sq)


def normalize_vector(vec: List[float]) -> List[float]:
    """Normalize vector to unit length (L2 norm = 1.0)."""
    norm = math.sqrt(sum(x ** 2 for x in vec))
    if norm == 0.0:
        return vec
    return [x / norm for x in vec]


def extract_features_from_base64_fallback(photo_base64: str, dimensions: int = 128) -> List[float]:
    """
    Safe fallback facial vector generator from image data when hardware GPU
    dlib/OpenCV models are not preloaded. Uses cryptographic deterministic hashing
    to generate reproducible unit vectors for simulation and testing.
    """
    cleaned = photo_base64.split(",")[-1] if "," in photo_base64 else photo_base64
    raw_bytes = base64.b64decode(cleaned.encode("utf-8", errors="ignore"))
    
    # Generate deterministic pseudo-vector across requested dimensions
    features: List[float] = []
    chunk_size = max(1, len(raw_bytes) // dimensions)
    
    for i in range(dimensions):
        sub_chunk = raw_bytes[i * chunk_size : (i + 1) * chunk_size] or raw_bytes
        h = hashlib.sha256(sub_chunk + f"pos_{i}".encode()).digest()
        # Convert first 4 bytes to signed float normalized between -1.0 and 1.0
        val = int.from_bytes(h[:4], byteorder="big", signed=True) / (2 ** 31)
        features.append(val)
        
    return normalize_vector(features)


class FaceMatchEngine:
    """High-level face recognition comparator and ranking engine."""

    MATCH_THRESHOLD_HIGH = 0.82
    MATCH_THRESHOLD_MODERATE = 0.70

    @classmethod
    def compare_vectors(
        cls,
        query_vector: List[float],
        target_vector: List[float],
    ) -> Tuple[float, float, bool]:
        """
        Returns (similarity_score, confidence_percentage, is_high_confidence).
        """
        sim = calculate_cosine_similarity(query_vector, target_vector)
        # Convert similarity to 0-100 percentage
        confidence = max(0.0, min(100.0, round(sim * 100, 2)))
        is_high = sim >= cls.MATCH_THRESHOLD_HIGH
        return round(sim, 4), confidence, is_high

    @classmethod
    def rank_candidates(
        cls,
        query_vector: List[float],
        database_biometrics: List[dict[str, Any]],
        threshold: float = 0.70,
        max_results: int = 5,
    ) -> List[dict[str, Any]]:
        """
        Ranks database biometric entries by facial similarity to query vector.
        `database_biometrics` entries should contain:
        {'patient_id': ..., 'face_vector': [...], 'card': ...}
        """
        results = []

        for record in database_biometrics:
            stored_vector = record.get("face_vector")
            if not stored_vector or not isinstance(stored_vector, list):
                continue

            sim, confidence, is_high = cls.compare_vectors(query_vector, stored_vector)
            if sim >= threshold:
                results.append({
                    "patient_id": record.get("patient_id"),
                    "similarity_score": sim,
                    "confidence_percentage": confidence,
                    "is_high_confidence": is_high,
                    "card": record.get("card"),
                })

        # Sort descending by similarity score
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:max_results]
