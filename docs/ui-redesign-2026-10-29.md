# Rediseño UI/UX · Carbón y salvia

Entrega: 29 de octubre de 2026 · America/Lima.

El rediseño se implementó en el frontend React existente, sin sustituir la arquitectura ni añadir dependencias. Se revisó el contenido de las **26 rutas solicitadas** y sus componentes compartidos. La comprobación visual de rutas privadas con una sesión autorizada queda pendiente; no se creó ninguna sesión ficticia ni se desactivó la seguridad.

## Cambios realizados

- **Navegación:** sidebar carbón, marca compacta, iconos sin cajas decorativas, indicador activo lateral, submenús y cabecera con divisores discretos. Se mantienen rutas, roles, acciones y cierre móvil.
- **Inicio y autenticación:** composición más sobria, resumen horizontal de capacidades, login con formulario claramente delimitado y etiquetas persistentes. Recuperación, cambio de contraseña y mensajes comparten controles, foco y superficies.
- **Administración:** indicadores de citas agrupados en una franja, ingresos con mayor espacio, métodos de pago en un panel secundario e inventario con filtro y tabla integrados. Formularios de usuarios e inventario alineados, acciones de tablas neutras y fichas de clientes con cifras tabulares.
- **Gráficos:** colores de baja saturación, cuadrícula tenue, tipografía y tooltips comunes, barras con radios moderados y leyendas con altura limitada y desplazamiento. Por solicitud posterior, las leyendas se conservan en las comparativas de ingresos y se retiraron de distribución de servicios, citas por estado, métodos de pago, citas por profesional y servicio e ingresos por servicio. “Ingresos por servicio” describe los importes que ya calculaba la aplicación, sin cambiar su cálculo.
- **Agendas y pagos:** encabezados, formulario de cita a ancho coherente, servicios más compactos, fechas legibles, filas menos decoradas, filtros y modales consistentes. Se conserva cada estado, botón, validación y operación.
- **Clínica:** agrupación de datos de atención, insumos, observaciones e imágenes; secciones del formulario clínico y sus campos condicionales; historial, tratamientos y seguimientos con jerarquía más clara. No se eliminó información clínica.
- **Plan alimentario:** indicadores, comidas y acciones reorganizados; la cuadrícula de comidas pasa de cinco a tres, dos y una columna según el ancho. El documento imprimible mantiene su presentación original.
- **Perfil y contraseña:** identidad y datos organizados por secciones, formularios y confirmaciones uniformes; firma digital sobre lienzo claro.
- **Componentes comunes:** botones, campos, búsquedas, tablas, estados vacíos, modal, selector, calendario, checkbox/radio y carga. El calendario asocia su etiqueta mediante un `id` generado solo para accesibilidad. Se retiró la animación orbital del cargador.

## Design System

| Uso | Token / valor |
|---|---|
| Fondo | `--surface-canvas`: `#101114` |
| Navegación y superficie secundaria | `--surface-subtle`: `#141518` |
| Paneles | `--surface-default`: `#1A1C20` |
| Superficie elevada | `--surface-raised`: `#22252A` |
| Campos | `--surface-input`: `#15171B` |
| Borde / borde de control | `--line-soft`: `#303238`; `--line-strong`: `#454950` |
| Texto principal / secundario | `#F0F0F1` / `#A1A4AB` |
| Etiquetas / texto auxiliar | `#C3C6CC` / `#969AA3` |
| Acento / hover | Salvia `#A8B8A4` / `#C4D0C1` |
| Éxito / advertencia / error / información | `#8CB89E` / `#C9AD7E` / `#CE9198` / `#9DB7C6` |
| Tipografía | Inter ya disponible en el proyecto, con alternativa del sistema |
| Escala | Títulos 22–28 px; sección 16 px; cuerpo 14 px; tablas/controles 13–14 px; ayuda 12 px |
| Espaciado | Múltiplos de 4 px, de 4 a 32 px |
| Radios | 6 px en controles, 8 px en elementos intermedios, 10 px en paneles |
| Interacción | Controles generales de 44 px, transiciones de 140 ms, foco visible y movimiento reducido |

Los aliases de Tailwind `slate` e `indigo` resuelven a neutros y salvia para integrar componentes heredados. Los documentos exportables mantienen sus propios estilos claros. Las tarjetas informativas no reaccionan al hover como si fueran botones. El acento se reserva principalmente para acciones, selección y foco; los estados conservan etiquetas textuales.

