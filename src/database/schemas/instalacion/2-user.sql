-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(50) NOT NULL,
  password varchar(255),
  status bool NOT NULL DEFAULT true,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6)
);
