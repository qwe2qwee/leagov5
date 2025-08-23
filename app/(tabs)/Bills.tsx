import { SafeAreaView } from "@/components/SafeAreaView";
import CustomButton from "@/components/ui/CustomButton";
import { useAuth } from "@/hooks/supabaseHooks/auth/context";
import { useSafeNavigate } from "@/utils/useSafeNavigate";
import { StyleSheet, Text, View } from "react-native";

const Bills = () => {
  const { push } = useSafeNavigate();
  const { signOut, user, session, profile, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/* Auth Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>حالة تسجيل الدخول:</Text>
          <Text
            style={[
              styles.statusText,
              user ? styles.loggedIn : styles.loggedOut,
            ]}
          >
            {user ? "مسجل دخول ✅" : "غير مسجل دخول ❌"}
          </Text>
        </View>

        {/* User Info */}
        {user && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoTitle}>معلومات المستخدم:</Text>
            <Text style={styles.userInfo}>ID: {user.id}</Text>
            <Text style={styles.userInfo}>
              Email: {user.email || "غير محدد"}
            </Text>
            <Text style={styles.userInfo}>
              Phone: {user.phone || profile?.phone || "غير محدد"}
            </Text>
            <Text style={styles.userInfo}>
              Phone Confirmed: {user.phone_confirmed_at ? "نعم ✅" : "لا ❌"}
            </Text>
            <Text style={styles.userInfo}>
              Email Confirmed: {user.email_confirmed_at ? "نعم ✅" : "لا ❌"}
            </Text>
            <Text style={styles.userInfo}>
              Profile Verified: {profile?.is_verified ? "نعم ✅" : "لا ❌"}
            </Text>
            <Text style={styles.userInfo}>
              Created: {new Date(user.created_at).toLocaleDateString("ar-SA")}
            </Text>
          </View>
        )}

        {/* Session Info */}
        {session && (
          <View style={styles.sessionContainer}>
            <Text style={styles.sessionTitle}>معلومات الجلسة:</Text>
            <Text style={styles.sessionInfo}>
              Access Token: {session.access_token ? "موجود ✅" : "غير موجود ❌"}
            </Text>
            <Text style={styles.sessionInfo}>
              Expires:{" "}
              {new Date(session.expires_at ?? 0 * 1000).toLocaleString("ar-SA")}
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Go to Profile"
            onPress={() => push("/(auth)/sign-up")}
          />

          <CustomButton
            title="تسجيل خروج"
            onPress={async () => await signOut()}
          />

          {!user && (
            <CustomButton
              title="تسجيل دخول"
              onPress={() => push("/(auth)/sign-in")}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    color: "#666",
    marginTop: 50,
  },
  statusContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loggedIn: {
    color: "#28a745",
  },
  loggedOut: {
    color: "#dc3545",
  },
  userInfoContainer: {
    backgroundColor: "#e8f5e8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#155724",
    marginBottom: 10,
    textAlign: "center",
  },
  userInfo: {
    fontSize: 14,
    color: "#155724",
    marginBottom: 5,
    textAlign: "right",
  },
  sessionContainer: {
    backgroundColor: "#fff3cd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 10,
    textAlign: "center",
  },
  sessionInfo: {
    fontSize: 14,
    color: "#856404",
    marginBottom: 5,
    textAlign: "right",
  },
  buttonContainer: {
    gap: 10,
  },
});

export default Bills;
