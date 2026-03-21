
import { Lead, LeadStatus, User, UserRole, UserStatus, Task, CalendarEvent, Conversation, ServiceType, Permission, Role, Service } from './types';

const today = new Date('2025-12-16T09:00:00');

const getRelativeDate = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const getRelativeISO = (days: number, time: string) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return `${d.toISOString().split('T')[0]}T${time}`;
};

export const PERMISSIONS: Permission[] = [
  { id: 'leads_read', name: 'Ver Leads', description: 'Permite visualizar leads en el sistema', module: 'leads', action: 'read' },
  { id: 'leads_create', name: 'Crear Leads', description: 'Permite dar de alta nuevos leads', module: 'leads', action: 'create' },
  { id: 'leads_update', name: 'Editar Leads', description: 'Permite modificar datos de leads', module: 'leads', action: 'update' },
  { id: 'leads_delete', name: 'Eliminar Leads', description: 'Permite borrar leads del sistema', module: 'leads', action: 'delete' },
  { id: 'leads_export', name: 'Exportar Leads', description: 'Permite descargar base de leads', module: 'leads', action: 'export' },
  
  { id: 'tasks_manage', name: 'Gestionar Tareas', description: 'Permite crear, editar y completar tareas', module: 'tasks', action: 'manage' },
  
  { id: 'users_read', name: 'Ver Usuarios', description: 'Permite ver lista de usuarios', module: 'users', action: 'read' },
  { id: 'users_manage', name: 'Gestionar Usuarios', description: 'Permite crear y editar usuarios y sus roles', module: 'users', action: 'manage' },
  
  { id: 'audit_read', name: 'Ver Audit Log', description: 'Permite ver historial de cambios', module: 'audit', action: 'read' },
  { id: 'strategy_read', name: 'Ver Estrategia', description: 'Permite ver el plan estratégico', module: 'strategy', action: 'read' },
  { id: 'strategy_manage', name: 'Gestionar Estrategia', description: 'Permite modificar el plan estratégico', module: 'strategy', action: 'manage' },
  { id: 'services_manage', name: 'Gestionar Servicios', description: 'Permite editar el catálogo de servicios y precios', module: 'services', action: 'manage' },
];

export const ROLES: Role[] = [
  {
    id: 'role_admin',
    name: 'Administrador',
    description: 'Acceso total al sistema y configuraciones',
    permissions: PERMISSIONS.map(p => p.id),
    createdAt: getRelativeISO(-30, '09:00:00'),
    updatedAt: getRelativeISO(-30, '09:00:00'),
  },
  {
    id: 'role_manager',
    name: 'Manager Operativo',
    description: 'Gestiona leads, tareas y estrategia, pero no configuración de usuarios',
    permissions: ['leads_read', 'leads_create', 'leads_update', 'leads_delete', 'leads_export', 'tasks_manage', 'strategy_read', 'strategy_manage', 'audit_read', 'services_manage'],
    createdAt: getRelativeISO(-30, '09:00:00'),
    updatedAt: getRelativeISO(-30, '09:00:00'),
  },
  {
    id: 'role_sales',
    name: 'Ejecutivo de Ventas',
    description: 'Gestiona sus propios leads y tareas asignadas',
    permissions: ['leads_read', 'leads_create', 'leads_update', 'tasks_manage'],
    createdAt: getRelativeISO(-30, '09:00:00'),
    updatedAt: getRelativeISO(-30, '09:00:00'),
  },
  {
    id: 'role_support',
    name: 'Soporte Técnico',
    description: 'Lectura de leads y gestión de tareas técnicas',
    permissions: ['leads_read', 'tasks_manage'],
    createdAt: getRelativeISO(-30, '09:00:00'),
    updatedAt: getRelativeISO(-30, '09:00:00'),
  }
];

export const ALL_USERS: Record<string, User> = {
  'u1': {
    id: 'u1',
    name: 'Sergio Callier',
    email: 'sergio@kliernav.com',
    role: UserRole.ADMIN,
    roleId: 'role_admin',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=sergio',
    lastLogin: getRelativeISO(0, '08:30:00'),
    createdAt: getRelativeISO(-365, '09:00:00')
  },
  'u2': {
    id: 'u2',
    name: 'Ventas 1',
    email: 'ventas1@kliernav.com',
    role: UserRole.SALES,
    roleId: 'role_sales',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=v1',
    lastLogin: getRelativeISO(0, '09:15:00'),
    createdAt: getRelativeISO(-120, '09:00:00')
  },
  'u3': {
    id: 'u3',
    name: 'UX/UI 1',
    email: 'uxui1@kliernav.com',
    role: UserRole.MANAGER,
    roleId: 'role_manager',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=ux1',
    lastLogin: getRelativeISO(-1, '18:00:00'),
    createdAt: getRelativeISO(-200, '09:00:00')
  },
  'u4': {
    id: 'u4',
    name: 'Support 1',
    email: 'support1@kliernav.com',
    role: UserRole.SUPPORT,
    roleId: 'role_support',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=s1',
    lastLogin: getRelativeISO(0, '09:00:00'),
    createdAt: getRelativeISO(-60, '09:00:00')
  },
  'u5': {
    id: 'u5',
    name: 'DEV 1',
    email: 'dev1@kliernav.com',
    role: UserRole.SUPPORT,
    roleId: 'role_support',
    status: UserStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=d1',
    lastLogin: getRelativeISO(-2, '10:00:00'),
    createdAt: getRelativeISO(-90, '09:00:00')
  }
};

