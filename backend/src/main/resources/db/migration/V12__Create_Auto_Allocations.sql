CREATE TABLE IF NOT EXISTS auto_allocations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    amount NUMERIC(19,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    destination_type VARCHAR(50) NOT NULL,
    destination_id BIGINT,
    label VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    next_execution_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    last_executed_at TIMESTAMP
);
