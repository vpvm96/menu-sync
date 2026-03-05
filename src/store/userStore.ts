import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  nickname: string | null;
  avatar: string | null;
  setNickname: (name: string) => void;
  setAvatar: (avatar: string) => void;
  clearNickname: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: null,
      avatar: null,
      setNickname: (name: string) => set({ nickname: name }),
      setAvatar: (avatar: string) => set({ avatar }),
      clearNickname: () => set({ nickname: null, avatar: null }),
    }),
    {
      name: "menu-sync-user-storage", // 로컬 스토리지 키 이름
    },
  ),
);
