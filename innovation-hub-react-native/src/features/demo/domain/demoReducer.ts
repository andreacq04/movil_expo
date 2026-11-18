// Lógica ÚNICA de la demo: un reducer puro que reciben el celular, el reloj y
// el panel de control. Cualquier acción (venga del celular, del reloj o del
// panel) pasa por aquí, así que los dos dispositivos siempre ven el mismo
// estado. Al ser puro, se prueba sin interfaz (__tests__/unit/demo.test.ts).
import { CANDIDATE_MEMBERS, CURRENT_USER_ID, createInitialDemoState } from "./demoData";
import {
  DemoActivity,
  DemoEvent,
  DemoMember,
  DemoNotification,
  DemoState,
  DemoTask,
  DemoTaskStatus,
  PhoneRoute,
  WatchRoute,
  WeeklySummaryData,
} from "./demoModels";

export type DemoAction =
  /** Completar una tarea. Sin `taskId` se elige la siguiente tarea abierta. */
  | { type: "COMPLETE_TASK"; taskId?: string; now: Date }
  /** Otro integrante del equipo completa la siguiente tarea abierta. */
  | { type: "COMPLETE_TASK_BY_TEAMMATE"; now: Date }
  | { type: "ADD_MEMBER"; now: Date }
  | { type: "SEND_REMINDER"; now: Date }
  | { type: "SHOW_WEEKLY_SUMMARY"; now: Date }
  | { type: "MARK_READ"; notificationId: string }
  | { type: "MARK_ALL_READ" }
  | { type: "WATCH_NAVIGATE"; route: WatchRoute }
  | { type: "PHONE_NAVIGATE"; route: PhoneRoute }
  /** Abre en el celular el detalle relacionado con una notificación. */
  | { type: "OPEN_ON_PHONE"; notificationId: string }
  | { type: "DISMISS_WATCH_ALERT" }
  | { type: "DISMISS_PHONE_BANNER" }
  | { type: "RESET"; now: Date };

// ── Selectores (lectura derivada, compartida por los dos dispositivos) ──────

export function completedCount(tasks: DemoTask[]): number {
  return tasks.filter((t) => t.status === "completed").length;
}

export function pendingCount(tasks: DemoTask[]): number {
  return tasks.filter((t) => t.status !== "completed").length;
}

