# Commands To Run On The Server

## 1. Entrar Al Backend

```powershell
cd C:\git\Tour360Web\backend
```

## 2. Verificar A Qué Base De Datos Está Apuntando El Backend

```powershell
node -e "require('./src/config/env'); console.log('cwd=', process.cwd()); console.log('DATABASE_URL=', process.env.DATABASE_URL)"
```

Si en el servidor existe un `.env` en la raíz del proyecto y otro en `backend/`, este backend prioriza `backend/.env` para evitar que el runtime apunte a una base distinta a la que Prisma CLI sincroniza.

## 3. Verificar Que El Schema Actual Tenga El Mapeo Correcto

```powershell
Get-Content .\prisma\schema.prisma
```

Confirma que el modelo `User` tenga esta línea:

```prisma
@@map("users")
```

## 4. Instalar Dependencias

```powershell
npm install
```

## 5. Regenerar El Cliente De Prisma

```powershell
npx prisma generate
```

## 6. Sincronizar La Base De Datos Con El Schema

```powershell
npx prisma db push
```

## Importante: Evitar `migrate reset` En Este Proyecto

Este backend se dejó funcionando con `prisma db push` (sin historial de migraciones).  
Si en el servidor ejecutas `npx prisma migrate dev` / `npx prisma migrate reset`, Prisma puede terminar aplicando un historial viejo/incompleto (o pedir reset) y dejarte una BD sin tablas como `users`.

Si ya te quedó una carpeta `backend\prisma\migrations` creada en el servidor (por pruebas), bórrala y vuelve al flujo de `db push`:

```powershell
Remove-Item -Recurse -Force .\prisma\migrations -ErrorAction SilentlyContinue
npx prisma generate
npx prisma db push
```

## 7. Verificar Que La Tabla `users` Exista En SQLite

```powershell
node -e "const Database=require('better-sqlite3'); const db=new Database('cotecmar.db'); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=''table'' ORDER BY name').all());"
```

## 8. Verificar Que Prisma Sí Pueda Leer `users`

```powershell
node -e "const {PrismaClient}=require('@prisma/client'); const prisma=new PrismaClient(); prisma.user.count().then(n=>console.log('users=',n)).catch(err=>console.error(err)).finally(()=>process.exit());"
```

## Modo Diagnóstico (Salida Corta)

Si no puedes compartir logs completos, usa estos checks que solo imprimen `OK/MISSING`:

```powershell
node -e "require('./src/config/env'); console.log(process.env.DATABASE_URL)"
```

```powershell
node -e "const Database=require('better-sqlite3'); const db=new Database('cotecmar.db'); console.log(db.prepare(\"SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name='users'\").get() ? 'users=OK' : 'users=MISSING');"
```

```powershell
node -e "const {PrismaClient}=require('@prisma/client'); const prisma=new PrismaClient(); prisma.user.count().then(()=>console.log('prisma.user=OK')).catch(()=>console.log('prisma.user=MISSING')).finally(()=>process.exit());"
```

### Si `users=MISSING`

```powershell
npx prisma db push
```

### Si `users=OK` pero `prisma.user=MISSING` o el backend sigue fallando

Fija `DATABASE_URL` como ruta absoluta en `backend/.env` (evita rutas relativas):

```env
DATABASE_URL="file:C:/RUTA/ABSOLUTA/A/backend/cotecmar.db"
```

Luego:

```powershell
npx prisma generate
npx prisma db push
npm start
```

## 9. Arrancar El Backend

```powershell
npm start
```

## 10. Si Usas PM2, Reiniciar El Proceso

```powershell
pm2 restart all
```

