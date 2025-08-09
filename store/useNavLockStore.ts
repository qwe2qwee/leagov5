import { create } from "zustand";

type NavLockStore = {
  isLocked: boolean;
  lockTimestamp: number | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  lock: () => void;
  unlock: () => void;
  forceUnlock: () => void;
};

const AUTO_UNLOCK_TIMEOUT = 3000; // 3 ثواني

export const useNavLockStore = create<NavLockStore>((set, get) => ({
  isLocked: false,
  lockTimestamp: null,
  timeoutId: null,

  lock: () => {
    const state = get();

    // مسح أي timeout سابق
    if (state.timeoutId) {
      console.log("[NavStore] Clearing previous timeout");
      clearTimeout(state.timeoutId);
    }

    console.log("[NavStore] Locking navigation for 3 seconds");

    // إنشاء timeout جديد
    const newTimeoutId = setTimeout(() => {
      console.log("[NavStore] Auto-unlocking after 3 seconds timeout");
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

    console.log("[NavStore] Manual unlock");

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

    console.log("[NavStore] Force unlock - clearing everything");

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
