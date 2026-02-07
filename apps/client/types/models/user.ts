export interface User {
  sub: string;
  id: string;
  username: string;
  avatar: string;
  name?: string;
  membership: {
    isActive: boolean;
    details?: {
      type: string;
    };
  };
}
