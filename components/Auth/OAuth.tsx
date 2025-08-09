import React from "react";
import { StyleSheet, Text, View } from "react-native";

const OAuth = () => {
  const handleGoogle = () => {
    console.log("Sign in with Google");
    // Add your Google OAuth logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* <TouchableOpacity style={styles.googleButton} onPress={handleGoogle}>
        <Image
          source={require('./assets/google-icon.png')} // Replace with your Google icon path
          style={styles.googleIcon}
          resizeMode="contain"
        />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dividerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#94a3b8", // slate-400
  },
  orText: {
    color: "#f1f5f9", // general-100 equivalent
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 12,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
});

export default OAuth;