Se comprobó el contraste de los tokens de texto: secundario sobre superficie elevada **6,16:1**, auxiliar **5,45:1**, y texto del botón principal sobre salvia **9,04:1**. Estas mediciones no constituyen una certificación de accesibilidad de toda la aplicación.

## Rutas y alcance de la verificación

“Código” significa revisión del componente y sus dependencias visuales, atributos y conexiones existentes. “Acceso” significa que la ruta privada redirige a `/login` sin sesión, no que su flujo interno haya sido ejecutado. Las páginas compartidas reciben el mismo rediseño en cada rol.

| Ruta | Contenido revisado | Verificación de navegador |
|---|---|---|
| `/` | Portada, navegación y pie | Layout a 320, 390, 768 y 1440 px |
| `/login` | Formulario, etiquetas, errores y contraseña | Layout, habilitación, teclado, mostrar/ocultar, enlace de recuperación |
| `/reset-password` | Recuperación, mensajes y estados | Layout y navegación desde login |
| `/administrador/dashboard-general` | KPI, filtros, ingresos, pagos e inventario | Acceso; interior revisado en código |
| `/administrador/gestion-de-usuarios-y-roles` | Registro, tabla, tarjetas y confirmaciones | Acceso; interior revisado en código |
| `/administrador/gestion-de-clientes` | Búsqueda, fichas, detalle, galería y exportación | Acceso; interior revisado en código |
| `/administrador/gestion-de-inventario` | Formularios, filtros, tablas y edición | Acceso; interior revisado en código |
| `/administrador/gestion-de-facturacion-y-pagos` | Reportes de servicios, importes y detalle compartidos | Acceso; interior revisado en código |
| `/administrador/reportes-avanzados` | Comparativas, profesionales y distribución de ingresos | Acceso; interior revisado en código |
| `/administrador/ajustes/perfil` | Identidad, formulario y confirmaciones | Acceso; interior revisado en código |
| `/administrador/ajustes/contrasena` | Campos, guía y confirmaciones | Acceso; interior revisado en código |
| `/cosmiatra/gestion-de-citas` | Formulario, servicios, agenda, fechas y estados | Acceso; interior revisado en código |
| `/cosmiatra/registrar-tratamiento` | Datos, insumos, observaciones e imágenes | Acceso; interior revisado en código |
| `/cosmiatra/gestion-de-pagos` | Búsqueda, tabla y registro de pago | Acceso; interior revisado en código |
| `/cosmiatra/historial-de-clientes` | Clientes, atenciones y seguimientos alimentarios | Acceso; interior revisado en código |
| `/cosmiatra/reportes-de-servicios-e-ingresos` | Filtros, historial, servicios e importes | Acceso; interior revisado en código |
| `/cosmiatra/ajustes/perfil` | Formulario compartido de perfil | Acceso; interior revisado en código |
| `/cosmiatra/ajustes/contrasena` | Formulario compartido de contraseña | Acceso; interior revisado en código |
| `/cosmiatra/historial-de-clientes/plan?historia=<id>` | Indicadores, menú, notas, finalización y vista previa | Acceso de la ruta base; consulta de historia revisada en código |
| `/doctor/agenda-de-citas` | Formulario y listado de citas | Acceso; interior revisado en código |
| `/doctor/historial-de-pacientes` | Búsqueda, detalle, tratamientos y documentos | Acceso; interior revisado en código |
| `/doctor/historial-de-pacientes/formulario` | Secciones clínicas, campos y tablas condicionales | Acceso; interior revisado en código |
| `/doctor/registrar-tratamiento` | Formulario de atención compartido | Acceso; interior revisado en código |
| `/doctor/mis-reportes` | Evolución, tratamientos, estados e insumos | Acceso; interior revisado en código |
| `/doctor/ajustes/perfil` | Perfil, CMP y firma digital | Acceso; interior revisado en código |
| `/doctor/ajustes/contrasena` | Formulario compartido de contraseña | Acceso; interior revisado en código |

También se actualizaron los controles de `/new-password`; no se probó una recuperación real con token válido.

## Archivos principales

