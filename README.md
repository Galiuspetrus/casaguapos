# Casaguapos

Crea una app web (en español, responsive y pensada sobre todo para móvil) para gestionar las tareas del hogar de una pareja: Sheila y Diego.

PERFILES
- Solo dos perfiles fijos: Sheila (color rosa, p. ej. #EC4899) y Diego (color azul, p. ej. #3B82F6).
- Pantalla de inicio sencilla para elegir "¿Quién eres?" con dos botones grandes (rosa y azul). Recordar la elección en el dispositivo y poder cambiar de perfil desde la cabecera.
- Los datos deben guardarse en una base de datos compartida en la nube para que ambos vean lo mismo desde sus móviles en tiempo real.

TAREAS
- Cada tarea tiene: título, descripción opcional, persona asignada (Sheila o Diego), fecha en que se hace, creada por (Sheila o Diego), y estado hecho / pendiente.
- Cualquiera puede crear tareas para sí mismo o para el otro ("añadir tarea a Sheila" / "añadir tarea a Diego").
- Marcar como hecha con un toque, editar y borrar.
- Mostrar un pequeño aviso/insignia cuando el otro te ha añadido una tarea nueva.

LISTA SEMANAL
- Una sección "Tareas semanales" con una plantilla de tareas recurrentes (ej.: fregar, aspirar, poner lavadora, sacar la basura, limpiar baño, hacer la compra, cocinar...). Se pueden añadir, editar y borrar elementos de la plantilla.
- Botón "Repartir la semana": para cada tarea semanal se elige quién la hace y qué día de la semana (lunes a domingo). Incluir también una opción "Repartir automáticamente" que la reparte de forma equilibrada entre los dos y en días distintos, que luego se puede ajustar a mano.
- Al confirmar, se generan las tareas de esa semana en el calendario. Poder navegar entre semanas (anterior / siguiente).

CALENDARIO
- Vista semanal (por defecto) y vista mensual.
- Cada tarea aparece en su día coloreada según la persona: rosa para Sheila, azul para Diego. Las hechas se muestran tachadas o atenuadas.
- Filtro rápido: Todos / Solo Sheila / Solo Diego.
- Al tocar un día se ve el detalle de las tareas de ese día y se pueden añadir tareas directamente en ese día.

OTRAS VISTAS
- "Hoy": las tareas de hoy de cada uno en dos columnas o bloques (rosa y azul).
- Un pequeño resumen semanal: cuántas tareas ha hecho cada uno (barras en rosa y azul).

DISEÑO
- Estilo limpio, cálido y amable, con esquinas redondeadas, iconos y una navegación inferior tipo app (Hoy, Calendario, Semanal, Resumen).
- Rosa y azul como colores identificativos muy claros en toda la app.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://casaguapos.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8ac55463-8cab-4657-b8b8-89bd4f22ceb3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
