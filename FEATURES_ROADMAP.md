# 🚀 Passweird - Features Roadmap

## 📊 Features Actuales

- ✅ CRUD de contraseñas
- ✅ Generador de contraseñas
- ✅ Analizador de contraseñas
- ✅ Categorías
- ✅ Búsqueda básica
- ✅ Encriptación (Cryptr)
- ✅ Autenticación (NextAuth)

---

## 🎯 Features PRO por Implementar

### 1. Security Audit Dashboard ⭐⭐⭐

**Prioridad:** Alta | **Complejidad:** Media | **Impacto:** Alto

#### Descripción
Dashboard completo de auditoría de seguridad que analiza todas las contraseñas del usuario.

#### Features
- **Passwords Duplicadas**: Detectar passwords que se usan en múltiples sitios
- **Passwords Débiles**: Lista de passwords con score bajo
- **Passwords Antiguas**: Alertar sobre passwords sin cambiar por >90 días
- **Score de Seguridad General**: Métrica global (0-100)
- **Breach Detection**: Integración con HaveIBeenPwned API
- **Gráficos visuales**: Distribución de fortaleza, timeline de cambios

#### Schema Changes
```prisma
model Password {
  // ... existing fields
  lastChanged    DateTime @default(now())
  breachDetected Boolean  @default(false)
  lastBreachCheck DateTime?
}

model SecurityAudit {
  id            String   @id @default(cuid())
  userId        String
  overallScore  Int
  weakPasswords Int
  duplicates    Int
  oldPasswords  Int
  breaches      Int
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
}
```

#### Implementation Plan
1. Crear `/dashboard/security-audit` page
2. Action para analizar todas las passwords
3. Integración con HaveIBeenPwned API
4. Componente de charts (recharts o chart.js)
5. Badge system para severity levels

---

### 2. Password Sharing ⭐⭐

**Prioridad:** Media | **Complejidad:** Alta | **Impacto:** Alto

#### Descripción
Permite compartir passwords de forma segura con otros usuarios.

#### Features
- **Share con permisos**: view-only, can-edit, can-share
- **Expiración automática**: Link expira después de X días
- **Notificaciones**: Email cuando alguien accede
- **Revocación**: Owner puede revocar acceso en cualquier momento
- **Audit log**: Track de quién accedió y cuándo

#### Schema Changes
```prisma
model SharedPassword {
  id              String   @id @default(cuid())
  passwordId      String
  sharedByUserId  String
  sharedToUserId  String
  permission      SharePermission @default(VIEW_ONLY)
  expiresAt       DateTime?
  createdAt       DateTime @default(now())
  lastAccessedAt  DateTime?
  revoked         Boolean  @default(false)
  
  password        Password @relation(fields: [passwordId], references: [id])
  sharedBy        User     @relation("SharedBy", fields: [sharedByUserId], references: [id])
  sharedTo        User     @relation("SharedTo", fields: [sharedToUserId], references: [id])
  
  @@unique([passwordId, sharedToUserId])
}

enum SharePermission {
  VIEW_ONLY
  CAN_EDIT
  CAN_SHARE
}

model ShareAccessLog {
  id              String   @id @default(cuid())
  sharedPasswordId String
  accessedBy      String
  accessedAt      DateTime @default(now())
  ipAddress       String?
  userAgent       String?
}
```

#### Implementation Plan
1. UI para share dialog con selección de usuario
2. Email invitations system
3. Encryption para shared passwords
4. Access control middleware
5. Notificaciones (Resend/SendGrid)

---

### 3. Auto-fill Browser Extension ⭐⭐⭐

**Prioridad:** Alta | **Complejidad:** Muy Alta | **Impacto:** Muy Alto

#### Descripción
Extensión de navegador para auto-completar passwords.

#### Features
- **Auto-detect forms**: Detecta formularios de login
- **One-click fill**: Botón para completar credenciales
- **Context menu**: Click derecho en campos
- **Biometric unlock**: Touch ID / Windows Hello
- **Sync en tiempo real**: Con la app web

#### Tech Stack
- Manifest V3
- Chrome Extension API
- WebExtension API (Firefox)
- WebSocket para sync real-time

#### Implementation Plan
1. Setup extension boilerplate
2. Content scripts para form detection
3. Background service worker
4. Popup UI con shadcn
5. API endpoints para extension auth
6. Chrome Web Store submission

---

### 4. Import/Export ⭐

**Prioridad:** Alta | **Complejidad:** Baja | **Impacto:** Alto

#### Descripción
Importar passwords desde otros password managers y exportar backups.

#### Features
- **Import desde**: 1Password, LastPass, Chrome, Firefox, Bitwarden
- **Export formats**: CSV, JSON, encrypted ZIP
- **Backup automático**: Semanal/mensual a storage
- **Restore from backup**: Upload y restaurar
- **Preview antes de import**: Ver qué se va a importar

