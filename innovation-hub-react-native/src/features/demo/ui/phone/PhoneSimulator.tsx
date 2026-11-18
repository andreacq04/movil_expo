// Celular simulado: marco con esquinas redondeadas, isla dinámica, botones
// laterales, barra de estado y, dentro, la app Proyéctate simplificada. Todo
// lo que se ve sale del estado compartido (useDemo), así que cualquier evento
// del reloj o del panel se refleja aquí al instante.
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import { Brand, Palette } from "@/src/core/theme/brand";
import { boxShadow } from "@/src/core/theme/shadow";
import { Colors, HomeColors, withAlpha } from "@/src/core/theme/homeColors";
import { InkWell } from "@/src/core/ui/material";
import { IconName, MaterialIcon } from "@/src/core/ui/MaterialIcon";

import { PhoneRoute } from "../../domain/demoModels";
import { unreadCount } from "../../domain/demoReducer";
import { NOTIFICATION_ICONS } from "../components/demoBits";
import { useDemo } from "../DemoStore";
import { ActivityScreen, NotificationsScreen, ProjectScreen, ProjectsScreen, SummaryScreen, TaskScreen } from "./PhoneScreens";

export const PHONE_WIDTH = 340;
export const PHONE_HEIGHT = 700;
const BEZEL = 11;

function clock(now: Date): string {
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function StatusBar({ now }: { now: Date }) {
  return (
    <View style={{ height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 26 }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: Palette.primary }}>{clock(now)}</Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 1.5 }}>
          {[4, 6, 8, 10].map((h) => (
            <View key={h} style={{ width: 3, height: h, borderRadius: 1, backgroundColor: Palette.primary }} />
          ))}
        </View>
        <Text style={{ fontSize: 10, fontWeight: "700", color: Palette.primary, lineHeight: 11 }}>5G</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 22, height: 11, borderRadius: 3, borderWidth: 1.2, borderColor: Palette.primary, padding: 1.2 }}>
            <View style={{ width: "78%", height: "100%", borderRadius: 1.5, backgroundColor: Palette.primary }} />
          </View>
          <View style={{ width: 1.5, height: 4, marginLeft: 1, borderRadius: 1, backgroundColor: Palette.primary }} />
        </View>
      </View>
    </View>
  );
}

const NAV: { icon: IconName; label: string; route: PhoneRoute; matches: PhoneRoute["name"][] }[] = [
  { icon: "folder_shared_outlined", label: "Mis proyectos", route: { name: "projects" }, matches: ["projects", "project", "task", "activity"] },
  { icon: "notifications_none", label: "Notificaciones", route: { name: "notifications" }, matches: ["notifications"] },
  { icon: "bar_chart_rounded", label: "Resumen", route: { name: "summary" }, matches: ["summary"] },
];

/** Misma barra inferior que HomeBottomNavigation (pastilla violeta, punto limón de «sin leer»). */
function BottomNav() {
  const { state, actions } = useDemo();
  const hasUnread = unreadCount(state.notifications) > 0;
  return (
    <View
      style={[
        {
          paddingTop: 8,
          paddingBottom: 18,
          backgroundColor: Colors.white,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          flexDirection: "row",
          justifyContent: "space-evenly",
        },
        boxShadow({ color: withAlpha(Palette.shadow, 0.08), blur: 16, dy: -2 }),
      ]}
    >
      {NAV.map((tab) => {
        const selected = tab.matches.includes(state.phone.name);
        const showDot = tab.route.name === "notifications" && hasUnread;
        return (
          <InkWell
            key={tab.label}
            onPress={() => actions.phoneNavigate(tab.route)}
            borderRadius={22}
            testID={`phone_nav_${tab.route.name}`}
            accessibilityLabel={showDot ? `${tab.label}, tienes notificaciones sin leer` : tab.label}
            accessibilityState={{ selected }}
            style={{ alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 22, backgroundColor: selected ? HomeColors.navSelectedBackground : "transparent" }}
          >
            <View>
              <MaterialIcon name={tab.icon} size={24} color={HomeColors.primaryPurple} />
              {showDot ? (
                <View
                  testID="phone_unread_dot"
                  style={{
                    position: "absolute",
                    top: -1,
                    right: -2,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: Palette.accent,
                    borderWidth: 1.5,
                    borderColor: Palette.primary,
                  }}
                />
              ) : null}
            </View>
            <Text style={{ fontSize: 9.5, marginTop: 2, color: HomeColors.primaryPurple, fontWeight: selected ? "700" : "500" }}>{tab.label}</Text>
          </InkWell>
        );
      })}
    </View>
  );
}

