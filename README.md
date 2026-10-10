# KARITO BEAUTY ESTHETIC CENTER S.A.C. · Frontend

Aplicación web interna para la operación clínica y administrativa de KARITO BEAUTY ESTHETIC CENTER S.A.C. Gestiona citas, tratamientos, inventario, pagos, historias clínicas y reportes para los roles de administrador, doctor y cosmiatra.

Este repositorio contiene solo el cliente React/Vite. La API se encuentra en el proyecto hermano `../Backend_Estetico`.

## Inicio rápido

Requisitos: Node.js LTS y npm.

```bash
cp .env.example .env
npm ci
npm run dev
```

La aplicación queda disponible normalmente en `http://localhost:5173`; para probar el flujo configurado con el backend local puede utilizarse `npm run dev -- --host` o el puerto que indique Vite. El backend de desarrollo escucha por defecto en `http://localhost:5000`.

Variables públicas necesarias:

| Variable | Ejemplo | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000` | Base de la API REST. |
| `VITE_SOCKET_URL` | `http://localhost:5000` | Servidor Socket.IO autenticado. |

Las variables `VITE_*` se incluyen en el JavaScript entregado al navegador. Nunca se deben colocar secretos, claves de Cloudinary, JWT privados ni credenciales en ellas.

## Scripts

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Servidor de desarrollo Vite. |
| `npm run build` | Compilación de producción y generación de Service Worker. |
| `npm run preview` | Vista previa local del build. |
| `npm run lint` | Revisión estática de JavaScript/JSX. |

## Arquitectura

```text
src/
├── api/                 # Límite HTTP por dominio; usa una instancia Axios común
├── components/          # Componentes visuales y formularios reutilizables
├── context/             # Estado transversal de citas, tratamientos, pagos y socket
├── hooks/               # Comportamiento reusable de React
├── layout/              # Shell, navegación y layouts por rol
├── pages/               # Pantallas enlazadas a rutas
├── services/            # Adaptadores de sesión y tiempo real
├── utils/               # Reglas puras, fecha, borradores clínicos y PWA
└── styles/              # Estilos globales y tokens visuales
```

La separación mantiene los componentes enfocados en presentación, los módulos `api/` en transporte HTTP y los servicios en dependencias del navegador. Ejemplos relevantes:

- `api/axiosConfig.js` concentra URL base y el encabezado `Authorization`.
- `services/authStorage.js` es el único adaptador para la sesión (`token` y `user`), maneja JSON corrupto y notifica cambios de sesión entre vistas y pestañas.
- `services/realtimeSocket.js` abre sockets únicamente cuando existe una sesión y envía el JWT en el handshake.
- `utils/clinicalHistoryStorage.js` y `utils/clinicalHistoryRemote.js` separan el borrador local de la sincronización duradera con la API.
- `utils/professionalOwnership.js` vincula citas y tratamientos por ID de cuenta; `utils/professionalDirectory.js` y `hooks/useProfessionalDirectory.js` resuelven el nombre vigente para tablas, reportes y exportaciones.

Este diseño aplica SRP, DRY, Provider Pattern, Adapter Pattern y una capa API como fachada. Los cambios de dominio deben entrar primero por `api/` o `services/`, no por llamadas `fetch` dispersas en componentes.

## Rutas principales

| Área | Rutas |
| --- | --- |
| Pública | `/`, `/login`, `/reset-password`, `/new-password` |
| Doctor | `/doctor/agenda-de-citas`, `/doctor/historial-de-pacientes`, `/doctor/historial-de-pacientes/formulario`, `/doctor/registrar-tratamiento`, `/doctor/mis-reportes`, `/doctor/ajustes/*` |
| Cosmiatra | `/cosmiatra/gestion-de-citas`, `/cosmiatra/registrar-tratamiento`, `/cosmiatra/gestion-de-pagos`, `/cosmiatra/historial-de-clientes`, `/cosmiatra/reportes-de-servicios-e-ingresos`, `/cosmiatra/ajustes/*` |
| Administrador | `/administrador/dashboard-general`, `/administrador/gestion-de-usuarios-y-roles`, `/administrador/gestion-de-clientes`, `/administrador/gestion-de-inventario`, `/administrador/gestion-de-facturacion-y-pagos`, `/administrador/reportes-avanzados`, `/administrador/ajustes/*` |

