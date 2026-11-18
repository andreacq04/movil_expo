// Pantallas de la app Proyéctate dentro del celular simulado. Son una versión
// simplificada de Mis proyectos, Detalle del proyecto, Tareas, Integrantes,
// Actividad y Notificaciones, con los mismos estilos (tarjetas blancas con
// borde, chips en tinte violeta, títulos en morado, botones redondeados).
import React from "react";
import { ScrollView, Text, View } from "react-native";

import { Brand, Palette } from "@/src/core/theme/brand";
import { Colors, HomeColors } from "@/src/core/theme/homeColors";
import { FilledButton, InkWell, LinearProgressIndicator, TextButton } from "@/src/core/ui/material";
import { MaterialIcon } from "@/src/core/ui/MaterialIcon";
import { timeAgo } from "@/src/core/utils/timeAgo";

import { DemoTask, ProjectTab } from "../../domain/demoModels";
import { firstName, memberById, pendingCount, progressPercent, taskStatusLabel, unreadCount } from "../../domain/demoReducer";
import { ACTIVITY_ICONS, DemoProjectAvatar, MemberAvatar, TaskStatusChip, TaskStatusIcon } from "../components/demoBits";
import { NotificationCard } from "../components/NotificationCard";
import { WeeklySummary } from "../components/WeeklySummary";
import { useDemo } from "../DemoStore";

// ── Piezas comunes ──────────────────────────────────────────────────────────

function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: HomeColors.textPrimary }}>{title}</Text>
      {subtitle ? <Text style={{ marginTop: 2, fontSize: 12.5, color: HomeColors.textSecondary }}>{subtitle}</Text> : null}
    </View>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 6 }}>
      <InkWell
        onPress={onBack}
        circle
        accessibilityLabel="Atrás"
        testID="phone_back"
        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: HomeColors.flowBackCircle, alignItems: "center", justifyContent: "center" }}
      >
        <MaterialIcon name="arrow_back" size={20} color={HomeColors.primaryPurple} />
      </InkWell>
      <Text style={{ marginLeft: 10, flex: 1, fontSize: 16, fontWeight: "bold", color: HomeColors.textPrimary }} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={{ marginTop: 14, marginBottom: 8, fontSize: 14, fontWeight: "bold", color: HomeColors.textPrimary }}>{children}</Text>;
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", color: HomeColors.textPrimary }}>{`${value}`}</Text>
      <Text style={{ marginTop: 2, fontSize: 11.5, color: HomeColors.textSecondary }}>{label}</Text>
    </View>
  );
}

function ProgressBlock({ percent, done, total }: { percent: number; done: number; total: number }) {
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Text style={{ fontSize: 12, color: HomeColors.textSecondary }}>Avance del proyecto</Text>
        <Text testID="phone_progress" style={{ fontSize: 16, fontWeight: "800", color: Palette.primary }}>{`${percent}%`}</Text>
      </View>
      <View style={{ marginTop: 6, borderRadius: 6, overflow: "hidden" }}>
        <LinearProgressIndicator value={percent / 100} minHeight={8} backgroundColor={Palette.violetTint} color={Palette.secondary} />
      </View>
      <Text style={{ marginTop: 4, fontSize: 11, color: HomeColors.textSecondary }}>{`${done} de ${total} tareas completadas`}</Text>
    </View>
  );
}

const scrollContent = { paddingHorizontal: 16, paddingBottom: 24 };

// ── Mis proyectos ───────────────────────────────────────────────────────────

