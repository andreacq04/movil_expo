// Estado centralizado de la demo (React Context + useReducer).
//
// El celular, el reloj y el panel de control leen el MISMO estado y despachan
// acciones al MISMO reducer: esa es la «sincronización» entre dispositivos.
// No usa Roble, ni el contenedor de dependencias, ni almacenamiento: al
// recargar la página o pulsar «Restablecer» todo vuelve a los datos iniciales.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";

import { createInitialDemoState } from "../domain/demoData";
import { DemoState, PhoneRoute, WatchRoute } from "../domain/demoModels";
import { DemoAction, demoReducer } from "../domain/demoReducer";

export type DemoActions = {
  completeTask: (taskId?: string) => void;
  completeTaskByTeammate: () => void;
  addMember: () => void;
  sendReminder: () => void;
  showWeeklySummary: () => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
  openOnPhone: (notificationId: string) => void;
  phoneNavigate: (route: PhoneRoute) => void;
  watchNavigate: (route: WatchRoute) => void;
  dismissWatchAlert: () => void;
  dismissPhoneBanner: () => void;
  reset: () => void;
};

type DemoContextValue = { state: DemoState; actions: DemoActions; dispatch: React.Dispatch<DemoAction>; now: Date };

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children, initialState }: { children: React.ReactNode; initialState?: DemoState }) {
  const [state, dispatch] = useReducer(demoReducer, initialState ?? null, (s) => s ?? createInitialDemoState());

  // Reloj compartido: la hora del smartwatch y los «Hace X min» se refrescan solos.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  const d = useCallback((a: DemoAction) => {
    dispatch(a);
    setNow(new Date());
  }, []);

  const actions = useMemo<DemoActions>(
    () => ({
      completeTask: (taskId) => d({ type: "COMPLETE_TASK", taskId, now: new Date() }),
      completeTaskByTeammate: () => d({ type: "COMPLETE_TASK_BY_TEAMMATE", now: new Date() }),
      addMember: () => d({ type: "ADD_MEMBER", now: new Date() }),
      sendReminder: () => d({ type: "SEND_REMINDER", now: new Date() }),
      showWeeklySummary: () => d({ type: "SHOW_WEEKLY_SUMMARY", now: new Date() }),
      markRead: (notificationId) => d({ type: "MARK_READ", notificationId }),
      markAllRead: () => d({ type: "MARK_ALL_READ" }),
      openOnPhone: (notificationId) => d({ type: "OPEN_ON_PHONE", notificationId }),
      phoneNavigate: (route) => d({ type: "PHONE_NAVIGATE", route }),
      watchNavigate: (route) => d({ type: "WATCH_NAVIGATE", route }),
      dismissWatchAlert: () => d({ type: "DISMISS_WATCH_ALERT" }),
      dismissPhoneBanner: () => d({ type: "DISMISS_PHONE_BANNER" }),
      reset: () => d({ type: "RESET", now: new Date() }),
    }),
    [d],
  );

  const value = useMemo(() => ({ state, actions, dispatch, now }), [state, actions, now]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo debe usarse dentro de <DemoProvider>");
  return ctx;
}