La protección de rutas del cliente mejora la experiencia de navegación; la autorización real se aplica siempre en el backend.

Los nombres de doctor y cosmiatra son datos de presentación, no identificadores. Al editar un perfil, el evento autenticado `profesionalActualizado` y la sincronización de sesión refrescan los nombres y los registros compartidos. Los historiales conservan su propietario por ID y los gráficos mantienen la selección del profesional aunque cambie su nombre. La API recupera registros antiguos mediante su cita vinculada; los registros que solo conservan un nombre requieren una migración interna revisada. Cambiar un nombre de perfil no concede acceso a registros sin propietario y el frontend conserva los filtros por ID.

## Historia clínica y PDF

1. El formulario conserva un borrador local para evitar pérdida de trabajo al cambiar de sección.
2. Cuando hay conexión, sincroniza el borrador con `/api/historias-clinicas`.
3. La API decide si el médico tiene acceso al paciente, valida la finalización y guarda una instantánea de la firma.
4. Al finalizar, el cliente presenta la historia, genera el PDF y actualiza la notificación de próximo control.

Los módulos `FormularioPeptidos`, `ClinicalHistoryPdf` y `HistoriaClinicaFinalizada` conservan el flujo clínico y PDF separado de la navegación general. No se deben mover o dividir sin pruebas de regresión de la exportación.

### Correcciones al nombre del cliente

Guardar y Finalizar sincronizan el nombre completo del **mismo cliente**, conservando los IDs de sus atenciones. `pacienteId` agrupa sus registros independientemente del nombre; no debe confundirse con `patientId`, que es la clave local de una historia concreta. Las pantallas de citas, pagos, clientes, historiales y reportes recargan los datos confirmados mediante `pacienteActualizado` y el evento local `patient:updated`.

La propagación no depende del estado de la cita: pendiente, atendida, aplazada y cancelada conservan la identidad del mismo cliente y reciben sus correcciones de nombre. Una cita heredada sin identidad necesita un vínculo revisado antes de poder seguir estos cambios; cambiar el nombre nunca reactiva, cancela ni reprograma la cita.

Al seleccionar un cliente existente en Registrar cita, el autocompletado conserva `citaPacienteId`, una referencia a una cita ya guardada. La API comprueba el acceso a esa cita y reutiliza su identidad persistida; cambiar de doctor a cosmiatra no crea otro cliente. Escribir un nombre libre no asigna automáticamente la identidad de un homónimo. Al volver a una pestaña visible se recargan los datos del servidor para recuperar actualizaciones perdidas durante una desconexión del socket.

El nombre solo se anuncia como actualizado después de confirmarlo la API. Las peticiones del formulario se serializan y los borradores permanecen disponibles si falla la conexión. Los registros antiguos se vinculan por referencias verificadas o por nombre anterior más contacto/DNI persistidos, sin mezclar homónimos. Si una cita antigua carece de vínculo verificable, el mensaje de guardado informa que no fue modificada.

Pruebas de regresión: `node src/utils/patientIdentity.test.js`, `node src/utils/clinicalHistoryStorage.test.js`, `node src/utils/appointmentPatientSuggestions.test.js` y `node src/hooks/usePatientUpdates.test.js` (identidad del cliente, selección activa, continuidad del borrador y actualización al volver a la pestaña).

### Atenciones sin tratamiento registrado

Una cita marcada como atendida puede tener un cobro antes de registrar su tratamiento. El historial de cosmiatra y Gestión de clientes consultan `/api/tratamientos/historial-atenciones`; el reporte diario compartido por cosmiatra y administración también incluye estas atenciones. Se distinguen con **Atención sin tratamiento registrado** y nunca generan un tratamiento ni respuestas clínicas ficticias. El listado clínico `/api/tratamientos` y los indicadores de tratamientos del doctor conservan su fuente original.

Los registros se enlazan por la cita o por una correspondencia histórica única; cuando se registra el tratamiento real reemplaza la atención pendiente. Las fechas se muestran en Lima y los cobros de filas operativas corresponden exclusivamente al pago confirmado de esa cita. Los totales del reporte no cuentan dos veces un comprobante. El historial se refresca al cambiar citas, tratamientos o pagos y al recuperar el foco/conexión.

