// Resumen semanal. Los números salen SIEMPRE del selector `weeklySummary`
// (estado compartido), así que el reloj y el celular nunca muestran cifras
// distintas. «watch»: cuatro cifras alrededor del anillo; «phone»: detalle
// completo con avance por tarea y aportes por integrante.
import React from "react";
import { Text, View } from "react-native";

import { Brand, Palette } from "@/src/core/theme/brand";
import { HomeColors } from "@/src/core/theme/homeColors";
import { LinearProgressIndicator } from "@/src/core/ui/material";
import { IconName, MaterialIcon } from "@/src/core/ui/MaterialIcon";

import { DemoState } from "../../domain/demoModels";
import { firstName, weeklySummary } from "../../domain/demoReducer";
import { MemberAvatar, ProgressRing, TaskStatusChip } from "./demoBits";

function WatchStat({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <View style={{ alignItems: "center", width: 74 }}>
      <Text style={{ color, fontSize: 20, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function PhoneStat({ icon, value, label, bg }: { icon: IconName; value: number | string; label: string; bg: string }) {
  return (
    <View style={{ flexBasis: "47%", flexGrow: 1, backgroundColor: bg, borderRadius: 14, padding: 12 }}>
      <MaterialIcon name={icon} size={18} color={Palette.primary} />
      <Text testID={`summary_${label}`} style={{ marginTop: 6, fontSize: 22, fontWeight: "800", color: Palette.primary }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11.5, color: Palette.textSecondary }}>{label}</Text>
    </View>
  );
}

export function WeeklySummary({ state, now, variant }: { state: DemoState; now: Date; variant: "watch" | "phone" }) {
  const s = weeklySummary(state, now);

  if (variant === "watch") {
    return (
      <View style={{ alignItems: "center" }} testID="watch_summary">
        <Text style={{ color: Brand.cyan, fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>RESUMEN SEMANAL</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <WatchStat value={s.completed} label="Completadas" color={Brand.lime} />
          <ProgressRing percent={s.progress} size={78} stroke={8}>
            <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800" }}>{`${s.progress}%`}</Text>
          </ProgressRing>
          <WatchStat value={s.pending} label="Pendientes" color={Brand.cyan} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <MaterialIcon name="group_add_outlined" size={14} color={Palette.violetSoft} />
          <Text style={{ color: "#FFFFFF", fontSize: 12, marginLeft: 4 }}>{`${s.newMembers} integrante${s.newMembers === 1 ? "" : "s"} nuevo${s.newMembers === 1 ? "" : "s"}`}</Text>
        </View>
      </View>
    );
  }

  const contributions = state.members
    .map((m) => ({ member: m, done: state.tasks.filter((t) => t.completedById === m.id).length }))
    .filter((c) => c.done > 0);

  return (
    <View testID="phone_summary">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <PhoneStat icon="task_alt" value={s.completed} label="Completadas" bg={Palette.limeTint} />
        <PhoneStat icon="schedule" value={s.pending} label="Pendientes" bg={Palette.cyanTint} />
        <PhoneStat icon="bar_chart_rounded" value={`${s.progress}%`} label="Avance" bg={Palette.violetTint} />
        <PhoneStat icon="group_add_outlined" value={s.newMembers} label="Nuevos integrantes" bg={Palette.surfaceMuted} />
      </View>

      <Text style={{ marginTop: 16, fontSize: 13.5, fontWeight: "bold", color: HomeColors.textPrimary }}>Avance del proyecto</Text>
      <View style={{ marginTop: 8, borderRadius: 6, overflow: "hidden" }}>
        <LinearProgressIndicator value={s.progress / 100} minHeight={8} backgroundColor={Palette.violetTint} color={Palette.primary} />
      </View>
      <Text style={{ marginTop: 4, fontSize: 11.5, color: Palette.textSecondary }}>
        {`Tu equipo completó ${s.completed} de ${s.total} tareas · ${s.completedThisWeek} esta semana`}
      </Text>

      <Text style={{ marginTop: 16, fontSize: 13.5, fontWeight: "bold", color: HomeColors.textPrimary }}>Estado de las tareas</Text>
      {state.tasks.map((t) => (
        <View
          key={t.id}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Palette.border }}
        >
          <Text style={{ flex: 1, fontSize: 12.5, color: Palette.textPrimary }} numberOfLines={1}>
            {t.title}
          </Text>
          <TaskStatusChip status={t.status} compact />
        </View>
      ))}

      {contributions.length > 0 ? (
        <>
          <Text style={{ marginTop: 16, fontSize: 13.5, fontWeight: "bold", color: HomeColors.textPrimary }}>Aportes del equipo</Text>
          {contributions.map(({ member, done }) => (
            <View key={member.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6 }}>
              <MemberAvatar member={member} size={26} />
              <Text style={{ flex: 1, marginLeft: 8, fontSize: 12.5, color: Palette.textPrimary }}>{firstName(member)}</Text>
              <Text style={{ fontSize: 12, color: Palette.textSecondary }}>{`${done} tarea${done === 1 ? "" : "s"}`}</Text>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}
