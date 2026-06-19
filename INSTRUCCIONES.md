# 🚀 INSTRUCCIONES DE INSTALACIÓN — CRM Cadopharma

## LO QUE VAS A LOGRAR
Una URL tipo `https://crm-cadopharma.vercel.app` que todos en el equipo
abren desde su celular o PC, sin instalar nada.

---

## PASO 1 — Crear la base de datos en Supabase

1. Ve a **supabase.com** → crea una cuenta → "New Project"
2. Ponle nombre: `crm-cadopharma`
3. Elige una contraseña segura → Region: **East US (N. Virginia)**
4. Espera 2 minutos mientras crea el proyecto
5. Ve al menú izquierdo → **SQL Editor** → "New Query"
6. Abre el archivo `database.sql` de esta carpeta
7. Copia TODO el contenido y pégalo en el SQL Editor
8. Presiona **Run** (botón verde)
9. Debe decir "Success" al final

### Copiar las claves de Supabase:
- Ve a **Settings → API** (en el menú izquierdo)
- Copia el **Project URL** (empieza con https://xxx.supabase.co)
- Copia el **anon/public key** (empieza con eyJ...)
- Guárdalas, las necesitas en el Paso 3

---

## PASO 2 — Subir el código a GitHub

1. Abre **GitHub Desktop** (ya instalado)
2. "Add an Existing Repository from your Hard Drive"
3. Selecciona la carpeta `crm-cadopharma`
4. Si no funciona, usa "Create a New Repository" y selecciona la misma carpeta
5. Ponle nombre: `crm-cadopharma`
6. Clic en **"Publish repository"** (arriba a la derecha)
7. Desmarca "Keep this code private" (dejar público para Vercel gratis)
8. Clic en **Publish**

---

## PASO 3 — Publicar en Vercel

1. Ve a **vercel.com** → crea cuenta con el mismo email de GitHub
2. "Add New Project"
3. Selecciona el repositorio `crm-cadopharma`
4. Vercel detecta automáticamente que es React → no cambies nada
5. Antes de darle Deploy, busca la sección **"Environment Variables"**
6. Agrega estas dos variables:

```
REACT_APP_SUPABASE_URL     → pega el Project URL de Supabase
REACT_APP_SUPABASE_ANON_KEY → pega el anon key de Supabase
```

7. Clic en **Deploy**
8. Espera 3-4 minutos
9. Vercel te da una URL como `https://crm-cadopharma.vercel.app`

---

## PASO 4 — Compartir con el equipo

Envíale la URL a cada representante por WhatsApp.
Ellos la abren en Chrome (celular o PC) → seleccionan su nombre → listo.

### Para guardar como app en el celular (Android):
1. Abrir Chrome → ir a la URL
2. Menú (3 puntos) → "Agregar a pantalla de inicio"
3. Queda como ícono de app nativa

### Para guardar como app en iPhone:
1. Abrir Safari → ir a la URL
2. Botón compartir (cuadro con flecha) → "Agregar a pantalla de inicio"

---

## SOLUCIÓN DE PROBLEMAS COMUNES

**"Cannot read properties of undefined"**
→ Las variables de entorno no están correctas en Vercel
→ Ve a Vercel → tu proyecto → Settings → Environment Variables → verifica

**La app carga pero no muestra datos**
→ El SQL no se ejecutó bien en Supabase
→ Ve a Supabase → Table Editor → verifica que existan las tablas

**Los cambios no se ven en tiempo real**
→ Verifica que ejecutaste la última parte del SQL (ALTER PUBLICATION...)

---

## ACTUALIZAR LA APP EN EL FUTURO

Cuando quieras hacer cambios:
1. Edita los archivos en tu computadora
2. Abre GitHub Desktop → verás los cambios listados
3. Escribe un mensaje (ej: "Agregar nuevo representante")
4. Clic en **"Commit to main"**
5. Clic en **"Push origin"**
6. Vercel detecta el cambio y actualiza la app automáticamente en 2-3 minutos

---

## CONTACTO
CRM desarrollado para Cadopharma SRL — Oncología
Santiago de los Caballeros, República Dominicana
