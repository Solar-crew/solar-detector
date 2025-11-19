export interface User {
  isLoggedIn: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface AuthContextType {
  user: User | null;
  login: () => void;
  register: (location?: { latitude: number; longitude: number }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
