# 🔐 Passweird - Plan Consolidado 2025

**Última actualización:** 20 Nov 2025  
**Versión:** 2.0.0 (Consolidado)

---

## 📊 Estado Actual del Proyecto

### ✅ Features Implementadas

#### Core Features (100% Completo)
- ✅ **CRUD de Contraseñas** - Crear, leer, actualizar, eliminar
- ✅ **Générardor de Contraseñas** - Con configuración de complejidad
- ✅ **Analizador de Contraseñas** - Strength checker (`check-password-strength`)
- ✅ **Sistema de Categorías** - Organización por categorías con iconos
- ✅ **Búsqueda** - Búsqueda por nombre, URL, categoría
- ✅ **Encriptación** - Cryptr para cifrado de contraseñas
- ✅ **Autenticación** - NextAuth con email/password
- ✅ **Password History** - Sistema completo de historial de cambios
- ✅ **Favoritos** - Marcar passwords como favoritas
- ✅ **Import/Export** - Actions básicas implementadas
- ✅ **Professional UI** - Diseño oscuro/claro profesional matching landing page

#### Tech Stack Actual
```json
{
  "framework": "Next.js 14",
  "db": "MySQL + Prisma",
  "auth": "NextAuth",
  "ui": "Shadcn/UI + Tailwind",
  "encryption": "Cryptr",
  "validation": "Zod + React Hook Form",
  "icons": "Lucide React"
}
```

### 🔧 Stack de Seguridad Actual
- ✅ Bcryptjs para hash de passwords
- ✅ Cryptr para encriptación de passwords guardadas
- ✅ NextAuth con HTTP-only cookies
- ✅ Zod validation en todos los forms
- ⚠️ **Por mejorar:** Zero-knowledge encryption

---

## 🎯 Plan de 3 Fases - 12 Semanas

### 📈 FASE 1: Confianza y Usabilidad Pro (Semanas 1-4)

**Objetivo:** Hacer que la app se sienta profesional, confiable y súper usable.

#### 🔴 Alta Prioridad - Semana 1-2

##### 1.1 Security Audit Dashboard ⭐⭐⭐
**Complejidad:** Media | **Impacto:** Muy Alto | **Tiempo:** 1-2 semanas

**Features:**
- Dashboard visual con métricas de seguridad
- Detectar passwords duplicadas (misma password en múltiples sitios)
- Identificar passwords débiles (score \u003c 60)
- Passwords antiguas (sin cambiar \u003e 90 días)
- Score general de seguridad (0-100)
- Gráficos con distribución de fortaleza
- Recomendaciones accionables

**Schema Changes:**
```prisma
model Password {
  // ... existing fields
  securityScore   Int?      @default(0)
  lastChanged     DateTime  @default(now())
  needsUpdate     Boolean   @default(false)
}

model SecurityAudit {
  id              String   @id @default(cuid())
  userId          String
  overallScore    Int      // 0-100
  weakPasswords   Int
  duplicates      Int
  oldPasswords    Int      // \u003e 90 días
  strongPasswords Int
  createdAt       DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
}
```

**Implementation Steps:**
1. [ ] Crear `/dashboard/security-audit` page
2. [ ] Action `analyzeUserPasswords()` para análisis completo
3. [ ] Action `calculateSecurityScore()` con algoritmo de scoring
4. [ ] Componente de charts (usar recharts)
5. [ ] Badge system para severity (crítico, warning, ok)
6. [ ] Auto-refresh cada vez que se edita/agrega password

**UI Components:**
- Grande score visual (circular progress)
- Lista de issues con links directos a passwords
- Gráfico de distribución (pie chart)
- Timeline de mejoras (opcional)

---

##### 1.2 Carpetas/Espacios de Trabajo ⭐⭐
**Complejidad:** Media | **Impacto:** Alto | **Tiempo:** 1 semana

**Features:**
- Carpetas tipo "Trabajo", "Personal", "Side Projects"
- Drag \u0026 drop para mover passwords entre carpetas
- Filtrado rápido por carpeta
- Iconos personalizables por carpeta
- Colores para identificación visual

