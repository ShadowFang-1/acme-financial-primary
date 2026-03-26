-- Add investment tracking columns
ALTER TABLE investments
ADD COLUMN initial_amount DECIMAL(19,2),
ADD COLUMN target_amount DECIMAL(19,2),
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
