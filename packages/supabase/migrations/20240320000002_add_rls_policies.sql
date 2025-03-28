-- Enable RLS on tables
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_details ENABLE ROW LEVEL SECURITY;

-- Policy for user_details
CREATE POLICY "Users can view and update their own details"
ON user_details
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for personal_details
CREATE POLICY "Users can view and update their own personal details"
ON personal_details
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for financial_details
CREATE POLICY "Users can view and update their own financial details"
ON financial_details
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_details TO authenticated;
GRANT SELECT, INSERT, UPDATE ON personal_details TO authenticated;
GRANT SELECT, INSERT, UPDATE ON financial_details TO authenticated; 