**Schema Changes:**
```prisma
model Folder {
  id        String   @id @default(cuid())
  name      String
  icon      String?  @default("folder")
  color     String?  @default("#3b82f6")
  userId    String
  order     Int      @default(0)
  createdAt DateTime @default(now())
  
  user      User       @relation(fields: [userId], references: [id])
  passwords Password[]
  
  @@index([userId])
}

model Password {
  // ... existing fields
  folderId String? // Nueva relación opcional
  folder   Folder? @relation(fields: [folderId], references: [id])
}
```

**Implementation Steps:**
1. [ ] Migración de Prisma con nuevo modelo
2. [ ] Sidebar con lista de carpetas
3. [ ] CRUD de carpetas (crear, editar, eliminar)
4. [ ] Drag \u0026 drop con `@dnd-kit/core`
5. [ ] Color picker component
6. [ ] Icon selector component

---

#### 🟡 Media Prioridad - Semana 3-4

##### 1.3 Modo "Ocultar Pantalla" ⭐
**Complejidad:** Baja | **Impacto:** Medio | **Tiempo:** 2-3 días

**Features:**
- Botón global que difumina todas las passwords
- Mostrar/ocultar individual por card
- Keyboard shortcut (Ctrl/Cmd + H)
- Estado persistente en localStorage

**Implementation:**
```typescript
// Hook personalizado
const usePrivacyMode = () =\u003e {
  const [isPrivate, setIsPrivate] = useState(false);
  
  useEffect(() =\u003e {
    const handleKeyboard = (e) =\u003e {
      if ((e.metaKey || e.ctrlKey) \u0026\u0026 e.key === 'h') {
        e.preventDefault();
        setIsPrivate(prev =\u003e !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () =\u003e window.removeEventListener('keydown', handleKeyboard);
  }, []);
  
  return { isPrivate, toggle: () =\u003e setIsPrivate(prev =\u003e !prev) };
};
```

**UI Changes:**
- Botón en header principal
- Blur filter en passwords cuando está activo
- Animación suave de transición

---

##### 1.4 Auto-logout y Bloqueo Rápido ⭐
**Complejidad:** Baja | **Impacto:** Alto | **Tiempo:** 2-3 días

**Features:**
- Timeout configurable (5/10/15/30 min)
- Botón "bloquear" en header
- Detectar inactividad del usuario
- Re-autenticación con password simple

**Schema Changes:**
```prisma
model User {
  // ... existing fields
  autoLockTimeout Int @default(15) // minutos
}
```

**Implementation:**
```typescript
// Hook de inactividad
const useIdleTimer = (timeout: number, onIdle: () =\u003e void) =\u003e {
  useEffect(() =\u003e {
    let timer: NodeJS.Timeout;
    
    const resetTimer = () =\u003e {
      clearTimeout(timer);
      timer = setTimeout(onIdle, timeout * 60 * 1000);
    };
    
    // Reset en cualquier actividad
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    
    resetTimer(); // Iniciar
    
    return () =\u003e {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [timeout, onIdle]);
};
```

---

### 🚀 FASE 2: Features Premium y Colaboración (Semanas 5-8)

**Objetivo:** Features que diferencian de la competencia.

#### 1️⃣ Integración 2FA/TOTP ⭐⭐⭐
**Complejidad:** Media-Alta | **Impacto:** Muy Alto | **Tiempo:** 1-2 semanas

**Features:**
- Generador TOTP integrado en cada password
- QR Scanner para setup fácil
- Códigos de 6 dígitos con timer visual
- Auto-copy al clipboard
- Backup codes storage

**Dependencies:**
```json
{
  "otpauth": "^9.2.0",
  "qrcode": "^1.5.3",
  "jsqr": "^1.4.0"
}
```

