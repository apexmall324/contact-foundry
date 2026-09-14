CREATE DATABASE vcf_manager;
USE vcf_manager;

CREATE TABLE vcf_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    base_name VARCHAR(100),
    total_contacts INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vcf_id INT,
    contact_name VARCHAR(100),
    phone_number VARCHAR(50),
    FOREIGN KEY (vcf_id) REFERENCES vcf_files(id) ON DELETE CASCADE
);