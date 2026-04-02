-- Step 1: Database create karna (Creating the database)
CREATE DATABASE IF NOT EXISTS campus_hub;
USE campus_hub;

-- Step 2: Students table create karna (Table for storing user data, with role, skills, cgpa)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    skills TEXT NULL,
    cgpa DECIMAL(3,2) NULL
);

-- Step 3: Opportunities table create karna (Table for jobs with expanded fields)
CREATE TABLE IF NOT EXISTS opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT,
    eligibility TEXT,
    location VARCHAR(255) NULL,
    salary VARCHAR(100) NULL,
    job_type VARCHAR(100) NULL
);

-- Step 4: Applications table create karna (Table for tracking student applications, resumes, and interview schedule)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_email VARCHAR(255) NOT NULL,
    opportunity_id INT NOT NULL,
    resume VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Applied',
    interview_date DATE NULL,
    interview_time TIME NULL,
    interview_mode VARCHAR(100) NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_email) REFERENCES students(email) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (student_email, opportunity_id)
);

-- Step 5: Admin generated Events mapping table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Mapping Student Registrations safely against duplicate arrays
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_email VARCHAR(255) NOT NULL,
    event_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_email) REFERENCES students(email) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (student_email, event_id)
);

-- Step 7: Dynamic Document Categories Map
CREATE TABLE IF NOT EXISTS resource_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Step 8: Admin Resources logic structure
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_id INT NULL,
    link VARCHAR(400) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE CASCADE
);
