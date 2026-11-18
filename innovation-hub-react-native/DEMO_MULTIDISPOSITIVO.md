# Demo multidispositivo: celular + smartwatch

Demo interactiva para la exposición **«Diseño de interfaces adaptativas y experiencia de usuario en aplicaciones móviles y relojes inteligentes»**. Se ejecuta en el navegador del computador. No necesita teléfono, reloj ni emulador.

## Cómo abrirla

```bash
npm install          # solo la primera vez
npm run web          # equivale a: npx expo start --web
```

Luego abre **http://localhost:8081/demo**. Si un servidor no redirige rutas, también funciona `http://localhost:8081/?demo`.

La app original sigue en **http://localhost:8081/** sin cambios. En iOS y Android la demo nunca se activa.

## Qué se ve

- **Encabezado**: logo de Proyéctate, «Experiencia multidispositivo», el subtítulo y el indicador «Simulación activa».
- **Celular (izquierda)**: marco con isla dinámica, barra de estado y la app simplificada:
  - Mis proyectos (EcoCampus con descripción, avance, integrantes y pendientes).
  - Detalle con pestañas Tareas, Integrantes y Actividad.
  - Detalle de tarea con «Completar tarea».
  - Detalle de actividad.
  - Notificaciones.
  - Resumen semanal.
  - Banner push.
- **Smartwatch (derecha)**: caja circular con correas, corona y botón lateral, y vistas adaptadas al círculo:
  - Inicio: hora, proyecto, anillo de avance, pendientes y contador de notificaciones.
  - Carrusel de notificaciones con flechas, puntos y deslizamiento.
  - Detalle con «Leída» y «Celular».
  - Resumen semanal.
  - Alerta entrante con vibración.
- **Control de demostración**: seis botones, el último evento y el historial.

## Guion sugerido para la exposición

1. **Completar una tarea.** En el celular toca EcoCampus y luego «Completar» en *Investigación de usuarios*, o usa el botón del panel. Pasa lo siguiente:
   - La tarea queda completada y el avance sube de 20 % a 40 %.
   - El reloj vibra y muestra «¡Excelente! Una tarea más completada».
   - El resumen semanal se actualiza.
2. **Nuevo integrante.** Pulsa «Simular nuevo integrante». Carlos se une, el reloj muestra «¡Nuevo integrante! Carlos se unió a EcoCampus» y el celular lo lista en Integrantes con la etiqueta *Nuevo*.
3. **Recordatorio.** Pulsa «Enviar recordatorio». El reloj muestra «Tienes una tarea pendiente: …» con su estado. Toca la alerta y luego «Celular»: el celular abre el detalle de esa tarea.
4. **Otro integrante.** Pulsa «Tarea completada por otro integrante». Por ejemplo, Luis termina *Desarrollo frontend*.
5. **Resumen semanal.** Pulsa «Ver resumen semanal». El reloj muestra las estadísticas y el celular el detalle completo, y llega la notificación «Tu equipo completó X de 5 tareas».
6. **Interacción en el reloj.** El botón lateral abre las notificaciones. Las flechas o el deslizamiento las recorren. Al tocar una se ve su detalle, donde se puede marcar como leída. La corona vuelve al inicio.
7. **Restablecer demostración** devuelve todo a los datos iniciales.

## Arquitectura

```
src/features/demo/
├── demoRoute.ts                 # Detecta /demo (solo web)
├── domain/
│   ├── demoModels.ts            # Tipos de la demo (tareas, integrantes, notificaciones…)
│   ├── demoData.ts              # Datos ficticios iniciales (EcoCampus)
│   └── demoReducer.ts           # Lógica única: acciones + selectores (progreso, resumen…)
└── ui/
    ├── DemoStore.tsx            # Estado centralizado (Context + useReducer)
    ├── DemoPage.tsx             # Página: encabezado, dispositivos, puente de sincronización
    ├── DemoControlPanel.tsx     # «CONTROL DE DEMOSTRACIÓN»
    ├── components/
    │   ├── demoBits.tsx         # Avatar, chip de estado, anillo de progreso, iconos
    │   ├── NotificationCard.tsx # Variante celular y variante reloj
    │   └── WeeklySummary.tsx    # Variante celular y variante reloj
    ├── phone/
    │   ├── PhoneSimulator.tsx   # Marco, barra de estado, barra inferior, banner push
    │   └── PhoneScreens.tsx     # Pantallas de la app simplificada
    └── watch/
        ├── WatchSimulator.tsx   # Caja, correas, corona, vibración
        └── WatchScreens.tsx     # Vistas adaptadas al círculo
```

**Sincronización:** el celular, el reloj y el panel leen el mismo estado y despachan acciones al mismo reducer puro (`demoReducer`). Las cifras salen de selectores compartidos (`progressPercent`, `pendingCount`, `weeklySummary`), así que ningún dispositivo puede mostrar un número distinto.

**Reutilizado de la app:**
- `brand.ts` (Brand y Palette), `homeColors.ts` y `shadow.ts`.
- `MaterialIcon` (mismas fuentes de iconos).
- `InkWell`, `FilledButton`, `TextButton` y `LinearProgressIndicator`.
- `BrandLogo`, `BrandGradientBox` y `timeAgo`.
- Los estilos de `MyProjectCard`, `NotificationTile` y `HomeBottomNavigation`.

No se añadió ninguna dependencia.

## Qué es simulado y qué es de la app original

| Simulado (solo en la demo) | App original (sin cambios) |
|---|---|
| Proyecto EcoCampus, tareas, integrantes, actividad y notificaciones (datos en memoria) | Proyectos, tareas, miembros y notificaciones reales en Roble |
| Smartwatch y sus vistas | Pantallas, navegación, sesión y Roble |
| Resumen semanal y banner push | Identidad visual, iconos y componentes base (reutilizados) |

La demo **no** se conecta a Roble, no usa el contenedor de dependencias ni la sesión, y no guarda nada. Recargar la página también la restablece.

## Archivos

- **Creados**:
  - `src/features/demo/**` (14 archivos).
  - `__tests__/unit/demo.test.ts`.
  - `__tests__/DemoPage.test.tsx`.
  - Este documento.
- **Modificados**: `App.tsx`, solo para añadir la rama `if (isDemoRoute())` después de cargar las fuentes y sus dos importaciones.

Para cambiar nombres, tareas o textos, edita `src/features/demo/domain/demoData.ts`.

## Validaciones ejecutadas

- `npm run typecheck`: sin errores.
- `npm run lint`: sin errores ni advertencias.
- `npm run test:ci`: 7 suites y 87 pruebas aprobadas, de ellas 11 nuevas de la demo:
  - Los cuatro escenarios.
  - Restablecer.
  - Casos sin tareas abiertas.
  - La sincronización celular → reloj → panel en la interfaz.
- Expo Web arranca y `/demo` responde 200.
- Recorrido completo en Chrome:
  - Sin errores de consola.
  - Sin desbordamiento horizontal a 1440×900, 1280×720 y 420×860.
  - `/` sigue mostrando la Bienvenida de la app original.
