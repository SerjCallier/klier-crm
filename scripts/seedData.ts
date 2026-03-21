
import { createClient } from '@supabase/supabase-js';
import { INITIAL_LEADS, INITIAL_SERVICES } from '../constants';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no configurados en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🚀 Iniciando carga de datos en Supabase...');

    // 1. Limpiar datos existentes (opcional, cuidado en producción)
    // await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Cargar Leads
    const formattedLeads = INITIAL_LEADS.map(lead => ({
        title: lead.title,
        company: lead.company,
        value: lead.value,
        status: lead.status,
        tags: lead.tags,
        service_type: lead.serviceType,
        lead_source: lead.leadSource,
        score: lead.score,
        score_justification: lead.scoreJustification,
        urgency_level: lead.urgencyLevel,
        closing_strategy: lead.closingStrategy
    }));

    const { error: leadsError } = await supabase.from('leads').insert(formattedLeads);
    if (leadsError) console.error('Error cargando leads:', leadsError.message);
    else console.log('✅ Leads cargados correctamente.');

    // 3. Cargar Servicios
    const formattedServices = INITIAL_SERVICES.map(service => ({
        type: service.type,
        name: service.name,
        description: service.description,
        base_price: service.basePrice,
        sla_hours: service.slaHours,
        features: service.features,
        is_active: service.isActive
    }));

    const { error: servicesError } = await supabase.from('services').insert(formattedServices);
    if (servicesError) console.error('Error cargando servicios:', servicesError.message);
    else console.log('✅ Servicios cargados correctamente.');

    console.log('✨ Proceso finalizado.');
}

seed();
