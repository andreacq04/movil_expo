// Vistas del smartwatch. Todo se dibuja dentro de un círculo de WATCH_SCREEN
// px: el contenido útil se mantiene en el cuadrado inscrito (~70 % del
// diámetro) y los controles van en los bordes (flechas a izquierda/derecha,
// puntos abajo, «atrás» arriba), como en Wear OS / watchOS.
import React, { useMemo } from "react";
import { PanResponder, Text, View } from "react-native";

import { Brand, Palette } from "@/src/core/theme/brand";
import { withAlpha } from "@/src/core/theme/homeColors";
import { InkWell } from "@/src/core/ui/material";
import { IconName, MaterialIcon } from "@/src/core/ui/MaterialIcon";
import { timeAgo } from "@/src/core/utils/timeAgo";

import { pendingCount, progressPercent, taskStatusLabel, unreadCount } from "../../domain/demoReducer";
import { NOTIFICATION_ICONS, ProgressRing, WATCH_KIND_COLORS } from "../components/demoBits";
import { NotificationCard } from "../components/NotificationCard";
import { WeeklySummary } from "../components/WeeklySummary";
import { useDemo } from "../DemoStore";

const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function clock(now: Date): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function RoundButton({
  icon,
  onPress,
  label,
  bg = "rgba(255,255,255,0.12)",
  fg = "#FFFFFF",
  size = 34,
  testID,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  bg?: string;
  fg?: string;
  size?: number;
  testID?: string;
}) {
  return (
    <InkWell
      onPress={onPress}
      circle
      accessibilityLabel={label}
      testID={testID}
      splashColor="rgba(255,255,255,0.2)"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}
    >
      <MaterialIcon name={icon} size={Math.round(size * 0.55)} color={fg} />
    </InkWell>
  );
}

function PillButton({ icon, label, onPress, primary, testID }: { icon: IconName; label: string; onPress: () => void; primary?: boolean; testID?: string }) {
  return (
    <InkWell
      onPress={onPress}
      borderRadius={16}
      testID={testID}
      accessibilityLabel={label}
      splashColor="rgba(255,255,255,0.2)"
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: primary ? Brand.lime : "rgba(255,255,255,0.14)",
      }}
    >
      <MaterialIcon name={icon} size={14} color={primary ? Brand.purple : "#FFFFFF"} />
      <Text style={{ marginLeft: 4, fontSize: 11, fontWeight: "700", color: primary ? Brand.purple : "#FFFFFF" }}>{label}</Text>
    </InkWell>
  );
}

/** Botón «atrás» pegado al borde superior del círculo. */
function TopBack({ onPress }: { onPress: () => void }) {
  return (
    <View style={{ position: "absolute", top: 14, alignSelf: "center" }}>
      <RoundButton icon="keyboard_arrow_down_rounded" onPress={onPress} label="Volver a la pantalla principal" size={28} testID="watch_back" />
    </View>
  );
}

// ── Pantalla principal ──────────────────────────────────────────────────────

export function WatchHome() {
  const { state, actions, now } = useDemo();
  const unread = unreadCount(state.notifications);
  const pending = pendingCount(state.tasks);
  const progress = progressPercent(state.tasks);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }} testID="watch_home">
      <Text testID="watch_time" style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "300", letterSpacing: 1 }}>
        {clock(now)}
      </Text>
      <Text style={{ color: Brand.cyan, fontSize: 10.5, fontWeight: "600", marginTop: -2 }}>{`${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`}</Text>

      <InkWell onPress={() => actions.watchNavigate({ name: "summary" })} circle accessibilityLabel="Ver resumen semanal" testID="watch_ring" style={{ marginTop: 6 }}>
        <ProgressRing percent={progress} size={96} stroke={9}>
          <Text testID="watch_progress" style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "800" }}>{`${progress}%`}</Text>
          <Text style={{ color: Brand.lime, fontSize: 10, fontWeight: "700", marginTop: -2 }}>{state.project.name}</Text>
        </ProgressRing>
      </InkWell>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(126,214,255,0.16)", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
          <MaterialIcon name="schedule" size={13} color={Brand.cyan} />
          <Text testID="watch_pending" style={{ color: "#FFFFFF", fontSize: 11.5, marginLeft: 3, fontWeight: "600" }}>{`${pending} pendientes`}</Text>
        </View>
        <InkWell
          onPress={() => actions.watchNavigate({ name: "notifications", index: 0 })}
          borderRadius={12}
          accessibilityLabel={`Notificaciones: ${unread} nuevas`}
          testID="watch_bell"
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: unread > 0 ? Brand.lime : "rgba(255,255,255,0.12)",
          }}
        >
          <MaterialIcon name={unread > 0 ? "notifications" : "notifications_none"} size={13} color={unread > 0 ? Brand.purple : "#FFFFFF"} />
          <Text testID="watch_unread" style={{ fontSize: 11.5, marginLeft: 3, fontWeight: "800", color: unread > 0 ? Brand.purple : "#FFFFFF" }}>{`${unread}`}</Text>
        </InkWell>
      </View>
    </View>
  );
}

