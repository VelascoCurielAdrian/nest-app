export interface PermissionDetail {
  id: number;
  key: string;
  name: string;
}

export interface PermissionNode {
  id: number;
  key: string;
  name: string;
  permissions: PermissionDetail[];
  children?: PermissionNode[];
}

export interface SessionData {
  user_id: string;
  username: string;
  status: boolean;
  id: string;
  profile_id: string | null;
  first_name: string;
  email: string;
  last_name: string;
  gender: string | null;
  local_number: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  permissions: PermissionNode[];
}

export interface UserWithProfile {
  user_id: string;
  username: string;
  status: boolean;
  id: string;
  profile_id: string | null;
  first_name: string;
  email: string;
  last_name: string;
  gender: string | null;
  local_number: string | null;
  phone_number: string | null;
  avatar_url: string | null;
}
