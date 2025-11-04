// /utils/auth/profile.ts - Customer Profile Management
import { supabase } from "@/lib/supabase";
import { ProfileInsert } from "@/types/supabase";
import { User } from "@supabase/supabase-js";
import { logError } from "./logError";

// ========================================================================
// إنشاء ملف العميل - ✅ يستخدم RPC الآمن
// ========================================================================
export const createCustomerProfile = async (user: User): Promise<void> => {
  console.log("🔄 createCustomerProfile called with:", {
    userId: user.id,
    email: user.email,
    phone: user.phone,
  });

  try {
    // التحقق من وجود البيانات الأساسية
    if (!user.email && !user.phone && !user.user_metadata?.phone) {
      throw new Error("العميل يجب أن يملك بريد إلكتروني أو رقم هاتف");
    }

    // استخدام RPC الآمن بدلاً من INSERT المباشر
    const { data, error } = await supabase.rpc("create_customer_profile_safe", {
      p_user_id: user.id,
      p_email: user.email || null,
      p_phone: user.phone || user.user_metadata?.phone || null,
      p_full_name: user.user_metadata?.full_name || null,
      p_age: user.user_metadata?.age ? parseInt(user.user_metadata.age) : null,
      p_gender: user.user_metadata?.gender || null,
      p_location: user.user_metadata?.location || null,
      p_user_latitude: user.user_metadata?.user_latitude
        ? parseFloat(user.user_metadata.user_latitude)
        : null,
      p_user_longitude: user.user_metadata?.user_longitude
        ? parseFloat(user.user_metadata.user_longitude)
        : null,
    });

    if (error) {
      console.error("❌ Error creating profile via RPC:", error);
      throw error;
    }

    console.log("✅ Profile created successfully:", data);
  } catch (error: any) {
    console.error("❌ createCustomerProfile failed:", error);
    logError("CREATE_CUSTOMER_PROFILE", error, {
      userId: user.id,
      email: user.email,
      phone: user.phone,
    });
    throw error;
  }
};

// ========================================================================
// تحديث ملف العميل - ✅ يستخدم RPC
// ========================================================================
export const updateCustomerProfile = async (updates: {
  full_name?: string;
  phone?: string;
  location?: string;
  age?: number;
  gender?: string;
  user_latitude?: number;
  user_longitude?: number;
}): Promise<void> => {
  try {
    console.log("🔄 Updating customer profile:", updates);

    // ✅ استخدام دالة update_user_profile (من قاعدة البيانات الأصلية)
    const { error } = await supabase.rpc("update_user_profile", {
      _full_name: updates.full_name || null,
      _phone: updates.phone || null,
      _location: updates.location || null,
      _age: updates.age || null,
      _gender: updates.gender || null,
      _user_latitude: updates.user_latitude || null,
      _user_longitude: updates.user_longitude || null,
    });

    if (error) {
      console.error("❌ Error updating profile:", error);
      throw error;
    }

    console.log("✅ Profile updated successfully");
  } catch (error) {
    console.error("❌ updateCustomerProfile failed:", error);
    logError("UPDATE_CUSTOMER_PROFILE", error, { updates });
    throw error;
  }
};

// ========================================================================
// الحصول على ملف العميل الحالي
// ========================================================================
export const getCurrentCustomerProfile = async () => {
  try {
    console.log("🔄 Fetching current customer profile");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // ✅ استخدام الدالة من قاعدة البيانات
    const { data: profile, error } = await supabase
      .rpc("get_current_user_profile")
      .single();

    if (error) {
      console.error("❌ Error fetching profile:", error);
      throw error;
    }

    if (!profile) {
      throw new Error("Profile not found");
    }

    // ✅ التحقق من أن المستخدم customer
    if (!(profile as any).is_customer) {
      throw new Error("User is not a customer");
    }

    console.log("✅ Profile fetched successfully");
    return profile;
  } catch (error) {
    console.error("❌ getCurrentCustomerProfile failed:", error);
    logError("GET_CUSTOMER_PROFILE", error);
    throw error;
  }
};

// ========================================================================
// التحقق من وجود العميل - ✅ يستخدم RPC
// ========================================================================
export const checkCustomerExists = async (
  field: "phone" | "email",
  value: string
): Promise<boolean> => {
  try {
    console.log("🔄 Checking if customer exists:", { field, value });

    // ✅ استخدام دالة check_user_exists (من قاعدة البيانات الأصلية)
    const { data, error } = await supabase.rpc("check_user_exists", {
      _column: field,
      _value: value,
    });

    if (error) {
      console.error("❌ Error checking customer existence:", error);
      throw error;
    }

    console.log("✅ Customer existence check result:", data);
    return Boolean(data);
  } catch (error) {
    console.error("❌ checkCustomerExists failed:", error);
    logError("CHECK_CUSTOMER_EXISTS", error, { field, value });
    return false;
  }
};

// ========================================================================
// الحصول على العميل برقم الجوال - ✅ يستخدم RPC
// ========================================================================
export const getCustomerByPhone = async (phone: string) => {
  try {
    console.log("🔄 Getting customer by phone:", phone);

    // ✅ استخدام دالة get_user_by_phone (من قاعدة البيانات الأصلية)
    const { data, error } = await supabase.rpc("get_user_by_phone", {
      _phone: phone,
    });

    if (error) {
      console.error("❌ Error getting customer by phone:", error);
      throw error;
    }

    console.log("✅ Customer found:", data?.[0]);
    return data?.[0] || null;
  } catch (error) {
    console.error("❌ getCustomerByPhone failed:", error);
    logError("GET_CUSTOMER_BY_PHONE", error, { phone });
    throw error;
  }
};

