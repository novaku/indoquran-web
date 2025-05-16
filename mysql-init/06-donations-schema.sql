-- MySQL schema for donations table
-- This file defines the donations table structure and inserts initial dummy data

-- Create donations table
CREATE TABLE IF NOT EXISTS `donations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `amount` DECIMAL(10,2) NOT NULL,
  `donor_name` VARCHAR(255) NOT NULL,
  `donor_initial` VARCHAR(10) NOT NULL,
  `method` VARCHAR(50) NOT NULL,
  `donation_date` DATETIME NOT NULL,
  `verified` BOOLEAN DEFAULT TRUE,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert dummy donation data (2025)
INSERT INTO `donations` 
  (`amount`, `donor_name`, `donor_initial`, `method`, `donation_date`, `notes`) 
VALUES
  -- May 2025
  (100015.00, 'Farhan Zulfikar', 'FZ', 'Bank Permata', '2025-05-12 09:15:22', 'Semoga bermanfaat'),
  (50015.00, 'Rania Amelia', 'RA', 'OVO', '2025-05-10 14:30:45', 'Untuk pengembangan aplikasi'),
  (25015.00, 'Hakim Kusuma', 'HK', 'GoPay', '2025-05-08 11:22:10', NULL),
  (200015.00, 'Sari Ramadhani', 'SR', 'Bank Permata', '2025-05-05 16:40:19', 'Untuk server dan hosting'),
  (75015.00, 'Muhammad Santoso', 'MS', 'DANA', '2025-05-01 10:05:37', 'Jazakumullah khair'),
  
  -- April 2025
  (125015.00, 'Ahmad Nurdin', 'AN', 'Bank Permata', '2025-04-29 08:22:15', NULL),
  (50015.00, 'Dina Fitriani', 'DF', 'ShopeePay', '2025-04-25 09:45:30', 'Untuk keberlangsungan aplikasi'),
  (75015.00, 'Zainal Abidin', 'ZA', 'DANA', '2025-04-20 13:10:22', NULL),
  (200000.00, 'Bambang Waskito', 'BW', 'Bank Permata', '2025-04-15 11:30:45', 'Donasi untuk pengembangan fitur'),
  (50000.00, 'Diana Pertiwi', 'DP', 'GoPay', '2025-04-10 14:20:15', NULL),
  (25000.00, 'Eko Nugroho', 'EN', 'OVO', '2025-04-05 16:45:10', 'Semoga berkah'),
  (50000.00, 'Anisa Rahma', 'AR', 'DANA', '2025-04-03 09:15:45', NULL),
  (50000.00, 'Putri Lestari', 'PL', 'Bank Permata', '2025-04-01 10:25:30', 'Untuk peningkatan konten'),
  
  -- March 2025
  (100015.00, 'Rizky Firmansyah', 'RF', 'Bank Permata', '2025-03-28 13:40:22', NULL),
  (75000.00, 'Indra Kusuma', 'IK', 'OVO', '2025-03-25 15:30:10', 'Semoga bermanfaat untuk umat'),
  (50000.00, 'Siti Aisyah', 'SA', 'GoPay', '2025-03-20 09:20:45', NULL),
  (25000.00, 'Budi Santoso', 'BS', 'DANA', '2025-03-15 10:15:30', NULL),
  (150000.00, 'Maya Wijaya', 'MW', 'Bank Permata', '2025-03-10 16:45:15', 'Untuk server Al-Quran'),
  (90000.00, 'Hendra Pratama', 'HP', 'ShopeePay', '2025-03-05 14:10:25', NULL),
  (50000.00, 'Dewi Safitri', 'DS', 'Bank Permata', '2025-03-01 11:30:40', 'Terimakasih atas layanannya'),
  
  -- February 2025
  (125000.00, 'Gunawan Wibowo', 'GW', 'Bank Permata', '2025-02-25 10:15:20', NULL),
  (50000.00, 'Tia Puspita', 'TP', 'OVO', '2025-02-20 09:30:15', 'Semoga berkah'),
  (75000.00, 'Joko Susilo', 'JS', 'DANA', '2025-02-15 13:45:30', NULL),
  (50015.00, 'Ratna Sari', 'RS', 'GoPay', '2025-02-10 15:20:45', 'Untuk pengembangan aplikasi'),
  (75000.00, 'Agus Setiawan', 'AS', 'Bank Permata', '2025-02-05 11:10:25', NULL),
  
  -- January 2025
  (100015.00, 'Dimas Prayoga', 'DP', 'Bank Permata', '2025-01-30 14:25:15', 'Semoga bermanfaat'),
  (50000.00, 'Yuni Astuti', 'YA', 'DANA', '2025-01-25 10:30:45', NULL),
  (75000.00, 'Faisal Rahman', 'FR', 'OVO', '2025-01-20 09:15:30', 'Untuk pengembangan fitur'),
  (125000.00, 'Kartika Dewi', 'KD', 'Bank Permata', '2025-01-15 15:45:10', NULL);
