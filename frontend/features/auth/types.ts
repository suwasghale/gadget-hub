/** Mirrors apps.users.api.serializers.UserSerializer. */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  profile_image: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  role: "superadmin" | "staff" | "vendor" | "user" | string;
  date_joined: string;
  last_login: string | null;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}