// ── Notificaciones (carrusel) ───────────────────────────────────────────────

export function WatchNotifications({ index }: { index: number }) {
  const { state, actions, now } = useDemo();
  const list = state.notifications;
  const i = Math.max(0, Math.min(index, list.length - 1));
  const go = (to: number) => actions.watchNavigate({ name: "notifications", index: Math.max(0, Math.min(to, list.length - 1)) });

  // Deslizar a izquierda/derecha (con el dedo o arrastrando el mouse) cambia de notificación.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderRelease: (_, g) => {
          if (g.dx < -35) go(i + 1);
          else if (g.dx > 35) go(i - 1);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i, list.length],
  );

  if (list.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <TopBack onPress={() => actions.watchNavigate({ name: "home" })} />
        <MaterialIcon name="notifications_off_outlined" size={30} color={Palette.violetSoft} />
        <Text style={{ color: "#FFFFFF", marginTop: 6, fontSize: 13 }}>Sin notificaciones</Text>
      </View>
    );
  }

  const n = list[i];
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }} testID="watch_notifications" {...pan.panHandlers}>
      <TopBack onPress={() => actions.watchNavigate({ name: "home" })} />
      <Text style={{ color: Brand.cyan, fontSize: 10.5, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 }}>{`NOTIFICACIÓN ${i + 1} DE ${list.length}`}</Text>
      <NotificationCard
        notification={n}
        now={now}
        variant="watch"
        onPress={() => actions.watchNavigate({ name: "detail", notificationId: n.id })}
      />
      {/* Flechas en los bordes del círculo */}
      <View style={{ position: "absolute", left: 8, top: "50%", marginTop: -15 }}>
        {i > 0 ? <RoundButton icon="arrow_back_ios" onPress={() => go(i - 1)} label="Notificación anterior" size={30} testID="watch_prev" /> : null}
      </View>
      <View style={{ position: "absolute", right: 8, top: "50%", marginTop: -15 }}>
        {i < list.length - 1 ? <RoundButton icon="chevron_right" onPress={() => go(i + 1)} label="Notificación siguiente" size={30} testID="watch_next" /> : null}
      </View>
      {/* Puntos de paginación */}
      <View style={{ position: "absolute", bottom: 20, flexDirection: "row", gap: 4 }}>
        {list.slice(0, 7).map((x, k) => (
          <View
            key={x.id}
            style={{
              width: k === i ? 14 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: k === i ? Brand.lime : x.read ? "rgba(255,255,255,0.3)" : Brand.violet,
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ── Detalle de una notificación ─────────────────────────────────────────────

export function WatchDetail({ notificationId }: { notificationId: string }) {
  const { state, actions, now } = useDemo();
  const n = state.notifications.find((x) => x.id === notificationId);
  if (!n) return null;
  const k = WATCH_KIND_COLORS[n.kind];
  const task = n.taskId ? state.tasks.find((t) => t.id === n.taskId) : undefined;
  const index = state.notifications.findIndex((x) => x.id === n.id);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 34 }} testID="watch_detail">
      <TopBack onPress={() => actions.watchNavigate({ name: "notifications", index: Math.max(0, index) })} />
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: k.bg, alignItems: "center", justifyContent: "center", marginTop: 14 }}>
        <MaterialIcon name={NOTIFICATION_ICONS[n.kind]} size={21} color={k.fg} />
      </View>
      <Text style={{ marginTop: 5, color: "#FFFFFF", fontSize: 13, fontWeight: "800", textAlign: "center" }} numberOfLines={1}>
        {n.title}
      </Text>
      <Text style={{ marginTop: 2, color: "rgba(255,255,255,0.85)", fontSize: 11.5, textAlign: "center", lineHeight: 14.5 }} numberOfLines={3}>
        {n.message}
      </Text>
      {task ? (
        <Text testID="watch_detail_task_status" style={{ marginTop: 3, color: Brand.cyan, fontSize: 10.5, fontWeight: "700" }}>
          {`Estado: ${taskStatusLabel(task.status)}`}
        </Text>
      ) : (
        <Text style={{ marginTop: 3, color: Brand.cyan, fontSize: 10.5 }}>{timeAgo(n.createdAt, now)}</Text>
      )}
      <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
        {n.read ? (
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 6 }}>
            <MaterialIcon name="done_all" size={14} color={Brand.lime} />
            <Text style={{ marginLeft: 3, fontSize: 11, color: Brand.lime, fontWeight: "700" }}>Leída</Text>
          </View>
        ) : (
          <PillButton icon="check_rounded" label="Leída" primary onPress={() => actions.markRead(n.id)} testID="watch_mark_read" />
        )}
        <PillButton icon="send_rounded" label="Celular" onPress={() => actions.openOnPhone(n.id)} testID="watch_open_on_phone" />
      </View>
    </View>
  );
}

