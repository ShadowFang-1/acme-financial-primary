CREATE TABLE IF NOT EXISTS auto_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    destination_type VARCHAR(50) NOT NULL,
    destination_id BIGINT,
    label VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    next_execution_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_executed_at TIMESTAMP NULL,
    CONSTRAINT fk_auto_alloc_user FOREIGN KEY (user_id) REFERENCES users(id)
);
