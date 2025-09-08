// Database initialization script for XAMPP MySQL
// Run this to create the database and tables

CREATE DATABASE IF NOT EXISTS `fashion_cms` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `fashion_cms`;

-- Note: Prisma will manage the actual table creation via migrations
-- This script is just to create the database itself

-- Grant privileges (adjust username/password as needed)
GRANT ALL PRIVILEGES ON `fashion_cms`.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- Verify database creation
SHOW DATABASES LIKE 'fashion_cms';