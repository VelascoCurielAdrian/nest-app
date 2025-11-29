-- ----------------------------
-- Table structure for profile
-- ----------------------------

DROP TABLE IF EXISTS profile;
CREATE TABLE profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description VARCHAR(100) NOT NULL,
  status BOOL NOT NULL DEFAULT true,
  active BOOL NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6)
);
