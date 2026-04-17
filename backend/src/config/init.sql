CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  role ENUM('owner', 'adult', 'child') DEFAULT 'adult',
  household_type ENUM('single', 'paar', 'familie') DEFAULT 'familie',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_preferences (
  id INT PRIMARY KEY,
  household_type ENUM('single', 'paar', 'familie') NOT NULL DEFAULT 'familie',
  diet_type ENUM('all', 'omnivore', 'vegetarisch', 'vegan', 'fisch') NOT NULL DEFAULT 'all',
  max_cooking_time INT NOT NULL DEFAULT 25,
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meal_suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  diet_type ENUM('omnivore', 'vegetarisch', 'vegan', 'fisch') DEFAULT 'omnivore',
  cooking_time_minutes INT NOT NULL,
  difficulty ENUM('einfach', 'mittel', 'schwer') DEFAULT 'einfach',
  family_friendly BOOLEAN DEFAULT TRUE,
  household_fit ENUM('single', 'paar', 'familie', 'all') DEFAULT 'all',
  tags VARCHAR(255) NULL,
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_meal_title (title)
);

CREATE TABLE IF NOT EXISTS weeks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('active', 'archived') DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS week_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  week_id INT NOT NULL,
  day_index INT NOT NULL,
  day_label VARCHAR(20) NOT NULL,
  meal_id INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_week_days_week FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE,
  CONSTRAINT fk_week_days_meal FOREIGN KEY (meal_id) REFERENCES meal_suggestions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shopping_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  week_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  amount VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'Sonstiges',
  recipe_count INT NOT NULL DEFAULT 1,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shopping_items_week FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE
);

INSERT INTO app_preferences (id, household_type, diet_type, max_cooking_time, onboarded)
VALUES (1, 'familie', 'all', 25, FALSE)
ON DUPLICATE KEY UPDATE id = VALUES(id);

INSERT INTO meal_suggestions (title, category, diet_type, cooking_time_minutes, difficulty, family_friendly, household_fit, tags, image_url)
VALUES
('One-Pot Pasta mit Tomaten', 'Pasta', 'vegetarisch', 20, 'einfach', TRUE, 'all', 'schnell,kinderfreundlich,pasta', NULL),
('Lachs mit Kartoffeln und Brokkoli', 'Fisch', 'fisch', 25, 'mittel', TRUE, 'paar', 'fisch,ofen,ausgewogen', NULL),
('Veggie Wraps mit Joghurtsauce', 'Wraps', 'vegetarisch', 15, 'einfach', TRUE, 'all', 'schnell,kinderfreundlich,fingerfood', NULL),
('Hähnchen-Reis-Pfanne', 'Pfanne', 'omnivore', 25, 'einfach', TRUE, 'familie', 'pfanne,mealprep,kinderfreundlich', NULL),
('Cremiges Kichererbsen-Curry', 'Curry', 'vegan', 25, 'mittel', TRUE, 'all', 'vegan,eintopf,wuerzig', NULL),
('Spinat-Feta-Ofenpasta', 'Pasta', 'vegetarisch', 30, 'einfach', TRUE, 'familie', 'ofen,pasta,comfort', NULL),
('Fischstäbchen-Bowl mit Erbsenreis', 'Bowl', 'fisch', 20, 'einfach', TRUE, 'familie', 'kinderfreundlich,bowl,schnell', NULL),
('Tomaten-Mozzarella-Toasties', 'Toast', 'vegetarisch', 10, 'einfach', TRUE, 'single', 'ultraschnell,toast,snack', NULL),
('Schnelle Udon-Pfanne', 'Nudeln', 'vegan', 18, 'mittel', FALSE, 'paar', 'asiatisch,schnell,pfanne', NULL),
('Puten-Gemüse-Pfanne', 'Pfanne', 'omnivore', 22, 'einfach', TRUE, 'all', 'protein,schnell,pfanne', NULL),
('Kartoffel-Brokkoli-Auflauf', 'Auflauf', 'vegetarisch', 30, 'mittel', TRUE, 'familie', 'ofen,kinderfreundlich,auflauf', NULL),
('Avocado-Bohnen-Tacos', 'Tacos', 'vegan', 20, 'einfach', FALSE, 'paar', 'tacos,schnell,frisch', NULL)
ON DUPLICATE KEY UPDATE
  category = VALUES(category),
  diet_type = VALUES(diet_type),
  cooking_time_minutes = VALUES(cooking_time_minutes),
  difficulty = VALUES(difficulty),
  family_friendly = VALUES(family_friendly),
  household_fit = VALUES(household_fit),
  tags = VALUES(tags),
  image_url = VALUES(image_url);
