"""
Zero-Hallucination Normalization, BDT Price Extraction, Text Sanitization,
and SHA-256 Deduplication Utilities for Oxpecker AI Medicine ETL.
"""
from __future__ import annotations

import hashlib
import html
import re
import unicodedata
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Optional, Tuple

# Regex patterns compiled once for high-throughput chunk processing
HTML_TAG_RE = re.compile(r"<[^>]+>")
CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
WHITESPACE_RE = re.compile(r"[ \t]+")
MULTI_NEWLINE_RE = re.compile(r"\n{3,}")

# Dosage ratio and unit patterns for canonical generic normalization
DOSAGE_RATIO_RE = re.compile(
    r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|kg|ml|l|iu|%|mEq|mmol|unit|units)"
    r"(?:\s*/\s*\d*(?:\.\d+)?\s*(?:mg|mcg|g|kg|ml|l|iu|%|dose|vial|ampoule|drop|actuation|puff))?\b",
    re.IGNORECASE,
)
DOSAGE_UNIT_RE = re.compile(
    r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|%)\b",
    re.IGNORECASE,
)
PHARMACOPEIA_RE = re.compile(r"\b(?:bp|usp|ip|ph\.?\s*eur|b\.p\.|u\.s\.p\.)\b", re.IGNORECASE)
BRACKET_NOISE_RE = re.compile(r"\[[^\]]*\]|\(\s*\d+[^)]*\)")
INGREDIENT_SPLIT_RE = re.compile(r"\s*(?:\+|/|\band\b|&|,)\s*", re.IGNORECASE)
NON_ALNUM_GENERIC_RE = re.compile(r"[^a-z0-9\s\-]")

# Secondary salt suffix stripper for cross-dataset clinical lookup only
SALT_SUFFIX_RE = re.compile(
    r"\b(?:hydrochloride|hcl|trihydrate|dihydrate|monohydrate|hemihydrate|anhydrous|"
    r"sodium|potassium|calcium|magnesium|maleate|citrate|sulfate|sulphate|"
    r"besylate|besilate|mesylate|mesilate|acetate|fumarate|tartrate|succinate|"
    r"phosphate|nitrate|bromide|chloride|iodide|propionate|valerate|butyrate|"
    r"dipropionate|furoate|palmitate|stearate|gluconate|lactate|benzoate|"
    r"salicylate|oxalate|carbonate|bicarbonate|hydrate|micronized|clavulanate)\b",
    re.IGNORECASE,
)

# BDT Price extraction regexes matching Section 4.2
UNIT_PRICE_RE = re.compile(
    r"(?:Unit\s*Price|Each|Per\s*piece)[^৳\d]*৳?\s*([0-9,]+(?:\.[0-9]{1,2})?)",
    re.IGNORECASE,
)
STRIP_PRICE_RE = re.compile(
    r"(?:Strip\s*Price|\bstrip\s*:|\bpack\s*:)[^৳\d]*৳?\s*([0-9,]+(?:\.[0-9]{1,2})?)",
    re.IGNORECASE,
)
FALLBACK_TAKA_RE = re.compile(r"৳\s*([0-9,]+(?:\.[0-9]{1,2})?)")

DEDUP_CLEAN_RE = re.compile(r"[^a-z0-9+.]")
SLUG_CLEAN_RE = re.compile(r"[^a-z0-9]+")

PREGNANCY_CAT_EXTRACT_RE = re.compile(
    r"(?:pregnancy\s+category|category|fda\s+category)\s*[:\-]?\s*\b([ABCDXN])\b",
    re.IGNORECASE,
)
VALID_PREGNANCY_CATS = {"A", "B", "C", "D", "X", "N"}