/** Banner de notificación «push» que baja desde arriba cuando ocurre un evento. */
function PushBanner() {
  const { state, actions, now } = useDemo();
  const n = state.notifications.find((x) => x.id === state.phoneBannerId);
  const slide = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (!n) return;
    slide.setValue(-120);
    Animated.spring(slide, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
    const timer = setTimeout(() => {
      Animated.timing(slide, { toValue: -120, duration: 220, useNativeDriver: false }).start(() => actions.dismissPhoneBanner());
    }, 4200);
    return () => clearTimeout(timer);
  }, [n?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!n) return null;
  return (
    <Animated.View style={{ position: "absolute", top: 44, left: 10, right: 10, transform: [{ translateY: slide }], zIndex: 20 }}>
      <InkWell
        onPress={() => actions.openOnPhone(n.id)}
        borderRadius={18}
        testID="phone_push_banner"
        accessibilityLabel={`Notificación: ${n.title}. ${n.message}`}
        style={[
          { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.97)", borderWidth: 1, borderColor: Palette.border },
          boxShadow({ color: withAlpha(Palette.shadow, 0.18), blur: 22, dy: 6 }),
        ]}
      >
        <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: Brand.purple, alignItems: "center", justifyContent: "center" }}>
          <MaterialIcon name={NOTIFICATION_ICONS[n.kind]} size={19} color={Brand.lime} />
        </View>
        <View style={{ flex: 1, marginLeft: 9 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 10.5, fontWeight: "700", color: Palette.textSecondary, letterSpacing: 0.4 }}>PROYÉCTATE</Text>
            <Text style={{ fontSize: 10, color: Palette.textMuted }}>{now.getTime() - n.createdAt.getTime() < 60_000 ? "ahora" : ""}</Text>
          </View>
          <Text style={{ fontSize: 12.5, fontWeight: "700", color: Palette.primary }} numberOfLines={1}>
            {n.title}
          </Text>
          <Text style={{ fontSize: 11.5, color: Palette.textSecondary }} numberOfLines={1}>
            {n.message}
          </Text>
        </View>
      </InkWell>
    </Animated.View>
  );
}

function CurrentScreen({ route }: { route: PhoneRoute }) {
  switch (route.name) {
    case "projects":
      return <ProjectsScreen />;
    case "project":
      return <ProjectScreen tab={route.tab} />;
    case "task":
      return <TaskScreen taskId={route.taskId} />;
    case "activity":
      return <ActivityScreen activityId={route.activityId} />;
    case "notifications":
      return <NotificationsScreen />;
    case "summary":
      return <SummaryScreen />;
  }
}

export function PhoneSimulator({ scale = 1 }: { scale?: number }) {
  const { state, now } = useDemo();
  return (
    <View
      style={{ width: PHONE_WIDTH * scale, height: PHONE_HEIGHT * scale, alignItems: "center", justifyContent: "center" }}
      testID="phone_simulator"
      accessibilityLabel="Celular simulado con la app Proyéctate"
    >
      <View style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT, transform: [{ scale }] }}>
        {/* Botones laterales */}
        <View style={{ position: "absolute", left: -3, top: 120, width: 4, height: 30, borderRadius: 2, backgroundColor: "#24104A" }} />
        <View style={{ position: "absolute", left: -3, top: 166, width: 4, height: 54, borderRadius: 2, backgroundColor: "#24104A" }} />
        <View style={{ position: "absolute", left: -3, top: 228, width: 4, height: 54, borderRadius: 2, backgroundColor: "#24104A" }} />
        <View style={{ position: "absolute", right: -3, top: 180, width: 4, height: 80, borderRadius: 2, backgroundColor: "#24104A" }} />
        {/* Marco */}
        <View
          style={[
            { flex: 1, borderRadius: 52, backgroundColor: "#150030", padding: BEZEL, borderWidth: 2, borderColor: "#3B1670" },
            boxShadow({ color: withAlpha(Palette.shadow, 0.35), blur: 50, dy: 24 }, { color: withAlpha(Brand.violet, 0.25), blur: 2, spread: 1 }),
          ]}
        >
          {/* Pantalla */}
          <View style={{ flex: 1, borderRadius: 42, overflow: "hidden", backgroundColor: Palette.background }}>
            <StatusBar now={now} />
            {/* Isla dinámica */}
            <View style={{ position: "absolute", top: 10, alignSelf: "center", width: 96, height: 26, borderRadius: 14, backgroundColor: "#000000", zIndex: 30 }} />
            <View style={{ flex: 1 }}>
              <CurrentScreen route={state.phone} />
            </View>
            <BottomNav />
            <View style={{ position: "absolute", bottom: 6, alignSelf: "center", width: 110, height: 4, borderRadius: 2, backgroundColor: Palette.primary, opacity: 0.85 }} />
            <PushBanner />
          </View>
        </View>
      </View>
    </View>
  );
}
