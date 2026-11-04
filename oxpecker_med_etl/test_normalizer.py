"""
Unit Tests for Oxpecker AI Medicine Normalizer (`normalizer.py`).
Verifies canonical generic normalization, BDT price regex extraction,
SHA-256 deduplication hashing, and zero-hallucination guarantees.
"""
from decimal import Decimal
from oxpecker_med_etl.normalizer import (
    compute_composite_key,
    compute_dedup_hash,
    extract_bdt_prices,
    extract_pregnancy_category,
    normalize_base_generic_key,
    normalize_dosage_form_icon,
    normalize_generic_key,
    sanitize_text,
)


def test_canonical_generic_normalization():
    # Exact prompt specification example
    assert normalize_generic_key("Paracetamol 500mg + Caffeine 65mg") == "caffeine + paracetamol"
    # Reversed order produces identical canonical key
    assert normalize_generic_key("Caffeine 65 mg + Paracetamol 500 mg BP") == "caffeine + paracetamol"
    # Slash and USP/BP stripping
    assert normalize_generic_key("Amoxicillin 125mg/5ml USP + Clavulanic Acid 31.25mg") == "amoxicillin + clavulanic acid"
    # "and" separator
    assert normalize_generic_key(" Calcium Carbonate 500mg and Vitamin D3 200 IU ") == "calcium carbonate + vitamin d3"
    # Base salt fallback
    assert normalize_base_generic_key("Cefixime Trihydrate 200mg") == "cefixime"
    assert normalize_base_generic_key("Sitagliptin Phosphate + Metformin Hydrochloride") == "metformin + sitagliptin"


def test_bdt_price_extraction():
    # Prompt specification string
    u, s = extract_bdt_prices("Unit Price: ৳ 10.00 (5 x 10: ৳ 500.00) Strip Price: ৳ 100.00")
    assert u == Decimal("10.00")
    assert s == Decimal("100.00")

    # Comma-formatted thousands in MedEx
    u2, s2 = extract_bdt_prices("Unit Price: ৳ 1,665.82,(120's pack: ৳ 199,898.40),")
    assert u2 == Decimal("1665.82")
    assert s2 == Decimal("199898.40")

    # Strip price format in MedEx
    u2b, s2b = extract_bdt_prices("4 tablet strip: ৳ 55.00,(14's pack: ৳ 770.00),")
    assert s2b == Decimal("55.00")

    # Syrup / bottle fallback price
    u3, s3 = extract_bdt_prices("100 ml bottle: ৳ 65.50")
    assert u3 == Decimal("65.50")
    assert s3 is None

    # Missing price returns (None, None) - ZERO hallucination
    u4, s4 = extract_bdt_prices("Price not available")
    assert u4 is None
    assert s4 is None
    assert extract_bdt_prices(None) == (None, None)


def test_dedup_hash_and_composite_key():
    h1 = compute_dedup_hash("Napa", "Tablet", "500 mg", "Beximco Pharmaceuticals Ltd.")
    h2 = compute_dedup_hash(" napa ", "TABLET", "500mg", "Beximco Pharmaceuticals Ltd.")
    assert len(h1) == 64
    assert h1 == h2

    # Different strength must yield different hash
    h3 = compute_dedup_hash("Napa", "Tablet", "665 mg", "Beximco Pharmaceuticals Ltd.")
    assert h1 != h3

    ck = compute_composite_key(" Napa ", " Tablet ", " 500 mg ", " Beximco ")
    assert ck == "napa|tablet|500 mg|beximco"


def test_sanitize_and_icons_and_pregnancy():
    assert sanitize_text("<b>Paracetamol &amp; Caffeine</b>\x00  ") == "Paracetamol & Caffeine"
    assert sanitize_text("   ") is None
    assert sanitize_text("NaN") is None

    assert normalize_dosage_form_icon("Tablet (Film Coated)") == "tablet"
    assert normalize_dosage_form_icon("Capsule (Delayed Release)") == "capsule"
    assert normalize_dosage_form_icon("Powder for Suspension") == "syrup"
    assert normalize_dosage_form_icon("IV Injection") == "injection"
    assert normalize_dosage_form_icon("Metered Dose Inhaler") == "inhaler"
    assert normalize_dosage_form_icon("Ophthalmic Eye Drops") == "drop"
    assert normalize_dosage_form_icon("Topical Ointment") == "ointment"

    assert extract_pregnancy_category("B", None) == "B"
    assert extract_pregnancy_category(None, "US FDA Pregnancy Category C. Use with caution.") == "C"
    assert extract_pregnancy_category(None, "No category assigned by manufacturer.") is None


if __name__ == "__main__":
    test_canonical_generic_normalization()
    test_bdt_price_extraction()
    test_dedup_hash_and_composite_key()
    test_sanitize_and_icons_and_pregnancy()
    print("ALL NORMALIZER UNIT TESTS PASSED (4/4 SUITES)")
