# Auditoría UI/UX · Minimalist Dark

Fecha: 11 de octubre de 2026 · America/Lima.

## 1. Resumen y alcance

Se modernizó exclusivamente la presentación del frontend React existente. El tema oscuro se aplica a páginas públicas, autenticación, administrador, cosmiatra y doctor. Se mantienen contenido, componentes funcionales y contratos de negocio; los documentos clínicos y comprobantes imprimibles conservan fondo blanco.

No se modificaron backend, endpoints, servicios, hooks de datos, autenticación, permisos, validaciones, cálculos, búsquedas, paginación, selección de fechas ni manejadores funcionales. No se añadieron dependencias al proyecto.

La inspección inicial confirmó React 18, Vite, Tailwind CSS 4, React Router, Recharts, react-datepicker, React Modal y los adaptadores de imágenes protegidas. La implementación reutiliza esa arquitectura, sin sustituir su framework CSS.

## 2. Sistema de colores y tokens

| Uso | Token | Valor |
|---|---|---|
| Canvas | `--surface-canvas` | `#0B0F14` |
| Inputs / navegación | `--surface-input` | `#111827` |
| Panel / tarjeta / documento emergente | `--surface-default` | `#161D29` |
| Superficie elevada | `--surface-raised` | `#1E293B` |
| Borde discreto | `--line-soft` | `#2B3648` |
| Borde de controles | `--line-strong` | `#465570` |
| Texto principal | `--text-primary` | `#F1F5F9` |
| Texto secundario | `--text-secondary` | `#A0AEC0` |
| Información auxiliar | `--text-muted` | `#94A3B8` |
| Acento principal | `--accent` | `#818CF8` |
| Hover / foco | `--accent-hover` | `#A5B4FC` |
| Éxito / advertencia / error / información | `--success / --warning / --danger / --info` | Emerald / amber / rose / sky |

Los nombres antiguos `--bg-*`, `--accent-cyan` y `--accent-violet` permanecen como alias de compatibilidad, no como estilos separados. La aplicación deja de depender de transparencias para la legibilidad de sus paneles.

Se centralizan espaciados de 4–32 px, controles de 44 px, radios de 10–16 px, sombras discretas, transiciones de 160 ms y capas de overlays. Los breakpoints reutilizan Tailwind: sm 640, md 768, lg 1024, xl 1280 y 2xl 1536 px; 320 px es el ancho base mínimo revisado.

La tipografía mantiene Inter cuando esté disponible y la pila local del sistema como alternativa, sin añadir descargas externas. Los títulos, descripciones, etiquetas, ayudas y encabezados de tabla tienen jerarquías comunes.

## 3. Componentes y arquitectura visual

- `src/index.css`: tokens y primitivas `ui-panel`, `ui-card`, `ui-control`, `ui-button`, `ui-table`, `ui-modal`, búsquedas, gráficos y calendarios.
- Layouts y navegación: superficies sólidas, rutas activas discretas, nombres ajustables y sidebar móvil con botón de cierre accesible por encima de su panel.
- Portada y autenticación: menos decoración, estructura clara y separación permanente entre icono y texto del campo.
- Perfil y contraseña: controles coherentes, modales contenidos y firma sobre lienzo blanco.
- Formulario clínico: agrupación visual, campos numéricos cómodos, tablas con scroll interno y lectura más clara de datos médicos deshabilitados.
- Estados de carga, desconexión, errores y confirmaciones: superficies y mensajes consistentes.

Los estilos reutilizables están en `@layer components`, permitiendo a las utilidades Tailwind ajustar presentación sin perder, por ejemplo, el padding necesario para un icono. Los overrides de react-datepicker están aislados y no cambian sus eventos ni selección. `chartTheme.js` contiene únicamente configuración visual compartida de Recharts.

## 4. Calendarios

