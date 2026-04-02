CREATE TABLE IF NOT EXISTS course_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS positions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS teacher_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    position_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    pedagogical_title VARCHAR(100),
    last_attestation_date DATE NOT NULL,
    next_attestation_date DATE NOT NULL,
    attestation_note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (position_id) REFERENCES positions(id),
    FOREIGN KEY (category_id) REFERENCES teacher_categories(id)
);

CREATE TABLE IF NOT EXISTS teacher_disciplines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    discipline VARCHAR(200) NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('TEACHER','HEAD','ADMIN') NOT NULL,
    teacher_id BIGINT UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    title VARCHAR(300) NOT NULL,
    institution VARCHAR(300) NOT NULL,
    hours INT NOT NULL,
    ects_credits DECIMAL(4,1),
    issue_date DATE NOT NULL,
    drive_url VARCHAR(1000),
    confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    confirmed_by BIGINT,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES course_categories(id),
    FOREIGN KEY (confirmed_by) REFERENCES users(id)
);

CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_courses_confirmed ON courses(teacher_id, confirmed);
CREATE INDEX idx_teachers_next_att ON teachers(next_attestation_date);
