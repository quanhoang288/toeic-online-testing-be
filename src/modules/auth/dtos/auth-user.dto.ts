export class AuthUserDto {
  id: number;
  email: string;
  username: string;
  roles: {
    id: number;
    name: string;
  }[];
  profileUrl?: string;
  isAdmin: boolean;
}
