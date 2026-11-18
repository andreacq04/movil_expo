// Página de la exposición: encabezado con el logo, los dos dispositivos lado a
// lado (celular a la izquierda, smartwatch a la derecha) unidos por el
// indicador de sincronización y, debajo, el panel de control.
//
// Se abre en Expo Web en http://localhost:8081/demo (ver App.tsx y
// DEMO_MULTIDISPOSITIVO.md). No usa Roble, ni sesión, ni la navegación de la app.
import React, { useEffect, useRef } from "react";
import { Animated, Easing, ScrollView, Text, useWindowDimensions, View } from "react-native";

import { Brand, Palette } from "@/src/core/theme/brand";
import { BrandGradientBox } from "@/src/core/widgets/BrandGradientBox";
import { BrandLogo } from "@/src/core/widgets/BrandLogo";
import { IconName, MaterialIcon } from "@/src/core/ui/MaterialIcon";

import { DemoState } from "../domain/demoModels";
import { DemoControlPanel } from "./DemoControlPanel";
import { DemoProvider, useDemo } from "./DemoStore";
import { PHONE_HEIGHT, PHONE_WIDTH, PhoneSimulator } from "./phone/PhoneSimulator";
import { WATCH_HEIGHT, WATCH_WIDTH, WatchSimulator } from "./watch/WatchSimulator";

function LiveIndicator() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: false }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });
  return (
    <View
      testID="demo_live_indicator"
      accessibilityLabel="Simulación activa"
      style={{ flexDirection: "row", alignItems: "center", backgroundColor: Palette.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
    >
      <View style={{ width: 10, height: 10, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={{ position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: Brand.lime, opacity, transform: [{ scale }] }} />
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Brand.lime }} />
      </View>
      <Text style={{ marginLeft: 8, color: "#FFFFFF", fontSize: 12.5, fontWeight: "700" }}>Simulación activa</Text>
    </View>
  );
}

function Header({ compact }: { compact: boolean }) {
  return (
    <View
      style={{
        width: "100%",
        maxWidth: 1120,
        alignSelf: "center",
        flexDirection: compact ? "column" : "row",
        alignItems: compact ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
        <BrandLogo variant="full" size={compact ? 120 : 150} />
        <View style={{ width: 1, height: 44, backgroundColor: Palette.border, marginHorizontal: 18 }} />
        <View style={{ flexShrink: 1 }}>
          <Text style={{ fontSize: compact ? 22 : 28, fontWeight: "800", color: Palette.primary }}>Experiencia multidispositivo</Text>
          <Text style={{ marginTop: 2, fontSize: compact ? 13 : 15, color: Palette.textSecondary }}>
            Conectando tu proyecto desde el móvil hasta tu smartwatch
          </Text>
        </View>
      </View>
      <LiveIndicator />
    </View>
  );
}

/** Indicador central: el estado compartido que conecta ambos dispositivos. */
function SyncBridge({ vertical }: { vertical: boolean }) {
  const { state } = useDemo();
  const flow = useRef(new Animated.Value(0)).current;
  const lastId = state.events[0]?.id;
  useEffect(() => {
    if (!lastId) return;
    flow.setValue(0);
    Animated.timing(flow, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }).start();
  }, [lastId, flow]);
  const travel = flow.interpolate({ inputRange: [0, 1], outputRange: [0, vertical ? 60 : 120] });
  const opacity = flow.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] });
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: vertical ? 0 : 6, paddingVertical: vertical ? 6 : 0 }}>
      <View style={{ width: vertical ? 4 : 140, height: vertical ? 70 : 4, borderRadius: 2, backgroundColor: Palette.violetTint, overflow: "visible" }}>
        <Animated.View
          style={{
            position: "absolute",
            left: vertical ? -4 : 0,
            top: vertical ? 0 : -4,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: Brand.lime,
            borderWidth: 2,
            borderColor: Brand.violet,
            opacity,
            transform: vertical ? [{ translateY: travel }] : [{ translateX: travel }],
          }}
        />
      </View>
      <View style={{ marginTop: 10, alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, paddingVertical: 8 }}>
        <MaterialIcon name="refresh_rounded" size={18} color={Palette.secondary} />
        <Text style={{ fontSize: 11, fontWeight: "700", color: Palette.primary, marginTop: 2 }}>Estado compartido</Text>
        <Text style={{ fontSize: 10, color: Palette.textMuted }}>sincronizado en tiempo real</Text>
      </View>
    </View>
  );
}

function DeviceCaption({ icon, title, subtitle }: { icon: IconName; title: string; subtitle: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14 }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: Palette.violetTint, alignItems: "center", justifyContent: "center" }}>
        <MaterialIcon name={icon} size={16} color={Palette.primary} />
      </View>
      <View style={{ marginLeft: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: "800", color: Palette.primary }}>{title}</Text>
        <Text style={{ fontSize: 11.5, color: Palette.textSecondary }}>{subtitle}</Text>
      </View>
    </View>
  );
}

function DemoContent() {
  const { width, height } = useWindowDimensions();
  const wide = width >= 900;
  // En pantallas anchas ambos dispositivos se escalan para caber a lo alto;
  // en pantallas angostas se apilan y se escalan para caber a lo ancho.
  const widthFit = (width - 240) / (PHONE_WIDTH + WATCH_WIDTH + 180);
  const phoneScale = wide
    ? Math.max(0.72, Math.min(1, (height - 190) / PHONE_HEIGHT, widthFit))
    : Math.min(1, (width - 32) / PHONE_WIDTH);
  const watchScale = wide
    ? Math.max(0.72, Math.min(1, (height - 190) / WATCH_HEIGHT, widthFit))
    : Math.min(1, (width - 32) / WATCH_WIDTH);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: wide ? 28 : 16, gap: wide ? 26 : 18 }}>
      <Header compact={!wide} />

      <BrandGradientBox
        strength={0.16}
        style={{
          width: "100%",
          maxWidth: 1120,
          alignSelf: "center",
          borderRadius: 28,
          paddingVertical: wide ? 26 : 18,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: Palette.border,
        }}
      >
        <View style={{ flexDirection: wide ? "row" : "column", alignItems: "center", justifyContent: "center", gap: wide ? 24 : 12 }}>
          <View style={{ alignItems: "center" }}>
            <PhoneSimulator scale={phoneScale} />
            <DeviceCaption icon="folder_shared_outlined" title="Celular · App Proyéctate" subtitle="Gestión completa del proyecto" />
          </View>
          <SyncBridge vertical={!wide} />
          <View style={{ alignItems: "center" }}>
            <WatchSimulator scale={watchScale} />
            <DeviceCaption icon="schedule" title="Smartwatch · Vista adaptada" subtitle="Información esencial y alertas" />
          </View>
        </View>
      </BrandGradientBox>

      <DemoControlPanel />

      <Text style={{ textAlign: "center", fontSize: 11.5, color: Palette.textMuted, paddingBottom: 8 }}>
        Demostración con datos ficticios en memoria · No se conecta a Roble ni modifica datos reales
      </Text>
    </ScrollView>
  );
}

export function DemoPage({ initialState }: { initialState?: DemoState }) {
  useEffect(() => {
    if (typeof document !== "undefined") document.title = "Proyéctate · Experiencia multidispositivo";
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: Palette.background }} testID="demo_page">
      <DemoProvider initialState={initialState}>
        <DemoContent />
      </DemoProvider>
    </View>
  );
}
