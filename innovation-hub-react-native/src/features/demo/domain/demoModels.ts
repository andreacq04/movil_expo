// Modelos de la DEMO multidispositivo (celular + smartwatch).
//
// Son modelos propios y ficticios: la demo NO usa los repositorios de Roble ni
// los modelos reales (ProjectTask, ProjectMember, AppNotification), para que
// ninguna acción de la exposición pueda tocar datos de usuarios.

export type DemoTaskStatus = "completed" | "in_progress" | "pending";

export type DemoTask = {
  id: string;
  title: string;
  description: string;
  status: DemoTaskStatus;
  /** Id del integrante responsable. */
  assigneeId: string;
  /** Quién la completó (si está completada). */
  completedById: string | null;
  completedAt: Date | null;
  dueLabel: string;
};

export type DemoMember = {
  id: string;
  name: string;
  role: string;
  /** Color de fondo del avatar (siempre de la paleta de la marca). */
  color: string;
  /** Se unió durante esta semana (cuenta para el resumen semanal). */
  joinedThisWeek: boolean;
  isCurrentUser?: boolean;
};

export type DemoNotificationKind = "task_completed" | "new_member" | "reminder" | "progress";

export type DemoNotification = {
  id: string;
  kind: DemoNotificationKind;
  title: string;
  message: string;
  /** Texto corto de celebración/alerta que muestra el reloj al recibirla. */
  watchHeadline: string;
  createdAt: Date;
  read: boolean;
  /** Tarea relacionada (para abrir su detalle en el celular). */
  taskId?: string;
  memberId?: string;
};

export type DemoActivityKind = "task_completed" | "member_joined" | "reminder" | "summary" | "project_created";

export type DemoActivity = {
  id: string;
  kind: DemoActivityKind;
  text: string;
  detail: string;
  createdAt: Date;
  taskId?: string;
  memberId?: string;
};

export type DemoProject = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
};

/** Pantallas del celular simulado. */
export type PhoneRoute =
  | { name: "projects" }
  | { name: "project"; tab: ProjectTab }
  | { name: "task"; taskId: string }
  | { name: "activity"; activityId: string }
  | { name: "notifications" }
  | { name: "summary" };

export type ProjectTab = "tasks" | "members" | "activity";

/** Vistas del reloj simulado. */
export type WatchRoute =
  | { name: "home" }
  | { name: "notifications"; index: number }
  | { name: "detail"; notificationId: string }
  | { name: "summary" };

/** Último evento ejecutado (lo muestra el panel de control). */
export type DemoEvent = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  tone: "success" | "info" | "warning";
};

export type DemoState = {
  project: DemoProject;
  tasks: DemoTask[];
  members: DemoMember[];
  notifications: DemoNotification[];
  activity: DemoActivity[];
  phone: PhoneRoute;
  watch: WatchRoute;
  /** Notificación que el reloj está mostrando como alerta entrante. */
  watchAlertId: string | null;
  /** Notificación que el celular muestra como banner superior. */
  phoneBannerId: string | null;
  events: DemoEvent[];
  /** Contador para generar ids estables y predecibles. */
  seq: number;
};

export type WeeklySummaryData = {
  completed: number;
  pending: number;
  total: number;
  progress: number;
  newMembers: number;
  completedThisWeek: number;
};
