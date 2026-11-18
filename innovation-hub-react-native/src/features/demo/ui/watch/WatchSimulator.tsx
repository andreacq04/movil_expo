// Smartwatch simulado: caja circular con bisel, correa superior e inferior,
// corona (vuelve al inicio) y botón lateral (abre notificaciones). Al llegar
// una notificación el reloj «vibra» y muestra la alerta a pantalla completa
// unos segundos; luego vuelve a la vista en la que estaba.
import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

import { Brand, Palette } from "@/src/core/theme/brand";
import { boxShadow } from "@/src/core/theme/shadow";
import { withAlpha } from "@/src/core/theme/homeColors";
import { InkWell } from "@/src/core/ui/material";

import { WatchRoute } from "../../domain/demoModels";
import { useDemo } from "../DemoStore";
import { WatchAlert, WatchDetail, WatchHome, WatchNotifications, WatchSummary } from "./WatchScreens";

const CASE = 300;
const SCREEN = 262;
const STRAP_W = 156;
const STRAP_H = 120;
export const WATCH_WIDTH = CASE + 30;
export const WATCH_HEIGHT = CASE + STRAP_H * 2 - 40;

function Strap({ position }: { position: "top" | "bottom" }) {
  const top = position === "top";
  return (
    <View
      style={{
        width: STRAP_W,
        height: STRAP_H,
        backgroundColor: Brand.purple,
        borderTopLeftRadius: top ? 26 : 8,
        borderTopRightRadius: top ? 26 : 8,
        borderBottomLeftRadius: top ? 8 : 26,
        borderBottomRightRadius: top ? 8 : 26,
        marginTop: top ? 0 : -20,
        marginBottom: top ? -20 : 0,
        alignItems: "center",
        justifyContent: top ? "flex-start" : "flex-end",
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: "#3B1670",
      }}
    >
      {/* Costura y agujeros de la correa */}
      <View style={{ position: "absolute", left: 10, right: 10, top: 8, bottom: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(205,178,254,0.18)", borderStyle: "dashed" }} />
      {!top ? (
        <View style={{ gap: 10, alignItems: "center" }}>
          {[0, 1, 2].map((k) => (
            <View key={k} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: "#12002A" }} />
          ))}
        </View>
      ) : (
        <View style={{ width: 40, height: 6, borderRadius: 3, backgroundColor: withAlpha(Brand.lime, 0.85) }} />
      )}
    </View>
  );
}

function CurrentView({ route }: { route: WatchRoute }) {
  switch (route.name) {
    case "home":
      return <WatchHome />;
    case "notifications":
      return <WatchNotifications index={route.index} />;
    case "detail":
      return <WatchDetail notificationId={route.notificationId} />;
    case "summary":
      return <WatchSummary />;
  }
}

export function WatchSimulator({ scale = 1 }: { scale?: number }) {
  const { state, actions } = useDemo();
  const shake = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  // Vibración + halo cuando llega una alerta; se cierra sola a los 5 s.
  useEffect(() => {
    if (!state.watchAlertId) return;
    shake.setValue(0);
    glow.setValue(1);
    Animated.sequence(
      [8, -8, 6, -6, 3, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, easing: Easing.linear, useNativeDriver: false })),
    ).start();
    Animated.timing(glow, { toValue: 0, duration: 2600, useNativeDriver: false }).start();
    const timer = setTimeout(() => actions.dismissWatchAlert(), 5000);
    return () => clearTimeout(timer);
  }, [state.watchAlertId]); // eslint-disable-line react-hooks/exhaustive-deps

  const glowColor = glow.interpolate({ inputRange: [0, 1], outputRange: ["rgba(217,255,77,0)", "rgba(217,255,77,0.9)"] });

  return (
    <View
      style={{ width: WATCH_WIDTH * scale, height: WATCH_HEIGHT * scale, alignItems: "center", justifyContent: "center" }}
      testID="watch_simulator"
      accessibilityLabel="Smartwatch simulado"
    >
      <Animated.View style={{ width: WATCH_WIDTH, height: WATCH_HEIGHT, alignItems: "center", transform: [{ scale }, { translateX: shake }] }}>
        <Strap position="top" />
        <View style={{ width: CASE, height: CASE, alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          {/* Corona y botón lateral */}
          <InkWell
            onPress={() => actions.watchNavigate({ name: "home" })}
            borderRadius={6}
            accessibilityLabel="Corona: volver a la pantalla principal"
            testID="watch_crown"
            style={{ position: "absolute", right: -12, top: CASE / 2 - 50, width: 20, height: 40, borderRadius: 6, backgroundColor: "#3B1670", borderWidth: 1, borderColor: Palette.violetSoft }}
          >
            <View style={{ flex: 1, justifyContent: "space-evenly", paddingHorizontal: 4 }}>
              {[0, 1, 2, 3, 4].map((k) => (
                <View key={k} style={{ height: 1.5, backgroundColor: "rgba(205,178,254,0.6)" }} />
              ))}
            </View>
          </InkWell>
          <InkWell
            onPress={() => actions.watchNavigate({ name: "notifications", index: 0 })}
            borderRadius={5}
            accessibilityLabel="Botón lateral: abrir notificaciones"
            testID="watch_side_button"
            style={{ position: "absolute", right: -9, top: CASE / 2 + 12, width: 14, height: 34, borderRadius: 5, backgroundColor: Brand.violet }}
          />
          {/* Caja con bisel */}
          <Animated.View
            style={[
              {
                width: CASE,
                height: CASE,
                borderRadius: CASE / 2,
                backgroundColor: "#1E0A3C",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: glowColor,
              },
              boxShadow({ color: withAlpha(Palette.shadow, 0.45), blur: 40, dy: 18 }),
            ]}
          >
            <View style={{ width: CASE - 18, height: CASE - 18, borderRadius: (CASE - 18) / 2, backgroundColor: "#0B0016", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#3B1670" }}>
              {/* Pantalla circular */}
              <View
                style={{ width: SCREEN, height: SCREEN, borderRadius: SCREEN / 2, overflow: "hidden", backgroundColor: "#120024" }}
                testID="watch_screen"
              >
                {state.watchAlertId ? <WatchAlert notificationId={state.watchAlertId} /> : <CurrentView route={state.watch} />}
              </View>
            </View>
          </Animated.View>
        </View>
        <Strap position="bottom" />
      </Animated.View>
    </View>
  );
}
