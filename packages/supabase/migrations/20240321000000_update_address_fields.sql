-- Update user_details table to split address into multiple fields
ALTER TABLE user_details 
  DROP COLUMN address,
  ADD COLUMN address_line1 VARCHAR(255) NOT NULL,
  ADD COLUMN address_line2 VARCHAR(255),
  ADD COLUMN city_town VARCHAR(100) NOT NULL,
  ADD COLUMN county VARCHAR(100),
  ADD COLUMN postcode VARCHAR(10) NOT NULL; 