#### File Formats
```typescript
// CSV Format
interface CSVPassword {
  name: string;
  url: string;
  username: string;
  password: string;
  notes?: string;
  category?: string;
}

// 1Password Format
interface OnePasswordExport {
  items: Array<{
    overview: { title: string; url: string };
    details: { fields: Array<{ name: string; value: string }> };
  }>;
}
```

#### Implementation Plan
1. Parser para cada formato (CSV, JSON, 1Password)
2. Upload component con dropzone
3. Preview table antes de confirmar import
4. Background job para import masivo
5. Export dialog con opciones de formato
6. Scheduled backup (cron job)

---

### 5. Two-Factor Authentication (2FA) ⭐⭐⭐

**Prioridad:** Alta | **Complejidad:** Media | **Impacto:** Muy Alto

#### Descripción
Generador y almacenamiento de códigos 2FA/TOTP integrado.

#### Features
- **TOTP Generator**: Códigos de 6 dígitos time-based
- **QR Scanner**: Escanear QR codes de servicios
- **Auto-copy**: Copiar código al clipboard automáticamente
- **Backup codes**: Guardar códigos de recuperación
- **Timer visual**: Countdown hasta siguiente código

#### Schema Changes
```prisma
model Password {
  // ... existing fields
  totpSecret     String?
  totpEnabled    Boolean  @default(false)
  backupCodes    String[] // Array de códigos de respaldo
}
```

#### Dependencies
```json
{
  "otpauth": "^9.2.0",
  "qrcode": "^1.5.3",
  "jsqr": "^1.4.0"
}
```

#### Implementation Plan
1. TOTP generator utility (otpauth library)
2. QR code scanner component
3. Real-time code display con countdown
4. Backup codes generator
5. Browser clipboard API integration
6. Settings panel para enable/disable TOTP

---

### 6. Password History ⭐

**Prioridad:** Media | **Complejidad:** Baja | **Impacto:** Medio

#### Descripción
Historial completo de cambios de cada password con rollback.

#### Features
- **Version history**: Todas las versiones anteriores
- **Rollback**: Restaurar versión anterior
- **Audit log**: Quién cambió, cuándo, desde dónde
- **Diff view**: Ver diferencias entre versiones
- **Retention policy**: Mantener últimas N versiones

#### Schema Changes
```prisma
model PasswordHistory {
  id          String   @id @default(cuid())
  passwordId  String
  oldPassword String   // Encrypted
  oldEmail    String?
  oldUsername String?
  oldUrl      String?
  changedBy   String
  changedAt   DateTime @default(now())
  changeType  ChangeType
  ipAddress   String?
  
  password    Password @relation(fields: [passwordId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [changedBy], references: [id])
}

enum ChangeType {
  CREATED
  UPDATED
  RESTORED
}
```

#### Implementation Plan
1. Middleware para capturar cambios
2. History panel component
3. Diff viewer con highlight
4. Rollback action con confirmación
5. Cleanup job para old entries

---

### 7. Emergency Access ⭐⭐

**Prioridad:** Baja | **Complejidad:** Alta | **Impacto:** Medio

#### Descripción
Acceso de emergencia para contactos de confianza.

#### Features
- **Contactos de emergencia**: Designar trusted contacts
- **Delayed access**: Acceso después de X días sin actividad
- **Notificaciones**: Email/SMS al owner
- **Owner override**: Cancelar request de emergencia
- **Restricted access**: Solo view, no edit

#### Schema Changes
```prisma
model EmergencyContact {
  id              String   @id @default(cuid())
  userId          String
  contactEmail    String
  contactName     String
  waitingPeriod   Int      @default(7) // días
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  accessRequests  EmergencyAccessRequest[]
}

model EmergencyAccessRequest {
  id              String   @id @default(cuid())
  contactId       String
  requestedAt     DateTime @default(now())
  approvedAt      DateTime?
  deniedAt        DateTime?
  status          EmergencyStatus @default(PENDING)
  
  contact         EmergencyContact @relation(fields: [contactId], references: [id])
}

enum EmergencyStatus {
  PENDING
  APPROVED
  DENIED
  EXPIRED
}
```

---

### 8. Tags & Folders ⭐

**Prioridad:** Media | **Complejidad:** Media | **Impacto:** Medio

#### Descripción
Sistema flexible de organización con tags y carpetas anidadas.

#### Features
- **Multiple tags**: Password puede tener varios tags
- **Nested folders**: Carpetas dentro de carpetas
- **Drag & drop**: Mover entre folders
- **Color coding**: Tags con colores personalizados
- **Favorites**: Marcar passwords como favoritas