- [`src/index.css`](../src/index.css): tokens, tipografía, controles, tablas, estados, calendarios y foco.
- [`src/styles/shell.css`](../src/styles/shell.css): navegación, acceso y ajustes de cuenta.
- [`DashboardLayout.jsx`](../src/layout/DashboardLayout.jsx), [`Sidebar.jsx`](../src/components/Sidebar/Sidebar.jsx), [`Topbar.jsx`](../src/components/Topbar/Topbar.jsx): estructura principal.
- `src/components/Home/`, `Login/`, `ResetPassword/`, `NewPassword/`, `Perfil/` y `src/pages/settings/`: páginas públicas y cuenta.
- [`DashboardGeneral.jsx`](../src/pages/admin/DashboardGeneral.jsx), `src/components/DashboardGeneral/`, `DashboardDoctor/`, `ReportesAvanzados/` y [`chartTheme.js`](../src/components/DashboardDoctor/chartTheme.js): composición y visualización de datos.
- `src/components/GestionUsuariosRoles/`, `GestionClientes/`, `GestionInventario/`, `GestionPagos/`: formularios, listas y modales.
- `src/pages/cosmiatra/`, `src/pages/doctor/`, `src/components/FormularioPeptidos/`, `HistorialPacientes/`, `PlanAlimentario/`: trabajo clínico y seguimiento.
- [`index.html`](../index.html) y [`vite.config.js`](../vite.config.js): color visual de navegador/PWA, sin cambios a caché o servicios.

## Validaciones y resultados

| Comprobación | Resultado |
|---|---|
| `npm run lint` | Sin errores |
| `node --test` | 26 archivos aprobados, 0 fallidos; pruebas originales intactas |
| `npm run build` | Compilación y PWA correctas; advertencia de chunk >500 kB, también presente al compilar HEAD |
| `git diff --check` | Sin errores de formato |
| Revisión AST + diff de JSX | Se conservaron atributos funcionales y conexiones; excepciones visuales: hover decorativo eliminado y `type="button"` añadido a ficha interactiva |
| Archivos de lógica y rutas | APIs, servicios, hooks, utilidades, contexto, App, rutas/menús por rol y dependencias sin cambios |
| Páginas públicas | 12 combinaciones de ruta/ancho antes y 12 después; 0 overflow global y 0 errores JavaScript |
| Interacciones públicas y acceso | 29 comprobaciones aprobadas, incluidas las 23 redirecciones privadas; 0 solicitudes de escritura |
| Componentes aislados | 14 comprobaciones: layouts, gráficos, selector, calendario/hora, radios, checkbox y modal; sin errores de consola |
| Backend | `git -C ../Backend_Estetico status --porcelain=v1` sin entradas: árbol de trabajo limpio |

No hay un script de TypeScript en este proyecto JavaScript. No se afirma haber ejecutado uno.

La revisión detectó una prueba de seguimiento que identificaba elementos por sus clases. Se conservaron esas clases y la prueba volvió a pasar, sin modificar la prueba ni su lógica. También se corrigió la asociación `label`/`id` del calendario y la disposición del encabezado del gráfico de pagos.

## Capturas y evidencias

- [Comparación visual de inicio, login y recuperación](ui-review/2026-10-29/index.html), con enlaces a variantes móviles.
- [Informe público antes](ui-review/2026-10-29/antes/report.json) y [después](ui-review/2026-10-29/despues/report.json).
- [Informe de componentes aislados](ui-review/2026-10-29/componentes/report.json) y [calendario en móvil](ui-review/2026-10-29/componentes/calendar-390.png).
- [Verificación del alcance y backend](ui-review/2026-10-29/scope-verification.json).

Las capturas públicas no contienen pacientes. Las de componentes están identificadas como pruebas aisladas con valores sintéticos: no son páginas privadas autenticadas ni datos sustituidos en la aplicación. El harness temporal no forma parte del frontend.

## Limitaciones

- No se dispuso de una sesión de prueba autorizada de administrador, doctor o cosmiatra. Falta validar visualmente los interiores completos con datos representativos, así como guardar/editar/pagar/exportar y comprobar permisos entre cuentas reales.
- No se enviaron pagos, registros clínicos, cambios de cuenta ni correos de recuperación. La equivalencia de estas operaciones se apoya en el diff y las pruebas existentes; no en una prueba de integración contra el backend.
- Las comprobaciones de layout se hicieron en Chromium. No se certifican Safari, Firefox, lectores de pantalla ni conformidad completa con WCAG.
- En el selector heredado, una ráfaga automatizada de flechas sin pausas puede adelantarse al efecto de apertura; la secuencia con 100 ms entre teclas funciona. Su lógica no se modificó en este rediseño.
- Se mantiene la advertencia de tamaño del bundle: dividirlo requeriría otro cambio de arquitectura.
- La eliminación local de `plan.png` ya existía al comenzar y se conservó. No hubo operaciones destructivas de Git.