/** Porcentaje de avance (0–100) = tareas completadas / tareas totales. */
export function progressPercent(tasks: DemoTask[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((completedCount(tasks) / tasks.length) * 100);
}

export function unreadCount(notifications: DemoNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

export function weeklySummary(state: DemoState, now: Date = new Date()): WeeklySummaryData {
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return {
    completed: completedCount(state.tasks),
    pending: pendingCount(state.tasks),
    total: state.tasks.length,
    progress: progressPercent(state.tasks),
    newMembers: state.members.filter((m) => m.joinedThisWeek).length,
    completedThisWeek: state.tasks.filter((t) => t.completedAt && t.completedAt.getTime() >= weekAgo).length,
  };
}

export function memberById(state: DemoState, id: string | null | undefined): DemoMember | undefined {
  return id ? state.members.find((m) => m.id === id) : undefined;
}

export function firstName(member: DemoMember | undefined): string {
  return member ? member.name.split(" ")[0] : "Alguien";
}

export function taskStatusLabel(status: DemoTaskStatus): string {
  switch (status) {
    case "completed":
      return "Completada";
    case "in_progress":
      return "En progreso";
    case "pending":
      return "Pendiente";
  }
}

/** Siguiente tarea abierta: primero las que están en progreso, luego las pendientes. */
export function nextOpenTask(tasks: DemoTask[]): DemoTask | undefined {
  return tasks.find((t) => t.status === "in_progress") ?? tasks.find((t) => t.status === "pending");
}

export function nextCandidate(state: DemoState): DemoMember | undefined {
  return CANDIDATE_MEMBERS.find((c) => !state.members.some((m) => m.id === c.id));
}

// ── Utilidades internas ─────────────────────────────────────────────────────

function pushEvent(state: DemoState, event: Omit<DemoEvent, "id">): DemoState {
  const id = `e-${state.seq}`;
  return { ...state, seq: state.seq + 1, events: [{ id, ...event }, ...state.events].slice(0, 8) };
}

/** Agrega una notificación y la «envía» a ambos dispositivos (alerta en el reloj y banner en el celular). */
function pushNotification(state: DemoState, n: Omit<DemoNotification, "id" | "read">): { state: DemoState; id: string } {
  const id = `n-${state.seq}`;
  return {
    id,
    state: {
      ...state,
      seq: state.seq + 1,
      notifications: [{ id, read: false, ...n }, ...state.notifications],
      watchAlertId: id,
      phoneBannerId: id,
    },
  };
}

function pushActivity(state: DemoState, a: Omit<DemoActivity, "id">): DemoState {
  const id = `a-${state.seq}`;
  return { ...state, seq: state.seq + 1, activity: [{ id, ...a }, ...state.activity] };
}

function completeTask(state: DemoState, task: DemoTask, byId: string, now: Date, source: string): DemoState {
  const by = memberById(state, byId);
  const name = firstName(by);
  let next: DemoState = {
    ...state,
    tasks: state.tasks.map((t) =>
      t.id === task.id ? { ...t, status: "completed", completedById: byId, completedAt: now, dueLabel: "Entregada" } : t,
    ),
  };
  const done = completedCount(next.tasks);
  const total = next.tasks.length;
  const pushed = pushNotification(next, {
    kind: "task_completed",
    title: "¡Tarea completada!",
    message: `${name} terminó ${task.title}`,
    watchHeadline: "¡Excelente! Una tarea más completada",
    createdAt: now,
    taskId: task.id,
    memberId: byId,
  });
  next = pushActivity(pushed.state, {
    kind: "task_completed",
    text: `${name} completó «${task.title}»`,
    detail: `El avance de EcoCampus subió a ${progressPercent(next.tasks)}% (${done} de ${total} tareas).`,
    createdAt: now,
    taskId: task.id,
    memberId: byId,
  });
  return pushEvent(next, {
    title: "Tarea completada",
    description: `${source}: ${name} completó «${task.title}». Avance: ${progressPercent(next.tasks)}% · ${done} de ${total} tareas. El reloj recibió la notificación.`,
    createdAt: now,
    tone: "success",
  });
}

// ── Reducer ─────────────────────────────────────────────────────────────────

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "COMPLETE_TASK": {
      const task = action.taskId ? state.tasks.find((t) => t.id === action.taskId) : nextOpenTask(state.tasks);
      if (!task || task.status === "completed") {
        return pushEvent(state, {
          title: "Sin tareas abiertas",
          description: "Todas las tareas de EcoCampus ya están completadas. Usa «Restablecer demostración» para empezar de nuevo.",
          createdAt: action.now,
          tone: "warning",
        });
      }
      return completeTask(state, task, CURRENT_USER_ID, action.now, "Desde el celular");
    }

    case "COMPLETE_TASK_BY_TEAMMATE": {
      // Prioriza una tarea asignada a otra persona; si no hay, la siguiente abierta.
      const task =
        state.tasks.find((t) => t.status !== "completed" && t.assigneeId !== CURRENT_USER_ID) ?? nextOpenTask(state.tasks);
      if (!task) {
        return pushEvent(state, {
          title: "Sin tareas abiertas",
          description: "Ningún integrante puede completar tareas: todas están terminadas.",
          createdAt: action.now,
          tone: "warning",
        });
      }
      const teammates = state.members.filter((m) => !m.isCurrentUser);
      const byId =
        task.assigneeId !== CURRENT_USER_ID
          ? task.assigneeId
          : teammates[completedCount(state.tasks) % Math.max(teammates.length, 1)]?.id ?? CURRENT_USER_ID;
      return completeTask(state, task, byId, action.now, "Otro integrante");
    }

    case "ADD_MEMBER": {
      const candidate = nextCandidate(state);
      if (!candidate) {
        return pushEvent(state, {
          title: "Equipo completo",
          description: "Ya se incorporaron todos los integrantes de la simulación.",
          createdAt: action.now,
          tone: "warning",
        });
      }
      const name = firstName(candidate);
      let next: DemoState = { ...state, members: [...state.members, { ...candidate }] };
      next = pushNotification(next, {
        kind: "new_member",
        title: "¡Nuevo integrante!",
        message: `${name} se unió a ${state.project.name}`,
        watchHeadline: "¡Nuevo integrante!",
        createdAt: action.now,
        memberId: candidate.id,
      }).state;
      next = pushActivity(next, {
        kind: "member_joined",
        text: `${name} se unió a ${state.project.name}`,
        detail: `${candidate.name} se incorporó como ${candidate.role.toLowerCase()}. Ahora son ${next.members.length} integrantes.`,
        createdAt: action.now,
        memberId: candidate.id,
      });
      return pushEvent(next, {
        title: "Nuevo integrante",
        description: `${candidate.name} (${candidate.role}) se unió. Integrantes: ${next.members.length}. El celular y el reloj ya lo reflejan.`,
        createdAt: action.now,
        tone: "info",
      });
    }

    case "SEND_REMINDER": {
      const task =
        state.tasks.find((t) => t.status !== "completed" && t.assigneeId === CURRENT_USER_ID) ?? nextOpenTask(state.tasks);
      if (!task) {
        return pushEvent(state, {
          title: "Nada que recordar",
          description: "No quedan tareas pendientes en EcoCampus.",
          createdAt: action.now,
          tone: "warning",
        });
      }
      let next = pushNotification(state, {
        kind: "reminder",
        title: "Recordatorio",
        message: `Tienes una tarea pendiente: ${task.title}`,
        watchHeadline: "Recordatorio",
        createdAt: action.now,
        taskId: task.id,
      }).state;
      next = pushActivity(next, {
        kind: "reminder",
        text: `Recordatorio enviado: «${task.title}»`,
        detail: `Estado actual: ${taskStatusLabel(task.status)} · ${task.dueLabel}.`,
        createdAt: action.now,
        taskId: task.id,
      });
      return pushEvent(next, {
        title: "Recordatorio enviado",
        description: `El reloj vibró con «${task.title}» (${taskStatusLabel(task.status).toLowerCase()}). Desde el reloj puedes abrir la tarea en el celular.`,
        createdAt: action.now,
        tone: "info",
      });
    }

    case "SHOW_WEEKLY_SUMMARY": {
      const s = weeklySummary(state, action.now);
      let next: DemoState = { ...state, watch: { name: "summary" }, phone: { name: "summary" } };
      next = pushNotification(next, {
        kind: "progress",
        title: "Progreso del equipo",
        message: `Tu equipo completó ${s.completed} de ${s.total} tareas`,
        watchHeadline: `${s.progress}% de avance`,
        createdAt: action.now,
      }).state;
      // El resumen se abre directamente: no hace falta la alerta emergente encima.
      next = { ...next, watchAlertId: null };
      next = pushActivity(next, {
        kind: "summary",
        text: "Se generó el resumen semanal",
        detail: `${s.completed} completadas, ${s.pending} pendientes, ${s.progress}% de avance y ${s.newMembers} integrante(s) nuevo(s).`,
        createdAt: action.now,
      });
      return pushEvent(next, {
        title: "Resumen semanal",
        description: `El reloj muestra las estadísticas y el celular el detalle completo: ${s.completed}/${s.total} tareas, ${s.progress}% de avance.`,
        createdAt: action.now,
        tone: "info",
      });
    }

    case "MARK_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.notificationId ? { ...n, read: true } : n)),
      };

    case "MARK_ALL_READ":
      return { ...state, notifications: state.notifications.map((n) => (n.read ? n : { ...n, read: true })) };

    case "WATCH_NAVIGATE":
      return { ...state, watch: action.route, watchAlertId: null };

    case "PHONE_NAVIGATE":
      return { ...state, phone: action.route };

    case "OPEN_ON_PHONE": {
      const n = state.notifications.find((x) => x.id === action.notificationId);
      if (!n) return state;
      let phone: PhoneRoute;
      if (n.taskId) phone = { name: "task", taskId: n.taskId };
      else if (n.kind === "new_member") phone = { name: "project", tab: "members" };
      else if (n.kind === "progress") phone = { name: "summary" };
      else phone = { name: "notifications" };
      return {
        ...state,
        phone,
        phoneBannerId: null,
        notifications: state.notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
      };
    }

    case "DISMISS_WATCH_ALERT":
      return { ...state, watchAlertId: null };

    case "DISMISS_PHONE_BANNER":
      return { ...state, phoneBannerId: null };

    case "RESET":
      return pushEvent(createInitialDemoState(action.now), {
        title: "Demostración restablecida",
        description: "Se recuperaron los datos iniciales: 1 de 5 tareas completadas, 4 integrantes y 1 notificación.",
        createdAt: action.now,
        tone: "info",
      });
  }
}
