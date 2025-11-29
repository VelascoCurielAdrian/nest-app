-- Iniciar transacción limpia
BEGIN;

-- Eliminar vistas primero
DROP VIEW IF EXISTS v_effective_permissions CASCADE;
DROP VIEW IF EXISTS v_section_hierarchy CASCADE;

-- Eliminar trigger y función
DROP TRIGGER IF EXISTS trigger_update_section_hierarchy ON system_section CASCADE;
DROP FUNCTION IF EXISTS update_section_hierarchy() CASCADE;

-- Eliminar las tablas en orden correcto por dependencias
DROP TABLE IF EXISTS permission_system CASCADE;
DROP TABLE IF EXISTS section_permission CASCADE;
DROP TABLE IF EXISTS system_section CASCADE;
DROP TABLE IF EXISTS type_permission CASCADE;

-- ============================================
-- CREAR TABLAS
-- ============================================

-- Tabla de tipos de permisos
CREATE TABLE type_permission (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Tabla de secciones con soporte para jerarquía (árbol)
CREATE TABLE system_section (
  id SERIAL PRIMARY KEY,
  parent_id INT NULL,
  key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  level INT NOT NULL DEFAULT 0,
  path VARCHAR(500) NOT NULL DEFAULT '',
  sort_order INT DEFAULT 0,
  status BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (parent_id) REFERENCES system_section(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT unique_key_per_parent UNIQUE (parent_id, key)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_system_section_parent ON system_section(parent_id);
CREATE INDEX idx_system_section_path ON system_section(path);
CREATE INDEX idx_system_section_level ON system_section(level);
CREATE INDEX idx_system_section_key ON system_section(key);

-- Tabla de permisos por sección
CREATE TABLE section_permission (
  id SERIAL PRIMARY KEY,
  section_id INT NOT NULL,
  permission_id INT NOT NULL,
  inherit_from_parent BOOLEAN DEFAULT TRUE,
  status BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (section_id) REFERENCES system_section(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES type_permission(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT unique_section_permission UNIQUE (section_id, permission_id)
);

CREATE INDEX idx_section_permission_section ON section_permission(section_id);
CREATE INDEX idx_section_permission_permission ON section_permission(permission_id);

-- Tabla de permisos asignados a perfiles
CREATE TABLE permission_system (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL,
  section_permission_id INT NOT NULL,
  status BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
  FOREIGN KEY (section_permission_id) REFERENCES section_permission(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT unique_profile_section_permission UNIQUE (profile_id, section_permission_id)
);

CREATE INDEX idx_permission_system_profile ON permission_system(profile_id);
CREATE INDEX idx_permission_system_section_perm ON permission_system(section_permission_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar automáticamente el path y level
CREATE OR REPLACE FUNCTION update_section_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  parent_path VARCHAR(500);
  parent_level INT;
BEGIN
  IF NEW. parent_id IS NULL THEN
    NEW.level := 0;
    NEW.path := NEW.id::VARCHAR;
  ELSE
    SELECT path, level
    INTO parent_path, parent_level
    FROM system_section
    WHERE id = NEW.parent_id;
    
    IF parent_path IS NULL THEN
      RAISE EXCEPTION 'Parent section with id % does not exist', NEW.parent_id;
    END IF;
    
    NEW.level := parent_level + 1;
    NEW. path := parent_path || '.' || NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para mantener la jerarquía actualizada
CREATE TRIGGER trigger_update_section_hierarchy
  BEFORE INSERT OR UPDATE OF parent_id
  ON system_section
  FOR EACH ROW
  EXECUTE FUNCTION update_section_hierarchy();

-- ============================================
-- VISTAS
-- ============================================

-- Vista para jerarquía completa
CREATE OR REPLACE VIEW v_section_hierarchy AS
WITH RECURSIVE section_tree AS (
  SELECT 
    id,
    parent_id,
    key,
    name,
    description,
    level,
    path,
    sort_order,
    status,
    name::TEXT AS full_path,
    ARRAY[id] AS id_path,
    created_at,
    updated_at
  FROM system_section
  WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT 
    s. id,
    s.parent_id,
    s.key,
    s.name,
    s.description,
    s. level,
    s.path,
    s.sort_order,
    s.status,
    (st.full_path || ' > ' || s.name)::TEXT,
    st.id_path || s.id,
    s.created_at,
    s.updated_at
  FROM system_section s
  INNER JOIN section_tree st ON s. parent_id = st.id
)
SELECT * FROM section_tree
ORDER BY path, sort_order;

-- Vista para permisos efectivos con herencia
CREATE OR REPLACE VIEW v_effective_permissions AS
SELECT DISTINCT
  ps.profile_id,
  ps.id AS permission_system_id,
  s.id AS section_id,
  s.key AS section_key,
  s.name AS section_name,
  s.level AS section_level,
  s.path AS section_path,
  tp.id AS permission_id,
  tp.key AS permission_key,
  tp.name AS permission_name,
  sp.inherit_from_parent,
  CASE 
    WHEN sp.section_id = s.id THEN 'direct'::TEXT
    ELSE 'inherited'::TEXT
  END AS permission_source,
  ps.status,
  ps.created_at
FROM permission_system ps
JOIN section_permission sp ON ps.section_permission_id = sp.id
JOIN type_permission tp ON sp.permission_id = tp.id
JOIN system_section parent_section ON sp.section_id = parent_section.id
JOIN system_section s ON (
  s.id = parent_section.id 
  OR (sp.inherit_from_parent = TRUE AND s.path LIKE parent_section.path || '. %')
)
WHERE ps. status = TRUE 
  AND sp.status = TRUE 
  AND tp.status = TRUE
  AND s.status = TRUE;

COMMIT;