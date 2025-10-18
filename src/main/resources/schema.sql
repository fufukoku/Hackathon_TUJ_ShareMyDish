CREATE TABLE IF NOT EXISTS food_record (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_name VARCHAR(200) NOT NULL,
    description TEXT,
    food_image VARCHAR(500),
    x REAL,
    y REAL,
    expire_time INTEGER,
    user_id INTEGER,
    status INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user(id)
);