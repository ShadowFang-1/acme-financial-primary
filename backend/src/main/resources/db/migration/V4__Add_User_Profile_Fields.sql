ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) AFTER password;
ALTER TABLE users ADD COLUMN country VARCHAR(50) AFTER phone_number;