// ========================================================================
// التحقق من أن المستخدم عميل فقط - ✅ NEW
// ========================================================================
export const verifyUserIsCustomerOnly = async (): Promise<boolean> => {
  try {
    console.log("🔄 Verifying user is customer only");

    const { data, error } = await supabase.rpc("check_user_is_customer");

    if (error) {
      console.error("❌ Error verifying customer role:", error);
      return false;
    }

    const isCustomerOnly = Boolean(data);
    console.log("✅ User is customer only:", isCustomerOnly);

    return isCustomerOnly;
  } catch (error) {
    console.error("❌ verifyUserIsCustomerOnly failed:", error);
    return false;
  }
};

// ========================================================================
// الحصول على دور المستخدم الحالي - ✅ NEW
// ========================================================================
export const getCurrentUserRole = async (): Promise<string | null> => {
  try {
    console.log("🔄 Getting current user role");

    const { data, error } = await supabase.rpc("get_current_user_role");

    if (error) {
      console.error("❌ Error getting user role:", error);
      return null;
    }

    console.log("✅ User role:", data);
    return data;
  } catch (error) {
    console.error("❌ getCurrentUserRole failed:", error);
    return null;
  }
};

// ========================================================================
// التحقق من رقم الجوال - ✅ يستخدم RPC
// ========================================================================
export const verifyCustomerPhone = async (phone: string): Promise<string> => {
  try {
    console.log("🔄 Verifying customer phone:", phone);

    // ✅ استخدام دالة verify_user_phone (من قاعدة البيانات الأصلية)
    const { data, error } = await supabase.rpc("verify_user_phone", {
      _phone: phone,
    });

    if (error) {
      console.error("❌ Error verifying phone:", error);
      throw error;
    }

    console.log("✅ Phone verified, user_id:", data);
    return data; // يرجع user_id
  } catch (error) {
    console.error("❌ verifyCustomerPhone failed:", error);
    logError("VERIFY_CUSTOMER_PHONE", error, { phone });
    throw error;
  }
};

// ========================================================================
// إنشاء عميل برقم الجوال - ✅ يستخدم RPC
// ========================================================================
export const createCustomerWithPhone = async (
  phone: string,
  fullName?: string
): Promise<string> => {
  try {
    console.log("🔄 Creating customer with phone:", { phone, fullName });

    // ✅ استخدام دالة create_user_with_phone (من قاعدة البيانات الأصلية)
    const { data, error } = await supabase.rpc("create_user_with_phone", {
      _phone: phone,
      _full_name: fullName || null,
    });

    if (error) {
      console.error("❌ Error creating customer with phone:", error);
      throw error;
    }

    console.log("✅ Customer created, user_id:", data);
    return data; // يرجع user_id
  } catch (error) {
    console.error("❌ createCustomerWithPhone failed:", error);
    logError("CREATE_CUSTOMER_WITH_PHONE", error, { phone, fullName });
    throw error;
  }
};

// ========================================================================
// التحقق من صحة البيانات
// ========================================================================
export const validateCustomerData = (
  customerData: Partial<ProfileInsert>
): string[] => {
  const errors: string[] = [];

  if (customerData.full_name && customerData.full_name.trim().length < 2) {
    errors.push("الاسم الكامل يجب أن يحتوي على حرفين على الأقل");
  }

  if (customerData.phone) {
    const phoneRegex = /^\+?966[0-9]{9}$/;
    if (!phoneRegex.test(customerData.phone.replace(/\s/g, ""))) {
      errors.push("رقم الهاتف يجب أن يكون سعودياً صحيحاً");
    }
  }

  if (customerData.email && !customerData.email.includes("@phone.temp")) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(customerData.email)) {
      errors.push("البريد الإلكتروني غير صحيح");
    }
  }

  if (customerData.age !== null && customerData.age !== undefined) {
    if (customerData.age < 18) {
      errors.push("العمر يجب أن يكون 18 سنة أو أكثر");
    }
    if (customerData.age > 100) {
      errors.push("العمر غير صحيح");
    }
  }

  if (
    customerData.gender &&
    !["male", "female"].includes(customerData.gender)
  ) {
    errors.push("الجنس يجب أن يكون ذكر أو أنثى");
  }

  return errors;
};

// ========================================================================
// حالة التفعيل
// ========================================================================
export const getCustomerVerificationStatus = async (): Promise<{
  isVerified: boolean;
  hasDocuments: boolean;
  documentsStatus?: string;
}> => {
  try {
    console.log("🔄 Getting customer verification status");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_verified")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("status")
      .eq("user_id", user.id);

    if (documentsError) {
      throw documentsError;
    }

    const hasDocuments = documents && documents.length > 0;
    const documentsStatus = hasDocuments ? documents[0].status : undefined;

    console.log("✅ Verification status:", {
      isVerified: profile.is_verified,
      hasDocuments,
      documentsStatus,
    });

    return {
      isVerified: profile.is_verified,
      hasDocuments,
      documentsStatus,
    };
  } catch (error) {
    console.error("❌ getCustomerVerificationStatus failed:", error);
    logError("GET_CUSTOMER_VERIFICATION_STATUS", error);
    throw error;
  }
};

// ========================================================================
// تحديث الموقع
// ========================================================================
export const updateCustomerLocation = async (
  latitude: number,
  longitude: number,
  location?: string
): Promise<void> => {
  try {
    console.log("🔄 Updating customer location:", {
      latitude,
      longitude,
      location,
    });

    await updateCustomerProfile({
      user_latitude: latitude,
      user_longitude: longitude,
      location: location,
    });

    console.log("✅ Location updated successfully");
  } catch (error) {
    console.error("❌ updateCustomerLocation failed:", error);
    logError("UPDATE_CUSTOMER_LOCATION", error, {
      latitude,
      longitude,
      location,
    });
    throw error;
  }
};
