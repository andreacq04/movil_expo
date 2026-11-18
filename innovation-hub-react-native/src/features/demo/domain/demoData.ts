// Datos FICTICIOS de la demostración. Todo vive en memoria: restablecer la demo
// vuelve exactamente a este estado. Para cambiar nombres o tareas antes de la
// exposición basta con editar este archivo.
import { Brand, Palette } from "@/src/core/theme/brand";

import { DemoMember, DemoState, DemoTask } from "./demoModels";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const CURRENT_USER_ID = "m-andrea";

export const INITIAL_MEMBERS: DemoMember[] = [
  { id: CURRENT_USER_ID, name: "Andrea Quintero", role: "Líder del proyecto", color: Brand.violet, joinedThisWeek: false, isCurrentUser: true },
  { id: "m-maria", name: "María Gómez", role: "Diseñadora UX/UI", color: Brand.cyan, joinedThisWeek: false },
  { id: "m-luis", name: "Luis Pérez", role: "Desarrollador frontend", color: Brand.purple, joinedThisWeek: false },
  { id: "m-sofia", name: "Sofía Ruiz", role: "Investigadora de usuarios", color: Brand.lime, joinedThisWeek: true },
];

/** Personas que se pueden incorporar con «Simular nuevo integrante» (en orden). */
export const CANDIDATE_MEMBERS: DemoMember[] = [
  { id: "m-carlos", name: "Carlos Martínez", role: "Tester QA", color: Palette.violetSoft, joinedThisWeek: true },
  { id: "m-valentina", name: "Valentina Díaz", role: "Documentadora técnica", color: Palette.progressBackground, joinedThisWeek: true },
  { id: "m-julian", name: "Julián Torres", role: "Desarrollador backend", color: Palette.limeTint, joinedThisWeek: true },
];

function initialTasks(now: Date): DemoTask[] {
  return [
    {
      id: "t-diseno",
      title: "Diseño de interfaz",
      description: "Prototipo en alta fidelidad de las pantallas principales de EcoCampus.",
      status: "completed",
      assigneeId: "m-maria",
      completedById: "m-maria",
      completedAt: new Date(now.getTime() - 2 * DAY),
      dueLabel: "Entregada",
    },
    {
      id: "t-investigacion",
      title: "Investigación de usuarios",
      description: "Entrevistas a estudiantes sobre reciclaje y puntos ecológicos del campus.",
      status: "in_progress",
      assigneeId: CURRENT_USER_ID,
      completedById: null,
      completedAt: null,
      dueLabel: "Vence mañana",
    },
    {
      id: "t-frontend",
      title: "Desarrollo frontend",
      description: "Implementar en React Native las pantallas del prototipo aprobado.",
      status: "pending",
      assigneeId: "m-luis",
      completedById: null,
      completedAt: null,
      dueLabel: "Vence en 5 días",
    },
    {
      id: "t-pruebas",
      title: "Pruebas de usabilidad",
      description: "Sesiones con 5 estudiantes para validar los flujos principales.",
      status: "pending",
      assigneeId: "m-sofia",
      completedById: null,
      completedAt: null,
      dueLabel: "Vence en 1 semana",
    },
    {
      id: "t-documentacion",
      title: "Documentación",
      description: "Informe final con decisiones de diseño, hallazgos y resultados.",
      status: "pending",
      assigneeId: CURRENT_USER_ID,
      completedById: null,
      completedAt: null,
      dueLabel: "Vence en 2 semanas",
    },
  ];
}

export function createInitialDemoState(now: Date = new Date()): DemoState {
  const t = now.getTime();
  return {
    project: {
      id: "p-ecocampus",
      name: "EcoCampus",
      description:
        "App para que la comunidad universitaria encuentre puntos de reciclaje, registre sus aportes y participe en retos ecológicos dentro del campus.",
      category: "Medio ambiente",
      status: "En curso",
    },
    tasks: initialTasks(now),
    members: INITIAL_MEMBERS.map((m) => ({ ...m })),
    notifications: [
      {
        id: "n-0",
        kind: "task_completed",
        title: "¡Tarea completada!",
        message: "María terminó Diseño de interfaz",
        watchHeadline: "¡Excelente! Una tarea más completada",
        createdAt: new Date(t - 2 * DAY),
        read: false,
        taskId: "t-diseno",
        memberId: "m-maria",
      },
    ],
    activity: [
      {
        id: "a-2",
        kind: "task_completed",
        text: "María completó «Diseño de interfaz»",
        detail: "El prototipo en alta fidelidad quedó aprobado por el equipo.",
        createdAt: new Date(t - 2 * DAY),
        taskId: "t-diseno",
        memberId: "m-maria",
      },
      {
        id: "a-1",
        kind: "member_joined",
        text: "Sofía se unió a EcoCampus",
        detail: "Sofía se incorporó como investigadora de usuarios.",
        createdAt: new Date(t - 3 * DAY),
        memberId: "m-sofia",
      },
      {
        id: "a-0",
        kind: "project_created",
        text: "Andrea creó el proyecto EcoCampus",
        detail: "Se publicó la idea y se definieron 5 tareas para el equipo.",
        createdAt: new Date(t - 5 * DAY),
        memberId: CURRENT_USER_ID,
      },
    ],
    phone: { name: "projects" },
    watch: { name: "home" },
    watchAlertId: null,
    phoneBannerId: null,
    events: [],
    seq: 1,
  };
}
