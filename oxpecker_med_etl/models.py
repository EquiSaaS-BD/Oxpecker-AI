"""
SQLAlchemy 2.0 ORM Models for Oxpecker AI Medicine Database (`oxpecker_med_db`).
Matches Section 3 schema specifications with InnoDB and utf8mb4_unicode_ci.
"""
from __future__ import annotations

from sqlalchemy import (
    Boolean,
    CHAR,
    Column,
    DECIMAL,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    TIMESTAMP,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

MYSQL_TABLE_ARGS = {
    "mysql_engine": "InnoDB",
    "mysql_charset": "utf8mb4",
    "mysql_collate": "utf8mb4_unicode_ci",
}


class Manufacturer(Base):
    __tablename__ = "manufacturers"
    __table_args__ = (MYSQL_TABLE_ARGS,)

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    country = Column(String(50), server_default=text("'Bangladesh'"), default="Bangladesh")

    medicines = relationship("Medicine", back_populates="manufacturer")


class DrugClass(Base):
    __tablename__ = "drug_classes"
    __table_args__ = (MYSQL_TABLE_ARGS,)

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), nullable=False, unique=True)

    generics = relationship("Generic", back_populates="drug_class")


class Generic(Base):
    __tablename__ = "generics"
    __table_args__ = (
        Index("ft_generic_search", "generic_name", "indication_description", mysql_prefix="FULLTEXT"),
        MYSQL_TABLE_ARGS,
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    generic_name = Column(String(500), nullable=False)
    canonical_name = Column(String(500), nullable=False, unique=True)
    drugbank_id = Column(String(50), nullable=True)
    drug_class_id = Column(Integer, ForeignKey("drug_classes.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    indication_description = Column(LONGTEXT, nullable=True)
    pharmacology_description = Column(LONGTEXT, nullable=True)
    dosage_administration = Column(LONGTEXT, nullable=True)
    interaction_description = Column(LONGTEXT, nullable=True)
    contraindications = Column(LONGTEXT, nullable=True)
    side_effects_text = Column(LONGTEXT, nullable=True)
    structured_side_effects = Column(JSON(none_as_null=True), nullable=True)
    clinical_uses = Column(JSON(none_as_null=True), nullable=True)
    pregnancy_category = Column(String(50), nullable=True)
    lactation_info = Column(Text, nullable=True)
    precautions = Column(LONGTEXT, nullable=True)
    overdose_effects = Column(Text, nullable=True)
    storage_conditions = Column(Text, nullable=True)
    habit_forming = Column(Boolean, server_default=text("0"), default=False)
    alcohol_interaction = Column(String(100), nullable=True)
    rx_otc_status = Column(String(50), nullable=True)
    monograph_url = Column(String(500), nullable=True)

    drug_class = relationship("DrugClass", back_populates="generics")
    medicines = relationship("Medicine", back_populates="generic")


class Medicine(Base):
    __tablename__ = "medicines"
    __table_args__ = (
        Index("idx_brand_name", "brand_name"),
        Index("idx_generic_id", "generic_id"),
        Index("ft_medicine_ocr", "brand_name", "strength", "dosage_form", mysql_prefix="FULLTEXT"),
        MYSQL_TABLE_ARGS,
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    brand_name = Column(String(255), nullable=False)
    slug = Column(String(300), nullable=False, unique=True)
    dedup_hash = Column(CHAR(64), nullable=False, unique=True)
    medicine_type = Column(String(50), server_default=text("'Allopathic'"), default="Allopathic")
    dosage_form = Column(String(100), nullable=False)
    strength = Column(String(255), nullable=True)
    generic_id = Column(Integer, ForeignKey("generics.id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False)
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    unit_price_bdt = Column(DECIMAL(10, 2), nullable=True)
    strip_price_bdt = Column(DECIMAL(10, 2), nullable=True)
    pack_size_info = Column(Text, nullable=True)
    reference_image_url = Column(String(500), nullable=True)
    dosage_form_icon = Column(String(100), nullable=False)
    is_active = Column(Boolean, server_default=text("1"), default=True)
    data_source = Column(String(100), nullable=False, server_default=text("'MedEx_BD_Verified'"), default="MedEx_BD_Verified")
    updated_at = Column(
        TIMESTAMP,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    generic = relationship("Generic", back_populates="medicines")
    manufacturer = relationship("Manufacturer", back_populates="medicines")
