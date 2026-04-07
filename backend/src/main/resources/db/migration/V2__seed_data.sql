INSERT IGNORE INTO course_categories (name) VALUES
    ('Профільне (ІТ)'), ('Психолого-педагогічне'), ('Інклюзивна освіта'), ('Інше');

INSERT IGNORE INTO positions (name) VALUES
    ('Викладач'), ('Директор'), ('Заступник директора'), ('Завідувач відділення'), ('Завідувач лабораторією');

INSERT IGNORE INTO teacher_categories (name) VALUES
    ('Вища'), ('Перша'), ('Друга'), ('Спеціаліст'), ('Без категорії');

INSERT IGNORE INTO users (username, password, role, active)
VALUES ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KGq6Gy', 'ADMIN', TRUE);
