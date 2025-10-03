# 🔒 ERP Segurança — ERPInternoTech

## Estratégia de Segurança

### Fase 1 (MVP) - Segurança Mínima
- **Uso interno** apenas
- **Validação** de uploads
- **Auditoria** básica
- **Preparação** para Fase 2

### Fase 2 (Autenticação) - Segurança Completa
- **JWT/Supabase Auth** implementado
- **RBAC** configurado
- **MFA** obrigatório
- **Auditoria** avançada

## 🛡️ Validação de Uploads

### Tipos Permitidos
```typescript
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
```

### Validações Obrigatórias
1. **Tipo MIME** válido
2. **Tamanho** dentro do limite
3. **Nome** sanitizado
4. **Hash** para integridade
5. **Quarentena** temporária

### Upload Seguro
```typescript
export async function secureUpload(file: File, empresaId: string): Promise<string> {
  // 1. Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido');
  }
  
  // 2. Validar tamanho
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande');
  }
  
  // 3. Gerar hash para integridade
  const hash = await generateFileHash(file);
  
  // 4. Sanitizar nome do arquivo
  const safeName = sanitizeFileName(file.name, empresaId);
  
  // 5. Upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from(`empresa-${empresaId}`)
    .upload(safeName, file);
    
  if (error) throw error;
  
  return data.path;
}
```

## 🔐 Autenticação (Fase 2)

### JWT com Supabase Auth
```typescript
interface AuthUser {
  id: string;
  email: string;
  empresaId: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin: Date;
}

// Middleware de autenticação
export async function authenticate(request: Request): Promise<AuthUser | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  
  // Buscar dados do usuário no banco
  const userData = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { empresa: true, role: true }
  });
  
  if (!userData) return null;
  
  return {
    id: userData.id,
    email: userData.email,
    empresaId: userData.empresaId,
    role: userData.role.nome,
    permissions: userData.role.permissions,
    mfaEnabled: userData.mfaEnabled,
    lastLogin: userData.lastLogin
  };
}
```

### RBAC (Role-Based Access Control)
```typescript
export const RBAC_PERMISSIONS = {
  // Projetos
  'projetos:read': ['admin', 'manager', 'user', 'viewer'],
  'projetos:write': ['admin', 'manager', 'user'],
  'projetos:delete': ['admin', 'manager'],
  'projetos:approve': ['admin', 'manager'],
  
  // Clientes
  'clientes:read': ['admin', 'manager', 'user', 'viewer'],
  'clientes:write': ['admin', 'manager', 'user'],
  'clientes:delete': ['admin', 'manager'],
  
  // Orçamentos
  'orcamentos:read': ['admin', 'manager', 'user', 'viewer'],
  'orcamentos:write': ['admin', 'manager', 'user'],
  'orcamentos:approve': ['admin', 'manager'],
  'orcamentos:reject': ['admin', 'manager'],
  
  // Documentos
  'documentos:read': ['admin', 'manager', 'user', 'viewer'],
  'documentos:write': ['admin', 'manager', 'user'],
  'documentos:delete': ['admin', 'manager'],
  'documentos:download': ['admin', 'manager', 'user', 'viewer'],
  
  // Relatórios
  'relatorios:read': ['admin', 'manager'],
  'relatorios:export': ['admin', 'manager'],
  
  // Configurações
  'config:read': ['admin'],
  'config:write': ['admin'],
  'usuarios:manage': ['admin']
};

// Middleware de autorização
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const allowedRoles = RBAC_PERMISSIONS[permission];
    
    if (!allowedRoles || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
```

## 🔐 MFA (Multi-Factor Authentication)

### Configuração TOTP
```typescript
export class MFAService {
  async enableMFA(userId: string): Promise<{ qrCode: string; secret: string }> {
    const secret = speakeasy.generateSecret({
      name: `ERP Interno Tech (${userId})`,
      issuer: 'ERP Interno Tech'
    });
    
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        mfaSecret: secret.base32,
        mfaEnabled: true
      }
    });
    
    return {
      qrCode: secret.otpauth_url,
      secret: secret.base32
    };
  }
  
  async verifyMFA(userId: string, token: string): Promise<boolean> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId }
    });
    
    if (!user?.mfaSecret) return false;
    
    return speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });
  }
}
```

## 📊 Auditoria Avançada

