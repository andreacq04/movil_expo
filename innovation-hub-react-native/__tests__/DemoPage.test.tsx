// La demo renderiza ambos dispositivos y una acción del celular llega al reloj.
import { act, fireEvent, render, screen, within } from "@testing-library/react-native";
import React from "react";

import { DemoPage } from "../src/features/demo/ui/DemoPage";

jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("completar una tarea en el celular actualiza el reloj y el panel", () => {
  render(<DemoPage />);
  expect(screen.getByText("Experiencia multidispositivo")).toBeTruthy();
  expect(screen.getByText("CONTROL DE DEMOSTRACIÓN")).toBeTruthy();

  const watch = screen.getByTestId("watch_simulator");
  expect(within(watch).getByTestId("watch_progress")).toHaveTextContent("20%");
  expect(within(watch).getByTestId("watch_pending")).toHaveTextContent("4 pendientes");

  // Celular: abrir EcoCampus y completar «Investigación de usuarios».
  fireEvent.press(screen.getByTestId("phone_project_card"));
  fireEvent.press(screen.getByTestId("phone_complete_t-investigacion"));

  // El reloj muestra la alerta de celebración…
  expect(within(watch).getByTestId("watch_alert_headline")).toHaveTextContent("¡Excelente! Una tarea más completada");
  // …y al cerrarse sola, la pantalla principal ya refleja el nuevo progreso.
  act(() => {
    jest.advanceTimersByTime(5200);
  });
  expect(within(watch).getByTestId("watch_progress")).toHaveTextContent("40%");
  expect(within(watch).getByTestId("watch_pending")).toHaveTextContent("3 pendientes");
  expect(screen.getByTestId("panel_stat_Avance")).toHaveTextContent("40%");

  // Restablecer vuelve a los datos iniciales.
  fireEvent.press(screen.getByTestId("control_reset"));
  expect(within(watch).getByTestId("watch_progress")).toHaveTextContent("20%");
});

test("panel: nuevo integrante y resumen semanal en ambos dispositivos", () => {
  render(<DemoPage />);
  fireEvent.press(screen.getByTestId("control_member"));
  expect(screen.getByTestId("panel_stat_Integrantes")).toHaveTextContent("5");
  expect(screen.getAllByText("Carlos se unió a EcoCampus", { exact: false }).length).toBeGreaterThan(0);

  fireEvent.press(screen.getByTestId("control_summary"));
  expect(screen.getByTestId("watch_summary")).toBeTruthy();
  expect(screen.getByTestId("phone_summary")).toBeTruthy();
});
