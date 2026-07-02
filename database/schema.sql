CREATE TABLE IF NOT EXISTS buyers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    company_name VARCHAR(150),
    business_type VARCHAR(100),
    address VARCHAR(255),
    
    status VARCHAR(20) DEFAULT 'pending',
    notification VARCHAR(1000),
    notification_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