Se uniformaron cabeceras, navegación, día actual, selección, días fuera de mes, estados deshabilitados y selección de hora/minuto. Las etiquetas siguen siendo distinguibles sin depender exclusivamente del color. Los selectores conservan sus portales y la protección existente de clics externos.

Se retiraron espaciados dinámicos que provocaban saltos de layout al abrir el filtro mensual. No se cambiaron fechas, disponibilidad, localización, formatos ni callbacks. La selección de minutos conserva el cierre del calendario ya existente.

## 5. Gráficos y dashboards

Paleta de series centralizada: indigo `#818CF8`, teal `#5FB9AE`, amber `#E0B96B`, rose `#D98F9D` y slate `#93A7BF`. Las series comparativas conservan nombres y pueden distinguirse también mediante trazos.

Tarjetas, cabeceras, ejes, leyendas, cuadrículas y tooltips comparten escala visual. Las rejillas evitan dos gráficos estrechos cuando el ancho disponible no lo permite; los gráficos extensos utilizan scroll contenido. Se desactivó la animación visual de series, sin modificar datos, fórmulas, filtros ni agrupaciones.

## 6. Tablas

Cabeceras más claras, bordes discretos, valores monetarios tabulares, nombres extensos ajustables y acciones de tamaño cómodo. Se conservan tarjetas móviles existentes con los mismos datos y acciones.

Se añadieron nombres accesibles, encabezados `scope="col"` donde correspondía y regiones enfocables para desplazamiento por teclado. Las tablas clínicas y la hoja A4 pueden desplazarse horizontalmente dentro de su contenedor sin ampliar la página.

## 7. Responsive

La revisión de rutas cubre **320, 375, 390, 430, 768, 1024, 1280, 1440 y 1920 px**, con altura de 960 px. Las quince secciones clínicas también se comprobaron en 320, 390 y 1440 px con alturas de 600 y 960 px.

Se revisaron ancho del documento, ancho del área principal y límites de paneles/formularios. La auditoría distingue scroll interno intencional de tablas, gráficos o documentos A4 del desbordamiento global no deseado.

Los modales tienen límites de viewport y scroll interno. El popup de próximos controles conserva su capa superior; su posición se limita mediante CSS para no salirse del borde izquierdo en móvil. No se alteró el cálculo o el comportamiento del aviso.

## 8. Accesibilidad