def sanitize_text(val: object) -> Optional[str]:
    """
    Clean raw string input: enforce UTF-8, strip HTML tags and entities,
    remove control characters, and normalize whitespace. Returns None if empty/NA.
    """
    if val is None:
        return None
    if isinstance(val, float):
        # Handle pandas float NaN
        if val != val:
            return None
    text = str(val).strip()
    if not text or text.lower() in {"nan", "none", "null", "n/a", "na", "-"}:
        return None

    text = html.unescape(text)
    text = HTML_TAG_RE.sub(" ", text)
    text = unicodedata.normalize("NFKC", text)
    text = CONTROL_CHARS_RE.sub("", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = WHITESPACE_RE.sub(" ", text)
    text = MULTI_NEWLINE_RE.sub("\n\n", text)
    text = "\n".join(line.strip() for line in text.split("\n")).strip()
    return text if text else None


def normalize_generic_key(text: object) -> str:
    """
    Section 4.1 Canonical Generic Normalization:
    - Convert to lowercase.
    - Remove dosage units and weights (e.g., 500mg, 10mg/5ml, bp, usp, ip)
      using regex `\\b\\d+(\\.\\d+)?\\s*(mg|mcg|g|ml|iu|%)\\b`.
    - Split multi-ingredient salts by `+`, `/`, or `and`, strip whitespace
      from each ingredient, sort alphabetically, and rejoin with ` + `.
    - Example: "Paracetamol 500mg + Caffeine 65mg" -> "caffeine + paracetamol".
    """
    cleaned = sanitize_text(text)
    if not cleaned:
        return ""

    s = cleaned.lower()
    # Remove bracketed concentration numbers like (500 mg) before splitting
    s = BRACKET_NOISE_RE.sub(" ", s)
    # Remove compound dosage ratios like 10mg/5ml first so '/' isn't treated as salt separator
    s = DOSAGE_RATIO_RE.sub(" ", s)
    # Remove standard dosage units per specification regex
    s = DOSAGE_UNIT_RE.sub(" ", s)
    # Remove pharmacopeia standards
    s = PHARMACOPEIA_RE.sub(" ", s)
    # Replace parentheses with spaces
    s = s.replace("(", " ").replace(")", " ")

    raw_parts = INGREDIENT_SPLIT_RE.split(s)
    ingredients = []
    for part in raw_parts:
        p = NON_ALNUM_GENERIC_RE.sub(" ", part)
        p = re.sub(r"\b\d+(?:\.\d+)?\b", " ", p)
        p = WHITESPACE_RE.sub(" ", p).strip(" -")
        if p and len(p) > 1:
            ingredients.append(p)

    if not ingredients:
        fallback = WHITESPACE_RE.sub(" ", NON_ALNUM_GENERIC_RE.sub(" ", s)).strip()
        return fallback

    unique_sorted = sorted(set(ingredients))
    return " + ".join(unique_sorted)


def normalize_base_generic_key(text: object) -> str:
    """
    Secondary canonical salt-free key for matching local generics (e.g. 'Cefixime Trihydrate')
    with international generics (e.g. 'Cefixime') when exact canonical_name has salt suffix differences.
    """
    canonical = normalize_generic_key(text)
    if not canonical:
        return ""
    parts = [p.strip() for p in canonical.split("+")]
    base_parts = []
    for p in parts:
        stripped = SALT_SUFFIX_RE.sub(" ", p)
        stripped = WHITESPACE_RE.sub(" ", stripped).strip(" -")
        base_parts.append(stripped if stripped else p)
    return " + ".join(sorted(set(base_parts)))


INN_BAN_SYNONYMS = {
    "amoxycillin": "amoxicillin",
    "acetaminophen": "paracetamol",
    "albuterol": "salbutamol",
    "sulphamethoxazole": "sulfamethoxazole",
    "co-trimoxazole": "sulfamethoxazole + trimethoprim",
    "aluminium": "aluminum",
    "frusemide": "furosemide",
    "lignocaine": "lidocaine",
    "chlorpheniramine": "chlorphenamine",
    "colecalciferol": "cholecalciferol",
    "dicycloverine": "dicyclomine",
    "epinephrine": "adrenaline",
    "norepinephrine": "noradrenaline",
    "glyburide": "glibenclamide",
    "meperidine": "pethidine",
    "cefalexin": "cephalexin",
    "cefradine": "cephradine",
    "vitamin b1": "thiamine",
    "vitamin b6": "pyridoxine",
    "vitamin b12": "cyanocobalamin",
    "vitamin c": "ascorbic acid",
    "vitamin d3": "cholecalciferol",
}


def normalize_lookup_generic_key(text: object) -> str:
    """
    Canonical cross-dataset pharmacological lookup key that resolves
    British/Indian (BAN) vs US (USAN/INN) spelling variations after base-salt normalization.
    """
    base = normalize_base_generic_key(text)
    if not base:
        return ""
    for src, dst in INN_BAN_SYNONYMS.items():
        base = re.sub(rf"\b{re.escape(src)}\b", dst, base)
    parts = [WHITESPACE_RE.sub(" ", p).strip(" -") for p in base.split("+")]
    parts = [p for p in parts if p]
    return " + ".join(sorted(set(parts)))


def _to_decimal_2dp(num_str: str) -> Optional[Decimal]:
    """Convert numeric string to Decimal(10, 2) > 0, or None if invalid."""
    try:
        clean_num = num_str.replace(",", "").strip()
        val = Decimal(clean_num).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if val > Decimal("0.00") and val < Decimal("10000000.00"):
            return val
    except (InvalidOperation, ValueError):
        pass
    return None


def extract_bdt_prices(package_str: object) -> Tuple[Optional[Decimal], Optional[Decimal]]:
    """
    Section 4.2 Bangladesh BDT Price Extraction:
    - Extract `unit_price_bdt` using regex:
      `(?:Unit Price|Each|Per piece)[^৳\\d]*৳?\\s*([0-9]+(?:\\.[0-9]{1,2})?)`
      (Fallback: first `৳\\s*([0-9]+(?:\\.[0-9]{1,2})?)`).
    - Extract `strip_price_bdt` using regex:
      `Strip Price[^৳\\d]*৳?\\s*([0-9]+(?:\\.[0-9]{1,2})?)`.
    - Convert extracted values to Decimal rounded to 2 decimal places. If no match, return (None, None).
    """
    cleaned = sanitize_text(package_str)
    if not cleaned:
        return None, None

    unit_price: Optional[Decimal] = None
    strip_price: Optional[Decimal] = None

    unit_match = UNIT_PRICE_RE.search(cleaned)
    if unit_match:
        unit_price = _to_decimal_2dp(unit_match.group(1))

    strip_match = STRIP_PRICE_RE.search(cleaned)
    if strip_match:
        strip_price = _to_decimal_2dp(strip_match.group(1))

    if unit_price is None:
        # Remove the Strip Price segment before running fallback so Strip Price isn't mistaken as Unit Price
        without_strip = STRIP_PRICE_RE.sub("", cleaned)
        fallback_match = FALLBACK_TAKA_RE.search(without_strip)
        if fallback_match:
            unit_price = _to_decimal_2dp(fallback_match.group(1))

    return unit_price, strip_price


def compute_dedup_hash(
    brand: object,
    form: object,
    strength: object,
    mfg: object,
) -> str:
    """
    Section 4.3 Deduplication Hash:
    - Normalize all 4 strings (lowercase, strip non-alphanumeric except `+` and `.`).
    - Concatenate as `f"{brand}|{form}|{strength}|{mfg}"`
      and return `hashlib.sha256(raw.encode('utf-8')).hexdigest()`.
    """
    b = DEDUP_CLEAN_RE.sub("", (sanitize_text(brand) or "").lower())
    f = DEDUP_CLEAN_RE.sub("", (sanitize_text(form) or "").lower())
    s = DEDUP_CLEAN_RE.sub("", (sanitize_text(strength) or "").lower())
    m = DEDUP_CLEAN_RE.sub("", (sanitize_text(mfg) or "").lower())
    raw = f"{b}|{f}|{s}|{m}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def compute_composite_key(
    brand: object,
    form: object,
    strength: object,
    mfg: object,
) -> str:
    """
    Section 1.2 Composite Key:
    LOWER(TRIM(brand_name)) + "|" + LOWER(TRIM(dosage_form)) + "|" + LOWER(TRIM(strength)) + "|" + LOWER(TRIM(manufacturer_name))
    """
    b = (sanitize_text(brand) or "").strip().lower()
    f = (sanitize_text(form) or "").strip().lower()
    s = (sanitize_text(strength) or "").strip().lower()
    m = (sanitize_text(mfg) or "").strip().lower()
    return f"{b}|{f}|{s}|{m}"


