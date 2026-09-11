import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type {
  Vacante,
  EstadoVacante,
  Candidato,
  Etapa,
  MensajeATS,
  ConversacionATS,
} from "@/types/database";

const STORAGE_VACANTES = "malinalli.vacantes";
const STORAGE_CANDIDATOS = "malinalli.candidatos";
const STORAGE_POSTULACIONES = "malinalli.postulaciones";
const STORAGE_MENSAJES = "malinalli.mensajes";

export const VACANTES_DEFAULT: Vacante[] = [
  {
    id: "mock-1",
    titulo: "Senior Full Stack Developer",
    departamento: "Tecnología",
    ubicacion: "Remoto (México)",
    tipo_jornada: "Tiempo completo",
    descripcion:
      "Desarrollo de aplicaciones web escalables con React, TypeScript y Node.js. Arquitectura de microservicios y despliegues en la nube.",
    estado: "abierta",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "mock-2",
    titulo: "Diseñador UX/UI Senior",
    departamento: "Diseño",
    ubicacion: "Remoto (LATAM)",
    tipo_jornada: "Tiempo completo",
    descripcion:
      "Investigación con usuarios, sistemas de diseño y prototipado interactivo de alta fidelidad para plataformas de talento.",
    estado: "abierta",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "mock-3",
    titulo: "Especialista en Marketing & Employer Branding",
    departamento: "Marketing",
    ubicacion: "Presencial (Monterrey)",
    tipo_jornada: "Medio tiempo",
    descripcion:
      "Estrategias de posicionamiento de marca empleadora, generación de contenido y gestión de comunidades de talento.",
    estado: "abierta",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: "mock-4",
    titulo: "DevOps / SRE Engineer",
    departamento: "Tecnología",
    ubicacion: "Híbrido (CDMX)",
    tipo_jornada: "Tiempo completo",
    descripcion:
      "Automatización de infraestructura con Terraform, pipelines CI/CD y monitoreo proactivo de servicios.",
    estado: "abierta",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: "mock-5",
    titulo: "Líder de Reclutamiento y Selección",
    departamento: "Recursos Humanos",
    ubicacion: "Híbrido (Guadalajara)",
    tipo_jornada: "Tiempo completo",
    descripcion:
      "Coordinación del ciclo completo de atracción de talento técnico y ejecutivo para cuentas estratégicas.",
    estado: "cerrada",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
  {
    id: "mock-6",
    titulo: "Data Analyst Senior",
    departamento: "Operaciones",
    ubicacion: "Remoto (México)",
    tipo_jornada: "Tiempo completo",
    descripcion:
      "Análisis de métricas de embudos de selección, rotación y tableros interactivos para toma de decisiones.",
    estado: "cerrada",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  },
];

export const CANDIDATOS_DEFAULT: Candidato[] = [
  {
    id: "cand-1",
    nombre: "Sofía Valdés",
    puesto: "Senior Full Stack Developer",
    vacante: "Senior Full Stack Developer",
    vacanteId: "mock-1",
    email: "candidato@malinalli.mx",
    telefono: "+52 55 1234 5678",
    linkedin: "https://linkedin.com/in/sofiavaldes-dev",
    etapa: "Filtro",
    match: 92,
    antiguedad: "Hace 2 días",
    iniciales: "SV",
    etiqueta: "Top",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "cand-2",
    nombre: "Carlos Mendoza",
    puesto: "Senior Full Stack Developer",
    vacante: "Senior Full Stack Developer",
    vacanteId: "mock-1",
    email: "carlos.mendoza@devmail.com",
    telefono: "+52 55 2345 6789",
    linkedin: "https://linkedin.com/in/carlos-mendoza-cloud",
    etapa: "Postulado",
    match: 86,
    antiguedad: "Hoy",
    iniciales: "CM",
    etiqueta: "Nuevo",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "cand-3",
    nombre: "Elena Morales",
    puesto: "Diseñador UX/UI Senior",
    vacante: "Diseñador UX/UI Senior",
    vacanteId: "mock-2",
    email: "elena.ux@designstudio.mx",
    telefono: "+52 55 3456 7890",
    linkedin: "https://linkedin.com/in/elenamorales-ux",
    etapa: "Entrevista",
    match: 95,
    antiguedad: "Hace 3 días",
    iniciales: "EM",
    etiqueta: "Top",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "cand-4",
    nombre: "Mateo Herrera",
    puesto: "DevOps / SRE Engineer",
    vacante: "DevOps / SRE Engineer",
    vacanteId: "mock-4",
    email: "mateo.herrera@cloudops.io",
    telefono: "+52 55 4567 8901",
    linkedin: "https://linkedin.com/in/mateo-herrera-sre",
    etapa: "Oferta",
    match: 91,
    antiguedad: "Hace 5 días",
    iniciales: "MH",
    etiqueta: "Urgente",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
  {
    id: "cand-5",
    nombre: "Camila Ríos",
    puesto: "Especialista en Marketing & Employer Branding",
    vacante: "Especialista en Marketing & Employer Branding",
    vacanteId: "mock-3",
    email: "camila.rios@talentbranding.mx",
    telefono: "+52 55 5678 9012",
    linkedin: "https://linkedin.com/in/camilarios-hrbrand",
    etapa: "Contratado",
    match: 94,
    antiguedad: "Hace 1 sem",
    iniciales: "CR",
    etiqueta: "Top",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
  },
];

export interface PostulacionItem {
  id: string;
  vacanteId: string;
  vacanteTitulo: string;
  empresa: string;
  ubicacion: string;
  fecha: string;
  estatus: Etapa | string;
  nombreCandidato: string;
  emailCandidato: string;
  telefono?: string | undefined;
  linkedin?: string | undefined;
  notas?: string | undefined;
}

export const POSTULACIONES_DEFAULT: PostulacionItem[] = [
  {
    id: "post-1",
    vacanteId: "mock-1",
    vacanteTitulo: "Senior Full Stack Developer",
    empresa: "Malinalli Tech",
    ubicacion: "Remoto (México)",
    fecha: "Hace 2 días",
    estatus: "Filtro",
    nombreCandidato: "Sofía Valdés",
    emailCandidato: "candidato@malinalli.mx",
    telefono: "+52 55 1234 5678",
  },
  {
    id: "post-2",
    vacanteId: "mock-1",
    vacanteTitulo: "Senior Full Stack Developer",
    empresa: "Malinalli Tech",
    ubicacion: "Remoto (México)",
    fecha: "Hoy",
    estatus: "Postulado",
    nombreCandidato: "Carlos Mendoza",
    emailCandidato: "carlos.mendoza@devmail.com",
    telefono: "+52 55 2345 6789",
  },
  {
    id: "post-3",
    vacanteId: "mock-2",
    vacanteTitulo: "Diseñador UX/UI Senior",
    empresa: "Malinalli Design",
    ubicacion: "Remoto (LATAM)",
    fecha: "Hace 3 días",
    estatus: "Entrevista",
    nombreCandidato: "Elena Morales",
    emailCandidato: "elena.ux@designstudio.mx",
    telefono: "+52 55 3456 7890",
  },
  {
    id: "post-4",
    vacanteId: "mock-4",
    vacanteTitulo: "DevOps / SRE Engineer",
    empresa: "Malinalli Tech",
    ubicacion: "Híbrido (CDMX)",
    fecha: "Hace 5 días",
    estatus: "Oferta",
    nombreCandidato: "Mateo Herrera",
    emailCandidato: "mateo.herrera@cloudops.io",
    telefono: "+52 55 4567 8901",
  },
  {
    id: "post-5",
    vacanteId: "mock-3",
    vacanteTitulo: "Especialista en Marketing & Employer Branding",
    empresa: "Malinalli Talent",
    ubicacion: "Presencial (Monterrey)",
    fecha: "Hace 1 sem",
    estatus: "Contratado",
    nombreCandidato: "Camila Ríos",
    emailCandidato: "camila.rios@talentbranding.mx",
    telefono: "+52 55 5678 9012",
  },
];

export const MENSAJES_DEFAULT: MensajeATS[] = [
  {
    id: "msg-1-1",
    conversacionId: "cand-1",
    de: "candidato",
    texto: "Hola Alejandro, envié mi postulación para Senior Full Stack Developer. Quedo atenta a los siguientes pasos.",
    timestamp: "10:15",
    leido: true,
  },
  {
    id: "msg-1-2",
    conversacionId: "cand-1",
    de: "rh",
    texto: "¡Hola Sofía! Revisamos tu perfil y tu experiencia con React y TypeScript encaja muy bien. Pasamos tu postulación a Filtro técnico.",
    timestamp: "10:24",
    leido: true,
  },
  {
    id: "msg-1-3",
    conversacionId: "cand-1",
    de: "candidato",
    texto: "¡Excelente noticia! Muchas gracias, estoy disponible para cualquier duda técnica.",
    timestamp: "10:30",
    leido: true,
  },
  {
    id: "msg-2-1",
    conversacionId: "cand-2",
    de: "candidato",
    texto: "Buenas tardes, recién envié mi CV para la posición Full Stack. Cuento con 6 años de experiencia en arquitecturas en la nube.",
    timestamp: "09:02",
    leido: true,
  },
  {
    id: "msg-2-2",
    conversacionId: "cand-2",
    de: "rh",
    texto: "Hola Carlos, recibido. Lo estamos canalizando con el líder de arquitectura para evaluación inicial.",
    timestamp: "09:15",
    leido: true,
  },
  {
    id: "msg-3-1",
    conversacionId: "cand-3",
    de: "rh",
    texto: "Hola Elena, revisamos tu portafolio de UX/UI y nos pareció sobresaliente. ¿Tienes disponibilidad para entrevista técnica este jueves?",
    timestamp: "Ayer",
    leido: true,
  },
  {
    id: "msg-3-2",
    conversacionId: "cand-3",
    de: "candidato",
    texto: "¡Hola! Sí, por supuesto. Tengo espacio a las 11:00 AM o a las 4:00 PM.",
    timestamp: "Ayer",
    leido: true,
  },
  {
    id: "msg-3-3",
    conversacionId: "cand-3",
    de: "rh",
    texto: "Agendado para las 11:00 AM. Te mandamos la liga de Google Meet por correo.",
    timestamp: "Ayer",
    leido: true,
  },
  {
    id: "msg-4-1",
    conversacionId: "cand-4",
    de: "rh",
    texto: "Estimado Mateo, nos complace informarte que hemos extendido una oferta formal para DevOps / SRE. Ya enviamos la propuesta.",
    timestamp: "Hace 2 días",
    leido: true,
  },
  {
    id: "msg-4-2",
    conversacionId: "cand-4",
    de: "candidato",
    texto: "¡Muchísimas gracias! Ya la recibí y la estoy revisando con gran entusiasmo.",
    timestamp: "Hace 2 días",
    leido: true,
  },
  {
    id: "msg-5-1",
    conversacionId: "cand-5",
    de: "rh",
    texto: "¡Felicidades Camila! Has concluido satisfactoriamente todas las fases y eres oficialmente nuestra nueva Especialista en Marketing.",
    timestamp: "Hace 4 días",
    leido: true,
  },
  {
    id: "msg-5-2",
    conversacionId: "cand-5",
    de: "candidato",
    texto: "¡Muchísimas gracias por la oportunidad! Estoy lista para iniciar el proceso de onboarding con todo el entusiasmo.",
    timestamp: "Hace 4 días",
    leido: true,
  },
];

function obtenerVacantesGuardadas(): Vacante[] {
  if (typeof window === "undefined") return VACANTES_DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_VACANTES);
    if (!raw) {
      window.localStorage.setItem(STORAGE_VACANTES, JSON.stringify(VACANTES_DEFAULT));
      return VACANTES_DEFAULT;
    }
    const parsed = JSON.parse(raw) as Vacante[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : VACANTES_DEFAULT;
  } catch {
    return VACANTES_DEFAULT;
  }
}

function guardarVacantes(vacantes: Vacante[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_VACANTES, JSON.stringify(vacantes));
    window.dispatchEvent(new CustomEvent("malinalli:vacantes_updated"));
  } catch (err) {
    console.error("Error al guardar vacantes en localStorage:", err);
  }
}