export const CURRENT_USER: User = ALL_USERS['u1'];

export const INITIAL_LEADS: Lead[] = [
  { 
    id: 'l1', title: 'Rescate E-commerce: MercadoPago', company: 'TechStore Argentina', value: 980000, 
    status: LeadStatus.NEGOTIATION, tags: ['E-commerce', 'High Ticket', 'SLA 48h'], ownerId: 'u1', 
    lastContact: getRelativeDate(0), serviceType: 'Ecommerce', isSameDay: true, leadSource: 'Inbound',
    industry: 'Retail', companySize: '11-50', score: 85, urgencyLevel: 'high', preferredContact: 'WhatsApp',
    slaDeadline: getRelativeISO(2, '09:30:00'), rescueStatus: 'Warning'
  },
  { 
    id: 'l2', title: 'Operación: Domina tu Barrio', company: 'Inmobiliaria López', value: 380000, 
    status: LeadStatus.CONTACTED, tags: ['Recurrente', 'Local'], ownerId: 'u2', 
    lastContact: getRelativeDate(-1), serviceType: 'Local', isSameDay: false, leadSource: 'Referral',
    industry: 'Real Estate', companySize: '1-10', score: 62, urgencyLevel: 'medium', preferredContact: 'Call',
    slaDeadline: getRelativeISO(5, '12:00:00'), rescueStatus: 'Safe'
  },
  { 
    id: 'l3', title: 'Landing SAME-DAY Urgent', company: 'Startup Fitness YA', value: 261000, 
    status: LeadStatus.WON, tags: ['Flash', 'MVP'], ownerId: 'u1', 
    lastContact: getRelativeDate(-2), serviceType: 'Landing', isSameDay: true, leadSource: 'Outbound',
    industry: 'Health', companySize: '1-10', score: 92, urgencyLevel: 'high', preferredContact: 'WhatsApp',
    slaDeadline: getRelativeISO(0, '20:00:00'), rescueStatus: 'Critical'
  },
  { 
    id: 'l4', title: 'Automatización Táctica de Leads', company: 'Agencia Marketing Total', value: 410000, 
    status: LeadStatus.WON, tags: ['Automation', 'B2B'], ownerId: 'u3', 
    lastContact: getRelativeDate(-5), serviceType: 'Automatizacion', isSameDay: false, leadSource: 'Referral',
    industry: 'Marketing', companySize: '11-50', score: 78, urgencyLevel: 'medium', preferredContact: 'Email'
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    type: 'Landing',
    name: 'Landing SAME-DAY (Rescate)',
    description: 'Despliegue táctico de landing page de alta conversión en 24-48 horas.',
    basePrice: 240000,
    slaHours: 48,
    isActive: true,
    features: ['Diseño Táctico', 'Copywriting de Rescate', 'Integración de Formularios', 'Hosting 1 año']
  },
  {
    id: 's2',
    type: 'Ecommerce',
    name: 'E-commerce de Asalto',
    description: 'Tienda online completa con pasarelas de pago integradas en 48 horas.',
    basePrice: 980000,
    slaHours: 48,
    isActive: true,
    features: ['Catálogo autogestionable', 'MercadoPago/PayPal', 'Cálculo de envíos', 'Panel de control']
  },
  {
    id: 's7',
    type: 'CRM',
    name: 'Operación CRM Setup',
    description: 'Implementación estratégica del Centro de Operaciones y soporte táctico.',
    basePrice: 500000,
    slaHours: 72,
    isActive: true,
    features: ['Configuración de Pipelines de Rescate', 'Automatización de Tareas', 'Capacitación Shirley/Equipo', 'Soporte 24/7']
  },
  {
    id: 's8',
    type: 'AppWeb',
    name: 'Sistemas Tácticos / Saas',
    description: 'Desarrollo de software de misión crítica para optimizar procesos complejos.',
    basePrice: 1500000,
    slaHours: 168, // 7 days (Complex Project)
    isActive: true,
    features: ['Arquitectura Escalable', 'Base de Datos Cloud', 'Seguridad Militar', 'Dashboard de Comando']
  },
  {
    id: 's4',
    type: 'Automatizacion',
    name: 'Automatización de Respuesta',
    description: 'Workflows tácticos para capturar y calificar prospectos en tiempo real.',
    basePrice: 410000,
    slaHours: 48,
    isActive: true,
    features: ['WhatsApp Automático', 'Sync Operation Center', 'Alertas Críticas', 'Chatbots IA']
  },
  {
    id: 's3',
    type: 'Local',
    name: 'Dominio de Barrio (SEO)',
    description: 'Posicionamiento táctico en Google Maps para capturar demanda local.',
    basePrice: 180000,
    slaHours: 72,
    isActive: true,
    features: ['Optimización GBP', 'Gestión de Reseñas', 'Keywords Locales', 'Reporte de Inteligencia']
  }
];

