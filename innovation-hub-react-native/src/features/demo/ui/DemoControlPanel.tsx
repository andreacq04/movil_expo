// Panel «CONTROL DE DEMOSTRACIÓN»: cada botón despacha una acción real al
// reducer compartido, así que el celular y el reloj cambian a la vez. Debajo
// se describe el último evento y se lista el historial reciente.
import React from "react";
import { Text, View } from "react-native";

import { Brand, Palette } from "@/src/core/theme/brand";
import { HomeColors } from "@/src/core/theme/homeColors";
import { InkWell } from "@/src/core/ui/material";
import { IconName, MaterialIcon } from "@/src/core/ui/MaterialIcon";

import { nextCandidate, nextOpenTask, pendingCount, progressPercent, unreadCount } from "../domain/demoReducer";
import { useDemo } from "./DemoStore";

type ControlButton = {
  key: string;
  icon: IconName;
  label: string;
  hint: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "accent" | "default" | "danger";
};

function ControlTile({ b }: { b: ControlButton }) {
  const bg = b.disabled
    ? Palette.surfaceMuted
    : b.variant === "primary"
      ? Palette.primary
      : b.variant === "accent"
        ? Brand.lime
        : b.variant === "danger"
          ? Palette.errorTint
          : "#FFFFFF";
  const fg = b.disabled ? Palette.textHint : b.variant === "primary" ? "#FFFFFF" : b.variant === "danger" ? Palette.errorStrong : Palette.primary;
  return (
    <InkWell
      onPress={b.disabled ? null : b.onPress}
      borderRadius={16}
      testID={`control_${b.key}`}
      accessibilityLabel={b.label}
      accessibilityState={{ disabled: !!b.disabled }}
      style={{
        flexGrow: 1,
        flexBasis: 300,
        minHeight: 74,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 16,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: b.variant === "default" || !b.variant ? Palette.border : "transparent",
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: b.variant === "primary" ? "rgba(255,255,255,0.14)" : b.variant === "accent" ? "rgba(42,0,87,0.08)" : Palette.violetTint,
        }}
      >
        <MaterialIcon name={b.icon} size={21} color={fg} />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: fg }}>{b.label}</Text>
        <Text style={{ marginTop: 2, fontSize: 11.5, color: b.variant === "primary" ? "rgba(255,255,255,0.75)" : Palette.textSecondary }} numberOfLines={2}>
          {b.hint}
        </Text>
      </View>
    </InkWell>
  );
}

