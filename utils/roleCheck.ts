// utils/auth/roleCheck.ts - Customer Role Verification
import { supabase } from "@/lib/supabase";
import { getCurrentUserRole, verifyUserIsCustomerOnly } from "./auth/profile";

/**
 * التحقق من أن المستخدم الحالي هو عميل فقط
 * @returns true إذا كان المستخدم عميل فقط
 */
export const ensureCustomerRole = async (): Promise<boolean> => {
  try {
    console.log("🔍 Checking if user is customer only...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("❌ No user found");
      return false;
    }

    // استخدام RPC للتحقق
    const isCustomerOnly = await verifyUserIsCustomerOnly();

    if (!isCustomerOnly) {
      console.log("❌ User is not a customer or has multiple roles");
      return false;
    }

    console.log("✅ User verified as customer only");
    return true;
  } catch (error) {
    console.error("❌ Error in ensureCustomerRole:", error);
    return false;
  }
};

/**
 * منع الوصول لغير العملاء وتسجيل الخروج التلقائي
 */
export const blockNonCustomers = async (): Promise<void> => {
  try {
    console.log("🚫 Blocking non-customers...");

    const isCustomer = await ensureCustomerRole();

    if (!isCustomer) {
      console.log("⚠️ Non-customer detected, signing out...");

      // تسجيل خروج تلقائي
      await supabase.auth.signOut();

      throw new Error("الوصول مرفوض: هذا التطبيق للعملاء فقط");
    }

    console.log("✅ Access granted: User is a customer");
  } catch (error) {
    console.error("❌ Error in blockNonCustomers:", error);
    throw error;
  }
};

/**
 * الحصول على دور المستخدم الحالي
 */
export const getUserRole = async (): Promise<string | null> => {
  try {
    const role = await getCurrentUserRole();
    return role;
  } catch (error) {
    console.error("❌ Error getting user role:", error);
    return null;
  }
};

/**
 * التحقق من دور معين
 */
export const hasRole = async (requiredRole: string): Promise<boolean> => {
  try {
    const currentRole = await getUserRole();
    return currentRole === requiredRole;
  } catch (error) {
    console.error("❌ Error checking role:", error);
    return false;
  }
};