**Schema Changes:**
```prisma
model Password {
  // ... existing fields
  totpSecret     String?  // Encrypted
  totpEnabled    Boolean  @default(false)
  totpIssuer     String?
  totpAccount    String?
  backupCodes    String[] // Array de códigos encriptados
}
```

**Implementation:**
1. [ ] Settings panel para enable/disable TOTP
2. [ ] QR Scanner component (usar jsqr)
3. [ ] TOTP Generator utility (otpauth)
4. [ ] Real-time code display con countdown circular
5. [ ] One-click copy to clipboard
6. [ ] Generar y almacenar backup codes

**UI:**
- Badge "2FA" en passwords con TOTP
- Modal para setup con QR scanner
- Live countdown timer (30s cycle)
- Copy button con feedback visual

---

#### 2️⃣ Password Sharing ⭐⭐
**Complejidad:** Alta | **Impacto:** Alto | **Tiempo:** 2 semanas

**Features:**
- Compartir con otro usuario de la app
- Permisos: view-only, can-edit, can-share
- Expiración automática
- Notificaciones por email
- Revocación instantánea
- Audit log completo

**Schema Changes:**
```prisma
model SharedPassword {
  id             String          @id @default(cuid())
  passwordId     String
  sharedBy       String
  sharedTo       String
  permission     SharePermission @default(VIEW_ONLY)
  expiresAt      DateTime?
  createdAt      DateTime        @default(now())
  lastAccess     DateTime?
  revoked        Boolean         @default(false)
  
  password    Password @relation(fields: [passwordId], references: [id])
  sharedByUser User    @relation(\"SharedBy\", fields: [sharedBy], references: [id])
  sharedToUser User    @relation(\"SharedTo\", fields: [sharedTo], references: [id])
  accessLogs  ShareAccessLog[]
  
  @@unique([passwordId, sharedTo])
  @@index([sharedTo, revoked])
}

enum SharePermission {
  VIEW_ONLY
  CAN_EDIT
  CAN_SHARE
}

model ShareAccessLog {
  id        String   @id @default(cuid())
  shareId   String
  accessAt  DateTime @default(now())
  ipAddress String?
  userAgent String?
  
  share SharedPassword @relation(fields: [shareId], references: [id])
}
```

**Implementation:**
1. [ ] Share modal con user selector
2. [ ] Permission selector (radio group)
3. [ ] Expiration date picker
4. [ ] Email notification system (Resend)
5. [ ] Revoke button con confirmación
6. [ ] Shared with me section
7. [ ] Access log viewer

**Security:**
- Re-encrypt password con clave del destinatario
- Notificar owner en cada acceso
- Rate limit shareactions

---

#### 3️⃣ Tags System ⭐
**Complejidad:** Media | **Impacto:** Medio | **Tiempo:** 1 semana

**Features:**
- Multiple tags por password
- Color-coded tags
- Tag manager
- Filtrado por tags
- Auto-suggest en creación

**Schema Changes:**
```prisma
model Tag {
  id        String     @id @default(cuid())
  name      String
  color     String     @default("#3b82f6")
  userId    String
  createdAt DateTime   @default(now())
  
  user      User       @relation(fields: [userId], references: [id])
  passwords Password[]
  
  @@unique([userId, name])
}

model Password {
  // ... existing fields
  tags Tag[]
}
```

---

#### 4️⃣ Breach Detection ⭐⭐
**Complejidad:** Media | **Impacto:** Alto | **Tiempo:** 1 semana

**Features:**
- Integración con HaveIBeenPwned API
- Check automático en background
- Badges de warning en passwords comprometidas
- Notificaciones de breach
- Forced update flow

**Schema Changes:**
```prisma
model Password {
  // ... existing fields
  breached       Boolean   @default(false)
  lastBreachCheck DateTime?
  breachDetails   String?   @db.Text
}
```

**Implementation:**
1. [ ] Servicio de API wrapper para HIBP
2. [ ] Cron job para check periódico
3. [ ] UI warnings y badges
4. [ ] Notification system
5. [ ] Quick update flow

---

### 🏢 FASE 3: Features Avanzadas y Escalabilidad (Semanas 9-12)