function clock(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

const TONE: Record<"success" | "info" | "warning", { bg: string; fg: string; icon: IconName }> = {
  success: { bg: Palette.limeTint, fg: Palette.primary, icon: "task_alt" },
  info: { bg: Palette.cyanTint, fg: Palette.primary, icon: "info_outline" },
  warning: { bg: Palette.errorTint, fg: Palette.errorStrong, icon: "error_outline" },
};

export function DemoControlPanel() {
  const { state, actions } = useDemo();
  const open = nextOpenTask(state.tasks);
  const candidate = nextCandidate(state);
  const last = state.events[0];

  const buttons: ControlButton[] = [
    {
      key: "complete",
      icon: "task_alt",
      label: "Completar tarea",
      hint: open ? `Completa «${open.title}» desde el celular` : "No quedan tareas abiertas",
      onPress: () => actions.completeTask(),
      disabled: !open,
      variant: "primary",
    },
    {
      key: "member",
      icon: "person_add_alt_1_outlined",
      label: "Simular nuevo integrante",
      hint: candidate ? `${candidate.name.split(" ")[0]} se une a ${state.project.name}` : "Ya se unieron todos",
      onPress: actions.addMember,
      disabled: !candidate,
      variant: "accent",
    },
    {
      key: "reminder",
      icon: "alarm",
      label: "Enviar recordatorio",
      hint: open ? "El reloj vibra con tu tarea pendiente" : "No hay tareas pendientes",
      onPress: actions.sendReminder,
      disabled: !open,
    },
    {
      key: "teammate",
      icon: "groups_outlined",
      label: "Tarea completada por otro integrante",
      hint: open ? "Un compañero termina la siguiente tarea" : "No quedan tareas abiertas",
      onPress: actions.completeTaskByTeammate,
      disabled: !open,
    },
    {
      key: "summary",
      icon: "bar_chart_rounded",
      label: "Ver resumen semanal",
      hint: "Estadísticas en el reloj y detalle en el celular",
      onPress: actions.showWeeklySummary,
    },
    {
      key: "reset",
      icon: "refresh_rounded",
      label: "Restablecer demostración",
      hint: "Vuelve a los datos iniciales",
      onPress: actions.reset,
      variant: "danger",
    },
  ];

  return (
    <View
      testID="demo_control_panel"
      style={{ width: "100%", maxWidth: 1120, alignSelf: "center", backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 1, borderColor: Palette.border, padding: 20 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: Palette.primary, alignItems: "center", justifyContent: "center" }}>
            <MaterialIcon name="tune_rounded" size={19} color={Brand.lime} />
          </View>
          <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: "800", letterSpacing: 1.2, color: Palette.primary }}>CONTROL DE DEMOSTRACIÓN</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          {[
            { k: "Avance", v: `${progressPercent(state.tasks)}%` },
            { k: "Pendientes", v: `${pendingCount(state.tasks)}` },
            { k: "Integrantes", v: `${state.members.length}` },
            { k: "Sin leer", v: `${unreadCount(state.notifications)}` },
          ].map((x) => (
            <View key={x.k} style={{ flexDirection: "row", backgroundColor: Palette.violetFaint, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ fontSize: 12, color: Palette.textSecondary }}>{`${x.k}: `}</Text>
              <Text testID={`panel_stat_${x.k}`} style={{ fontSize: 12, fontWeight: "800", color: Palette.primary }}>
                {x.v}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
        {buttons.map((b) => (
          <ControlTile key={b.key} b={b} />
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 16 }}>
        <View style={{ flexGrow: 1, flexBasis: 320 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: Palette.textSecondary, letterSpacing: 0.6 }}>ÚLTIMO EVENTO</Text>
          {last ? (
            <View
              testID="demo_last_event"
              style={{ marginTop: 8, flexDirection: "row", alignItems: "flex-start", backgroundColor: TONE[last.tone].bg, borderRadius: 14, padding: 12 }}
            >
              <MaterialIcon name={TONE[last.tone].icon} size={20} color={TONE[last.tone].fg} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ fontSize: 13.5, fontWeight: "800", color: TONE[last.tone].fg }}>{last.title}</Text>
                <Text style={{ marginTop: 2, fontSize: 12.5, lineHeight: 17, color: HomeColors.textPrimary }}>{last.description}</Text>
              </View>
              <Text style={{ fontSize: 11, color: Palette.textSecondary, marginLeft: 6 }}>{clock(last.createdAt)}</Text>
            </View>
          ) : (
            <View style={{ marginTop: 8, backgroundColor: Palette.surfaceMuted, borderRadius: 14, padding: 12 }}>
              <Text style={{ fontSize: 12.5, color: Palette.textSecondary }}>
                Aún no ocurre ningún evento. Pulsa un botón o interactúa con el celular o el reloj.
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexGrow: 1, flexBasis: 260 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: Palette.textSecondary, letterSpacing: 0.6 }}>HISTORIAL</Text>
          <View style={{ marginTop: 8 }}>
            {state.events.length <= 1 ? (
              <Text style={{ fontSize: 12, color: Palette.textMuted }}>Aquí aparecerán los eventos anteriores.</Text>
            ) : (
              state.events.slice(1, 5).map((e) => (
                <View key={e.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: e.tone === "warning" ? Palette.error : Palette.secondary }} />
                  <Text style={{ flex: 1, marginLeft: 8, fontSize: 12, color: Palette.textPrimary }} numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: Palette.textMuted }}>{clock(e.createdAt)}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
