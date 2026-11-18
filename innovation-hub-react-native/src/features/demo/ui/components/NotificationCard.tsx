// Tarjeta de notificación de la demo. La variante «phone» replica el estilo de
// NotificationTile de la app (mismos radios, colores, tamaños y punto de «sin
// leer»); la variante «watch» la adapta al reloj: fondo oscuro, icono grande,
// texto centrado y como mucho tres líneas para no salirse del círculo.
import React from "react";
import { Text, View } from "react-native";

import { Brand, Palette } from "@/src/core/theme/brand";
import { Colors, HomeColors } from "@/src/core/theme/homeColors";
import { InkWell } from "@/src/core/ui/material";
import { MaterialIcon } from "@/src/core/ui/MaterialIcon";
import { timeAgo } from "@/src/core/utils/timeAgo";

import { DemoNotification } from "../../domain/demoModels";
import { NOTIFICATION_ICONS, WATCH_KIND_COLORS } from "./demoBits";

type Props = {
  notification: DemoNotification;
  now: Date;
  onPress?: () => void;
  variant?: "phone" | "watch";
};

export function NotificationCard({ notification: n, now, onPress, variant = "phone" }: Props) {
  if (variant === "watch") {
    const k = WATCH_KIND_COLORS[n.kind];
    return (
      <InkWell
        onPress={onPress}
        borderRadius={22}
        testID={`watch_notification_${n.id}`}
        accessibilityLabel={`${n.read ? "" : "Sin leer: "}${n.title}. ${n.message}`}
        style={{ alignItems: "center", paddingHorizontal: 6, paddingVertical: 4, width: 200 }}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: k.bg, alignItems: "center", justifyContent: "center" }}>
          <MaterialIcon name={NOTIFICATION_ICONS[n.kind]} size={24} color={k.fg} />
          {!n.read ? (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 11,
                height: 11,
                borderRadius: 6,
                backgroundColor: Brand.lime,
                borderWidth: 2,
                borderColor: "#120024",
              }}
            />
          ) : null}
        </View>
        <Text style={{ marginTop: 6, color: "#FFFFFF", fontWeight: "700", fontSize: 13.5, textAlign: "center" }} numberOfLines={1}>
          {n.title}
        </Text>
        <Text style={{ marginTop: 2, color: "rgba(255,255,255,0.78)", fontSize: 12, textAlign: "center", lineHeight: 15 }} numberOfLines={3}>
          {n.message}
        </Text>
        <Text style={{ marginTop: 4, color: Brand.cyan, fontSize: 10.5 }}>{timeAgo(n.createdAt, now)}</Text>
      </InkWell>
    );
  }

  return (
    <InkWell
      onPress={onPress}
      borderRadius={14}
      testID={`phone_notification_${n.id}`}
      accessibilityLabel={`${n.read ? "" : "Sin leer: "}${n.title}`}
      style={{
        padding: 12,
        backgroundColor: n.read ? Colors.white : Palette.violetFaint,
        borderWidth: 1,
        borderColor: HomeColors.borderGrey,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          backgroundColor: HomeColors.navSelectedBackground,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialIcon name={NOTIFICATION_ICONS[n.kind]} color={HomeColors.primaryPurple} size={19} />
      </View>
      <View style={{ width: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "bold", fontSize: 13, color: HomeColors.textPrimary }}>{n.title}</Text>
        <Text style={{ marginTop: 2, fontSize: 12, color: HomeColors.textSecondary, lineHeight: 15.5 }}>{n.message}</Text>
        <Text style={{ marginTop: 4, fontSize: 11, color: HomeColors.textSecondary }}>{timeAgo(n.createdAt, now)}</Text>
      </View>
      {!n.read ? <View style={{ width: 8, height: 8, marginLeft: 6, marginTop: 4, borderRadius: 4, backgroundColor: Palette.secondary }} /> : null}
    </InkWell>
  );
}