export function ProjectsScreen() {
  const { state, actions, now } = useDemo();
  const p = state.project;
  const done = state.tasks.length - pendingCount(state.tasks);
  return (
    <ScrollView contentContainerStyle={scrollContent} showsVerticalScrollIndicator={false}>
      <View style={{ marginHorizontal: -16 }}>
        <ScreenTitle title="Mis proyectos" subtitle={`Hola, ${firstName(memberById(state, "m-andrea"))} 👋`} />
      </View>
      <InkWell
        onPress={() => actions.phoneNavigate({ name: "project", tab: "tasks" })}
        borderRadius={16}
        testID="phone_project_card"
        accessibilityLabel={`Abrir ${p.name}`}
        style={{ backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: HomeColors.borderGrey, padding: 14 }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <DemoProjectAvatar size={44} />
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: HomeColors.textPrimary }}>{p.name}</Text>
            <Text style={{ marginTop: 4, fontSize: 12.5, color: HomeColors.textSecondary, lineHeight: 16 }} numberOfLines={3}>
              {p.description}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: HomeColors.navSelectedBackground, borderRadius: 20 }}>
            <Text style={{ fontSize: 11.5, fontWeight: "600", color: HomeColors.primaryPurple }}>{p.status}</Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Palette.limeTint, borderRadius: 20 }}>
            <Text style={{ fontSize: 11.5, fontWeight: "600", color: HomeColors.primaryPurple }}>{p.category}</Text>
          </View>
        </View>
        <View style={{ height: 12 }} />
        <ProgressBlock percent={progressPercent(state.tasks)} done={done} total={state.tasks.length} />
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Stat value={state.members.length} label="Integrantes" />
          <Stat value={state.tasks.length} label="Tareas" />
          <Stat value={pendingCount(state.tasks)} label="Pendientes" />
        </View>
        <View style={{ flexDirection: "row", marginTop: 12, alignItems: "center" }}>
          {state.members.map((m, i) => (
            <View key={m.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
              <MemberAvatar member={m} size={30} ring="#FFFFFF" />
            </View>
          ))}
          <Text style={{ marginLeft: 8, fontSize: 11.5, color: HomeColors.textSecondary }}>{`${state.members.length} integrantes`}</Text>
        </View>
      </InkWell>

      <SectionLabel>Actividad reciente</SectionLabel>
      {state.activity.slice(0, 3).map((a) => (
        <InkWell
          key={a.id}
          onPress={() => actions.phoneNavigate({ name: "activity", activityId: a.id })}
          borderRadius={12}
          style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
        >
          <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: Palette.violetTint, alignItems: "center", justifyContent: "center" }}>
            <MaterialIcon name={ACTIVITY_ICONS[a.kind]} size={16} color={Palette.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 12.5, color: HomeColors.textPrimary }} numberOfLines={1}>
              {a.text}
            </Text>
            <Text style={{ fontSize: 10.5, color: HomeColors.textSecondary }}>{timeAgo(a.createdAt, now)}</Text>
          </View>
          <MaterialIcon name="chevron_right" size={18} color={HomeColors.textSecondary} />
        </InkWell>
      ))}
    </ScrollView>
  );
}

// ── Detalle del proyecto (Tareas · Integrantes · Actividad) ─────────────────

const TABS: { key: ProjectTab; label: string }[] = [
  { key: "tasks", label: "Tareas" },
  { key: "members", label: "Integrantes" },
  { key: "activity", label: "Actividad" },
];

function TaskRow({ task }: { task: DemoTask }) {
  const { state, actions } = useDemo();
  const assignee = memberById(state, task.assigneeId);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 11,
        marginBottom: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: task.status === "completed" ? Palette.limeTint : HomeColors.borderGrey,
        backgroundColor: task.status === "completed" ? "#FBFFF0" : Colors.white,
      }}
    >
      <InkWell
        onPress={() => actions.phoneNavigate({ name: "task", taskId: task.id })}
        borderRadius={14}
        testID={`phone_task_${task.id}`}
        accessibilityLabel={`Ver detalle de ${task.title}`}
        style={{ flex: 1, flexDirection: "row", alignItems: "center", padding: 11, borderRadius: 14 }}
      >
        <TaskStatusIcon status={task.status} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: HomeColors.textPrimary,
              textDecorationLine: task.status === "completed" ? "line-through" : "none",
            }}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 }}>
            <TaskStatusChip status={task.status} compact />
            <Text style={{ fontSize: 10.5, color: HomeColors.textSecondary }} numberOfLines={1}>
              {firstName(assignee)}
            </Text>
          </View>
        </View>
      </InkWell>
      {task.status !== "completed" ? (
        <InkWell
          onPress={() => actions.completeTask(task.id)}
          borderRadius={16}
          testID={`phone_complete_${task.id}`}
          accessibilityLabel={`Completar tarea ${task.title}`}
          style={{ backgroundColor: Palette.primary, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>Completar</Text>
        </InkWell>
      ) : (
        <MaterialIcon name="chevron_right" size={18} color={HomeColors.textSecondary} />
      )}
    </View>
  );
}