#### Schema Changes
```prisma
model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  color     String   @default("#3b82f6")
  userId    String
  createdAt DateTime @default(now())
  
  user      User       @relation(fields: [userId], references: [id])
  passwords Password[]
}

model Folder {
  id          String   @id @default(cuid())
  name        String
  parentId    String?
  userId      String
  icon        String?
  createdAt   DateTime @default(now())
  
  parent      Folder?    @relation("FolderHierarchy", fields: [parentId], references: [id])
  subfolders  Folder[]   @relation("FolderHierarchy")
  passwords   Password[]
  user        User       @relation(fields: [userId], references: [id])
}

model Password {
  // ... existing fields
  tags       Tag[]
  folderId   String?
  isFavorite Boolean  @default(false)
  folder     Folder?  @relation(fields: [folderId], references: [id])
}
```

---

### 9. Password Expiration ⭐

**Prioridad:** Baja | **Complejidad:** Baja | **Impacto:** Medio

#### Descripción
Sistema de expiración automática con notificaciones.

#### Features
- **Custom expiration**: Configurar días hasta expiración
- **Auto-remind**: Notificaciones X días antes
- **Expiration dashboard**: Ver passwords por vencer
- **Quick update flow**: Actualizar con un click
- **Policy per category**: Reglas diferentes por tipo

#### Schema Changes
```prisma
model Password {
  // ... existing fields
  expiresAt         DateTime?
  expirationDays    Int?      @default(90)
  lastReminderSent  DateTime?
  remindersSent     Int       @default(0)
}

model ExpirationPolicy {
  id              String   @id @default(cuid())
  categoryId      String   @unique
  expirationDays  Int      @default(90)
  reminderDays    Int[]    @default([30, 7, 1])
  autoExpire      Boolean  @default(false)
  
  category        Category @relation(fields: [categoryId], references: [id])
}
```

#### Implementation Plan
1. Expiration settings por password
2. Cron job para check expirations
3. Email notification system
4. Expiration dashboard con filters
5. Quick update flow en notification

---

### 10. Team Features ⭐⭐⭐

**Prioridad:** Baja | **Complejidad:** Muy Alta | **Impacto:** Muy Alto

#### Descripción
Features para equipos y organizaciones.

#### Features
- **Shared Vaults**: Vaults compartidos por equipo
- **Role-based access**: Admin, Manager, Member, Viewer
- **Activity Dashboard**: Ver actividad del team
- **Audit logs**: Logs completos de acciones
- **Billing**: Gestión de subscripciones y pagos
- **SSO**: Single Sign-On con SAML

#### Schema Changes
```prisma
model Team {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  plan        TeamPlan @default(FREE)
  createdAt   DateTime @default(now())
  
  members     TeamMember[]
  vaults      TeamVault[]
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  userId    String
  role      TeamRole @default(MEMBER)
  joinedAt  DateTime @default(now())
  
  team      Team     @relation(fields: [teamId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([teamId, userId])
}

model TeamVault {
  id        String   @id @default(cuid())
  teamId    String
  name      String
  createdAt DateTime @default(now())
  
  team      Team       @relation(fields: [teamId], references: [id])
  passwords Password[]
}

enum TeamRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}

enum TeamPlan {
  FREE
  STARTER
  BUSINESS
  ENTERPRISE
}
```

---

## 📅 Roadmap Sugerido

### Fase 1: Quick Wins (1-2 semanas)
- [ ] Import/Export
- [ ] Password History
- [ ] Security Audit Dashboard

### Fase 2: Premium Features (3-4 semanas)
- [ ] 2FA Integration
- [ ] Password Sharing
- [ ] Tags & Folders
- [ ] Password Expiration

### Fase 3: Advanced Features (4-6 semanas)
- [ ] Browser Extension
- [ ] Emergency Access
- [ ] Team Features

---

## 🛠️ Tech Stack Recomendado

### APIs Externas
- **HaveIBeenPwned API**: Breach detection
- **Resend/SendGrid**: Email notifications
- **Stripe**: Payments (para features premium)

### Librerías
- **otpauth**: TOTP generation
- **qrcode**: QR code generation
- **jsqr**: QR code scanning
- **recharts**: Data visualization
- **socket.io**: Real-time sync
- **zod**: Validation

### Infraestructura
- **Vercel Cron**: Scheduled jobs
- **Upstash Redis**: Cache y rate limiting
- **Cloudflare R2/S3**: Backups storage

---

## 📝 Notas de Implementación

1. **Security First**: Todas las features nuevas deben mantener el nivel de encriptación actual
2. **Progressive Enhancement**: Hacer features opt-in cuando sea posible
3. **Mobile Responsive**: Todo debe funcionar en mobile
4. **Accessibility**: WCAG AA compliance mínimo
5. **Testing**: Unit tests para security-critical features
6. **Rate Limiting**: Implementar para evitar abuse
7. **Error Handling**: Manejo robusto de errores en todas las features

---

## 🎯 KPIs a Trackear

- User adoption de nuevas features
- Security score promedio de usuarios
- Breach detection hits
- Password update frequency
- Share feature usage
- Extension installs
- User retention

---

**Última actualización:** Nov 18, 2025
**Versión:** 1.0.0
