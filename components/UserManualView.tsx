import React from 'react';
import {
    Book,
    LayoutDashboard,
    Kanban,
    Calendar,
    MessageCircle,
    CheckSquare,
    Sparkles,
    Shield,
    Box,
    Target,
    Zap,
    Info,
    ShieldCheck,
    TrendingUp
} from 'lucide-react';

const ManualSection: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
    features: string[];
}> = ({ icon: Icon, title, description, features }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
            {description}
        </p>
        <ul className="space-y-2">
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {feature}
                </li>
            ))}
        </ul>
    </div>
);

export const UserManualView: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-slate-50 dark:bg-slate-900">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Book className="text-blue-600 dark:text-blue-400" size={32} />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manual de Usuario</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                        Bienvenido al centro de ayuda de KlierNav CRM. Aquí encontrarás toda la información necesaria para dominar cada módulo y optimizar tu flujo de trabajo.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <ManualSection
                        icon={LayoutDashboard}
                        title="Dashboard"
                        description="Vista general del estado de tu negocio. Visualiza kpis críticos, métricas de conversión y el valor total de tu pipeline de un vistazo."
                        features={[
                            "Métricas en tiempo real",
                            "Resumen de distribución de leads",
                            "Valor proyectado del pipeline",
                            "Accesos directos a módulos clave"
                        ]}
                    />

                    <ManualSection
                        icon={Target}
                        title="Planificación Estratégica"
                        description="Define objetivos, analiza el mercado y establece la hoja de ruta para tus proyectos digitales."
                        features={[
                            "Definición de OKRs",
                            "Análisis de competencia",
                            "Roadmap de ejecución",
                            "Estrategias de go-to-market"
                        ]}
                    />

                    <ManualSection
                        icon={Kanban}
                        title="Pipeline (Kanban)"
                        description="Gestiona tus oportunidades de venta de forma visual. Arrastra y suelta leads entre etapas para rastrear el progreso."
                        features={[
                            "Drag-and-drop intuitivo",
                            "Filtros avanzados por servicio",
                            "Scoring visual de leads",
                            "Edición rápida de prospectos"
                        ]}
                    />

                    <ManualSection
                        icon={MessageCircle}
                        title="Chat Multi-canal"
                        description="Comunícate directamente con tus prospectos a través de WhatsApp integrando canales de mensajería unificados."
                        features={[
                            "Historial completo de chats",
                            "Sugerencias de respuesta IA",
                            "Plantillas de mensajes",
                            "Sincronización en tiempo real"
                        ]}
                    />

                    <ManualSection
                        icon={Sparkles}
                        title="Asistente AI"
                        description="Potencia tu productividad con inteligencia artificial. Análisis de sentimientos, scoring automático y generación de contenido."
                        features={[
                            "Cálculo de probabilidad de cierre",
                            "Resumen automático de leads",
                            "Sugerencias de estrategia de venta",
                            "Búsqueda inteligente de información"
                        ]}
                    />

                    <ManualSection
                        icon={ShieldCheck}
                        title="Administración Pro"
                        description="Control total sobre usuarios, roles y permisos. Auditoría completa de cada cambio realizado en el sistema."
                        features={[
                            "Gestión de Roles (RBAC)",
                            "Audit Log detallado",
                            "Seguridad de nivel corporativo",
                            "Configuración de perfiles"
                        ]}
                    />
                </div>

                <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="text-amber-300" size={24} fill="currentColor" />
                            <h2 className="text-xl font-bold">Consejos Rápidos para el Éxito</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <h4 className="font-bold flex items-center gap-2">
                                    <TrendingUp size={16} /> 1. Revisa el Scoring
                                </h4>
                                <p className="text-blue-100 text-sm">Prioriza los leads que la IA marque con puntuación superior a 80 para maximizar tu conversión.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold flex items-center gap-2">
                                    <CheckSquare size={16} /> 2. Mantén la Agenda
                                </h4>
                                <p className="text-blue-100 text-sm">Sincroniza tus eventos en el calendario para recibir recordatorios de SLA y reuniones críticas.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold flex items-center gap-2">
                                    <Info size={16} /> 3. Usa el Buscador
                                </h4>
                                <p className="text-blue-100 text-sm">¿No encuentras algo? El Asistente IA puede buscar en toda la base de datos por ti.</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-24 -translate-x-24 blur-2xl" />
                </section>

                <footer className="mt-12 text-center pb-8 border-t border-slate-200 dark:border-slate-800 pt-8">
                    <p className="text-slate-500 dark:text-slate-500 text-sm">
                        KlierNav CRM v1.0 • Desarrollado por KlierNav Innovations • &copy; 2025
                    </p>
                </footer>
            </div>
        </div>
    );
};
