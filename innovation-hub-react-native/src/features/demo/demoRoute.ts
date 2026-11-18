// Entrada independiente de la demo en Expo Web: http://localhost:8081/demo
// (también vale ?demo, útil si un servidor estático no redirige rutas).
// En iOS/Android siempre devuelve false: la app original no cambia.
import { Platform } from "react-native";

export function isDemoRoute(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined" || !window.location) return false;
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  if (path === "/demo" || path.endsWith("/demo")) return true;
  return new URLSearchParams(window.location.search).has("demo");
}
