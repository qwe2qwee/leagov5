import { create } from "zustand";

type NavLockStore = {
  isLocked: boolean;
  lockTimestamp: number | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  lock: () => void;
  unlock: () => void;
  forceUnlock: () => void;
};

const AUTO_UNLOCK_TIMEOUT = 1000; // 1 ثواني

export const useNavLockStore = create<NavLockStore>((set, get) => ({
  isLocked: false,
  lockTimestamp: null,
  timeoutId: null,

  lock: () => {
    const state = get();

    // مسح أي timeout سابق
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }


    // إنشاء timeout جديد
    const newTimeoutId = setTimeout(() => {
      set({
        isLocked: false,
        lockTimestamp: null,
        timeoutId: null,
      });
    }, AUTO_UNLOCK_TIMEOUT);

    set({
      isLocked: true,
      lockTimestamp: Date.now(),
      timeoutId: newTimeoutId,
    });
  },

  unlock: () => {
    const state = get();


    // مسح الـ timeout عند الفتح اليدوي
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    set({
      isLocked: false,
      lockTimestamp: null,
      timeoutId: null,
    });
  },

  forceUnlock: () => {
    const state = get();


    // مسح الـ timeout
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    set({
      isLocked: false,
      lockTimestamp: null,
      timeoutId: null,
    });
  },
}));
