import { create } from 'zustand';

interface UserState {
    token: string | null;
    username: string | null;
    nickname: string | null;
    setToken: (token: string | null) => void;
    setUserInfo: (username: string, nickname: string) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    token: localStorage.getItem('eam_token'),
    username: null,
    nickname: null,
    setToken: (token) => {
        if (token) {
            localStorage.setItem('eam_token', token);
        } else {
            localStorage.removeItem('eam_token');
        }
        set({ token });
    },
    setUserInfo: (username, nickname) => set({ username, nickname }),
    logout: () => {
        localStorage.removeItem('eam_token');
        set({ token: null, username: null, nickname: null });
    },
}));
