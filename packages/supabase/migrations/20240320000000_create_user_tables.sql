-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_details table
CREATE TABLE user_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    given_names VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile_phone VARCHAR(11),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create personal_details table
CREATE TABLE personal_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    national_insurance_number VARCHAR(9) NOT NULL,
    unique_taxpayer_reference VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(national_insurance_number),
    UNIQUE(unique_taxpayer_reference)
);

-- Create financial_details table
CREATE TABLE financial_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    sort_code VARCHAR(6) NOT NULL,
    account_number VARCHAR(8) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_details_updated_at
    BEFORE UPDATE ON user_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_details_updated_at
    BEFORE UPDATE ON personal_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_details_updated_at
    BEFORE UPDATE ON financial_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_details ENABLE ROW LEVEL SECURITY;

-- User can only view and update their own details
CREATE POLICY "Users can view own details"
    ON user_details FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own details"
    ON user_details FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own details"
    ON user_details FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Personal details policies
CREATE POLICY "Users can view own personal details"
    ON personal_details FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own personal details"
    ON personal_details FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal details"
    ON personal_details FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Financial details policies
CREATE POLICY "Users can view own financial details"
    ON financial_details FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own financial details"
    ON financial_details FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial details"
    ON financial_details FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_user_details_user_id ON user_details(user_id);
CREATE INDEX idx_personal_details_user_id ON personal_details(user_id);
CREATE INDEX idx_financial_details_user_id ON financial_details(user_id); 