### Logs de Segurança
```typescript
interface SecurityAuditLog {
  id: string;
  empresaId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityAuditor {
  async logSecurityEvent(
    action: string,
    resource: string,
    resourceId: string,
    user: AuthUser,
    request: Request,
    details: Record<string, any> = {}
  ) {
    const log: SecurityAuditLog = {
      id: crypto.randomUUID(),
      empresaId: user.empresaId,
      userId: user.id,
      action,
      resource,
      resourceId,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details,
      timestamp: new Date(),
      severity: this.calculateSeverity(action, details)
    };
    
    await prisma.auditLog.create({ data: log });
  }
  
  private calculateSeverity(action: string, details: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    if (action.includes('delete') || action.includes('reject')) return 'high';
    if (action.includes('approve') || action.includes('create')) return 'medium';
    if (action.includes('read') || action.includes('list')) return 'low';
    return 'medium';
  }
}
```

### Eventos Auditados
```typescript
export const AUDIT_EVENTS = {
  // Autenticação
  'auth:login': 'Usuário fez login',
  'auth:logout': 'Usuário fez logout',
  'auth:mfa_enabled': 'MFA habilitado',
  'auth:mfa_disabled': 'MFA desabilitado',
  'auth:password_changed': 'Senha alterada',
  
  // Projetos
  'projeto:created': 'Projeto criado',
  'projeto:updated': 'Projeto atualizado',
  'projeto:deleted': 'Projeto excluído',
  'projeto:status_changed': 'Status do projeto alterado',
  
  // Clientes
  'cliente:created': 'Cliente criado',
  'cliente:updated': 'Cliente atualizado',
  'cliente:deleted': 'Cliente excluído',
  
  // Orçamentos
  'orcamento:created': 'Orçamento criado',
  'orcamento:approved': 'Orçamento aprovado',
  'orcamento:rejected': 'Orçamento rejeitado',
  
  // Documentos
  'documento:uploaded': 'Documento enviado',
  'documento:downloaded': 'Documento baixado',
  'documento:deleted': 'Documento excluído',
  
  // Configurações
  'config:updated': 'Configuração atualizada',
  'usuario:created': 'Usuário criado',
  'usuario:updated': 'Usuário atualizado',
  'usuario:deleted': 'Usuário excluído'
};
```

## 🚨 Monitoramento de Segurança

### Alertas Automáticos
```typescript
export const SECURITY_ALERTS = {
  // Tentativas de login
  multiple_failed_logins: {
    threshold: 5,
    window: 300000, // 5 minutos
    action: 'block_ip_temporarily'
  },
  
  // Acesso suspeito
  unusual_access_pattern: {
    threshold: 3,
    window: 3600000, // 1 hora
    action: 'require_mfa_verification'
  },
  
  // Uploads suspeitos
  suspicious_file_upload: {
    threshold: 1,
    window: 60000, // 1 minuto
    action: 'quarantine_file'
  },
  
  // Acesso a dados sensíveis
  sensitive_data_access: {
    threshold: 1,
    window: 60000,
    action: 'log_and_notify'
  }
};
```

### Rate Limiting
```typescript
export const RATE_LIMITS = {
  // APIs públicas
  api_public: {
    requests: 100,
    window: 60000, // 1 minuto
    action: 'throttle'
  },
  
  // APIs de autenticação
  api_auth: {
    requests: 10,
    window: 60000,
    action: 'block_temporarily'
  },
  
  // Uploads
  api_upload: {
    requests: 20,
    window: 60000,
    action: 'throttle'
  },
  
  // Relatórios
  api_reports: {
    requests: 5,
    window: 60000,
    action: 'throttle'
  }
};
```

## 🔒 Criptografia

### Dados Sensíveis
```typescript
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  
  encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }
  
  decrypt(encryptedText: string, key: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Hash de Senhas
```typescript
export class PasswordService {
  private readonly saltRounds = 12;
  
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  async generateSecurePassword(): Promise<string> {
    return crypto.randomBytes(16).toString('hex');
  }
}
```

## 📋 Checklist de Segurança

### Fase 1 (MVP)
- [ ] **Validação** de uploads implementada
- [ ] **Sanitização** de dados ativa
- [ ] **Headers** de segurança configurados
- [ ] **Logs** de auditoria básicos
- [ ] **Rate limiting** implementado

### Fase 2 (Autenticação)
- [ ] **JWT/Supabase Auth** configurado
- [ ] **RBAC** implementado
- [ ] **MFA** obrigatório
- [ ] **Auditoria** avançada ativa
- [ ] **Criptografia** de dados sensíveis

### Monitoramento
- [ ] **Alertas** automáticos configurados
- [ ] **Logs** de segurança centralizados
- [ ] **Métricas** de segurança ativas
- [ ] **Resposta** a incidentes definida
