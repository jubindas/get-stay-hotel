import { getFullImageUrl } from "@/utils/image";
import { useState } from "react";
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native";

export function PropertyBannerImage({
  uri,
  style,
}: {
  uri: string;
  style?: StyleProp<ImageStyle>;
}) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Image
      source={{ uri: imgErr ? getFullImageUrl(null) : uri }}
      style={[styles.mainImage, style]}
      onError={() => setImgErr(true)}
    />
  );
}

export function RoomThumbImage({
  uri,
  style,
}: {
  uri: string;
  style?: StyleProp<ImageStyle>;
}) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Image
      source={{ uri: imgErr ? getFullImageUrl(null) : uri }}
      style={[styles.roomThumbImage, style]}
      onError={() => setImgErr(true)}
    />
  );
}

const styles = StyleSheet.create({
  mainImage: {
    width: "100%",
    height: 280,
    resizeMode: "cover",
  },
  roomThumbImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
    resizeMode: "cover",
  },
});
