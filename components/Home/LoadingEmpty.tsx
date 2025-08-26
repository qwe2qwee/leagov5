// -------------------------------------------------------------
// components/Home/LoadingEmpty.tsx
import React from "react";
import { Text, View } from "react-native";
import SkeletonLoader from "../Search/SkeletonLoader";

type Props = {
  loading?: boolean;
  text?: string;
};

export default function LoadingEmpty({ loading = false, text = "" }: Props) {
  if (loading) {
    return <SkeletonLoader />;
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {text ? (
        <Text style={{ marginTop: 12, fontSize: 16, textAlign: "center" }}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}
