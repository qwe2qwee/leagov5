// components/AuthProvider.tsx - Provider Component with debugging

import { AuthContext } from "@/hooks/supabaseHooks/auth/context";
import { useAuthLogic } from "@/hooks/supabaseHooks/auth/useAuthLogic";
import { AuthProviderProps } from "@/types/authtyps";
import React, { useEffect } from "react";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const contextValue = useAuthLogic();

  // Debug logging لمتابعة تحديثات AuthContext
  useEffect(() => {
    console.log("🏗️ AuthProvider context update:", {
      hasSession: !!contextValue.session,
      hasUser: !!contextValue.user,
      hasProfile: !!contextValue.profile,
      loading: contextValue.loading,
      userId: contextValue.user?.id || null,
      userEmail: contextValue.user?.email || null,
      userPhone: contextValue.user?.phone || null,
      timestamp: new Date().toISOString(),
    });
  }, [
    contextValue.session,
    contextValue.user,
    contextValue.profile,
    contextValue.loading,
  ]);

  // تسجيل عند أول render
  useEffect(() => {
    console.log("🚀 AuthProvider initialized");
    return () => {
      console.log("🔄 AuthProvider cleanup");
    };
  }, []);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
