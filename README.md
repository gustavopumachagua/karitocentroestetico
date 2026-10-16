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
- [Seguimiento y plan alimentario](#seguimiento-y-plan-alimentario)
- [Código limpio, patrones y SOLID](#código-limpio-patrones-y-solid)
- [Seguridad y privacidad](#seguridad-y-privacidad)
- [Imágenes protegidas](#imágenes-protegidas)
- [Pruebas y control de calidad](#pruebas-y-control-de-calidad)
- [Despliegue](#despliegue)
- [Mantenimiento y contribución](#mantenimiento-y-contribución)
- [Diagnóstico de problemas](#diagnóstico-de-problemas)

## Alcance funcional

| Área | Funciones principales |
| --- | --- |
| Pública | Página de inicio, acceso, solicitud de recuperación y restablecimiento de contraseña. |
| Doctor | Agenda asignada, historial de pacientes, registro de tratamientos, historia clínica para evaluación de manejo de peso, PDF, reportes y ajustes. |
| Cosmiatra | Gestión de citas, registro de tratamientos, cobros y comprobantes, historial de clientes, seguimiento y plan alimentario derivados de nuevas historias finalizadas, reporte diario de servicios e ingresos y ajustes. |
| Administrador | Panel general, usuarios y roles, clientes, inventario y servicios, facturación/pagos, reportes avanzados y ajustes. |

El inventario y los servicios se seleccionan de acuerdo con la especialidad. CMP y firma del perfil se muestran únicamente al doctor. Los reportes diarios de cosmiatra y administración pueden mostrar servicios de ambas especialidades utilizando el conjunto de datos autorizado por la API.

### Rutas

| Área | Rutas |
| --- | --- |
| Pública | `/`, `/login`, `/reset-password`, `/new-password` |
| Doctor | `/doctor/agenda-de-citas`, `/doctor/historial-de-pacientes`, `/doctor/historial-de-pacientes/formulario`, `/doctor/registrar-tratamiento`, `/doctor/mis-reportes`, `/doctor/ajustes/perfil`, `/doctor/ajustes/contrasena` |
| Cosmiatra | `/cosmiatra/gestion-de-citas`, `/cosmiatra/registrar-tratamiento`, `/cosmiatra/gestion-de-pagos`, `/cosmiatra/historial-de-clientes`, `/cosmiatra/historial-de-clientes/plan?historia=<id>`, `/cosmiatra/reportes-de-servicios-e-ingresos`, `/cosmiatra/ajustes/perfil`, `/cosmiatra/ajustes/contrasena` |
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

La interfaz utiliza superficies sólidas, un acento indigo (`#818CF8`), tipografía legible, controles de 44 px y colores semánticos reservados para estados. Los estilos compartidos se organizan en `@layer components` para que las utilidades Tailwind puedan ajustar los layouts sin superponer iconos y texto. [`chartTheme.js`](src/components/DashboardDoctor/chartTheme.js) centraliza únicamente la presentación de Recharts; los calendarios conservan su implementación y callbacks originales. La apariencia de documentos imprimibles queda fuera del tema oscuro.

El [informe de auditoría UI/UX](docs/ui-ux-audit.md) documenta la paleta, componentes, archivos, rutas revisadas, pruebas responsive de 320 a 1920 px y limitaciones. Las pruebas visuales utilizan usuarios/pacientes ficticios y APIs simuladas; no deben confundirse con una validación del backend o una certificación de accesibilidad.

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

### Datos de ingreso compartidos entre Doctor y Cosmiatra

`RegistrarTratamiento` es la misma pantalla para ambas especialidades. Al seleccionar una cita propia consulta `GET /api/tratamientos/paciente-por-cita/:citaId`, que devuelve únicamente nombre, identidad del paciente, sexo y celular. El servidor resuelve esos campos mediante el `pacienteId` ya vinculado a la cita, aunque la captura original haya sido realizada por el otro rol. No se consulta por nombre ni se comparten observaciones, imágenes, diagnósticos o historias privadas.

En la primera atención los campos ausentes permanecen editables. En las siguientes, el celular se completa y el sexo registrado queda seleccionado; un sexo aún no informado puede completarse. En Gestión de citas se debe elegir al cliente existente desde las sugerencias para conservar su referencia, en lugar de registrarlo de nuevo como un nombre libre. Los homónimos no se fusionan automáticamente.

`useTreatmentPatient` encapsula carga, errores y reintentos; cancela consultas y descarta respuestas de otra cita o sesión. Un error de conexión no convierte al cliente en nuevo ni habilita un registro sin verificar sus datos. El editor se identifica por sesión y cita (`_id` o `id`), evitando conservar sexo, teléfono, observaciones o imágenes del paciente anterior. El backend también recupera los datos guardados cuando un envío omite esos campos.

Sin citas pendientes propias, Registrar tratamiento conserva todos los campos visibles y vacíos, sin consultar datos de otro paciente. Guardar permanece deshabilitado hasta disponer de una cita válida y verificar sus datos; mostrar el formulario vacío no habilita registros sin cita.

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
| `components/FormularioPeptidos/clinicalExamRows.js` | Filas dinámicas de exámenes, adaptación de respuestas antiguas y validación compartida con la guía y el PDF. |
| `utils/clinicalHistoryStorage.js` | Borradores aislados por cuenta, selección activa y notificaciones locales. |
| `utils/clinicalHistoryRemote.js` | Adaptación entre el modelo local y el contrato de la API clínica. |
| `utils/clinicalHistoryDoctorProfile.js` | Aplicación del nombre, CMP y firma vigente del doctor a la copia de presentación. |
| `components/FormularioPeptidos/ClinicalHistoryPdf.jsx` | Modelo imprimible, vista previa propia y generación/descarga del PDF. |
| `components/FormularioPeptidos/pdfTextFlow.js` | Distribución pura de etiqueta y respuesta, medición tipográfica y ajuste de líneas sin recortar contenido. |

### Guardar, continuar y finalizar

El formulario conserva una copia local mientras se trabaja, incluso al cambiar de pantalla. Guardar permite un borrador incompleto y habilita la guía de preguntas pendientes; esta ayuda permite saltar directamente al campo sin recorrer todos los pasos.

La sincronización remota utiliza `/api/historias-clinicas`. Sus peticiones se serializan para que una respuesta de Guardar anterior no sobrescriba una Finalización posterior. Si hay un problema de conexión, se muestra el estado de sincronización; conservar un borrador local **no equivale** a haberlo guardado en el servidor.

Finalizar exige las respuestas requeridas y una confirmación del servidor. La edad debe ser adulta y coherente con la fecha de nacimiento; el DNI debe tener ocho dígitos. El sexo proviene del registro del paciente. Los antecedentes gineco-obstétricos aparecen únicamente cuando corresponde y la numeración visible sigue siendo consecutiva. Campos condicionales no seleccionados no deben convertirse en preguntas obligatorias ni en contenido vacío del documento.

### Exámenes auxiliares editables

La sección utiliza una tabla de dos columnas, **Examen** y **Resultado**, con una fila inicial y controles para agregar o quitar filas. El contrato es `formData.examenesAuxiliares: [{ examen, resultado }]`, con un máximo de 100 filas, 160 caracteres para cada nombre y 2000 para cada resultado. Guardar admite filas vacías o parciales; Finalizar requiere una fecha de laboratorio válida y al menos una fila completa, sin filas parcialmente contestadas. Las filas totalmente vacías no se imprimen.

`clinicalExamRows.js` comparte la interpretación de las filas entre el editor, la guía de preguntas y el documento clínico. Al abrir un registro antiguo, sus resultados fijos —glucosa, HbA1c y los demás exámenes, incluido Otros— se convierten en filas sin perder sus respuestas. Si existe la lista nueva, incluso vacía, esta es autoritativa: no se recuperan resultados antiguos que el usuario ya quitó. El backend conserva la validación previa para historias que todavía no contienen esa lista y valida estrictamente el esquema nuevo al guardar.

### Documento y firma

La vista previa clínica se renderiza con componentes de la aplicación, sin depender del visor PDF nativo del navegador. Comparte el modelo de secciones y campos con la exportación; no debe confundirse una representación DOM con un visor binario idéntico a cada píxel del archivo.

La exportación principal utiliza jsPDF para producir texto vectorial, tablas y paginación A4. Solo se muestran campos con contenido. El diseño documental utiliza tipografía legible, una cabecera institucional inicial y separadores discretos, sin fondos oscuros en tablas. Cada respuesta comienza después de los dos puntos de su etiqueta; las descripciones extensas ocupan el ancho completo y continúan en líneas nuevas, conservando los saltos escritos. La distribución de columnas se decide con las mismas mediciones para la vista previa y el PDF, sin alterar el orden clínico.

`pdfTextFlow` calcula líneas y fragmentos de texto mediante una función de medición inyectada, sin depender de React, DOM ni persistencia. El renderizador vectorial divide párrafos y filas de tabla extensas entre páginas, repite las cabeceras de tabla cuando corresponde y reserva espacio para la constancia y firma. La vista previa es una lectura continua del documento; el archivo descargado tiene páginas A4 y numeración.

El nombre, CMP y firma vigentes del doctor se aplican a una copia de presentación/descarga; no se reescriben respuestas del paciente por un cambio de perfil. Un PDF ya descargado es un archivo independiente: para obtener los datos actualizados se debe generar y descargar nuevamente.

html2pdf.js permanece como alternativa de compatibilidad si falla la exportación vectorial. La preparación y limpieza del DOM temporal evita dejar superposiciones bloqueando la pantalla al producirse un error. Ambos renderizadores obtienen la firma mediante el cliente autenticado de imágenes; no deben recurrir a una URL pública cuando falla la autorización. Pruebe disponibilidad de la API, sesión y permisos explícitamente tras cambiar infraestructura o librerías.

### Próximos controles

Los controles de historias finalizadas se combinan con la fuente remota mediante `clinicalControlNotifications.service` y `useClinicalControlNotifications`. El popup de la barra superior muestra paciente, servicio y fecha como un aviso informativo. Se monta con un portal para evitar quedar debajo de otras cards. Las fechas vencidas se excluyen de la vista; esto no elimina la historia clínica del servidor ni crea una cita automáticamente.

## Seguimiento y plan alimentario

### Derivación mínima desde una nueva historia finalizada

Cuando el servidor confirma una **nueva finalización**, habilita un seguimiento alimentario vinculado al ID de esa historia. En `/cosmiatra/historial-de-clientes` aparece una ficha independiente con nombre, sexo, contacto, fecha e indicadores del paciente. No se copia ni se entrega al rol Cosmiatra el formulario privado del doctor: no incluye diagnósticos, exámenes, firma ni atenciones previas. Las historias que ya estaban finalizadas antes de esta funcionalidad no se incorporan retroactivamente. El historial operativo propio de Cosmiatra se conserva por separado; no se crean citas, tratamientos ni clientes duplicados para mostrar esta derivación.

Los seguimientos aún sin plan pueden ser consultados por profesionales activos de Cosmiatra. **El primer guardado** asigna el plan al ID de esa profesional; abrir la ficha o la vista previa no lo asigna. Después, el servidor restringe la consulta y edición del plan a su propietaria. La identidad del paciente y la autorización se resuelven en el backend, nunca por coincidencia de nombres ni por un ID proporcionado libremente en el cuerpo.

### Edición, guardado y finalización

El botón **Generar plan** abre `/cosmiatra/historial-de-clientes/plan?historia=<id>`. La estructura toma como referencia visual [`plan.png`](plan.png): siete días ordenados de lunes a domingo y cinco tiempos de comida —desayuno, media mañana, almuerzo, media tarde y cena—, más edad, peso, talla, IMC e indicaciones. Las comidas empiezan vacías: el profesional redacta el contenido individualizado; no se genera una dieta ni recomendaciones médicas automáticamente.

Los indicadores iniciales proceden de la ficha autorizada y pueden editarse. La edad admite 18–130 años; peso, talla e IMC requieren valores numéricos positivos. Cada comida permite hasta 1500 caracteres y las indicaciones, hasta 4000. **Guardar borrador** permite respuestas incompletas y persiste exclusivamente en el servidor; no se guarda el plan en `localStorage`, IndexedDB ni caché PWA. Los cambios pendientes sólo están en memoria: guarde antes de cambiar de sección, cerrar o recargar, y espere el mensaje de confirmación.

Cada guardado envía una `revision`; el backend la compara y aumenta atómicamente. Una edición concurrente o un plan ya finalizado devuelve `409`: la pantalla conserva los cambios sin guardar y ofrece cargar la versión del servidor, previa confirmación para descartarlos. No se sobrescribe automáticamente la versión de otra sesión. Las solicitudes verifican token e ID de cuenta antes del despacho y al recibir la respuesta; los cambios de sesión cancelan solicitudes y descartan respuestas de la cuenta anterior.

Durante la edición sólo aparece **Guardar borrador** mientras falten respuestas o existan valores inválidos. **Finalizar plan** aparece automáticamente cuando los cuatro indicadores, las 35 comidas y las indicaciones están completos y válidos; vuelve a ocultarse si se borra o invalida algún campo. Antes de confirmar se comprueba también que las fuentes del PDF estén disponibles y representen los caracteres escritos. Sólo una respuesta persistida del servidor cambia el estado a finalizado; un fallo de red no se presenta como una finalización exitosa.

Una vez finalizado, se ocultan las acciones de edición y aparece **Vista previa**. El documento no se abre automáticamente: al seleccionar ese botón se muestra el plan concluido junto con **Descargar plan en PDF**, dentro de la misma sección. Al volver a abrir un plan finalizado, también se requiere seleccionar Vista previa. El plan finalizado permanece inmutable.

**Finalizar plan** inicia el guardado directamente, sin una segunda confirmación. Un modal informativo sin botones muestra el progreso mientras se valida el PDF y se guarda; se bloquean los envíos duplicados y el cierre del diálogo. Sólo tras la confirmación del servidor aparece el aviso de éxito, que se cierra automáticamente a los 2,8 segundos, sin cambiar de página ni abrir el PDF. Si falla el proceso, el modal se cierra y el error queda visible en el editor, conservando el borrador para reintentar; las solicitudes tienen un tiempo límite de 30 segundos para no bloquear indefinidamente la pantalla. Los conflictos de revisión requieren cargar la versión del servidor. El modal gestiona el foco, la navegación por teclado y la restauración al botón Finalizar o Vista previa según corresponda.

### Documento profesional y límites tipográficos

La vista previa pertenece a la aplicación, sin visor PDF del navegador. La descarga utiliza jsPDF vectorial en **A4 horizontal**, con datos del paciente, indicadores, menú semanal, indicaciones y paginación. El modelo y el orden son compartidos por editor, vista previa y PDF. Los textos extensos se ajustan al ancho y se dividen entre páginas con cabeceras de tabla repetidas, sin recortar comidas ni indicaciones.

El diseño documental sigue la referencia `plan.png`: título centrado en mayúsculas, paciente e indicadores compactos debajo, cabecera verde salvia con texto blanco, columna de días en tono claro y cuadrícula fina. La columna de almuerzo dispone de más ancho; las indicaciones comienzan junto a su etiqueta al pie de la tabla. La identidad institucional se presenta discretamente en el pie. `nutritionPlanPresentation.js` comparte proporciones, paleta y resumen entre vista previa y PDF. El diseño no introduce alimentos de ejemplo ni modifica las respuestas del profesional.

El documento incorpora las fuentes Unicode locales DejaVu Sans normal y negrita desde `src/assets/fonts/`; no solicita tipografías a terceros. Su redistribución conserva el aviso y la [licencia incluida](src/assets/fonts/LICENSE-DejaVu.txt), publicada también en `public/licenses/DejaVu.txt` para incorporarla a `dist/licenses/DejaVu.txt`. La cobertura no es universal: el preflight revisa los glifos de ambas fuentes y bloquea la finalización/exportación con un mensaje explícito si detecta un carácter no compatible —por ejemplo ciertos emojis—, en lugar de eliminarlo o sustituirlo silenciosamente. Corrija ese carácter antes de finalizar. Un PDF descargado es una copia independiente; no se actualiza remotamente.

### Arquitectura del módulo

| Módulo | Responsabilidad |
| --- | --- |
| `api/planesAlimentarios.api.js` | Fachada de `GET /api/planes-alimentarios/seguimientos`, `GET /api/planes-alimentarios/:historiaId` y `PUT /api/planes-alimentarios/:historiaId`; sesión esperada y cancelación de solicitudes. |
| `hooks/useNutritionFollowups.js` | Consulta la proyección mínima y refresca mediante eventos, foco y sondeo; limpia recursos y separa resultados por sesión. |
| `components/HistorialPacientes/ClinicalNutritionFollowups.jsx` | Listado y selección de fichas, búsqueda y acceso a Generar/Continuar/Ver plan. |
| `pages/cosmiatra/PlanAlimentario.jsx` | Coordina carga, editor, validación, revisión concurrente, finalización y exportación. |
| `utils/nutritionPlan.js` | Orden canónico de días/comidas, borrador, validadores y modelos de API/documento mediante funciones puras. |
| `components/PlanAlimentario/NutritionPlanDocument.jsx` y `nutritionPlan.css` | Vista previa accesible, clara y responsive, independiente del tema oscuro. |
| `components/PlanAlimentario/NutritionPlanActions.jsx` | Acciones progresivas según completitud y estado persistido: borrador, finalización y apertura explícita de la vista previa. |
| `components/PlanAlimentario/NutritionPlanFinalizationModal.jsx` | Avisos de progreso y éxito sin botones mediante React Modal, con foco, cierre automático coordinado por el editor y recuperación de la interacción; no realiza escrituras. |
| `utils/nutritionPlanFonts.js` y `nutritionPlanPdf.js` | Carga local de fuentes, comprobación de glifos y distribución vectorial paginada. |
| `utils/nutritionPlanPresentation.js` | Paleta, proporciones de columnas y resumen de indicadores compartidos por los dos renderizadores documentales. |

La separación mantiene presentación, reglas, transporte y exportación en responsabilidades distintas; no comparte el agregado clínico privado del doctor con el nuevo módulo. Las pruebas de regresión cubren filas antiguas/nuevas, validación, contratos de sesión, orden del menú, caracteres compatibles/no compatibles, contenido y límites de página. La autorización, propiedad del primer guardado y persistencia por revisión se verifican además en las pruebas del backend; requieren desplegar ambos proyectos juntos.

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

## Imágenes protegidas

Las firmas, fotos de perfil y fotografías/miniaturas de tratamientos se solicitan al backend mediante `/api/media/*`. El frontend no genera firmas Cloudinary, conoce secretos ni recibe enlaces temporales de acceso. La autorización definitiva pertenece a la API: el personal activo puede consultar fotos de perfil; las firmas del perfil/historias requieren su doctor propietario; las fotos de tratamientos requieren su profesional propietario o administrador. Nombres y alias no conceden acceso.

| Módulo | Responsabilidad |
| --- | --- |
| [`src/api/media.api.js`](src/api/media.api.js) | Valida rutas de medios admitidas y descarga un `Blob` con JWT, sin caché, cookies ni redirecciones externas; valida tipo/tamaño y que la sesión no cambió durante la descarga. |
| [`src/hooks/useProtectedImage.js`](src/hooks/useProtectedImage.js) | Gestiona solicitudes, estados y URLs `blob:` en memoria; aborta y libera recursos al cambiar imagen, sesión o desmontar el componente. |
| [`src/components/common/ProtectedImage.jsx`](src/components/common/ProtectedImage.jsx) | Presentación compartida de las imágenes autorizadas en perfiles, sidebar y galerías. Los estados de error no intentan una entrega pública alternativa. |
| [`src/utils/protectedMediaReference.js`](src/utils/protectedMediaReference.js) | Valida referencias canónicas y adapta sesiones/historias locales antiguas a rutas de la API, sin modificar respuestas clínicas ni conservar enlaces temporales o metadatos internos del proveedor. |
| [`src/components/FormularioPeptidos/ClinicalHistoryPdf.jsx`](src/components/FormularioPeptidos/ClinicalHistoryPdf.jsx) | Obtiene la firma por el mismo transporte autorizado para vista previa y generación del PDF; prepara los bytes necesarios antes de exportar. |

Los objetos `Blob`, URLs `blob:` y bytes de firmas no se guardan en `localStorage`, IndexedDB ni caché PWA. Solo se conservan referencias de API donde el flujo existente necesita recordar la imagen. El Service Worker mantiene `NetworkOnly` para la API y solicitudes con `Authorization`. Los logos/fondos y avatares genéricos locales continúan siendo recursos públicos de diseño; una foto personal denegada nunca se reemplaza con su antigua URL Cloudinary.

**Las imágenes públicas anteriores necesitan una migración separada.** El cliente protegido no revoca una URL ya compartida ni una copia descargada. La herramienta preparada en el backend requiere inventario, respaldo, aprobación específica de un piloto y revisión por lotes; no se ejecuta desde este frontend. Consulte el [procedimiento de migración](../Backend_Estetico/README.md#imágenes-protegidas-y-migración). Los PDF descargados son archivos locales independientes y no pueden modificarse o revocarse remotamente.

Tras desplegar ambos proyectos, compruebe con cada rol: perfil/avatar, firma del doctor, reapertura de historia, PDF principal/alternativo, galerías/miniaturas, cierre y cambio de sesión. Una solicitud sin JWT debe devolver `401` y un recurso ajeno sin permisos, `403`; revise los mensajes sin copiar tokens, imágenes o información clínica a la consola/tickets.

```bash
node src/api/media.api.test.js
node src/hooks/useProtectedImage.test.js
```

Estas pruebas usan datos sintéticos y dobles de red/navegador. La revocación de URLs antiguas y el funcionamiento con la cuenta real de Cloudinary solo pueden verificarse tras un piloto expresamente autorizado. La protección de acceso no sustituye controles XSS, retención, respaldo ni seguridad del dispositivo del usuario.

## Pruebas y control de calidad

### Verificación automatizada

```bash
npm run lint
npm run build
node --test
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
| `src/components/FormularioPeptidos/clinicalExamRows.test.js` | Exámenes editables, adaptación de resultados antiguos, filas vacías/parciales, límites y lista nueva autoritativa. |
| `src/api/planesAlimentarios.api.test.js` | Cancelación y cambio de sesión antes del despacho o al recibir respuestas, sin enviar datos de una cuenta con el token de otra. |
| `src/utils/nutritionPlan.test.js` | Semana vacía inicial, orden canónico, indicadores, límites y payload sin identidad duplicada. |
| `src/utils/nutritionPlanPdf.test.js` | PDF vectorial real, contenido íntegro entre páginas, vista previa segura, fuentes locales y comprobación de glifos. |

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
10. Nueva finalización clínica: ficha mínima en Cosmiatra sin historias médicas anteriores; primer guardado del plan, continuación del borrador, conflicto entre sesiones, validación de comidas/indicadores y descarga final Unicode multipágina. Comprobar que otro profesional no pueda abrir un plan ya asignado.

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
| No aparece la firma en el documento | Revise sesión vigente, respuestas del endpoint `/api/media`, propiedad de la historia, metadatos de firma y conectividad backend/Cloudinary; genere nuevamente el documento. No sustituya el endpoint con una URL pública. |
| Guardado local pero no remoto | Revise el aviso de sincronización y conectividad; vuelva a Guardar. No dé por finalizada una historia sin confirmación de la API. |
| Descarga PDF falla | Revise errores de consola/red sin exponer datos clínicos; compruebe renderizador, firma y fallback, y que la interfaz quede desbloqueada. |

Para diagnosticar, recopile ruta, rol, pasos, fecha de calendario, tipo de respuesta y errores sin datos personales. Los registros con identidad heredada requieren una revisión controlada en el backend; no se corrigen borrando pacientes ni modificando colecciones por coincidencia de nombres.
