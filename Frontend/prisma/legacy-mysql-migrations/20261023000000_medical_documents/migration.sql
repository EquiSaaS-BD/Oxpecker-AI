CREATE TABLE `MedicalDocument` (
  `id` VARCHAR(191) NOT NULL,
  `ownerId` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(32) NOT NULL,
  `originalName` VARCHAR(255) NOT NULL,
  `mimeType` VARCHAR(64) NOT NULL,
  `provider` VARCHAR(128) NOT NULL,
  `category` VARCHAR(32) NULL,
  `analysis` LONGTEXT NOT NULL,
  `priceComparison` LONGTEXT NULL,
  `priceSnapshot` VARCHAR(512) NULL,
  `image` LONGBLOB NOT NULL,
  `consentAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `MedicalDocument_ownerId_createdAt_idx` (`ownerId`, `createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