export function ProjectScreen({ tab }: { tab: ProjectTab }) {
  const { state, actions, now } = useDemo();
  const done = state.tasks.length - pendingCount(state.tasks);
  return (
    <View style={{ flex: 1 }}>
      <BackHeader title={state.project.name} onBack={() => actions.phoneNavigate({ name: "projects" })} />
      <ScrollView contentContainerStyle={scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: Palette.violetFaint, borderRadius: 16, padding: 14 }}>
          <ProgressBlock percent={progressPercent(state.tasks)} done={done} total={state.tasks.length} />
        </View>

        <View style={{ flexDirection: "row", marginTop: 14, backgroundColor: HomeColors.flowTabGrey, borderRadius: 24, padding: 4 }}>
          {TABS.map((t) => {
            const selected = t.key === tab;
            const count = t.key === "tasks" ? state.tasks.length : t.key === "members" ? state.members.length : state.activity.length;
            return (
              <InkWell
                key={t.key}
                onPress={() => actions.phoneNavigate({ name: "project", tab: t.key })}
                borderRadius={20}
                testID={`phone_tab_${t.key}`}
                accessibilityState={{ selected }}
                style={{ flex: 1, paddingVertical: 7, borderRadius: 20, alignItems: "center", backgroundColor: selected ? Colors.white : "transparent" }}
              >
                <Text style={{ fontSize: 12, fontWeight: selected ? "700" : "500", color: selected ? HomeColors.primaryPurple : HomeColors.flowTabText }}>
                  {`${t.label} (${count})`}
                </Text>
              </InkWell>
            );
          })}
        </View>

        <View style={{ height: 12 }} />
        {tab === "tasks" ? state.tasks.map((t) => <TaskRow key={t.id} task={t} />) : null}

        {tab === "members"
          ? state.members.map((m) => (
              <View
                key={m.id}
                testID={`phone_member_${m.id}`}
                style={{ flexDirection: "row", alignItems: "center", padding: 10, marginBottom: 8, borderRadius: 14, borderWidth: 1, borderColor: HomeColors.borderGrey }}
              >
                <MemberAvatar member={m} size={38} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: HomeColors.textPrimary }}>{m.isCurrentUser ? `${m.name} (Tú)` : m.name}</Text>
                  <Text style={{ fontSize: 11.5, color: HomeColors.textSecondary }}>{m.role}</Text>
                </View>
                {m.joinedThisWeek ? (
                  <View style={{ backgroundColor: Brand.lime, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: Brand.purple }}>Nuevo</Text>
                  </View>
                ) : null}
              </View>
            ))
          : null}

        {tab === "activity"
          ? state.activity.map((a, i) => (
              <InkWell
                key={a.id}
                onPress={() => actions.phoneNavigate({ name: "activity", activityId: a.id })}
                borderRadius={12}
                testID={`phone_activity_${a.id}`}
                style={{ flexDirection: "row", paddingVertical: 4 }}
              >
                <View style={{ alignItems: "center", width: 30 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: i === 0 ? Brand.lime : Palette.violetTint, alignItems: "center", justifyContent: "center" }}>
                    <MaterialIcon name={ACTIVITY_ICONS[a.kind]} size={15} color={Palette.primary} />
                  </View>
                  {i < state.activity.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 18, backgroundColor: Palette.border }} /> : null}
                </View>
                <View style={{ flex: 1, marginLeft: 10, paddingBottom: 12 }}>
                  <Text style={{ fontSize: 12.5, fontWeight: "600", color: HomeColors.textPrimary }}>{a.text}</Text>
                  <Text style={{ marginTop: 2, fontSize: 10.5, color: HomeColors.textSecondary }}>{timeAgo(a.createdAt, now)}</Text>
                </View>
              </InkWell>
            ))
          : null}
      </ScrollView>
    </View>
  );
}

// ── Detalle de tarea ────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Palette.border }}>
      <Text style={{ fontSize: 12.5, color: HomeColors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 12.5, fontWeight: "600", color: HomeColors.textPrimary, flexShrink: 1, textAlign: "right" }}>{value}</Text>
    </View>
  );
}

