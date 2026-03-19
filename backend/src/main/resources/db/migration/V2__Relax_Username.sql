-- Migration: V2_Relax_Username_Constraint.sql
-- Description: Removes the UNIQUE constraint from the username column to allow common names,
-- while maintaining uniqueness on the email address.

ALTER TABLE users DROP INDEX username;
