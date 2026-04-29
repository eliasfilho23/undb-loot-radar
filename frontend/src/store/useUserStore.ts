import { create } from 'zustand';

interface UserStore {
  isLoading: boolean;
  isLogged : boolean;
  userId   : string | null;
  username : string | null;
  login    : (data: { userId: string; username: string }) => void;
  logout   : () => void;
  setLoaded: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isLoading: true,
  isLogged : false,
  userId   : null,
  username : null,
  login    : (data) => set({ isLogged: true, userId: data.userId, username: data.username }),
  logout   : () => set({ isLogged: false, userId: null, username: null }),
  setLoaded: () => set({ isLoading: false }),
}));
