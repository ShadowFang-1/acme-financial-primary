# ACME Financial - Enterprise Banking System

A production-ready, full-stack banking application built with Spring Boot, React, and TiDB.

## Features
- **Secure Authentication:** JWT-based login/registration with role-based access (USER, ADMIN).
- **Comprehensive Banking:** Account management, instant transfers, and transaction history.
- **Admin Dashboard:** Full user and account management for system administrators.
- **Modern UI:** Responsive, premium interface mimicking CalBank's aesthetics.
- **ACID Compliant:** Ensures financial transactions are reliable and atomic.

## Tech Stack
- **Backend:** Java 17, Spring Boot, Spring Security, Spring Data JPA, Hibernate.
- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Vite.
- **Database:** TiDB (MySQL compatible), Flyway for migrations.
- **Security:** JWT, BCrypt, Rate Limiting, CORS, Input Sanitization.

## Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose (optional, for containerized run)
- TiDB or MySQL 8.0

## Quick Start (Docker)
1. Clone the repository.
2. Run `docker-compose up -d`.
3. Access the frontend at `http://localhost:3000`.
4. Access the API documentation at `http://localhost:8080/swagger-ui.html`.

## Manual Setup

### Backend
1. Navigate to `backend/`.
2. Configure your database in `src/main/resources/application.properties`.
3. Run `./mvnw spring-boot:run`.

### Frontend
1. Navigate to `frontend/`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Access at `http://localhost:5173`.

## 🔐 Security Information
- **Administrative Access**: For initial setup, use the configured environment variables for admin role assignment or create a user with the `ADMIN` role via the secure API endpoints.
- **Passwords**: All passwords must be hashed using the platform's BCrypt engine before being stored in the cryptographic ledger.

## Security Best Practices
- Sensitive data is encrypted in transit using SSL/TLS.
- Passwords are hashed using BCrypt.
- Session timeout is implemented via JWT expiration.
- CORS is configured to allow only trusted origins.

---
© 2026 ACME Financial. Created for University Level 200 Student Project.
