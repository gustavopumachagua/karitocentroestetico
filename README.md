# KARITO BEAUTY ESTHETIC CENTER S.A.C. · Frontend

Aplicación web para la gestión clínica, operativa y administrativa de un centro médico estético. Integra agenda, tratamientos, insumos, pagos, historias clínicas, documentos PDF y reportes mediante una interfaz responsive organizada por rol.

Este repositorio contiene el cliente **React**. La API, las reglas de autorización y la persistencia MongoDB pertenecen al proyecto hermano [`Backend_Estetico`](../Backend_Estetico/README.md). Este documento describe la implementación existente; no presupone una certificación de seguridad ni una arquitectura que todavía no esté implementada.

## Contenido

- [Alcance funcional](#alcance-funcional)
- [Instalación y configuración](#instalación-y-configuración)
- [Tecnologías y librerías](#tecnologías-y-librerías)
- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Flujos de datos y contratos](#flujos-de-datos-y-contratos)
- [Historia clínica y PDF](#historia-clínica-y-pdf)
- [Código limpio, patrones y SOLID](#código-limpio-patrones-y-solid)
- [Seguridad y privacidad](#seguridad-y-privacidad)
- [Pruebas y control de calidad](#pruebas-y-control-de-calidad)
- [Despliegue](#despliegue)
- [Mantenimiento y contribución](#mantenimiento-y-contribución)
- [Diagnóstico de problemas](#diagnóstico-de-problemas)

## Alcance funcional

| Área | Funciones principales |
| --- | --- |
| Pública | Página de inicio, acceso, solicitud de recuperación y restablecimiento de contraseña. |
| Doctor | Agenda asignada, historial de pacientes, registro de tratamientos, historia clínica para evaluación de manejo de peso, PDF, reportes y ajustes. |
| Cosmiatra | Gestión de citas, registro de tratamientos, cobros y comprobantes, historial de clientes, reporte diario de servicios e ingresos y ajustes. |
| Administrador | Panel general, usuarios y roles, clientes, inventario y servicios, facturación/pagos, reportes avanzados y ajustes. |

El inventario y los servicios se seleccionan de acuerdo con la especialidad. CMP y firma del perfil se muestran únicamente al doctor. Los reportes diarios de cosmiatra y administración pueden mostrar servicios de ambas especialidades utilizando el conjunto de datos autorizado por la API.

### Rutas

| Área | Rutas |
| --- | --- |
| Pública | `/`, `/login`, `/reset-password`, `/new-password` |
| Doctor | `/doctor/agenda-de-citas`, `/doctor/historial-de-pacientes`, `/doctor/historial-de-pacientes/formulario`, `/doctor/registrar-tratamiento`, `/doctor/mis-reportes`, `/doctor/ajustes/perfil`, `/doctor/ajustes/contrasena` |
| Cosmiatra | `/cosmiatra/gestion-de-citas`, `/cosmiatra/registrar-tratamiento`, `/cosmiatra/gestion-de-pagos`, `/cosmiatra/historial-de-clientes`, `/cosmiatra/reportes-de-servicios-e-ingresos`, `/cosmiatra/ajustes/perfil`, `/cosmiatra/ajustes/contrasena` |
| Administrador | `/administrador/dashboard-general`, `/administrador/gestion-de-usuarios-y-roles`, `/administrador/gestion-de-clientes`, `/administrador/gestion-de-inventario`, `/administrador/gestion-de-facturacion-y-pagos`, `/administrador/reportes-avanzados`, `/administrador/ajustes/perfil`, `/administrador/ajustes/contrasena` |

Las rutas se declaran en [`src/App.jsx`](src/App.jsx) y en los layouts de cada rol. [`ProtectedRoute`](src/components/common/ProtectedRoute.jsx) redirige sesiones inexistentes o roles incorrectos; es una protección de navegación, no sustituye la autorización del servidor.

## Instalación y configuración

### Requisitos

- Node.js compatible con Vite: `20.19+` en la rama 20, o `22.12+`. Se recomienda una versión LTS compatible y la misma versión en desarrollo y despliegue.
- npm y acceso al backend configurado. No se requiere MongoDB directamente en este repositorio.
- Navegador actualizado con JavaScript, almacenamiento local y descarga de archivos habilitados.

### Desarrollo local

Desde la raíz de este repositorio:

```bash
cp .env.example .env
npm ci
npm run dev
```

Complete `.env` con las URLs de su entorno. El servidor de desarrollo suele abrir `http://localhost:5173`; consulte el puerto que indique Vite. Arranque el backend por separado siguiendo su README; su configuración de desarrollo usa normalmente `http://localhost:5000`.

Para probar el compilado en el puerto utilizado por las pantallas del proyecto:

```bash
npm run build
npm run preview -- --port 4173
```

`preview` sirve el resultado de `dist/` para verificación local: no es el servidor de producción. Después de cambiar código debe volver a compilar si está usando este modo.

### Variables de entorno

| Variable | Ejemplo local | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000` | Origen/base de la API. Axios añade `/api`; no duplique ese sufijo. |
| `VITE_SOCKET_URL` | `http://localhost:5000` | Base del servidor Socket.IO; no añada una ruta REST. |

Las variables `VITE_*` son públicas y se incorporan al JavaScript durante la compilación. Nunca coloque contraseñas, claves privadas JWT, credenciales MongoDB ni secretos de Cloudinary. `.env` no se versiona; `.env.example` documenta la configuración permitida. Reinicie Vite o recompílelo después de cambiar estas variables.

### Comandos disponibles

| Comando | Propósito |
| --- | --- |
| `npm ci` | Instala exactamente el árbol fijado en `package-lock.json`. |
| `npm run dev` | Desarrollo con recarga y detección de dependencias circulares. |
| `npm run build` | Compilación optimizada en `dist/` y generación del Service Worker. |
| `npm run preview` | Verificación local del compilado. |
| `npm run lint` | Análisis estático JavaScript/JSX con ESLint y reglas de hooks. |

## Tecnologías y librerías

Las versiones siguientes son los **rangos declarados en `package.json`**, no una afirmación de que sean las versiones más recientes. `package-lock.json` fija las resoluciones concretas que instala `npm ci`.

| Tecnología | Versión declarada | Responsabilidad |
| --- | --- | --- |
| React / React DOM | `^18.3.1` | Componentes funcionales, composición, hooks y renderizado. |
| React Router DOM | `^7.9.3` | Rutas públicas, navegación privada y layouts por rol. |
| Vite | `npm:rolldown-vite@7.1.12` | Servidor de desarrollo y compilación; alias fijado también mediante `overrides`. |
| `@vitejs/plugin-react` | `^5.0.4` | Integración React utilizada por `vite.config.js`. |
| Tailwind CSS / `@tailwindcss/vite` | `^4.1.13` | Utilidades CSS integradas con el sistema visual propio. |
| Axios | `^1.12.2` | Cliente HTTP compartido e interceptor de autenticación. |
| Socket.IO Client | `^4.8.1` | Actualizaciones autenticadas en tiempo real. |
| Recharts | `^3.2.1` | Gráficos de actividad, servicios, insumos e ingresos. |
| React Datepicker | `^8.8.0` | Selección de fechas y horas. |
| Day.js | `^1.11.19` | Apoyo al tratamiento de fechas. |
| React Icons | `^5.5.0` | Iconografía de controles y navegación. |
| React Modal | `^3.16.3` | Modales de interacción. |
| jsPDF | `^4.2.1` | Generación principal del documento clínico vectorial. |
| html2pdf.js | `^0.14.0` | Exportación alternativa desde el DOM cuando falla el renderizador principal. |
| SheetJS / `xlsx` | `^0.18.5` | Generación de exportaciones Excel; no se importa un Excel clínico de terceros. |
| Vite Plugin PWA | `^1.1.0` | Manifest, registro y caché del shell/recursos estáticos. |

Herramientas de desarrollo: ESLint y `@eslint/js` `^9.36.0`, `eslint-plugin-react-hooks` `^5.2.0`, `eslint-plugin-react-refresh` `^0.4.20`, `globals` `^16.4.0`, esbuild `^0.25.11` y `vite-plugin-circular-dependency` `^0.5.0`. El minificador configurado es esbuild.

El proyecto es **JavaScript/JSX con módulos ES**, no TypeScript. Aunque están declarados `@types/react`, `@types/react-dom` y `@vitejs/plugin-react-swc`, estos paquetes no convierten el código a TypeScript ni significan que SWC sea el plugin activo: la configuración actual utiliza `@vitejs/plugin-react`.

## Arquitectura y estructura

El frontend es una **SPA organizada por dominios funcionales**, con capas prácticas de presentación, coordinación, acceso HTTP y adaptadores de navegador. No hay Redux, microfrontends, contenedor de inyección de dependencias ni una implementación estricta de Clean Architecture.

```text
Web_Estetico/
├── public/                         Recursos públicos y assets de la PWA
├── src/
│   ├── main.jsx                    Arranque, Provider y registro del Service Worker
│   ├── App.jsx                     Rutas de entrada y guardas por rol
│   ├── api/                        Funciones HTTP agrupadas por dominio
│   ├── assets/                     Imágenes importadas por el código
│   ├── components/
│   │   ├── common/                 Controles compartidos y estados de interfaz
│   │   ├── FormularioPeptidos/      Pasos, validación y documento clínico
│   │   └── ...                     Componentes de citas, pagos, perfil y reportes
│   ├── context/                    Provider/contexto de datos operativos y socket
│   ├── hooks/                      Sesión, suscripciones y comportamientos reutilizables
│   ├── layout/                     Shell compartido, menús y rutas de cada rol
│   ├── pages/                      Pantallas públicas, operativas y administrativas
│   ├── services/                   Adaptadores de sesión, socket y controles clínicos
│   ├── utils/                      Transformaciones, identidad y persistencia local/remota
│   └── index.css                   Tokens visuales, componentes CSS y responsive
├── .env.example                    Contrato de configuración pública
├── eslint.config.js                Reglas estáticas
├── vite.config.js                  Compilación y política PWA
├── vercel.json                     Reescrituras SPA y cabeceras de despliegue
├── package.json                    Scripts y dependencias declaradas
└── package-lock.json               Dependencias reproducibles
```

### Responsabilidades y dirección de dependencias

```text
Rutas/layouts → páginas → componentes y hooks
                           ├── contexto compartido
                           ├── utils: reglas y transformaciones
                           └── api → Axios → backend autorizado

Adaptadores: sesión/localStorage · Socket.IO · PDF/descargas · PWA
```

| Límite | Implementación y criterio |
| --- | --- |
| Navegación | `DashboardLayout` recibe rutas, menús y ruta inicial; doctor, cosmiatra y administrador configuran el mismo shell sin duplicarlo. |
| Pantallas | `pages/` coordina consultas, selección, guardados, mensajes y componentes del caso de uso. |
| Presentación | `components/` contiene controles, tablas, gráficos, formularios y documentos. Los componentes se agrupan por función, no solo por tipo visual. |
| Estado transversal | `CitasProvider` mantiene citas, tratamientos, pagos, selección, mensajes y la conexión Socket.IO. `useCitas` expone ese contexto. Otros estados permanecen locales cuando no necesitan compartirse. |
| HTTP | `api/*.api.js` define operaciones del dominio; `axiosConfig.js` agrega URL base y token a cada petición. |
| Sesión e infraestructura | `authStorage`, `realtimeSocket` y los adaptadores clínicos evitan dispersar el acceso a dependencias del navegador. |
| Reglas reutilizables | Los helpers de identidad, fechas, agrupación, validación y montos se prueban sin arrancar toda la aplicación. |

Esta separación es una guía, no una prohibición que el código ya cumpla en todos sus archivos: algunas pantallas existentes, por ejemplo `Perfil.jsx`, aún utilizan el Axios compartido directamente. Las refactorizaciones deben ser graduales, con pruebas, y no cambiar los contratos operativos.

### Sistema visual

[`src/index.css`](src/index.css) define el tema oscuro, tokens de color/espaciado y clases compartidas `ui-panel`, `ui-control`, `ui-button`, `ui-table` y estados vacíos. Tailwind complementa los layouts y ajustes por pantalla. `components/common/` centraliza elementos como selectores, fechas, skeletons y layouts de autenticación.

El documento clínico mantiene su propia presentación imprimible clara: el tema oscuro de la aplicación no debe trasladarse a un PDF ni modificar sus contrastes o tamaños de página.

## Flujos de datos y contratos

### Sesión y autorización

1. El formulario de acceso utiliza la API de autenticación.
2. [`authStorage`](src/services/authStorage.js) conserva `token` y `user`, tolera almacenamiento bloqueado/JSON inválido y comunica cambios mediante `auth-session-change` y eventos `storage`.
3. [`useAuth`](src/hooks/useAuth.js) alimenta la navegación y las guardas de rol.
4. El interceptor Axios lee el token vigente en cada solicitud y añade `Authorization: Bearer …`.
5. El backend valida token, rol y propiedad del recurso. Ningún nombre ni filtro visual del navegador concede permisos.

El Provider limpia sus datos y desconecta el socket al cambiar la sesión. Las consultas compartidas comprueban que el token no haya cambiado antes de aplicar una respuesta, para no reutilizar datos de una cuenta anterior.

### Estado y tiempo real

[`createAuthenticatedSocket`](src/services/realtimeSocket.js) abre conexiones únicamente con token y URL explícita. `CitasProvider` administra una conexión compartida por sesión; los hooks/pantallas suscriben handlers concretos y los retiran al desmontarse.

Eventos como `profesionalActualizado`, `pacienteActualizado` e `historiaClinicaFinalizada` disparan sincronizaciones del estado autorizado. [`usePatientUpdates`](src/hooks/usePatientUpdates.js) combina el evento local `patient:updated`, Socket.IO, reconexión y retorno a una pestaña visible. El socket informa que hubo un cambio; la API continúa siendo la fuente de datos persistidos.

### Identidad de profesionales y clientes

- El profesional se identifica por **ID de cuenta**, no por su nombre. `professionalOwnership`, `professionalDirectory` y `useProfessionalDirectory` preservan propiedad y resuelven el nombre actual para historiales, gráficos y exportaciones.
- `pacienteId` es la identidad estable del cliente entre citas, tratamientos, pagos e historias. `patientId` es una clave del almacenamiento local de una historia: no son intercambiables.
- Guardar o Finalizar una historia envía el nombre completo corregido junto con referencias persistidas. Solo después de la confirmación de la API se anuncia la actualización del cliente.
- La propagación de nombre incluye citas pendientes, atendidas, aplazadas y canceladas de la misma identidad; no altera estado, fecha, servicio ni monto.
- En Registrar cita, seleccionar una sugerencia existente conserva `citaPacienteId`, una referencia a una cita. El servidor verifica acceso y reutiliza la identidad persistida. Un nombre escrito libremente no acredita que se trate del mismo cliente.
- Los registros antiguos sin identidad necesitan evidencias verificables o una reparación interna revisada. No se deben unir homónimos ni reemplazar nombres masivamente desde el navegador.

### Historial operativo y reportes

| Fuente API | Consumidor y significado |
| --- | --- |
| `/api/tratamientos` | Tratamientos realmente registrados; conserva el listado clínico y los indicadores del doctor. |
| `/api/tratamientos/historial-atenciones` | Historial operativo de cosmiatra y Gestión de clientes: puede incluir una cita atendida sin tratamiento registrado. |
| `/api/tratamientos/reporte-servicios` | Proyección autorizada para el reporte diario compartido de servicios e ingresos de ambas especialidades. |

Una atención sin tratamiento se identifica explícitamente y no inventa observaciones, insumos, imágenes ni respuestas clínicas. Cuando aparece el tratamiento real se conserva la selección por identidad de la atención. Los pagos operativos se relacionan con la cita correspondiente y los totales evitan contar dos veces un comprobante.

`citasFecha` y `serviceReport` distinguen instantes de citas y fechas de calendario; una cita cerca de medianoche UTC debe aparecer en el día de Lima correcto. No convierta indiscriminadamente una fecha `YYYY-MM-DD` mediante una interpretación UTC.

## Historia clínica y PDF

### Módulos principales

| Archivo | Responsabilidad |
| --- | --- |
| `pages/doctor/FormularioPeptidos.jsx` | Coordina apertura, pasos, borrador, sincronización, validación, finalización y vista previa. |
| `components/FormularioPeptidos/formConfig.js` | Secciones, valores iniciales, visibilidad y compatibilidad de diagnósticos/filas antiguas. |
| `components/FormularioPeptidos/FormSteps.jsx` | Contenido visual de cada sección clínica. |
| `components/FormularioPeptidos/FormFields.jsx` | Controles y contexto de navegación de pasos. |
| `components/FormularioPeptidos/formValidations.js` | Validadores por paso y guía de preguntas faltantes. |
| `components/FormularioPeptidos/birthDateAge.js` | Edad, mayoría de edad y coherencia de fecha de nacimiento. |
| `utils/clinicalHistoryStorage.js` | Borradores aislados por cuenta, selección activa y notificaciones locales. |
| `utils/clinicalHistoryRemote.js` | Adaptación entre el modelo local y el contrato de la API clínica. |
| `utils/clinicalHistoryDoctorProfile.js` | Aplicación del nombre, CMP y firma vigente del doctor a la copia de presentación. |
| `components/FormularioPeptidos/ClinicalHistoryPdf.jsx` | Modelo imprimible, vista previa propia y generación/descarga del PDF. |
| `components/FormularioPeptidos/pdfTextFlow.js` | Distribución pura de etiqueta y respuesta, medición tipográfica y ajuste de líneas sin recortar contenido. |

### Guardar, continuar y finalizar

El formulario conserva una copia local mientras se trabaja, incluso al cambiar de pantalla. Guardar permite un borrador incompleto y habilita la guía de preguntas pendientes; esta ayuda permite saltar directamente al campo sin recorrer todos los pasos.

La sincronización remota utiliza `/api/historias-clinicas`. Sus peticiones se serializan para que una respuesta de Guardar anterior no sobrescriba una Finalización posterior. Si hay un problema de conexión, se muestra el estado de sincronización; conservar un borrador local **no equivale** a haberlo guardado en el servidor.

Finalizar exige las respuestas requeridas y una confirmación del servidor. La edad debe ser adulta y coherente con la fecha de nacimiento; el DNI debe tener ocho dígitos. El sexo proviene del registro del paciente. Los antecedentes gineco-obstétricos aparecen únicamente cuando corresponde y la numeración visible sigue siendo consecutiva. Campos condicionales no seleccionados no deben convertirse en preguntas obligatorias ni en contenido vacío del documento.

### Documento y firma

La vista previa clínica se renderiza con componentes de la aplicación, sin depender del visor PDF nativo del navegador. Comparte el modelo de secciones y campos con la exportación; no debe confundirse una representación DOM con un visor binario idéntico a cada píxel del archivo.

La exportación principal utiliza jsPDF para producir texto vectorial, tablas y paginación A4. Solo se muestran campos con contenido. El diseño documental utiliza tipografía legible, una cabecera institucional inicial y separadores discretos, sin fondos oscuros en tablas. Cada respuesta comienza después de los dos puntos de su etiqueta; las descripciones extensas ocupan el ancho completo y continúan en líneas nuevas, conservando los saltos escritos. La distribución de columnas se decide con las mismas mediciones para la vista previa y el PDF, sin alterar el orden clínico.

`pdfTextFlow` calcula líneas y fragmentos de texto mediante una función de medición inyectada, sin depender de React, DOM ni persistencia. El renderizador vectorial divide párrafos y filas de tabla extensas entre páginas, repite las cabeceras de tabla cuando corresponde y reserva espacio para la constancia y firma. La vista previa es una lectura continua del documento; el archivo descargado tiene páginas A4 y numeración.

El nombre, CMP y firma vigentes del doctor se aplican a una copia de presentación/descarga; no se reescriben respuestas del paciente por un cambio de perfil. Un PDF ya descargado es un archivo independiente: para obtener los datos actualizados se debe generar y descargar nuevamente.

html2pdf.js permanece como alternativa de compatibilidad si falla la exportación vectorial. La preparación y limpieza del DOM temporal evita dejar superposiciones bloqueando la pantalla al producirse un error. La firma depende además de la disponibilidad del archivo y de las condiciones CORS del proveedor de imágenes; pruebe este caso explícitamente tras cambiar infraestructura o librerías.

### Próximos controles

Los controles de historias finalizadas se combinan con la fuente remota mediante `clinicalControlNotifications.service` y `useClinicalControlNotifications`. El popup de la barra superior muestra paciente, servicio y fecha como un aviso informativo. Se monta con un portal para evitar quedar debajo de otras cards. Las fechas vencidas se excluyen de la vista; esto no elimina la historia clínica del servidor ni crea una cita automáticamente.

## Código limpio, patrones y SOLID

### Convenciones de código limpio

- Componentes funcionales y composición, con nombres vinculados al caso de uso.
- Funciones HTTP agrupadas por dominio y cliente Axios centralizado.
- Hooks para ciclo de vida/suscripciones; helpers puros para reglas y transformaciones que no necesitan React.
- Configuración y validación del formulario separadas del contenido visual de cada paso.
- IDs persistidos para identidad, evitando utilizar nombres modificables como claves de autorización.
- Limpieza de listeners, timers, sockets y nodos temporales al finalizar su ciclo de vida.
- Compatibilidad explícita con formatos heredados y errores de almacenamiento, sin ocultar un fallo de sincronización persistente.

### Patrones aplicados

| Patrón/enfoque | Ejemplo real | Beneficio y límite |
| --- | --- | --- |
| Composición / configuración | `DashboardLayout` con rutas y menús por rol. | Reutiliza el shell sin una jerarquía de clases ni copias por especialidad. |
| Provider / Context | `CitasProvider`, `useCitas`, contexto de pasos clínicos. | Comparte estado donde es necesario; no implica una biblioteca externa de gestión de estado. |
| Adapter | `authStorage`, `realtimeSocket`, `clinicalHistoryStorage`, `clinicalHistoryRemote`. | Encapsula navegador, transporte y diferencias de formato entre cliente/API. |
| Fachada API | `citas.api.js`, `tratamientos.api.js`, `historiasClinicas.api.js`. | Da nombres del dominio a solicitudes HTTP y reduce conocimiento de rutas en consumidores. |
| Observer / publicación-suscripción | Eventos de sesión/cliente y Socket.IO. | Refresca consumidores desacoplados; requiere retirar listeners y volver a consultar la fuente autorizada. |
| Transformación de modelo de presentación | `professionalDirectory`, `attentionHistory`, `clinicalHistoryDoctorProfile`. | Prepara nombres, selección y documentos sin cambiar arbitrariamente el registro persistido. |
| Estrategias de exportación | jsPDF principal y html2pdf alternativo. | Aísla alternativas de renderizado; ambas deben conservar contenido y liberar recursos. |

No se declara un Repository Pattern del frontend: los repositorios MongoDB pertenecen al backend. Tampoco se introducen clases o abstracciones únicamente para que el código parezca cumplir un patrón.

### Aplicación práctica de SOLID

SOLID se interpreta como criterio de diseño de responsabilidades y contratos, adaptado a React funcional; no como una afirmación de cumplimiento total del proyecto.

| Principio | Aplicación actual | Precaución al evolucionar |
| --- | --- | --- |
| **S · Responsabilidad única** | Transporte en `api/`, persistencia local en su adaptador, validación clínica en su módulo y UI en componentes. | `FormularioPeptidos` y `CitasProvider` aún coordinan varias tareas; separar gradualmente cuando las pruebas preserven su comportamiento. |
| **O · Abierto/cerrado** | Menús/rutas por configuración y registro de pasos/validadores reducen cambios en el shell. | Una nueva pregunta clínica puede requerir también cambios en API, validadores y PDF: no existe extensión automática completa. |
| **L · Sustitución de Liskov** | Renderizadores/adaptadores alternativos deben conservar el contrato de entrada, contenido y resultado esperado. | No hay jerarquía de herencia que permita afirmar una verificación formal de LSP; comprobar equivalencia observable con regresiones. |
| **I · Segregación de interfaces** | `useAuth`, `useProfessionalDirectory` y funciones API del caso de uso ofrecen contratos focalizados. | El contexto operativo compartido sigue siendo amplio; evitar agregar responsabilidades ajenas y considerar su división si crece. |
| **D · Inversión de dependencias** | Los consumidores clínicos usan adaptadores de almacenamiento/sincronización. `pdfTextFlow` recibe una función de medición y no conoce jsPDF: sus reglas se prueban con otras implementaciones del mismo contrato. | La inyección es parcial: existen imports concretos y acceso al Axios común; no hay contenedor DI ni aislamiento universal de infraestructura. |

## Seguridad y privacidad

### Medidas implementadas

- Guardas de navegación por sesión y rol; la API impone autenticación, autorización y propiedad definitiva.
- Socket.IO autenticado mediante el adaptador compartido y desconexión al cambiar la cuenta.
- Estado transversal limpiado al cambiar sesión y borradores clínicos locales aislados por ID de usuario.
- Purga de claves clínicas globales antiguas y eliminación de borradores al cerrar sesión mediante el flujo de logout.
- PWA con política `NetworkOnly` para `/api/*` y solicitudes con `Authorization`; caché runtime únicamente para recursos estáticos del mismo origen, no imágenes clínicas externas.
- Limpieza de cachés heredadas `karito-api-cache*` al arrancar y durante el cierre de sesión.
- Exportación Excel que neutraliza textos que comienzan con `=`, `+`, `-` o `@` para evitar su interpretación como fórmulas.
- `.env` excluido de Git y configuración pública documentada sin credenciales.
- Cabeceras declaradas en `vercel.json`: CSP, `nosniff`, restricciones de iframe, referrer, permisos y política de opener.

### Límites y controles operativos necesarios

El JWT se almacena actualmente en `localStorage` para compatibilidad con el contrato vigente. Una XSS podría leerlo. Migrar a cookies `HttpOnly` exige coordinar autenticación, CORS y protección CSRF con el backend; no puede resolverse únicamente mediante un cambio visual.

Los borradores locales contienen información clínica y no están cifrados por este adaptador. La separación por cuenta reduce exposición accidental, pero no reemplaza el control físico del equipo: use perfiles de navegador individuales, bloqueo de pantalla, cifrado del dispositivo y políticas de retención. El shell PWA puede cargarse offline; eso no habilita una operación completa ni garantizada sin conexión.

La CSP actual permite conexiones `https:`/`wss:` en general y excepciones locales de desarrollo. Antes de endurecer producción, restrinja los orígenes a los servicios realmente utilizados y pruebe API, sockets, firmas y exportaciones. Las cabeceras solo se aplican automáticamente en la plataforma que interprete `vercel.json`.

La dependencia `xlsx` merece seguimiento periódico de mantenimiento/avisos de seguridad. El uso actual es generación de archivos, no lectura de documentos externos; no interprete esa limitación como ausencia de riesgo. Revise todo el árbol con auditorías y evalúe actualizaciones sin sustituir librerías críticas a ciegas.

Los datos clínicos, imágenes y comprobantes requieren controles de acceso, retención, respaldo y registros operativos coordinados con el backend. Este README no garantiza inmunidad frente a ataques ni cumplimiento normativo automático.

## Pruebas y control de calidad

### Verificación automatizada

```bash
npm run lint
npm run build
node --test src/utils/*.test.js src/hooks/*.test.js src/components/ReportesServiciosIngresos/calcularMonto.test.js src/components/FormularioPeptidos/*.test.js
npm audit --omit=dev
```

Las pruebas existentes utilizan `node:test` y `node:assert`; el hook probado emplea adaptadores pequeños de React/navegador. No existe un script `npm test` en este frontend ni una suite E2E general configurada. La auditoría requiere acceso al registro y sus resultados dependen de la fecha; revise también dependencias de desarrollo antes de desplegar cambios de herramienta.

| Suite | Riesgos cubiertos |
| --- | --- |
| `src/utils/patientIdentity.test.js` | Identidad estable, correcciones de nombre y separación de homónimos. |
| `src/utils/clinicalHistoryStorage.test.js` | Continuidad del borrador, almacenamiento y aislamiento por cuenta. |
| `src/utils/appointmentPatientSuggestions.test.js` | Selección/autocompletado y referencias a clientes existentes. |
| `src/hooks/usePatientUpdates.test.js` | Eventos locales/remotos, reconexión, foco/visibilidad y limpieza. |
| `src/utils/attentionHistory.test.js` | Identidad de una atención y reemplazo por su tratamiento registrado. |
| `src/utils/serviceReport.test.js` | Día de Lima y datos de presentación de reportes. |
| `src/components/ReportesServiciosIngresos/calcularMonto.test.js` | Relación de pagos y totales sin duplicación de comprobantes. |
| `src/components/FormularioPeptidos/pdfTextFlow.test.js` | Etiqueta/respuesta en la misma línea, saltos explícitos, Unicode, palabras largas y límites de ancho. |
| `src/components/FormularioPeptidos/ClinicalHistoryPdf.test.js` | PDF real y vista previa, orden clínico, campos vacíos/sexo, firma, cabecera inicial y contenido extenso sin recortes entre páginas. |

### Regresión manual mínima

Antes de entregar un cambio, compruebe:

1. Acceso, recuperación, cambio/cierre de sesión y navegación de cada rol.
2. Registro/edición/estado de cita, calendario completo y servicios de la especialidad elegida.
3. Tratamiento con insumos propios e imágenes; cobro y comprobante de la cita correcta.
4. Búsqueda, selección y paginación de clientes; reportes diarios de ambas especialidades y fechas cercanas a medianoche.
5. Historia incompleta: Guardar, salir, volver, guía de pendientes y fallo de conexión.
6. Historia completa: Finalizar, progreso final, popup, retorno al paciente y reapertura.
7. Corrección de nombres de cliente/profesional sin duplicar identidades ni perder historial, incluidos estados cancelado/aplazado.
8. Vista previa y descarga PDF con texto largo, tablas, firma, varias páginas y cambios de perfil; comprobar también un fallo de exportación sin bloquear la UI.
9. Layout móvil y escritorio, teclado, etiquetas, foco visible y lectura de mensajes.

Las regresiones del PDF compilan el JSX en memoria con esbuild, renderizan la vista previa con React y generan archivos reales con jsPDF. Registran posiciones de texto e imágenes para comprobar límites y paginación, usando solo datos sintéticos. No sustituyen una prueba del navegador con descargas, CORS y firmas remotas reales. Los tests actuales son focalizados: pasar lint/build no demuestra por sí solo que todos estos flujos estén correctos.

## Despliegue

1. Configure `VITE_API_URL` y `VITE_SOCKET_URL` para el entorno destino **antes de compilar**. Use HTTPS y evite contenido mixto.
2. Instale mediante `npm ci`, ejecute validaciones y compile con `npm run build`.
3. Publique únicamente `dist/` en un alojamiento estático; no incluya `.env`, fuentes con secretos ni `node_modules/`.
4. Redirija las rutas SPA no correspondientes a archivos hacia `index.html`, para permitir recarga directa de rutas internas. `vercel.json` incluye esta reescritura para Vercel.
5. Configure en el backend una allowlist CORS exacta con el origen publicado y permita el transporte Socket.IO necesario.
6. Replique cabeceras de seguridad en CDN/proxy si no utiliza Vercel; revise CSP contra los dominios reales.
7. Verifique Service Worker, actualización del shell, API, socket, imágenes, firmas y descargas en el dominio definitivo.
8. Defina retención de datos, acceso mínimo, equipos autorizados, backups y recuperación junto con el responsable del backend.

No utilice el servidor Vite de desarrollo o `preview` como reemplazo de un despliegue de producción. Un cambio de variables públicas requiere una nueva compilación.

## Mantenimiento y contribución

### Añadir o modificar una funcionalidad

1. Identifique rol, recursos afectados y contrato del servidor antes de tocar la vista.
2. Añada/ajuste la operación HTTP en el módulo `api/` del dominio; reutilice Axios y la autenticación existentes.
3. Extraiga reglas reutilizables en funciones pequeñas o adaptadores; mantenga efectos/listeners en hooks con limpieza explícita.
4. Implemente la presentación mediante componentes y tokens existentes, preservando accesibilidad y responsive.
5. Mantenga IDs de selección/propiedad. No convierta una corrección de nombre en una alta de cliente ni agregue una fusión nominal automática.
6. Para preguntas clínicas actualice configuración, control, validación, guía de faltantes, compatibilidad de borradores, contrato backend y PDF cuando corresponda.
7. Agregue regresiones del caso resuelto y de sus límites de autorización/identidad; ejecute controles automáticos y manuales.
8. Actualice README y `.env.example` si cambia el contrato de arquitectura, operación o despliegue.

### Actualizar dependencias

Conserve `package-lock.json`, use una rama/cambio acotado y revise el diff de versiones. Las actualizaciones de jsPDF/html2pdf, fechas, Router, React y PWA necesitan una regresión de navegador además de lint/build. No aplique `npm audit fix --force` sin revisar cambios incompatibles y resultados funcionales.

No versionar credenciales, exportaciones con pacientes, imágenes clínicas de prueba reales, tokens ni dumps de base. Use datos sintéticos al reproducir fallos. Las mejoras de arquitectura deben preservar el comportamiento solicitado; se prioriza un refactor pequeño comprobado sobre una reestructuración masiva sin cobertura.

## Diagnóstico de problemas

| Síntoma | Comprobaciones recomendadas |
| --- | --- |
| Cambios no visibles en `localhost:4173` | Recompile: `preview` no aplica cambios de fuente. Compruebe también actualización del Service Worker. |
| API no disponible / errores CORS | Revise `.env`, que `VITE_API_URL` no duplique `/api`, backend en ejecución, origen autorizado y HTTPS del despliegue. |
| Socket desconectado | Compruebe `VITE_SOCKET_URL`, sesión vigente, CORS/socket del servidor y soporte WebSocket/polling del proxy. |
| Historial vacío después de cambiar un nombre | Verifique respuesta API, IDs de cuenta/cliente y referencias persistidas; no desactive filtros de propiedad para ocultar el fallo. |
| Reporte de un día sin registros | Distinga fecha de calendario de instante UTC; compruebe la proyección de reporte y el día de Lima. |
| No aparece la firma en el documento | Revise perfil del doctor, URL accesible, autorización/proxy de firma y CORS de imágenes; genere nuevamente el documento. |
| Guardado local pero no remoto | Revise el aviso de sincronización y conectividad; vuelva a Guardar. No dé por finalizada una historia sin confirmación de la API. |
| Descarga PDF falla | Revise errores de consola/red sin exponer datos clínicos; compruebe renderizador, firma y fallback, y que la interfaz quede desbloqueada. |

Para diagnosticar, recopile ruta, rol, pasos, fecha de calendario, tipo de respuesta y errores sin datos personales. Los registros con identidad heredada requieren una revisión controlada en el backend; no se corrigen borrando pacientes ni modificando colecciones por coincidencia de nombres.
