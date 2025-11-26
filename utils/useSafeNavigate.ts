// utils/useSafeNavigate.ts
import { LinkProps, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { useNavLockStore } from "../store/useNavLockStore";

type Href = LinkProps["href"];

type NavOptions = { force?: boolean };

export function useSafeNavigate() {
  const router = useRouter();
  const { isLocked, lock, unlock, forceUnlock } = useNavLockStore();

  // تنظيف عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (isLocked) {
        forceUnlock();
      }
    };
  }, [isLocked, forceUnlock]);

  const safeAction = useCallback(
    (action: () => void, options?: NavOptions) => {
      const bypassLock = options?.force === true;

      if (!bypassLock && isLocked) {
        return;
      }

      if (!bypassLock) {
        lock(); // الـ zustand store سيتولى إدارة الـ timeout
      }

      try {
        action();
      } catch (err) {
        console.error("action threw:", err);
        if (!bypassLock) {
          forceUnlock();
        }
        throw err;
      }
    },
    [isLocked, lock, forceUnlock]
  );

  const push = useCallback(
    (href: Href, options?: NavOptions) =>
      safeAction(() => router.push(href), options),
    [router, safeAction]
  );

  const replace = useCallback(
    (href: Href, options?: NavOptions) =>
      safeAction(() => router.replace(href), options),
    [router, safeAction]
  );

  const back = useCallback(
    (options?: NavOptions) =>
      safeAction(() => {
        if (router.canGoBack?.()) {
          router.back();
        } else {
          router.replace("/");
        }
      }, options),
    [router, safeAction]
  );

  return {
    push,
    replace,
    back,
    forceUnlock,
    isNavigationLocked: isLocked,
  };
}