export function TaskScreen({ taskId }: { taskId: string }) {
  const { state, actions, now } = useDemo();
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  const assignee = memberById(state, task.assigneeId);
  const completedBy = memberById(state, task.completedById);
  return (
    <View style={{ flex: 1 }} testID="phone_task_detail">
      <BackHeader title="Detalle de la tarea" onBack={() => actions.phoneNavigate({ name: "project", tab: "tasks" })} />
      <ScrollView contentContainerStyle={scrollContent} showsVerticalScrollIndicator={false}>
        <TaskStatusChip status={task.status} />
        <Text style={{ marginTop: 10, fontSize: 20, fontWeight: "bold", color: HomeColors.textPrimary }}>{task.title}</Text>
        <Text style={{ marginTop: 6, fontSize: 13, lineHeight: 18, color: HomeColors.textSecondary }}>{task.description}</Text>
        <View style={{ height: 12 }} />
        <DetailRow label="Proyecto" value={state.project.name} />
        <DetailRow label="Responsable" value={assignee ? assignee.name : "Sin asignar"} />
        <DetailRow label="Estado" value={taskStatusLabel(task.status)} />
        <DetailRow label="Entrega" value={task.dueLabel} />
        {completedBy && task.completedAt ? (
          <DetailRow label="Completada por" value={`${firstName(completedBy)} · ${timeAgo(task.completedAt, now)}`} />
        ) : null}
        <View style={{ height: 18 }} />
        {task.status !== "completed" ? (
          <FilledButton
            label="Completar tarea"
            testID="phone_task_complete_button"
            onPress={() => actions.completeTask(task.id)}
            backgroundColor={Palette.primary}
            height={46}
            borderRadius={24}
            icon={<MaterialIcon name="check_rounded" size={18} color="#FFFFFF" />}
          />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: Palette.limeTint, borderRadius: 14, padding: 12 }}>
            <MaterialIcon name="task_alt" size={22} color={Palette.primary} />
            <Text style={{ marginLeft: 8, flex: 1, fontSize: 12.5, color: Palette.primary, fontWeight: "600" }}>
              ¡Tarea completada! El progreso del proyecto ya se actualizó en todos tus dispositivos.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Detalle de actividad ────────────────────────────────────────────────────

export function ActivityScreen({ activityId }: { activityId: string }) {
  const { state, actions, now } = useDemo();
  const a = state.activity.find((x) => x.id === activityId);
  if (!a) return null;
  const member = memberById(state, a.memberId);
  return (
    <View style={{ flex: 1 }} testID="phone_activity_detail">
      <BackHeader title="Actividad" onBack={() => actions.phoneNavigate({ name: "project", tab: "activity" })} />
      <ScrollView contentContainerStyle={scrollContent}>
        <View style={{ alignItems: "center", paddingVertical: 14 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: Brand.lime, alignItems: "center", justifyContent: "center" }}>
            <MaterialIcon name={ACTIVITY_ICONS[a.kind]} size={32} color={Brand.purple} />
          </View>
          <Text style={{ marginTop: 12, fontSize: 17, fontWeight: "bold", color: HomeColors.textPrimary, textAlign: "center" }}>{a.text}</Text>
          <Text style={{ marginTop: 4, fontSize: 11.5, color: HomeColors.textSecondary }}>{timeAgo(a.createdAt, now)}</Text>
        </View>
        <View style={{ backgroundColor: Palette.violetFaint, borderRadius: 14, padding: 14 }}>
          <Text style={{ fontSize: 13, lineHeight: 18, color: HomeColors.textPrimary }}>{a.detail}</Text>
        </View>
        {member ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14 }}>
            <MemberAvatar member={member} size={34} />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: HomeColors.textPrimary }}>{member.name}</Text>
              <Text style={{ fontSize: 11.5, color: HomeColors.textSecondary }}>{member.role}</Text>
            </View>
          </View>
        ) : null}
        {a.taskId ? (
          <TextButton
            label="Ver la tarea relacionada"
            onPress={() => actions.phoneNavigate({ name: "task", taskId: a.taskId! })}
            foregroundColor={Palette.secondary}
            style={{ marginTop: 12, alignSelf: "flex-start" }}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

// ── Notificaciones ──────────────────────────────────────────────────────────

export function NotificationsScreen() {
  const { state, actions, now } = useDemo();
  const unread = unreadCount(state.notifications);
  return (
    <ScrollView contentContainerStyle={scrollContent} showsVerticalScrollIndicator={false}>
      <View style={{ marginHorizontal: -16, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <ScreenTitle title="Notificaciones" subtitle={unread > 0 ? `${unread} sin leer` : "Estás al día"} />
        {unread > 0 ? (
          <TextButton label="Leer todas" onPress={actions.markAllRead} foregroundColor={Palette.secondary} style={{ marginRight: 8, marginBottom: 6 }} />
        ) : null}
      </View>
      {state.notifications.map((n) => (
        <View key={n.id} style={{ marginBottom: 8 }}>
          <NotificationCard notification={n} now={now} onPress={() => actions.openOnPhone(n.id)} />
        </View>
      ))}
    </ScrollView>
  );
}

// ── Resumen semanal (detalle completo) ──────────────────────────────────────

export function SummaryScreen() {
  const { state, now } = useDemo();
  return (
    <ScrollView contentContainerStyle={scrollContent} showsVerticalScrollIndicator={false}>
      <View style={{ marginHorizontal: -16 }}>
        <ScreenTitle title="Resumen semanal" subtitle={`${state.project.name} · esta semana`} />
      </View>
      <WeeklySummary state={state} now={now} variant="phone" />
    </ScrollView>
  );
}
