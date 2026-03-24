CREATE TABLE savings_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(19, 2) NOT NULL,
    current_amount DECIMAL(19, 2) DEFAULT 0.00,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_savings FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE investments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    asset_name VARCHAR(255),
    asset_type VARCHAR(50),
    amount DECIMAL(19, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'STABLE',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_investment FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    principal_amount DECIMAL(19, 2) NOT NULL,
    remaining_balance DECIMAL(19, 2) NOT NULL,
    interest_rate DECIMAL(19, 4),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_in_months INT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    CONSTRAINT fk_user_loan FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    username VARCHAR(255),
    details VARCHAR(500),
    ip_address VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