**Objetivo:** Preparar para equipos y uso corporativo.

#### 1️⃣ Browser Extension MVP ⭐⭐⭐
**Complejidad:** Muy Alta | **Impacto:** Muy Alto | **Tiempo:** 3-4 semanas

**Features Core:**
- Auto-detect login forms
- One-click autofill
- Context menu integration
- Biometric unlock (si disponible)
- Sync con web app

**Tech Stack:**
```json
{
  "manifest": "v3",
  "frameworks": ["React", "Vite"],
  "apis": ["chrome.storage", "chrome.tabs", "chrome.runtime"],
  "build": "crxjs/vite-plugin"
}
```

**Scope Reducido (MVP):**
- Solo Chrome inicialmente
- Solo autofill básico
- Login con credentials de la app
- Sync cada 5 minutos

---

#### 2️⃣ Emergency Access ⭐
**Complejidad:** Alta | **Impacto:** Medio | **Tiempo:** 1-2 semanas

**Features:**
- Designar contactos de emergencia
- Delayed access (7/14/30 días)
- Owner notification \u0026 override
- Only view permission

**Schema Changes:**
```prisma
model EmergencyContact {
  id            String   @id @default(cuid())
  userId        String
  email         String
  name          String
  waitDays      Int      @default(7)
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  
  user     User                    @relation(fields: [userId], references: [id])
  requests EmergencyAccessRequest[]
}

model EmergencyAccessRequest {
  id         String          @id @default(cuid())
  contactId  String
  status     EmergencyStatus @default(PENDING)
  requestAt  DateTime        @default(now())
  approveAt  DateTime?
  denyAt     DateTime?
  
  contact EmergencyContact @relation(fields: [contactId], references: [id])
}

enum EmergencyStatus {
  PENDING
  APPROVED
  DENIED
  EXPIRED
}
```

---

#### 3️⃣ Team Features (Basic) ⭐⭐
**Complejidad:** Muy Alta | **Impacto:** Muy Alto | **Tiempo:** 3-4 semanas

**Features Básicas:**
- Shared vaults (1 por team en MVP)
- Roles: Owner, Admin, Member
- Team settings básicos
- Billing simple (Stripe)

**Schema Changes:**
```prisma
model Team {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  plan      TeamPlan @default(FREE)
  createdAt DateTime @default(now())
  
  members TeamMember[]
  vault   TeamVault?
}

model TeamMember {
  id       String   @id @default(cuid())
  teamId   String
  userId   String
  role     TeamRole @default(MEMBER)
  joinedAt DateTime @default(now())
  
  team Team @relation(fields: [teamId], references: [id])
  user User @relation(fields: [userId], references: [id])
  
  @@unique([teamId, userId])
}

model TeamVault {
  id        String     @id @default(cuid())
  teamId    String     @unique
  createdAt DateTime   @default(now())
  
  team      Team       @relation(fields: [teamId], references: [id])
  passwords Password[]
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
}

enum TeamPlan {
  FREE
  PRO
  BUSINESS
}
```

---

## 🎯 Roadmap Visual

```
SEMANAS 1-4: FASE 1 - Confianza \u0026 Usabilidad
├─ S1-2: Security Audit Dashboard
├─ S2-3: Carpetas/Espacios
├─ S3: Modo Ocultar + Auto-logout
└─ S4: Polish \u0026 Bug fixes

SEMANAS 5-8: FASE 2 - Premium Features
├─ S5-6: 2FA/TOTP Integration
├─ S6-7: Password Sharing
├─ S7: Tags System
└─ S8: Breach Detection

SEMANAS 9-12: FASE 3 - Advanced
├─ S9-11: Browser Extension MVP
├─ S11-12: Emergency Access
└─ S12: Team Features (Basic)
```

---

## 🛡️ Plan de Seguridad Mejorado

### Mejoras Prioritarias

#### 1. Zero-Knowledge Encryption
**Problema Actual:** Cryptr usa una clave compartida en el servidor.

