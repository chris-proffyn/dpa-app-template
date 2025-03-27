-- Drop the existing function
DROP FUNCTION IF EXISTS get_decrypted_financial_details;

-- Recreate the function with correct return types
CREATE OR REPLACE FUNCTION get_decrypted_financial_details(
  p_user_id UUID,
  p_secret TEXT
)
RETURNS TABLE (
  bank_name VARCHAR(255),
  sort_code VARCHAR(6),
  account_number TEXT,
  account_name VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.bank_name,
    f.sort_code,
    pgp_sym_decrypt(f.account_number::bytea, p_secret)::TEXT,
    f.account_name
  FROM financial_details f
  WHERE f.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 