Pruebas: `node src/utils/attentionHistory.test.js`, `node src/utils/serviceReport.test.js` y `node src/components/ReportesServiciosIngresos/calcularMonto.test.js`.

## Seguridad y privacidad

Se incorporaron estas medidas en el cliente:

- La PWA nunca almacena respuestas `/api/*`, peticiones con `Authorization` ni imágenes externas en Cache Storage. Solo se cachean assets estáticos del mismo origen.
- Al iniciar y al cerrar sesión se elimina la caché heredada que pudo contener respuestas autenticadas (`karito-api-cache*`).
- Todas las conexiones Socket.IO pasan por `createAuthenticatedSocket`, que adjunta el token actual; el backend rechaza sockets anónimos.
- Existe una sola conexión Socket.IO por sesión mediante `CitasProvider`; las pantallas se suscriben y se desuscriben con handlers concretos, evitando conexiones duplicadas o listeners huérfanos.
- El acceso a `localStorage` está encapsulado y tolera datos corruptos. El cambio de sesión desconecta el socket y limpia el estado compartido.
- Los borradores clínicos locales están aislados por ID de usuario y se eliminan al cerrar sesión. La migración descarta las claves globales heredadas para que un navegador compartido no exponga una historia a otra cuenta.
- Las rutas privadas verifican también el rol en cliente para evitar navegación accidental entre áreas; el backend conserva la autorización definitiva.
- En Vercel se entregan CSP, `frame-ancestors`, `nosniff`, política de permisos y cabeceras de referrer. La CSP permite únicamente los orígenes necesarios para assets propios, Cloudinary y la API/Socket HTTPS configurada.
- La exportación Excel neutraliza valores que comienzan con `=`, `+`, `-` o `@` para evitar inyección de fórmulas al abrir el archivo.
- La interfaz usa el cliente Axios común para que las solicitudes autenticadas no dependan de encabezados duplicados escritos a mano.

### Límites que siguen requiriendo controles operativos

- El token actual se conserva en `localStorage` para mantener compatibilidad con el backend. Una XSS puede exponerlo; una migración a cookies `HttpOnly` requiere un cambio coordinado de API, CORS y protección CSRF.
- Los borradores clínicos locales contienen datos sensibles mientras el usuario trabaja. Aunque se aíslan por cuenta y se purgan al cerrar sesión, deben usarse equipos y perfiles de navegador individuales, con bloqueo de pantalla y limpieza de datos al retirar un equipo.
- `xlsx` tiene una alerta upstream sin corrección publicada. En este proyecto solo se usa para **generar** un Excel en el navegador, no para leer archivos de terceros, y sus valores se protegen contra fórmulas. Debe revisarse periódicamente para migrar a una alternativa mantenida cuando exista una validación funcional equivalente.

## Verificación antes de entregar

```bash
npm run lint
npm run build
npm audit --omit=dev
```

Pruebe manualmente al menos login, cambio/cierre de sesión, una cita, tratamiento con imagen, pago, el formulario clínico y la descarga de PDF después de actualizar paquetes o la configuración PWA.

## Despliegue

1. Use HTTPS para frontend, API y Socket.IO.
2. Configure `VITE_API_URL` y `VITE_SOCKET_URL` con la URL HTTPS real de la API antes de compilar.
3. Publique el frontend sin `.env`; solo se versiona `.env.example`.
4. Configure el backend con una allowlist CORS exacta y secretos fuera del repositorio.
5. Configure una política de retención, respaldos cifrados y acceso mínimo para información clínica y financiera.
6. Si despliega fuera de Vercel, replique las cabeceras de `vercel.json` en su CDN o proxy inverso.

## Dependencias y actualización

El proyecto usa React, Vite, Tailwind, Axios, Socket.IO, jsPDF/html2pdf y las librerías de gráficos/formularios indicadas en `package.json`. Después de cualquier actualización use el lockfile, ejecute el build y vuelva a probar la generación de PDF, pues es el flujo con mayor interacción de navegador.
