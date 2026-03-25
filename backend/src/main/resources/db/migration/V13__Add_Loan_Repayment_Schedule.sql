-- Add loan repayment schedule columns
ALTER TABLE loans
ADD COLUMN repayment_frequency VARCHAR(20),
ADD COLUMN next_repayment_date TIMESTAMP NULL,
ADD COLUMN closing_date TIMESTAMP NULL,
ADD COLUMN repayment_amount DECIMAL(19,2);