Referencia de criterios: [WCAG 2.2 del W3C](https://www.w3.org/WAI/WCAG22/quickref/).

Mejoras: foco visible, controles táctiles, etiquetas de campos clínicos, nombre del listbox asociado al trigger, encabezados de tabla, áreas de scroll enfocables, estados textuales y respeto de `prefers-reduced-motion`. Los radio/checkbox clínicos mantienen su input nativo visualmente oculto pero enfocable, en lugar de `display:none`.

Las pruebas automáticas de axe ayudan a detectar problemas de contraste y semántica, **pero no certifican WCAG AA**. Se requiere revisión manual de lectores de pantalla y navegación integral por teclado, especialmente en widgets heredados.

## 9. Archivos modificados

El listado completo está en el anexo al final. Las responsabilidades permanecen en sus carpetas originales; no se introdujo una arquitectura paralela.

## 10. Pruebas y metodología

- `npm run lint`: ESLint.
- `node --test`: pruebas existentes, incluyendo exportación clínica, persistencia, identidad de pacientes, reportes e imágenes protegidas.
- `npm run build`: compilación de producción y PWA.
- `git diff --check`: formato del diff.
- Comparación de AST contra HEAD en 103 archivos JSX: 1.067 atributos funcionales originales conservados; revisiones adicionales de handlers, efectos y cálculos realizadas por ámbito.
- Chromium/Playwright temporal: sesiones ficticias, almacenamiento aislado y APIs simuladas. Peticiones externas y de escritura bloqueadas; no se utilizó una sesión real ni se modificaron registros.
- Capturas antes/después en páginas públicas, dashboard y agendas; capturas actuales en todas las rutas. La comparación es visual, no una prueba de equivalencia de datos del backend.
- axe con etiquetas WCAG 2 A/AA, 2.1 AA y 2.2 AA, más controles de overflow.
- Pruebas de guía pendiente, filas de tratamiento y diagnóstico, vista previa clínica, calendarios y avisos; resultados detallados en los artefactos de la ejecución.

Resultados de la ejecución:

| Comprobación | Resultado |
|---|---|
| ESLint, diff y build | Correctos; se mantiene la advertencia previa de tamaño del bundle |
| Pruebas existentes | 12 archivos de pruebas aprobados |
| Invariantes de JSX | 103 archivos y 1.067 atributos funcionales originales sin diferencias |
| Rutas / anchos | 234 comprobaciones, sin errores JavaScript ni overflow global |
| axe de rutas | 52 comprobaciones a 390 y 1440 px, sin violaciones detectadas |
| Formulario completo | 98 estados y 6 vistas previas en primera ronda; 32 estados y 6 vistas previas focalizadas tras los ajustes, sin overflow ni errores JavaScript |
| Revalidación clínica | Sin violaciones axe en los estados focalizados tras añadir etiquetas y regiones enfocables |
| Interacciones adicionales | 15 resultados: guía, PDF preview, fecha/hora, popup informativo, modal de pago, filtro mensual y tooltip; sin incidencias detectadas |

Los calendarios de día/minuto se inspeccionaron abiertos, no sólo en su estado inicial. Se comprobó `10:45` como hora/minuto ficticios y el cierre existente al completar la selección. También se comprobó que pulsar el aviso de próximo control no cambia la ruta. No se emitieron escrituras en estas pruebas.

Artefactos temporales de esta ejecución (fuera del repositorio, exclusivamente datos ficticios): `/tmp/estetico-ui-before/`, `/tmp/estetico-ui-after/`, `/tmp/estetico-ui-states/`, `/tmp/estetico-ui-clinical-states/` y `/tmp/estetico-ui-clinical-states-focus/`. Cada auditoría conserva su `report.json` y capturas; estos directorios no son dependencias de la aplicación.

No existe un script de type checking en este proyecto JavaScript: no se afirma haberlo ejecutado. Playwright y axe usados para la auditoría fueron herramientas temporales ya disponibles; no se incorporaron al bundle ni al package.json.

## 11. Límites y pendientes

- Falta una prueba de aceptación con **sesiones reales autorizadas** y datos representativos del entorno desplegado. Las rutas privadas se comprobaron mediante fixtures, no contra el backend real.
- No se enviaron pagos, tratamientos, cambios de perfil ni historias reales; estas operaciones continúan usando su implementación existente.
- La ruta `/new-password` sin token válido muestra la redirección a login prevista. El formulario de una recuperación real sigue pendiente de revisión con un token de prueba autorizado.
- Persisten tarjetas/autocompletados heredados basados en `div/li` clicables. Completar su interacción por teclado exigiría modificar handlers o comportamiento; se dejó fuera del alcance explícito de esta tarea.
- El build conserva la advertencia previa sobre chunks mayores a 500 kB. Dividir el bundle o cambiar carga de módulos sería una optimización arquitectónica separada.
- No se certifica compatibilidad visual con Safari/Firefox ni lectores de pantalla a partir de una prueba de Chromium.
- Diagnósticos: con el primer campo vacío, la normalización existente conserva una fila; añadir/eliminar se comprobó después de escribir una respuesta ficticia. No se cambió esa regla.
- No se descargaron documentos con datos reales. La exportación existente se verificó mediante sus pruebas automatizadas; el documento clínico y la boleta no se rediseñaron en esta tarea.

## 12. Rutas revisadas

Todas las rutas solicitadas fueron inspeccionadas en código y renderizadas con fixtures en Chromium a los nueve anchos. Ninguna ruta solicitada se omitió. Esto no sustituye su validación autenticada contra el backend.

| Módulo | Rutas verificadas en el entorno visual aislado |
|---|---|
| Público | `/`, `/login`, `/reset-password` |
| Administrador | `/administrador/dashboard-general`, `/administrador/gestion-de-usuarios-y-roles`, `/administrador/gestion-de-clientes`, `/administrador/gestion-de-inventario`, `/administrador/gestion-de-facturacion-y-pagos`, `/administrador/reportes-avanzados`, `/administrador/ajustes/perfil`, `/administrador/ajustes/contrasena` |
| Cosmiatra | `/cosmiatra/gestion-de-citas`, `/cosmiatra/registrar-tratamiento`, `/cosmiatra/gestion-de-pagos`, `/cosmiatra/historial-de-clientes`, `/cosmiatra/reportes-de-servicios-e-ingresos`, `/cosmiatra/ajustes/perfil`, `/cosmiatra/ajustes/contrasena` |
| Doctor | `/doctor/agenda-de-citas`, `/doctor/historial-de-pacientes`, `/doctor/registrar-tratamiento`, `/doctor/mis-reportes`, `/doctor/ajustes/perfil`, `/doctor/ajustes/contrasena`, `/doctor/historial-de-pacientes/formulario` |
| Adicional | `/new-password`: redirección a login sin token de recuperación; no se afirma revisión del formulario con token válido. |

Son 25 rutas solicitadas y una adicional: 234 comprobaciones de layout de ruta/ancho. Para el formulario se amplió la revisión a sus quince secciones, estados de guía y vista previa, con paciente ficticia mujer; la prueba general también cubre el estado de catorce secciones para paciente hombre.

### Anexo · Archivos

- [`README.md`](../README.md)
- [`docs/ui-ux-audit.md`](../docs/ui-ux-audit.md)
- [`src/components/AccesButon/AccessButton.jsx`](../src/components/AccesButon/AccessButton.jsx)
- [`src/components/AgendaCitas/CitaForm.jsx`](../src/components/AgendaCitas/CitaForm.jsx)
- [`src/components/AgendaCitas/CitaTable.jsx`](../src/components/AgendaCitas/CitaTable.jsx)
- [`src/components/CitaForm/FormInput.jsx`](../src/components/CitaForm/FormInput.jsx)
- [`src/components/CitaForm/FormSelect.jsx`](../src/components/CitaForm/FormSelect.jsx)
- [`src/components/CitaForm/ServiceSelector.jsx`](../src/components/CitaForm/ServiceSelector.jsx)
- [`src/components/DashboardDoctor/FiltrosReportes.jsx`](../src/components/DashboardDoctor/FiltrosReportes.jsx)
- [`src/components/DashboardDoctor/GraficoCitasEvolucion.jsx`](../src/components/DashboardDoctor/GraficoCitasEvolucion.jsx)
- [`src/components/DashboardDoctor/GraficoCitasPorEstado.jsx`](../src/components/DashboardDoctor/GraficoCitasPorEstado.jsx)
- [`src/components/DashboardDoctor/GraficoInsumos.jsx`](../src/components/DashboardDoctor/GraficoInsumos.jsx)
- [`src/components/DashboardDoctor/LineChartCard.jsx`](../src/components/DashboardDoctor/LineChartCard.jsx)
- [`src/components/DashboardDoctor/PieChartCard.jsx`](../src/components/DashboardDoctor/PieChartCard.jsx)
- [`src/components/DashboardDoctor/chartTheme.js`](../src/components/DashboardDoctor/chartTheme.js)
- [`src/components/DashboardGeneral/FiltrosInventario.jsx`](../src/components/DashboardGeneral/FiltrosInventario.jsx)
- [`src/components/DashboardGeneral/IngresosMensuales.jsx`](../src/components/DashboardGeneral/IngresosMensuales.jsx)
- [`src/components/DashboardGeneral/InventarioTable.jsx`](../src/components/DashboardGeneral/InventarioTable.jsx)
- [`src/components/DashboardGeneral/MetodosPagoChart.jsx`](../src/components/DashboardGeneral/MetodosPagoChart.jsx)
- [`src/components/DashboardGeneral/ResumenCitas.jsx`](../src/components/DashboardGeneral/ResumenCitas.jsx)
- [`src/components/Footer/Footer.jsx`](../src/components/Footer/Footer.jsx)
- [`src/components/FormularioPeptidos/FormFields.jsx`](../src/components/FormularioPeptidos/FormFields.jsx)
- [`src/components/FormularioPeptidos/FormSteps.jsx`](../src/components/FormularioPeptidos/FormSteps.jsx)
- [`src/components/GestionClientes/BuscadorClientes.jsx`](../src/components/GestionClientes/BuscadorClientes.jsx)
- [`src/components/GestionClientes/ClienteCard.jsx`](../src/components/GestionClientes/ClienteCard.jsx)
- [`src/components/GestionClientes/ClienteDetalle.jsx`](../src/components/GestionClientes/ClienteDetalle.jsx)
- [`src/components/GestionClientes/TratamientoCard.jsx`](../src/components/GestionClientes/TratamientoCard.jsx)
- [`src/components/GestionInventario/AgregarItemForm.jsx`](../src/components/GestionInventario/AgregarItemForm.jsx)
- [`src/components/GestionInventario/EditarItemModal.jsx`](../src/components/GestionInventario/EditarItemModal.jsx)
- [`src/components/GestionInventario/InventarioHeader.jsx`](../src/components/GestionInventario/InventarioHeader.jsx)
- [`src/components/GestionInventario/TablaInsumos.jsx`](../src/components/GestionInventario/TablaInsumos.jsx)
- [`src/components/GestionInventario/TablaServicios.jsx`](../src/components/GestionInventario/TablaServicios.jsx)
- [`src/components/GestionPagos/BuscadorPagos.jsx`](../src/components/GestionPagos/BuscadorPagos.jsx)
- [`src/components/GestionPagos/ModalRegistrarPago.jsx`](../src/components/GestionPagos/ModalRegistrarPago.jsx)
- [`src/components/GestionPagos/ModalTicket.jsx`](../src/components/GestionPagos/ModalTicket.jsx)
- [`src/components/GestionPagos/TablaPagos.jsx`](../src/components/GestionPagos/TablaPagos.jsx)
- [`src/components/GestionUsuariosRoles/Buscador.jsx`](../src/components/GestionUsuariosRoles/Buscador.jsx)
- [`src/components/GestionUsuariosRoles/DeleteConfirmationModal.jsx`](../src/components/GestionUsuariosRoles/DeleteConfirmationModal.jsx)
- [`src/components/GestionUsuariosRoles/FormularioUsuario.jsx`](../src/components/GestionUsuariosRoles/FormularioUsuario.jsx)
- [`src/components/GestionUsuariosRoles/TablaUsuarios.jsx`](../src/components/GestionUsuariosRoles/TablaUsuarios.jsx)
- [`src/components/GestionUsuariosRoles/UsuarioCard.jsx`](../src/components/GestionUsuariosRoles/UsuarioCard.jsx)
- [`src/components/GestionUsuariosRoles/UsuariosSection.jsx`](../src/components/GestionUsuariosRoles/UsuariosSection.jsx)
- [`src/components/HistorialPacientes/BuscadorPacientes.jsx`](../src/components/HistorialPacientes/BuscadorPacientes.jsx)
- [`src/components/HistorialPacientes/DetallePaciente.jsx`](../src/components/HistorialPacientes/DetallePaciente.jsx)
- [`src/components/HistorialPacientes/HistoriaClinicaFinalizada.jsx`](../src/components/HistorialPacientes/HistoriaClinicaFinalizada.jsx)
- [`src/components/HistorialPacientes/InfoPaciente.jsx`](../src/components/HistorialPacientes/InfoPaciente.jsx)
- [`src/components/HistorialPacientes/ListaTratamientos.jsx`](../src/components/HistorialPacientes/ListaTratamientos.jsx)
- [`src/components/HistorialPacientes/ListaTratamientosAnteriores.jsx`](../src/components/HistorialPacientes/ListaTratamientosAnteriores.jsx)
- [`src/components/HistorialPacientes/ObservacionesImagenes.jsx`](../src/components/HistorialPacientes/ObservacionesImagenes.jsx)
- [`src/components/HistorialPacientes/Paginacion.jsx`](../src/components/HistorialPacientes/Paginacion.jsx)
- [`src/components/Home/Hero.jsx`](../src/components/Home/Hero.jsx)
- [`src/components/Home/Home.jsx`](../src/components/Home/Home.jsx)
- [`src/components/Login/LoginForm.jsx`](../src/components/Login/LoginForm.jsx)
- [`src/components/Login/PasswordInput.jsx`](../src/components/Login/PasswordInput.jsx)
- [`src/components/Login/TextInput.jsx`](../src/components/Login/TextInput.jsx)
- [`src/components/Logo/Logo.jsx`](../src/components/Logo/Logo.jsx)
- [`src/components/LogoutButton/LogoutButton.jsx`](../src/components/LogoutButton/LogoutButton.jsx)
- [`src/components/Modal/ModalGuardar.jsx`](../src/components/Modal/ModalGuardar.jsx)
- [`src/components/Navbar/Navbar.jsx`](../src/components/Navbar/Navbar.jsx)
- [`src/components/NewPassword/ChangePasswordForm.jsx`](../src/components/NewPassword/ChangePasswordForm.jsx)
- [`src/components/NewPassword/PasswordInput.jsx`](../src/components/NewPassword/PasswordInput.jsx)
- [`src/components/OfflineAlert/OfflineAlert.jsx`](../src/components/OfflineAlert/OfflineAlert.jsx)
- [`src/components/Perfil/AvatarUploader.jsx`](../src/components/Perfil/AvatarUploader.jsx)
- [`src/components/Perfil/CmpField.jsx`](../src/components/Perfil/CmpField.jsx)
- [`src/components/Perfil/ConfirmationModal.jsx`](../src/components/Perfil/ConfirmationModal.jsx)
- [`src/components/Perfil/FirmaDigitalField.jsx`](../src/components/Perfil/FirmaDigitalField.jsx)
- [`src/components/Perfil/ProfileForm.jsx`](../src/components/Perfil/ProfileForm.jsx)
- [`src/components/RegistaTratamiento/ActionButtons.jsx`](../src/components/RegistaTratamiento/ActionButtons.jsx)
- [`src/components/RegistaTratamiento/FechaField.jsx`](../src/components/RegistaTratamiento/FechaField.jsx)
- [`src/components/RegistaTratamiento/ImageUploader.jsx`](../src/components/RegistaTratamiento/ImageUploader.jsx)
- [`src/components/RegistaTratamiento/InputField.jsx`](../src/components/RegistaTratamiento/InputField.jsx)
- [`src/components/RegistaTratamiento/RadioGroup.jsx`](../src/components/RegistaTratamiento/RadioGroup.jsx)
- [`src/components/RegistaTratamiento/TextAreaField.jsx`](../src/components/RegistaTratamiento/TextAreaField.jsx)
- [`src/components/ReportesAvanzados/GraficoCitasPorRol.jsx`](../src/components/ReportesAvanzados/GraficoCitasPorRol.jsx)
- [`src/components/ReportesAvanzados/GraficoIngresosComparativos.jsx`](../src/components/ReportesAvanzados/GraficoIngresosComparativos.jsx)
- [`src/components/ReportesAvanzados/GraficoServiciosRentables.jsx`](../src/components/ReportesAvanzados/GraficoServiciosRentables.jsx)
- [`src/components/ReportesServiciosIngresos/BuscadorClientes.jsx`](../src/components/ReportesServiciosIngresos/BuscadorClientes.jsx)
- [`src/components/ReportesServiciosIngresos/ClienteCard.jsx`](../src/components/ReportesServiciosIngresos/ClienteCard.jsx)
- [`src/components/ReportesServiciosIngresos/HistorialCliente.jsx`](../src/components/ReportesServiciosIngresos/HistorialCliente.jsx)
- [`src/components/ReportesServiciosIngresos/TablaServicios.jsx`](../src/components/ReportesServiciosIngresos/TablaServicios.jsx)
- [`src/components/ResetPassword/ErrorAlert.jsx`](../src/components/ResetPassword/ErrorAlert.jsx)
- [`src/components/ResetPassword/ResetForm.jsx`](../src/components/ResetPassword/ResetForm.jsx)
- [`src/components/ResetPassword/ResetHeader.jsx`](../src/components/ResetPassword/ResetHeader.jsx)
- [`src/components/ResetPassword/ResetSuccess.jsx`](../src/components/ResetPassword/ResetSuccess.jsx)
- [`src/components/Sidebar/Sidebar.jsx`](../src/components/Sidebar/Sidebar.jsx)
- [`src/components/TablaCitas/CitaCard.jsx`](../src/components/TablaCitas/CitaCard.jsx)
- [`src/components/TablaCitas/CitaRow.jsx`](../src/components/TablaCitas/CitaRow.jsx)
- [`src/components/TablaCitas/DetalleCita.jsx`](../src/components/TablaCitas/DetalleCita.jsx)
- [`src/components/Topbar/ClinicalControlNotifications.jsx`](../src/components/Topbar/ClinicalControlNotifications.jsx)
- [`src/components/Topbar/Topbar.jsx`](../src/components/Topbar/Topbar.jsx)
- [`src/components/common/AuthPageLayout.jsx`](../src/components/common/AuthPageLayout.jsx)
- [`src/components/common/CustomChoice.jsx`](../src/components/common/CustomChoice.jsx)
- [`src/components/common/CustomSelect.jsx`](../src/components/common/CustomSelect.jsx)
- [`src/components/common/DatePickerField.jsx`](../src/components/common/DatePickerField.jsx)
- [`src/components/common/LoadingSpinner.jsx`](../src/components/common/LoadingSpinner.jsx)
- [`src/index.css`](../src/index.css)
- [`src/layout/DashboardLayout.jsx`](../src/layout/DashboardLayout.jsx)
- [`src/layout/NavbarFooterLayout.jsx`](../src/layout/NavbarFooterLayout.jsx)
- [`src/pages/admin/DashboardGeneral.jsx`](../src/pages/admin/DashboardGeneral.jsx)
- [`src/pages/admin/ReportesAvanzados.jsx`](../src/pages/admin/ReportesAvanzados.jsx)
- [`src/pages/cosmiatra/ReportesServiciosIngresos.jsx`](../src/pages/cosmiatra/ReportesServiciosIngresos.jsx)
- [`src/pages/doctor/FormularioPeptidos.jsx`](../src/pages/doctor/FormularioPeptidos.jsx)
- [`src/pages/doctor/HistorialPacientes.jsx`](../src/pages/doctor/HistorialPacientes.jsx)
- [`src/pages/doctor/MisReportes.jsx`](../src/pages/doctor/MisReportes.jsx)
- [`src/pages/doctor/RegistrarTratamiento.jsx`](../src/pages/doctor/RegistrarTratamiento.jsx)
- [`src/pages/settings/Contrasena.jsx`](../src/pages/settings/Contrasena.jsx)
- [`src/pages/settings/Perfil.jsx`](../src/pages/settings/Perfil.jsx)