function obtenerCandidatosGuardados(): Candidato[] {
  if (typeof window === "undefined") return CANDIDATOS_DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_CANDIDATOS);
    if (!raw) {
      window.localStorage.setItem(STORAGE_CANDIDATOS, JSON.stringify(CANDIDATOS_DEFAULT));
      return CANDIDATOS_DEFAULT;
    }
    const parsed = JSON.parse(raw) as Candidato[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : CANDIDATOS_DEFAULT;
  } catch {
    return CANDIDATOS_DEFAULT;
  }
}

function guardarCandidatos(candidatos: Candidato[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_CANDIDATOS, JSON.stringify(candidatos));
    window.dispatchEvent(new CustomEvent("malinalli:candidatos_updated"));
  } catch (err) {
    console.error("Error al guardar candidatos en localStorage:", err);
  }
}

function obtenerPostulacionesGuardadas(): PostulacionItem[] {
  if (typeof window === "undefined") return POSTULACIONES_DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_POSTULACIONES);
    if (!raw) {
      window.localStorage.setItem(STORAGE_POSTULACIONES, JSON.stringify(POSTULACIONES_DEFAULT));
      return POSTULACIONES_DEFAULT;
    }
    const parsed = JSON.parse(raw) as PostulacionItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : POSTULACIONES_DEFAULT;
  } catch {
    return POSTULACIONES_DEFAULT;
  }
}

