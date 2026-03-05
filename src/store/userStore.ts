import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  nickname: string | null;
  setNickname: (name: string) => void;
  clearNickname: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: null,
      setNickname: (name: string) => set({ nickname: name }),
      clearNickname: () => set({ nickname: null }),
    }),
    {
      name: "menu-sync-user-storage", // 로컬 스토리지 키 이름
    },
  ),
);
