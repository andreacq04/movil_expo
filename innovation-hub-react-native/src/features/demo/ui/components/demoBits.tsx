// Piezas visuales pequeñas que comparten el celular y el reloj: avatar con
// iniciales, chip de estado de tarea, anillo de progreso e iconos por tipo de
// notificación. Todas usan exclusivamente la paleta de `brand.ts`.
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { Brand, Palette } from "@/src/core/theme/brand";
import { IconName, MaterialIcon } from "@/src/core/ui/MaterialIcon";

import { DemoActivityKind, DemoMember, DemoNotificationKind, DemoTaskStatus } from "../../domain/demoModels";
import { taskStatusLabel } from "../../domain/demoReducer";

export const NOTIFICATION_ICONS: Record<DemoNotificationKind, IconName> = {
  task_completed: "task_alt",
  new_member: "person_add_alt_1_outlined",
  reminder: "alarm",
  progress: "bar_chart_rounded",
};

export const ACTIVITY_ICONS: Record<DemoActivityKind, IconName> = {
  task_completed: "task_alt",
  member_joined: "group_add_outlined",
  reminder: "alarm",
  summary: "bar_chart_rounded",
  project_created: "rocket_launch_rounded",
};

/** Colores (fondo, texto) de cada tipo de notificación en el reloj (fondo oscuro). */
export const WATCH_KIND_COLORS: Record<DemoNotificationKind, { bg: string; fg: string }> = {
  task_completed: { bg: Brand.lime, fg: Brand.purple },
  new_member: { bg: Brand.cyan, fg: Brand.purple },
  reminder: { bg: Brand.violet, fg: "#FFFFFF" },
  progress: { bg: Palette.violetSoft, fg: Brand.purple },
};

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Texto legible sobre el color del avatar (morado sobre claros, blanco sobre oscuros). */
function avatarTextColor(bg: string): string {
  return bg === Brand.purple || bg === Brand.violet ? "#FFFFFF" : Brand.purple;
}

export function MemberAvatar({ member, size = 36, ring }: { member: DemoMember; size?: number; ring?: string }) {
  return (
    <View
      accessibilityLabel={member.name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: member.color,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: ring ? 2 : 0,
        borderColor: ring,
      }}
    >
      <Text style={{ color: avatarTextColor(member.color), fontWeight: "700", fontSize: Math.round(size * 0.38) }}>{initials(member.name)}</Text>
    </View>
  );
}

const STATUS_STYLE: Record<DemoTaskStatus, { bg: string; fg: string; icon: IconName }> = {
  completed: { bg: Palette.successBackground, fg: Palette.successForeground, icon: "check_circle" },
  in_progress: { bg: Palette.progressBackground, fg: Palette.progressForeground, icon: "schedule" },
  pending: { bg: Palette.surfaceMuted, fg: Palette.textSecondary, icon: "radio_button_unchecked" },
};

export function TaskStatusChip({ status, compact }: { status: DemoTaskStatus; compact?: boolean }) {
  const s = STATUS_STYLE[status];
  return (
    <View
      testID={`status_${status}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: s.bg,
        borderRadius: 20,
        paddingHorizontal: compact ? 8 : 10,
        paddingVertical: compact ? 3 : 5,
      }}
    >
      <MaterialIcon name={s.icon} size={compact ? 12 : 14} color={s.fg} />
      <Text style={{ marginLeft: 4, fontSize: compact ? 10.5 : 12, fontWeight: "600", color: s.fg }}>{taskStatusLabel(status)}</Text>
    </View>
  );
}

export function TaskStatusIcon({ status, size = 22 }: { status: DemoTaskStatus; size?: number }) {
  if (status === "completed") {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: Brand.lime, alignItems: "center", justifyContent: "center" }}>
        <MaterialIcon name="check_rounded" size={size * 0.7} color={Brand.purple} />
      </View>
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: status === "in_progress" ? Brand.violet : Palette.borderStrong,
        borderStyle: status === "in_progress" ? "dashed" : "solid",
      }}
    />
  );
}

/** Anillo de progreso (SVG). Se usa grande en el reloj y pequeño en el celular. */
export function ProgressRing({
  percent,
  size,
  stroke,
  color = Brand.lime,
  track = "rgba(255,255,255,0.16)",
  children,
}: {
  percent: number;
  size: number;
  stroke: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`Avance ${p}%`}>
      <Svg width={size} height={size} style={{ position: "absolute", left: 0, top: 0 }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

/** Ícono del proyecto (mismo estilo que ProjectAvatar sin imagen: tinte limón + icono de categoría). */
export function DemoProjectAvatar({ size = 44 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.27),
        backgroundColor: Palette.limeTint,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialIcon name="eco_outlined" color={Palette.primary} size={Math.round(size * 0.52)} />
    </View>
  );
}
