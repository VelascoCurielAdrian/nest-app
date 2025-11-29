-- ----------------------------
-- Table structure for user_profile
-- ----------------------------
DROP TABLE IF EXISTS user_profile;

CREATE TABLE user_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  user_id UUID NOT NULL,
  email VARCHAR(80) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  local_number VARCHAR(20) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  avatar_url VARCHAR(255),
  status bool NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ,
  -- FOREIGN KEYS
  FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