function guardarPostulaciones(items: PostulacionItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_POSTULACIONES, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("malinalli:postulaciones_updated"));
  } catch (err) {
    console.error("Error al guardar postulaciones en localStorage:", err);
  }
}

function obtenerMensajesGuardados(): MensajeATS[] {
  if (typeof window === "undefined") return MENSAJES_DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_MENSAJES);
    if (!raw) {
      window.localStorage.setItem(STORAGE_MENSAJES, JSON.stringify(MENSAJES_DEFAULT));
      return MENSAJES_DEFAULT;
    }
    const parsed = JSON.parse(raw) as MensajeATS[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MENSAJES_DEFAULT;
  } catch {
    return MENSAJES_DEFAULT;
  }
}

function guardarMensajes(mensajes: MensajeATS[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_MENSAJES, JSON.stringify(mensajes));
    window.dispatchEvent(new CustomEvent("malinalli:mensajes_updated"));
  } catch (err) {
    console.error("Error al guardar mensajes en localStorage:", err);
  }
}

export function useAtsStore() {
  const [vacantes, setVacantes] = useState<Vacante[]>(obtenerVacantesGuardadas);
  const [candidatos, setCandidatos] = useState<Candidato[]>(obtenerCandidatosGuardados);
  const [postulaciones, setPostulaciones] = useState<PostulacionItem[]>(
    obtenerPostulacionesGuardadas,
  );
  const [mensajes, setMensajes] = useState<MensajeATS[]>(obtenerMensajesGuardados);

  const cargarCandidatos = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCandidatos(obtenerCandidatosGuardados());
      return;
    }
    try {
      const peticion = supabase.from("postulantes").select("*");
      const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Timeout Supabase") }), 1500),
      );
      const { data, error } = await Promise.race([peticion, timeout]);

      if (error || !data || data.length === 0) {
        setCandidatos(obtenerCandidatosGuardados());
      } else {
        // Mapear registros de tabla Supabase postulantes a modelo Candidato
        const mapeados: Candidato[] = (data as any[]).map((p) => {
          const mapaEtapas: Record<string, Etapa> = {
            nuevo: "Postulado",
            en_revision: "Filtro",
            entrevista: "Entrevista",
            oferta: "Oferta",
            contratado: "Contratado",
            rechazado: "Postulado",
          };
          const etapa = mapaEtapas[p.estado] || "Postulado";
          const nombre = p.nombre_completo || "Candidato";
          const iniciales =
            nombre
              .split(" ")
              .slice(0, 2)
              .map((n: string) => n[0]?.toUpperCase() ?? "")
              .join("") || "CA";

          return {
            id: p.id,
            nombre,
            puesto: p.vacante_id ? "Postulante ATS" : "Candidato",
            vacante: p.vacante_id ? "Vacante registrada" : "Proceso General",
            vacanteId: p.vacante_id,
            email: p.email,
            telefono: p.telefono,
            linkedin: p.linkedin_url,
            etapa,
            match: 90,
            antiguedad: "Reciente",
            iniciales,
            etiqueta: "Nuevo",
            created_at: p.created_at,
          };
        });

        // Combinar evitando duplicados
        const locales = obtenerCandidatosGuardados();
        const combinados = [...mapeados];
        for (const loc of locales) {
          if (!combinados.some((c) => c.id === loc.id || c.email === loc.email)) {
            combinados.push(loc);
          }
        }
        setCandidatos(combinados);
      }
    } catch {
      setCandidatos(obtenerCandidatosGuardados());
    }
  }, []);

  // Load vacantes from Supabase or fallback
  const cargarVacantes = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setVacantes(obtenerVacantesGuardadas());
      return;
    }
    try {
      const peticion = supabase.from("vacantes").select("*");
      const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Timeout Supabase") }), 1500)
      );
      const { data, error } = await Promise.race([peticion, timeout]);
      if (error || !data || (data as any[]).length === 0) {
        setVacantes(obtenerVacantesGuardadas());
      } else {
        const vacArray = (data as any[]).map((v) => ({
          id: v.id,
          titulo: v.titulo,
          departamento: v.departamento,
          ubicacion: v.ubicacion,
          tipo_jornada: v.tipo_jornada,
          descripcion: v.descripcion,
          estado: v.estado,
          created_at: v.created_at,
        }));
        setVacantes(vacArray);
      }
    } catch {
      setVacantes(obtenerVacantesGuardadas());
    }
  }, []);

  // Load mensajes from Supabase or fallback
  const cargarMensajes = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setMensajes(obtenerMensajesGuardados());
      return;
    }
    try {
      const peticion = supabase.from("mensajes").select("*");
      const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Timeout Supabase") }), 1500)
      );
      const { data, error } = await Promise.race([peticion, timeout]);
      if (error || !data || (data as any[]).length === 0) {
        setMensajes(obtenerMensajesGuardados());
      } else {
        const msgs = (data as any[]).map((m) => ({
          id: m.id,
          conversacionId: m.postulante_id || m.id_rh || "",
          de: m.de,
          texto: m.texto,
          timestamp: m.timestamp,
          leido: true,
        }));
        setMensajes(msgs);
      }
    } catch {
      setMensajes(obtenerMensajesGuardados());
    }
  }, []);

  // Load postulaciones from Supabase or fallback
  const cargarPostulaciones = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setPostulaciones(obtenerPostulacionesGuardadas());
      return;
    }
    try {
      const peticion = supabase.from("postulantes").select("*");
      const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Timeout Supabase") }), 1500)
      );
      const { data, error } = await Promise.race([peticion, timeout]);
      if (error || !data || (data as any[]).length === 0) {
        setPostulaciones(obtenerPostulacionesGuardadas());
      } else {
        const posts = (data as any[]).map((p) => ({
          id: p.id,
          vacanteId: p.vacante_id,
          vacanteTitulo: p.vacante_titulo || "",
          empresa: p.empresa || "",
          ubicacion: p.ubicacion || "",
          fecha: p.fecha || "",
          estatus: p.estado,
          nombreCandidato: p.nombre_completo,
          emailCandidato: p.email,
          telefono: p.telefono,
          linkedin: p.linkedin_url,
          notas: p.notas,
        }));
        setPostulaciones(posts);
      }
    } catch {
      setPostulaciones(obtenerPostulacionesGuardadas());
    }
  }, []);

  // Existing sincronizar function
  const sincronizar = useCallback(() => {
    setVacantes(obtenerVacantesGuardadas());
    setCandidatos(obtenerCandidatosGuardados());
    setPostulaciones(obtenerPostulacionesGuardadas());
    setMensajes(obtenerMensajesGuardados());
  }, []);

  // Load data on component mount
  useEffect(() => {
    cargarVacantes();
    cargarCandidatos();
    cargarPostulaciones();
    cargarMensajes();
  }, [cargarVacantes, cargarCandidatos, cargarPostulaciones, cargarMensajes]);


  // Derivar conversaciones agrupadas por candidato
  const conversaciones: ConversacionATS[] = useMemo(() => {
    return candidatos.map((cand) => {
      const msgsCandidato = mensajes
        .filter((m) => m.conversacionId === cand.id)
        .sort((a, b) => (a.id > b.id ? 1 : -1));

      // Si no tiene mensajes aún, generar uno inicial de bienvenida automático
      const listadoFinal =
        msgsCandidato.length > 0
          ? msgsCandidato
          : [
            {
              id: `init-${cand.id}`,
              conversacionId: cand.id,
              de: "rh" as const,
              texto: `Hola ${cand.nombre}, hemos registrado tu postulación a la posición de ${cand.vacante}. Tu perfil está en etapa ${cand.etapa}.`,
              timestamp: "Hoy",
              leido: true,
            },
          ];

      const ultimoMsg = listadoFinal[listadoFinal.length - 1];

      return {
        id: cand.id,
        candidatoId: cand.id,
        nombre: cand.nombre,
        email: cand.email || "candidato@malinalli.mx",
        vacante: cand.vacante,
        vacanteId: cand.vacanteId || undefined,
        ultimaHora: ultimoMsg?.timestamp || "Hoy",
        mensajes: listadoFinal,
      };
    });
  }, [candidatos, mensajes]);

  // Enviar mensaje en una conversación
  const enviarMensaje = useCallback(
    async ({
      conversacionId,
      texto,
      de = "rh",
    }: {
      conversacionId: string;
      texto: string;
      de?: "rh" | "candidato";
    }) => {
      const ahora = new Date();
      const horaStr = `${ahora.getHours().toString().padStart(2, "0")}:${ahora
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const nuevoMensaje: MensajeATS = {
        id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        conversacionId,
        de,
        texto: texto.trim(),
        timestamp: horaStr,
        leido: true,
      };

      const listaActual = obtenerMensajesGuardados();
      const actualizados = [...listaActual, nuevoMensaje];
      guardarMensajes(actualizados);
      setMensajes(actualizados);

      if (isSupabaseConfigured) {
        try {
          await (supabase as any).from("mensajes").insert({
            postulante_id: conversacionId.startsWith("cand-") ? null : conversacionId,
            de: nuevoMensaje.de,
            texto: nuevoMensaje.texto,
          });
        } catch (err) {
          console.warn("No se pudo sincronizar mensaje en Supabase (guardado localmente):", err);
        }
      }

      return nuevoMensaje;
    },
    [],
  );

  const crearVacante = useCallback(
    async (datos: {
      titulo: string;
      departamento: string;
      ubicacion: string;
      tipo_jornada: string;
      descripcion: string;
      estado: EstadoVacante;
    }): Promise<Vacante> => {
      const nueva: Vacante = {
        id: "vac-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        ...datos,
        created_at: new Date().toISOString(),
      };

      const listaActual = obtenerVacantesGuardadas();
      const actualizadas = [nueva, ...listaActual];
      guardarVacantes(actualizadas);
      setVacantes(actualizadas);

      if (isSupabaseConfigured) {
        try {
          await (supabase as any).from("vacantes").insert({
            titulo: nueva.titulo,
            departamento: nueva.departamento,
            ubicacion: nueva.ubicacion,
            tipo_jornada: nueva.tipo_jornada,
            descripcion: nueva.descripcion,
            estado: nueva.estado,
          });
        } catch (error) {
          console.warn("No se pudo sincronizar vacante con Supabase (guardada localmente):", error);
        }
      }

      return nueva;
    },
    [],
  );

  const actualizarVacante = useCallback(
    async (vacanteActualizada: Vacante) => {
      const listaActual = obtenerVacantesGuardadas();
      const actualizadas = listaActual.map((v) =>
        v.id === vacanteActualizada.id ? vacanteActualizada : v,
      );
      guardarVacantes(actualizadas);
      setVacantes(actualizadas);

      if (isSupabaseConfigured) {
        try {
          await (supabase as any)
            .from("vacantes")
            .update({
              titulo: vacanteActualizada.titulo,
              departamento: vacanteActualizada.departamento,
              ubicacion: vacanteActualizada.ubicacion,
              tipo_jornada: vacanteActualizada.tipo_jornada,
              descripcion: vacanteActualizada.descripcion,
              estado: vacanteActualizada.estado,
            })
            .eq("id", vacanteActualizada.id);
        } catch (error) {
          console.warn("Error al actualizar vacante en Supabase:", error);
        }
      }
    },
    [],
  );

  const eliminarVacante = useCallback(async (id: string) => {
    const listaActual = obtenerVacantesGuardadas();
    const filtradas = listaActual.filter((v) => v.id !== id);
    guardarVacantes(filtradas);
    setVacantes(filtradas);

    if (isSupabaseConfigured) {
      try {
        await (supabase as any).from("vacantes").delete().eq("id", id);
      } catch (error) {
        console.warn("Error al eliminar vacante en Supabase:", error);
      }
    }
  }, []);

  const actualizarEstadoVacante = useCallback(
    async (id: string, nuevoEstado: EstadoVacante) => {
      const listaActual = obtenerVacantesGuardadas();
      const actualizadas = listaActual.map((v) =>
        v.id === id ? { ...v, estado: nuevoEstado } : v,
      );
      guardarVacantes(actualizadas);
      setVacantes(actualizadas);

      if (isSupabaseConfigured) {
        try {
          await (supabase as any).from("vacantes").update({ estado: nuevoEstado }).eq("id", id);
        } catch (error) {
          console.warn("Error al actualizar estado en Supabase:", error);
        }
      }
    },
    [],
  );

  const actualizarEtapaCandidato = useCallback(
    async (candidatoId: string, nuevaEtapa: Etapa) => {
      const candidatosActuales = obtenerCandidatosGuardados();
      const actualizados = candidatosActuales.map((c) =>
        c.id === candidatoId ? { ...c, etapa: nuevaEtapa } : c,
      );
      guardarCandidatos(actualizados);
      setCandidatos(actualizados);

      if (isSupabaseConfigured) {
        try {
          const mapaSupabase: Record<Etapa, string> = {
            Postulado: "nuevo",
            Filtro: "en_revision",
            Entrevista: "entrevista",
            Oferta: "oferta",
            Contratado: "contratado",
          };
          await (supabase as any)
            .from("postulantes")
            .update({ estado: (mapaSupabase[nuevaEtapa] || "nuevo") as any })
            .eq("id", candidatoId);
        } catch (error) {
          console.warn("Error updating candidato etapa en Supabase:", error);
        }
      }

      // Sincronizar también postulaciones
      const postActuales = obtenerPostulacionesGuardadas();
      const postActualizadas = postActuales.map((p) =>
        p.id === candidatoId || p.nombreCandidato === candidatoId || p.vacanteId === candidatoId
          ? { ...p, estatus: nuevaEtapa }
          : p,
      );
      guardarPostulaciones(postActualizadas);
      setPostulaciones(postActualizadas);
    },
    [],
  );

  const postularseAVacante = useCallback(
    async (datos: {
      vacanteId: string;
      vacanteTitulo: string;
      departamento?: string;
      ubicacion?: string;
      nombre: string;
      email: string;
      telefono?: string;
      linkedin?: string;
      notas?: string;
    }) => {
      const iniciales =
        datos.nombre
          .split(" ")
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase() ?? "")
          .join("") || "CA";

      const nuevoCandidato: Candidato = {
        id: "cand-" + Date.now(),
        nombre: datos.nombre,
        puesto: datos.vacanteTitulo,
        vacante: datos.vacanteTitulo,
        vacanteId: datos.vacanteId,
        email: datos.email,
        telefono: datos.telefono || undefined,
        linkedin: datos.linkedin || undefined,
        etapa: "Postulado",
        match: Math.floor(84 + Math.random() * 14),
        antiguedad: "Hoy",
        iniciales,
        etiqueta: "Nuevo",
        created_at: new Date().toISOString(),
      };

      const candsActuales = obtenerCandidatosGuardados();
      const candsActualizados = [nuevoCandidato, ...candsActuales];
      guardarCandidatos(candsActualizados);
      setCandidatos(candsActualizados);

      const nuevaPostulacion: PostulacionItem = {
        id: "post-" + Date.now(),
        vacanteId: datos.vacanteId,
        vacanteTitulo: datos.vacanteTitulo,
        empresa: "Malinalli Elite",
        ubicacion: datos.ubicacion || "México",
        fecha: "Hoy",
        estatus: "Postulado",
        nombreCandidato: datos.nombre,
        emailCandidato: datos.email,
        telefono: datos.telefono || undefined,
        linkedin: datos.linkedin || undefined,
        notas: datos.notas || undefined,
      };

      const postActuales = obtenerPostulacionesGuardadas();
      const postActualizadas = [nuevaPostulacion, ...postActuales];
      guardarPostulaciones(postActualizadas);
      setPostulaciones(postActualizadas);

      if (isSupabaseConfigured) {
        try {
          await (supabase as any).from("postulantes").insert({
            vacante_id: datos.vacanteId,
            nombre_completo: datos.nombre,
            email: datos.email,
            telefono: datos.telefono ?? null,
            linkedin_url: datos.linkedin ?? null,
            estado: "nuevo",
          });
        } catch (error) {
          console.warn("Error inserting postulante in Supabase:", error);
        }
      }
      return nuevoCandidato;
    },
    [],
  );

  // Upload CV to Supabase Storage and update postulante's cv_url
  const subirCV = useCallback(
    async (candidatoId: string, file: File): Promise<string | null> => {
      if (!isSupabaseConfigured) {
        console.warn("Supabase no configurado; subida de CV omitida");
        return null;
      }
      try {
        const ext = file.name.split(".").pop() || "pdf";
        const path = `${candidatoId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("cvs")
          .upload(path, file, { upsert: true });

        if (uploadError) {
          console.error("Error subiendo CV:", uploadError);
          return null;
        }

        const { data: publicData } = supabase.storage
          .from("cvs")
          .getPublicUrl(path);
        const cvUrl = publicData?.publicUrl || "";

        // Actualizar postulante en Supabase
        await (supabase as any)
          .from("postulantes")
          .update({ cv_url: cvUrl })
          .eq("id", candidatoId);

        // Actualizar estado local de candidatos
        setCandidatos((prev) =>
          prev.map((c) =>
            c.id === candidatoId ? { ...c, cv_url: cvUrl } : c,
          ),
        );
        const locales = obtenerCandidatosGuardados();
        const actualizados = locales.map((c) =>
          c.id === candidatoId ? { ...c, cv_url: cvUrl } : c,
        );
        guardarCandidatos(actualizados);

        return cvUrl;
      } catch (err) {
        console.error("Error en subirCV:", err);
        return null;
      }
    },
    [],
  );

  const cancelarPostulacion = useCallback(
    async (postulacionId: string) => {
      const postsActuales = obtenerPostulacionesGuardadas();
      const postulacionEncontrada = postsActuales.find((p) => p.id === postulacionId);
      if (!postulacionEncontrada) return;

      // Filtrar de postulaciones locales
      const postsFiltrados = postsActuales.filter((p) => p.id !== postulacionId);
      guardarPostulaciones(postsFiltrados);
      setPostulaciones(postsFiltrados);

      // Encontrar y filtrar candidato asociado
      const candsActuales = obtenerCandidatosGuardados();
      const candAsociado = candsActuales.find(
        (c) =>
          c.email === postulacionEncontrada.emailCandidato &&
          c.vacanteId === postulacionEncontrada.vacanteId,
      );

      let candIdParaSupabase = candAsociado?.id;

      if (candAsociado) {
        const candsFiltrados = candsActuales.filter((c) => c.id !== candAsociado.id);
        guardarCandidatos(candsFiltrados);
        setCandidatos(candsFiltrados);
      }

      // En Supabase, eliminar de la tabla 'postulantes'
      if (isSupabaseConfigured) {
        try {
          const idAEliminar = candIdParaSupabase || postulacionId;
          await (supabase as any).from("postulantes").delete().eq("id", idAEliminar);
        } catch (error) {
          console.warn("Error al eliminar postulante en Supabase:", error);
        }
      }
    },
    [],
  );

  return {
    vacantes,
    candidatos,
    postulaciones,
    mensajes,
    conversaciones,
    enviarMensaje,
    crearVacante,
    actualizarEstadoVacante,
    actualizarEtapaCandidato,
    postularseAVacante,
    actualizarVacante,
    eliminarVacante,
    subirCV,
    cancelarPostulacion,
  };
}

