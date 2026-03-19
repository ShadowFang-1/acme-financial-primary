CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    balance DECIMAL(19, 2) DEFAULT 0.00,
    type VARCHAR(50) NOT NULL,
    frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_account FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_account_id BIGINT,
    receiver_account_id BIGINT,
    amount DECIMAL(19, 2) NOT NULL,
    description VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sender_account FOREIGN KEY (sender_account_id) REFERENCES accounts(id),
    CONSTRAINT fk_receiver_account FOREIGN KEY (receiver_account_id) REFERENCES accounts(id)
);

-- Insert an admin user (password is 'admin123')
-- BCrypt hash generated for 'admin123' with 10 rounds
INSERT INTO users (username, email, password, role) VALUES ('admin', 'admin@acme.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');