def normalize_dosage_form_icon(dosage_form: object) -> str:
    """
    Map dosage_form to normalized UI icon key:
    `tablet`, `capsule`, `syrup`, `injection`, `inhaler`, `ointment`, `drop`, `other`.
    """
    f = (sanitize_text(dosage_form) or "").lower()
    if "tablet" in f or "caplet" in f or "lozenge" in f:
        return "tablet"
    if "capsule" in f:
        return "capsule"
    if any(k in f for k in ("syrup", "suspension", "liquid", "solution", "elixir", "linctus", "emulsion", "mixture")):
        if "drop" in f:
            return "drop"
        if "injection" in f or "infusion" in f or "iv" in f:
            return "injection"
        return "syrup"
    if any(k in f for k in ("injection", "infusion", "iv", "im", "sc", "vial", "ampoule", "prefilled", "vaccine")):
        return "injection"
    if any(k in f for k in ("inhaler", "MDI", "dpi", "nebul", "rotacap", "cozycap", "spray", "aerosol")):
        return "inhaler"
    if any(k in f for k in ("ointment", "cream", "gel", "lotion", "paste", "topical", "rub", "powder", "shampoo", "soap")):
        return "ointment"
    if "drop" in f or "ophthalmic" in f or "otic" in f or "nasal" in f:
        return "drop"
    return "other"


def extract_pregnancy_category(raw_cat: object, monograph_text: object = None) -> Optional[str]:
    """
    Extract verified FDA Pregnancy Category (A, B, C, D, X, N) without guessing.
    """
    cleaned_cat = sanitize_text(raw_cat)
    if cleaned_cat:
        upper = cleaned_cat.upper().strip()
        if upper in VALID_PREGNANCY_CATS:
            return upper
        m = PREGNANCY_CAT_EXTRACT_RE.search(cleaned_cat)
        if m and m.group(1).upper() in VALID_PREGNANCY_CATS:
            return m.group(1).upper()

    cleaned_text = sanitize_text(monograph_text)
    if cleaned_text:
        m = PREGNANCY_CAT_EXTRACT_RE.search(cleaned_text)
        if m and m.group(1).upper() in VALID_PREGNANCY_CATS:
            return m.group(1).upper()

    return None


def make_slug(text: object, fallback_prefix: str = "item", unique_suffix: Optional[str] = None) -> str:
    """Create URL-safe lowercase slug within column length limits."""
    cleaned = sanitize_text(text) or fallback_prefix
    base = SLUG_CLEAN_RE.sub("-", cleaned.lower()).strip("-")
    if not base:
        base = fallback_prefix
    if unique_suffix:
        sfx = SLUG_CLEAN_RE.sub("-", str(unique_suffix).lower()).strip("-")
        if sfx:
            return f"{base[:220]}-{sfx[:60]}"
    return base[:250]