// ── Resumen semanal ─────────────────────────────────────────────────────────

export function WatchSummary() {
  const { state, actions, now } = useDemo();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <TopBack onPress={() => actions.watchNavigate({ name: "home" })} />
      <View style={{ marginTop: 10 }}>
        <WeeklySummary state={state} now={now} variant="watch" />
      </View>
    </View>
  );
}

// ── Alerta entrante (pantalla completa, se cierra sola) ─────────────────────

export function WatchAlert({ notificationId }: { notificationId: string }) {
  const { state, actions } = useDemo();
  const n = state.notifications.find((x) => x.id === notificationId);
  if (!n) return null;
  const k = WATCH_KIND_COLORS[n.kind];
  const task = n.taskId ? state.tasks.find((t) => t.id === n.taskId) : undefined;
  return (
    <InkWell
      onPress={() => actions.watchNavigate({ name: "detail", notificationId: n.id })}
      testID="watch_alert"
      accessibilityLabel={`${n.watchHeadline}. ${n.message}. Toca para ver el detalle`}
      splashColor="rgba(255,255,255,0.15)"
      style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, backgroundColor: "#1B0038" }}
    >
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: withAlpha(k.bg, 0.25), alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: k.bg, alignItems: "center", justifyContent: "center" }}>
          <MaterialIcon name={NOTIFICATION_ICONS[n.kind]} size={28} color={k.fg} />
        </View>
      </View>
      <Text testID="watch_alert_headline" style={{ marginTop: 10, color: Brand.lime, fontSize: 15, fontWeight: "800", textAlign: "center", lineHeight: 18 }}>
        {n.watchHeadline}
      </Text>
      <Text style={{ marginTop: 4, color: "#FFFFFF", fontSize: 12, textAlign: "center", lineHeight: 15 }} numberOfLines={3}>
        {n.message}
      </Text>
      {task ? <Text style={{ marginTop: 4, color: Brand.cyan, fontSize: 10.5, fontWeight: "700" }}>{taskStatusLabel(task.status)}</Text> : null}
      <Text style={{ marginTop: 8, color: "rgba(255,255,255,0.55)", fontSize: 9.5 }}>Toca para ver el detalle</Text>
    </InkWell>
  );
}