export const KANBAN_COLUMNS = [
  { id: LeadStatus.NEW, title: 'Nuevos (Inbound)' },
  { id: LeadStatus.CONTACTED, title: 'Contactados / Demo' },
  { id: LeadStatus.NEGOTIATION, title: 'Presupuesto Enviado' },
  { id: LeadStatus.WON, title: 'Ganados (A Producción)' },
  { id: LeadStatus.LOST, title: 'Perdidos / Standby' }
];

export const SERVICE_COLORS: Record<ServiceType, string> = {
  Landing: 'bg-[#00BCD4] text-white', 
  Ecommerce: 'bg-[#4CAF50] text-white', 
  Local: 'bg-[#FF9800] text-white', 
  Automatizacion: 'bg-[#9C27B0] text-white', 
  Mobile: 'bg-[#E91E63] text-white', 
  CRO: 'bg-[#FF5722] text-white', 
  CRM: 'bg-[#3F51B5] text-white', 
  AppWeb: 'bg-[#2196F3] text-white', 
  Other: 'bg-slate-500 text-white'
};

export const SERVICE_HEX: Record<ServiceType, string> = {
  Landing: '#00BCD4', 
  Ecommerce: '#4CAF50', 
  Local: '#FF9800', 
  Automatizacion: '#9C27B0', 
  Mobile: '#E91E63', 
  CRO: '#FF5722', 
  CRM: '#3F51B5', 
  AppWeb: '#2196F3', 
  Other: '#64748b'
};

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Kickoff Rescate TechStore (09:30)', dueDate: getRelativeDate(0), completed: true, leadId: 'l1', priority: 'high' },
  { id: 't2', title: 'Misión: Wireframe Crítico (12:00)', dueDate: getRelativeDate(0), completed: false, leadId: 'l1', priority: 'high' },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Kickoff TechStore', date: getRelativeDate(0), time: '09:30', type: 'meeting', leadId: 'l1' },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    leadId: 'l1', unreadCount: 2, lastMessageAt: getRelativeISO(0, '10:30:00'),
    messages: [
      { id: 'm1', senderId: 'me', text: '¡Hola! Recibimos tu solicitud para E-commerce Express.', timestamp: getRelativeISO(-1, '09:00:00'), status: 'read' },
    ]
  }
];

export const MESSAGE_TEMPLATES: Record<ServiceType, string[]> = {
  Landing: ["Rescatamos tu idea en 48h con una landing táctica de alta conversión.", "El despliegue SAME-DAY está listo. Entrega mañana a las 20hs."],
  Ecommerce: ["Lanzamos tu E-commerce de Asalto con Mercado Pago en 48hs.", "¿Tienes el inventario listo para cargar?"],
  Local: ["Captura a todos los clientes de tu barrio con posicionamiento táctico Maps.", "Optimizamos tu perfil de GBP para dominar los resultados locales."],
  Automatizacion: ["Deja de perder leads. Filtramos tus consultas con bots de inteligencia.", "Implementamos un workflow táctico de respuesta inmediata."],
  Mobile: ["Llevamos tu negocio al bolsillo del cliente con un MVP táctico.", "Desarrollo ágil de aplicaciones móviles de misión específica."],
  CRO: ["Aumentamos tu fuego de conversión.", "Auditoría de rendimiento táctico express."],
  CRM: ["Estructura tu proceso de rescate con un Operation Center robusto.", "Te ayudamos a centralizar tu inteligencia de mercado."],
  AppWeb: ["Desarrollamos armas informáticas a medida para tu operativa.", "Llevamos tu lógica de misión a una plataforma escalable."],
  Other: ["Reporte de situación, ¿en qué podemos apoyarte?", "Entendido. Procesando solicitud."]
};
