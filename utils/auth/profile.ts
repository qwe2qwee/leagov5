// /utils/auth/profile.ts - Customer Profile Management
import { supabase } from "@/lib/supabase";
import { ProfileInsert, UserRole } from "@/types/supabase";
import { User } from "@supabase/supabase-js";
import { logError } from "./logError";

export const createCustomerProfile = async (user: User): Promise<void> => {
  console.log("createCustomerProfile called with:", user);

  try {
    // التحقق من وجود البيانات الأساسية المطلوبة للعميل
    if (!user.email && !user.phone && !user.user_metadata?.phone) {
      throw new Error("العميل يجب أن يملك بريد إلكتروني أو رقم هاتف");
    }

    const customerProfileData: ProfileInsert = {
      user_id: user.id,
      email:
        user.email || `${user.phone || user.user_metadata?.phone}@phone.temp`,
      full_name: user.user_metadata?.full_name || "",
      phone: user.phone || user.user_metadata?.phone || "",
      age: user.user_metadata?.age ? parseInt(user.user_metadata.age) : null,
      gender: user.user_metadata?.gender || null,
      location: user.user_metadata?.location || null,
      password: user.user_metadata?.password || null,
      user_latitude: user.user_metadata?.user_latitude
        ? parseFloat(user.user_metadata.user_latitude)
        : null,
      user_longitude: user.user_metadata?.user_longitude
        ? parseFloat(user.user_metadata.user_longitude)
        : null,
      role: "customer" as UserRole, // دائماً عميل
      is_verified: Boolean(user.email_confirmed_at || user.phone_confirmed_at),
      branch_id: null, // العملاء لا ينتمون لفرع
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(customerProfileData, {
        onConflict: "user_id",
        ignoreDuplicates: false,
      });

    if (error) {
      // تجاهل أخطاء المفاتيح المكررة فقط
      if (
        !error.message.includes("duplicate key") &&
        !error.message.includes("profiles_email_key") &&
        !error.message.includes("profiles_phone_key")
      ) {
        throw error;
      }
    }

    console.log("ملف العميل تم إنشاؤه/تحديثه بنجاح", { userId: user.id });
  } catch (error) {
    logError("CREATE_CUSTOMER_PROFILE", error, {
      userId: user.id,
      email: user.email,
      phone: user.phone,
    });
    throw error;
  }
};

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
    // استخدام الدالة المخزنة من قاعدة البيانات
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
      throw error;
    }

    console.log("ملف العميل تم تحديثه بنجاح");
  } catch (error) {
    logError("UPDATE_CUSTOMER_PROFILE", error, { updates });
    throw error;
  }
};

export const getCurrentCustomerProfile = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("العميل غير مسجل الدخول");
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", "customer") // التأكد من أنه عميل
      .single();

    if (error) {
      throw error;
    }

    return profile;
  } catch (error) {
    logError("GET_CUSTOMER_PROFILE", error);
    throw error;
  }
};

export const checkCustomerExists = async (
  field: "phone" | "email",
  value: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("check_user_exists", {
      _column: field,
      _value: value,
    });

    if (error) {
      throw error;
    }

    return Boolean(data);
  } catch (error) {
    logError("CHECK_CUSTOMER_EXISTS", error, { field, value });
    throw error;
  }
};

export const getCustomerByPhone = async (phone: string) => {
  try {
    const { data, error } = await supabase.rpc("get_user_by_phone", {
      _phone: phone,
    });

    if (error) {
      throw error;
    }

    return data?.[0] || null;
  } catch (error) {
    logError("GET_CUSTOMER_BY_PHONE", error, { phone });
    throw error;
  }
};

export const verifyCustomerPhone = async (phone: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc("verify_user_phone", {
      _phone: phone,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    logError("VERIFY_CUSTOMER_PHONE", error, { phone });
    throw error;
  }
};

export const createCustomerWithPhone = async (
  phone: string,
  fullName?: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc("create_user_with_phone", {
      _phone: phone,
      _full_name: fullName || null,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    logError("CREATE_CUSTOMER_WITH_PHONE", error, { phone, fullName });
    throw error;
  }
};

// دالة للتحقق من صحة بيانات العميل
export const validateCustomerData = (
  customerData: Partial<ProfileInsert>
): string[] => {
  const errors: string[] = [];

  // التحقق من الاسم الكامل
  if (customerData.full_name && customerData.full_name.trim().length < 2) {
    errors.push("الاسم الكامل يجب أن يحتوي على حرفين على الأقل");
  }

  // التحقق من صحة الهاتف
  if (customerData.phone) {
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(customerData.phone)) {
      errors.push("رقم الهاتف يجب أن يحتوي على 8-15 رقم");
    }
  }

  // التحقق من صحة البريد الإلكتروني
  if (customerData.email && !customerData.email.includes("@phone.temp")) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(customerData.email)) {
      errors.push("البريد الإلكتروني غير صحيح");
    }
  }

  // التحقق من العمر (يجب أن يكون 18+ للقيادة)
  if (customerData.age !== null && customerData.age !== undefined) {
    if (customerData.age < 18) {
      errors.push("العمر يجب أن يكون 18 سنة أو أكثر");
    }
    if (customerData.age > 100) {
      errors.push("العمر غير صحيح");
    }
  }

  // التحقق من الجنس
  if (
    customerData.gender &&
    !["male", "female"].includes(customerData.gender)
  ) {
    errors.push("الجنس يجب أن يكون ذكر أو أنثى");
  }

  // التحقق من الإحداثيات الجغرافية
  if (
    customerData.user_latitude !== null &&
    customerData.user_latitude !== undefined
  ) {
    if (customerData.user_latitude < -90 || customerData.user_latitude > 90) {
      errors.push("خط العرض غير صحيح");
    }
  }

  if (
    customerData.user_longitude !== null &&
    customerData.user_longitude !== undefined
  ) {
    if (
      customerData.user_longitude < -180 ||
      customerData.user_longitude > 180
    ) {
      errors.push("خط الطول غير صحيح");
    }
  }

  return errors;
};

// دالة للحصول على حالة تفعيل العميل
export const getCustomerVerificationStatus = async (): Promise<{
  isVerified: boolean;
  hasDocuments: boolean;
  documentsStatus?: string;
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("العميل غير مسجل الدخول");
    }

    // جلب حالة التفعيل من الملف الشخصي
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_verified")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // جلب حالة الوثائق
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("status")
      .eq("user_id", user.id);

    if (documentsError) {
      throw documentsError;
    }

    const hasDocuments = documents && documents.length > 0;
    const documentsStatus = hasDocuments ? documents[0].status : undefined;

    return {
      isVerified: profile.is_verified,
      hasDocuments,
      documentsStatus,
    };
  } catch (error) {
    logError("GET_CUSTOMER_VERIFICATION_STATUS", error);
    throw error;
  }
};

// دالة لتحديث موقع العميل
export const updateCustomerLocation = async (
  latitude: number,
  longitude: number,
  location?: string
): Promise<void> => {
  try {
    await updateCustomerProfile({
      user_latitude: latitude,
      user_longitude: longitude,
      location: location,
    });

    console.log("تم تحديث موقع العميل بنجاح");
  } catch (error) {
    logError("UPDATE_CUSTOMER_LOCATION", error, {
      latitude,
      longitude,
      location,
    });
    throw error;
  }
};