**Solución:**
```typescript
// Derivar clave desde master password en cliente
const deriveKey = async (masterPassword: string, salt: Uint8Array) =\u003e {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Cifrar en cliente
const encryptPassword = async (password: string, key: CryptoKey) =\u003e {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(password)
  );
  
  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv)
  };
};
```

**Implementación:**
1. [ ] Crear crypto utilities en `/lib/crypto-client.ts`
2. [ ] Almacenar solo salt, iv, ciphertext en DB
3. [ ] Derivar clave en login y mantener en memoria
4. [ ] Clear key en logout
5. [ ] Migración gradual de passwords existentes

---

#### 2. Rate Limiting Mejorado

**Implementar:**
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests por minuto
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  return NextResponse.next();
}
```

**Rutas a proteger:**
- `/api/auth/signin`
- `/api/passwords/*`
- `/api/share/*`

---

#### 3. Logging y Auditoría

**Implementar:**
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // 'CREATE', 'UPDATE', 'DELETE', 'SHARE', 'ACCESS'
  resource  String   // 'password', 'folder', 'share'
  resourceId String?
  ipAddress String?
  userAgent String?
  timestamp DateTime @default(now())
  details   Json?
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId, timestamp])
  @@index([action, timestamp])
}
```

---

## 📦 Dependencies a Agregar

### Fase 1
```json
{
  "recharts": "^2.10.0",
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0"
}
```

### Fase 2
```json
{
  "otpauth": "^9.2.0",
  "qrcode": "^1.5.3",
  "jsqr": "^1.4.0",
  "resend": "^3.0.0",
  "@upstash/ratelimit": "^1.0.0",
  "@upstash/redis": "^1.25.0"
}
```

### Fase 3
```json
{
  "@crxjs/vite-plugin": "^2.0.0",
  "stripe": "^14.0.0"
}
```

---

## 🎨 Design System Updates

### Nuevos Componentes Necesarios

1. **SecurityScoreCircle** - Para dashboard de auditoría
2. **FolderCard** - Para vista de carpetas
3. **TOTPDisplay** - Para códigos 2FA
4. **ShareDialog** - Para compartir passwords
5. **TagPicker** - Para selección múltiple de tags

#### Todos manteniendo:
- Tema dark/light con variables CSS
- Sharp edges (`rounded-none`)
- Grande typography
- Monochromatic palette

---

## 📊 KPIs a Trackear

### Engagement
- Daily active users
- Passwords guardadas por usuario
- Uso de generador
- Uso de auditoría

### Security
- Score promedio de usuarios
- % passwords duplicadas
- % passwords débiles
- Breaches detectadas

### Premium
- Shares creados
- Teams creados
- Extension installs
- Conversion rate a paid

---

## 🚨 Decisiones Críticas Pendientes

### 1. Modelo de Encriptación
- [ ] ¿Migrar a zero-knowledge ahora o después?
- [ ] ¿Mantener compatibilidad con passwords existentes?

### 2. Monetización
- [ ] ¿Qué features son premium?
- [ ] ¿Pricing tiers?
- [ ] ¿Free tier limitations?

### 3. Infraestructura
- [ ] ¿Upstash Redis para rate limiting?
- [ ] ¿R2/S3 para backups?
- [ ] ¿Vercel Cron o queue system?

---

## ✅ Próximos Pasos Inmediatos

1. **Esta semana:**
   - [ ] Decidir: ¿Empezar con Security Audit Dashboard?
   - [ ] Revisar este plan completo
   - [ ] Crear issues en GitHub/Linear

2. **Preparación:**
   - [ ] Configurar Upstash Redis
   - [ ] Configurar Resend para emails
   - [ ] Branch feature/security-audit

3. **Primera implementación:**
   - [ ] Security Audit Dashboard (Semana 1-2)
   - [ ] Testing exhaustivo
   - [ ] Deploy a producción

---

**¿Listo para empezar con el Security Audit Dashboard?** 🚀
