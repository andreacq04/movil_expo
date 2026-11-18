// Lógica de la demo multidispositivo (reducer compartido por celular y reloj).
import { createInitialDemoState } from "../../src/features/demo/domain/demoData";
import {
  demoReducer,
  pendingCount,
  progressPercent,
  unreadCount,
  weeklySummary,
} from "../../src/features/demo/domain/demoReducer";

const now = new Date("2026-11-17T10:00:00");

describe("demo multidispositivo", () => {
  test("estado inicial: EcoCampus con 5 tareas, 1 completada y 4 integrantes", () => {
    const s = createInitialDemoState(now);
    expect(s.project.name).toBe("EcoCampus");
    expect(s.tasks.map((t) => t.title)).toEqual([
      "Diseño de interfaz",
      "Investigación de usuarios",
      "Desarrollo frontend",
      "Pruebas de usabilidad",
      "Documentación",
    ]);
    expect(s.tasks.map((t) => t.status)).toEqual(["completed", "in_progress", "pending", "pending", "pending"]);
    expect(progressPercent(s.tasks)).toBe(20);
    expect(s.members).toHaveLength(4);
    expect(s.notifications[0].message).toBe("María terminó Diseño de interfaz");
  });

  test("escenario 1: completar «Investigación de usuarios» actualiza progreso, notifica al reloj y al resumen", () => {
    const s0 = createInitialDemoState(now);
    const s1 = demoReducer(s0, { type: "COMPLETE_TASK", taskId: "t-investigacion", now });
    expect(s1.tasks.find((t) => t.id === "t-investigacion")?.status).toBe("completed");
    expect(progressPercent(s1.tasks)).toBe(40);
    expect(pendingCount(s1.tasks)).toBe(3);
    const n = s1.notifications[0];
    expect(n.kind).toBe("task_completed");
    expect(n.message).toBe("Andrea terminó Investigación de usuarios");
    expect(n.watchHeadline).toBe("¡Excelente! Una tarea más completada");
    expect(s1.watchAlertId).toBe(n.id);
    expect(unreadCount(s1.notifications)).toBe(2);
    expect(weeklySummary(s1, now).completed).toBe(2);
    expect(s1.events[0].title).toBe("Tarea completada");
  });

  test("escenario 2: nuevo integrante (Carlos) se suma al equipo y al reloj", () => {
    const s = demoReducer(createInitialDemoState(now), { type: "ADD_MEMBER", now });
    expect(s.members).toHaveLength(5);
    expect(s.members[4].name).toBe("Carlos Martínez");
    expect(s.notifications[0].message).toBe("Carlos se unió a EcoCampus");
    expect(s.watchAlertId).toBe(s.notifications[0].id);
    expect(weeklySummary(s, now).newMembers).toBe(2);
  });

  test("escenario 3: recordatorio de la tarea pendiente y apertura en el celular", () => {
    const s1 = demoReducer(createInitialDemoState(now), { type: "SEND_REMINDER", now });
    const n = s1.notifications[0];
    expect(n.message).toBe("Tienes una tarea pendiente: Investigación de usuarios");
    expect(n.taskId).toBe("t-investigacion");
    const s2 = demoReducer(s1, { type: "OPEN_ON_PHONE", notificationId: n.id });
    expect(s2.phone).toEqual({ name: "task", taskId: "t-investigacion" });
    expect(s2.notifications[0].read).toBe(true);
  });

  test("escenario 4: el resumen semanal abre las estadísticas en ambos dispositivos", () => {
    let s = createInitialDemoState(now);
    s = demoReducer(s, { type: "COMPLETE_TASK", now });
    s = demoReducer(s, { type: "COMPLETE_TASK_BY_TEAMMATE", now });
    s = demoReducer(s, { type: "COMPLETE_TASK_BY_TEAMMATE", now });
    s = demoReducer(s, { type: "SHOW_WEEKLY_SUMMARY", now });
    expect(s.watch).toEqual({ name: "summary" });
    expect(s.phone).toEqual({ name: "summary" });
    expect(s.notifications[0].message).toBe("Tu equipo completó 4 de 5 tareas");
    expect(weeklySummary(s, now).progress).toBe(80);
  });

  test("otro integrante completa tareas a su nombre", () => {
    const s = demoReducer(createInitialDemoState(now), { type: "COMPLETE_TASK_BY_TEAMMATE", now });
    expect(s.notifications[0].message).toBe("Luis terminó Desarrollo frontend");
  });

  test("marcar como leída y navegar en el reloj", () => {
    let s = createInitialDemoState(now);
    s = demoReducer(s, { type: "WATCH_NAVIGATE", route: { name: "detail", notificationId: "n-0" } });
    expect(s.watch.name).toBe("detail");
    s = demoReducer(s, { type: "MARK_READ", notificationId: "n-0" });
    expect(unreadCount(s.notifications)).toBe(0);
  });

  test("sin tareas abiertas no se generan notificaciones falsas", () => {
    let s = createInitialDemoState(now);
    for (let i = 0; i < 4; i++) s = demoReducer(s, { type: "COMPLETE_TASK", now });
    expect(pendingCount(s.tasks)).toBe(0);
    const count = s.notifications.length;
    s = demoReducer(s, { type: "COMPLETE_TASK", now });
    s = demoReducer(s, { type: "SEND_REMINDER", now });
    expect(s.notifications).toHaveLength(count);
    expect(s.events[0].tone).toBe("warning");
  });

  test("restablecer recupera exactamente los datos iniciales", () => {
    let s = createInitialDemoState(now);
    s = demoReducer(s, { type: "COMPLETE_TASK", now });
    s = demoReducer(s, { type: "ADD_MEMBER", now });
    s = demoReducer(s, { type: "PHONE_NAVIGATE", route: { name: "summary" } });
    s = demoReducer(s, { type: "RESET", now });
    const fresh = createInitialDemoState(now);
    expect(s.tasks).toEqual(fresh.tasks);
    expect(s.members).toEqual(fresh.members);
    expect(s.notifications).toEqual(fresh.notifications);
    expect(s.phone).toEqual({ name: "projects" });
    expect(s.watch).toEqual({ name: "home" });
  });
});
