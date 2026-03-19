ALTER TABLE users ADD COLUMN one_time_password VARCHAR(10) AFTER login_notifications;
ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP AFTER one_time_password;
