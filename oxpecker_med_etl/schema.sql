-- =============================================================================
-- OXPECKER AI - PRODUCTION MEDICINE DATABASE SCHEMA (MySQL 8.0+)
-- Database: oxpecker_med_db
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `oxpecker_med_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `oxpecker_med_db`;

-- 1. manufacturers
CREATE TABLE IF NOT EXISTS `manufacturers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `country` VARCHAR(50) DEFAULT 'Bangladesh'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. drug_classes
CREATE TABLE IF NOT EXISTS `drug_classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `slug` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. generics
CREATE TABLE IF NOT EXISTS `generics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `generic_name` VARCHAR(500) NOT NULL,
  `canonical_name` VARCHAR(500) NOT NULL UNIQUE,
  `drugbank_id` VARCHAR(50) NULL,
  `drug_class_id` INT NULL,
  `indication_description` LONGTEXT NULL,
  `pharmacology_description` LONGTEXT NULL,
  `dosage_administration` LONGTEXT NULL,
  `interaction_description` LONGTEXT NULL,
  `contraindications` LONGTEXT NULL,
  `side_effects_text` LONGTEXT NULL,
  `structured_side_effects` JSON NULL,
  `clinical_uses` JSON NULL,
  `pregnancy_category` VARCHAR(50) NULL,
  `lactation_info` TEXT NULL,
  `precautions` LONGTEXT NULL,
  `overdose_effects` TEXT NULL,
  `storage_conditions` TEXT NULL,
  `habit_forming` BOOLEAN DEFAULT FALSE,
  `alcohol_interaction` VARCHAR(100) NULL,
  `rx_otc_status` VARCHAR(50) NULL,
  `monograph_url` VARCHAR(500) NULL,
  CONSTRAINT `fk_generics_drug_class`
    FOREIGN KEY (`drug_class_id`) REFERENCES `drug_classes` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  FULLTEXT INDEX `ft_generic_search` (`generic_name`, `indication_description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. medicines (Local Bangladeshi Brands & Products)
CREATE TABLE IF NOT EXISTS `medicines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `brand_name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(300) NOT NULL UNIQUE,
  `dedup_hash` CHAR(64) NOT NULL UNIQUE,
  `medicine_type` VARCHAR(50) DEFAULT 'Allopathic',
  `dosage_form` VARCHAR(100) NOT NULL,
  `strength` VARCHAR(255) NULL,
  `generic_id` INT NOT NULL,
  `manufacturer_id` INT NULL,
  `unit_price_bdt` DECIMAL(10, 2) NULL,
  `strip_price_bdt` DECIMAL(10, 2) NULL,
  `pack_size_info` TEXT NULL,
  `reference_image_url` VARCHAR(500) NULL,
  `dosage_form_icon` VARCHAR(100) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `data_source` VARCHAR(100) NOT NULL DEFAULT 'MedEx_BD_Verified',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_medicines_generic`
    FOREIGN KEY (`generic_id`) REFERENCES `generics` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_medicines_manufacturer`
    FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturers` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_brand_name` (`brand_name`),
  INDEX `idx_generic_id` (`generic_id`),
  FULLTEXT INDEX `ft_medicine_ocr` (`brand_name`, `strength`, `dosage_form`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
