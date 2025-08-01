/*
  # Add missing user and agency fields

  1. New Columns Added
    - `users` table:
      - `phone` (text, optional) - User's phone number
    - `agencies` table:
      - `website` (text, optional) - Agency website URL
      - `phone` (text, optional) - Agency contact phone
      - `billing_address` (text, optional) - Billing address
      - `billing_city` (text, optional) - Billing city
      - `billing_zip` (text, optional) - Billing postal code
      - `billing_country` (text, optional) - Billing country

  2. Security
    - No changes to existing RLS policies needed
    - New columns inherit existing table permissions

  3. Notes
    - All new fields are optional to maintain backward compatibility
    - Billing information stored with agency for multi-user access
*/

-- Add phone number to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text;
  END IF;
END $$;

-- Add additional fields to agencies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'website'
  ) THEN
    ALTER TABLE agencies ADD COLUMN website text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'phone'
  ) THEN
    ALTER TABLE agencies ADD COLUMN phone text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE agencies ADD COLUMN billing_address text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'billing_city'
  ) THEN
    ALTER TABLE agencies ADD COLUMN billing_city text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'billing_zip'
  ) THEN
    ALTER TABLE agencies ADD COLUMN billing_zip text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agencies' AND column_name = 'billing_country'
  ) THEN
    ALTER TABLE agencies ADD COLUMN billing_country text DEFAULT 'Canada';
  END IF;
END $$;