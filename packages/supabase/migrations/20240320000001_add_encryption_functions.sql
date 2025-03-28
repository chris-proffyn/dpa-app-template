-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to store encrypted personal details
CREATE OR REPLACE FUNCTION store_encrypted_personal_details(
  p_user_id UUID,
  p_ni_number TEXT,
  p_utr TEXT,
  p_dob DATE,
  p_secret TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO personal_details (
    user_id,
    national_insurance_number,
    unique_taxpayer_reference,
    date_of_birth
  )
  VALUES (
    p_user_id,
    pgp_sym_encrypt(p_ni_number, p_secret),
    pgp_sym_encrypt(p_utr, p_secret),
    p_dob
  )
  ON CONFLICT (user_id) DO UPDATE SET
    national_insurance_number = pgp_sym_encrypt(p_ni_number, p_secret),
    unique_taxpayer_reference = pgp_sym_encrypt(p_utr, p_secret),
    date_of_birth = p_dob,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get decrypted personal details
CREATE OR REPLACE FUNCTION get_decrypted_personal_details(
  p_user_id UUID,
  p_secret TEXT
)
RETURNS TABLE (
  date_of_birth DATE,
  national_insurance_number TEXT,
  unique_taxpayer_reference TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_of_birth,
    pgp_sym_decrypt(national_insurance_number, p_secret),
    pgp_sym_decrypt(unique_taxpayer_reference, p_secret)
  FROM personal_details
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to store encrypted financial details
CREATE OR REPLACE FUNCTION store_encrypted_financial_details(
  p_user_id UUID,
  p_bank_name TEXT,
  p_sort_code TEXT,
  p_account_number TEXT,
  p_account_name TEXT,
  p_secret TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO financial_details (
    user_id,
    bank_name,
    sort_code,
    account_number,
    account_name
  )
  VALUES (
    p_user_id,
    p_bank_name,
    p_sort_code,
    pgp_sym_encrypt(p_account_number, p_secret),
    p_account_name
  )
  ON CONFLICT (user_id) DO UPDATE SET
    bank_name = p_bank_name,
    sort_code = p_sort_code,
    account_number = pgp_sym_encrypt(p_account_number, p_secret),
    account_name = p_account_name,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get decrypted financial details
CREATE OR REPLACE FUNCTION get_decrypted_financial_details(
  p_user_id UUID,
  p_secret TEXT
)
RETURNS TABLE (
  bank_name TEXT,
  sort_code TEXT,
  account_number TEXT,
  account_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bank_name,
    sort_code,
    pgp_sym_decrypt(account_number, p_secret),
    account_name
  FROM financial_details
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 