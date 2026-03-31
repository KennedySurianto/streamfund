export interface User {
  id: string;
  username: string;
  email: string;
  profile_picture?: string;
  is_anonymous_allowed: boolean;
  created_at: string;
}