## 11. Si Quieres Verificar Que El Backend Arrancó Bien

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:5000/
```

## Flujo Recomendado Completo

```powershell
cd C:\git\Tour360Web\backend
node -e "require('./src/config/env'); console.log('cwd=', process.cwd()); console.log('DATABASE_URL=', process.env.DATABASE_URL)"
Get-Content .\prisma\schema.prisma
npm install
npx prisma generate
npx prisma db push
node -e "const {PrismaClient}=require('@prisma/client'); const prisma=new PrismaClient(); prisma.user.count().then(n=>console.log('users=',n)).catch(err=>console.error(err)).finally(()=>process.exit());"
npm start
```

## Si Sigue Fallando

Comparte la salida de estos 3 comandos:

```powershell
node -e "require('./src/config/env'); console.log(process.env.DATABASE_URL)"
```

```powershell
node -e "const {PrismaClient}=require('@prisma/client'); const prisma=new PrismaClient(); prisma.user.count().then(n=>console.log('users=',n)).catch(err=>console.error(err)).finally(()=>process.exit());"
```

```powershell
Get-Content .\prisma\schema.prisma
```


PS E:\WebProyects\Tour360Web> npx prisma migrate dev
Need to install the following packages:
prisma@6.19.3
Ok to proceed? (y) y

npm notice Beginning October 4, 2021, all connections to the npm registry - including for package installation - must use TLS 1.2 or higher. You are currently using plaintext http to connect. Please visit the GitHub blog for more information: https://github.blog/2021-08-23-npm-registry-deprecating-tls-1-0-tls-1-1/
npm notice Beginning October 4, 2021, all connections to the npm registry - including for package installation - must use TLS 1.2 or higher. You are currently using plaintext
Environment variables loaded from .env
Error: Could not find Prisma Schema that is required for this command.
You can either provide it with `--schema` argument,
set it in your Prisma Config file (e.g., `prisma.config.ts`),
set it as `prisma.schema` in your package.json,
or put it into the default location (`./prisma/schema.prisma`, or `./schema.prisma`.
Checked following paths:

schema.prisma: file not found
prisma\schema.prisma: file not found

See also https://pris.ly/d/prisma-schema-location
PS E:\WebProyects\Tour360Web> cd backend                                                                                                                                      
PS E:\WebProyects\Tour360Web\backend> npx prisma migrate dev
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": SQLite database "cotecmar.db" at "file:./cotecmar.db"

Drift detected: Your database schema is not in sync with your migration history.

The following is a summary of the differences between the expected database schema given your migrations files, and the actual schema of the database.

It should be understood as the set of changes to get from the expected schema to the actual schema.

If you are running this the first time on an existing database, please make sure to read this documentation page:
https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate/troubleshooting-development
[+] Added tables
  - images
  - projects
  - schema_migrations

[*] Changed the `images` table
  [+] Added index on columns (projectId)
  [+] Added index on columns (projectId)

We need to reset the SQLite database "cotecmar.db" at "file:./cotecmar.db"

All data will be lost.
PS E:\WebProyects\Tour360Web\backend> npx prisma migrate reset
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": SQLite database "cotecmar.db" at "file:./cotecmar.db"

√ Are you sure you want to reset your database? All data will be lost. ... yes

Database reset successful


✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 845ms

PS E:\WebProyects\Tour360Web\backend> npm run dev

> cotecmar-backend@1.0.0 dev
> nodemon server.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
No se pudo iniciar el backend: PrismaClientKnownRequestError: 
Invalid `prisma.user.count()` invocation in
E:\WebProyects\Tour360Web\backend\src\services\auth.service.js:133:40

  130 }
  131 
  132 async function ensureDefaultAdmin() {
→ 133   const adminCount = await prisma.user.count(
The table `main.users` does not exist in the current database.
    at ei.handleRequestError (E:\WebProyects\Tour360Web\backend\node_modules\@prisma\client\runtime\library.js:121:7268)
    at ei.handleAndLogRequestError (E:\WebProyects\Tour360Web\backend\node_modules\@prisma\client\runtime\library.js:121:6593)
    at ei.request (E:\WebProyects\Tour360Web\backend\node_modules\@prisma\client\runtime\library.js:121:6300)
    at async a (E:\WebProyects\Tour360Web\backend\node_modules\@prisma\client\runtime\library.js:130:9551)
    at async Object.ensureDefaultAdmin (E:\WebProyects\Tour360Web\backend\src\services\auth.service.js:133:22)
    at async bootstrap (E:\WebProyects\Tour360Web\backend\src\server.js:12:3) {
  code: 'P2021',
  meta: { modelName: 'User', table: 'main.users' },
  clientVersion: '6.19.3'
}
[nodemon] app crashed - waiting for file changes before starting...
           
node -e "console.log(require('bcryptjs').hashSync('NuevaClave123*', 10))"