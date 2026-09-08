import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Vacante, EstadoVacante, Candidato, Etapa } from "@/types/database";

const STORAGE_VACANTES = "malinalli.vacantes";
const STORAGE_CANDIDATOS = "malinalli.candidatos";
const STORAGE_POSTULACIONES = "malinalli.postulaciones";

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
  telefono?: string;
  linkedin?: string;
  notas?: string;
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
  },
  {
    id: "post-2",
    vacanteId: "mock-2",
    vacanteTitulo: "Diseñador UX/UI Senior",
    empresa: "Malinalli Design",
    ubicacion: "Remoto (LATAM)",
    fecha: "Hace 4 días",
    estatus: "Entrevista",
    nombreCandidato: "Sofía Valdés",
    emailCandidato: "candidato@malinalli.mx",
  },
];

function obtenerVacantesGuardadas(): Vacante[] {
  if (typeof window === "undefined") return VACANTES_DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_VACANTES);
    if (!raw) return VACANTES_DEFAULT;
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
    if (!raw) return POSTULACIONES_DEFAULT;
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

export function useAtsStore() {
  const [vacantes, setVacantes] = useState<Vacante[]>(obtenerVacantesGuardadas);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [postulaciones, setPostulaciones] = useState<PostulacionItem[]>(
    obtenerPostulacionesGuardadas,
  );

  const cargarCandidatos = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCandidatos([]);
      return;
    }
    try {
      const { data, error } = await supabase.from("postulantes").select("*");
      if (error) {
        console.warn("Supabase candidate fetch error:", error.message);
        setCandidatos([]);
      } else {
        setCandidatos(data as Candidato[]);
      }
    } catch (err) {
      console.warn("Network error fetching candidatos:", err);
      setCandidatos([]);
    }
  }, []);

  const sincronizar = useCallback(() => {
    setVacantes(obtenerVacantesGuardadas());
    void cargarCandidatos();
    setPostulaciones(obtenerPostulacionesGuardadas());
  }, [cargarCandidatos]);

  useEffect(() => {
    window.addEventListener("malinalli:vacantes_updated", sincronizar);
    window.addEventListener("malinalli:postulaciones_updated", sincronizar);
    window.addEventListener("storage", sincronizar);

    void cargarCandidatos();

    return () => {
      window.removeEventListener("malinalli:vacantes_updated", sincronizar);
      window.removeEventListener("malinalli:postulaciones_updated", sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, [sincronizar]);

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
          await supabase.from("vacantes").insert({
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
    []
  );

  // Update an existing vacancy
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
          await supabase.from("vacantes")
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
    []
  );

  // Delete a vacancy
  const eliminarVacante = useCallback(async (id: string) => {
    const listaActual = obtenerVacantesGuardadas();
    const filtradas = listaActual.filter((v) => v.id !== id);
    guardarVacantes(filtradas);
    setVacantes(filtradas);

    if (isSupabaseConfigured) {
      try {
        await supabase.from("vacantes").delete().eq("id", id);
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
          await supabase.from("vacantes").update({ estado: nuevoEstado }).eq("id", id);
        } catch (error) {
          console.warn("Error al actualizar estado en Supabase:", error);
        }
      }
    },
    [],
  );

  const actualizarEtapaCandidato = useCallback(
    async (candidatoId: string, nuevaEtapa: Etapa) => {
      setCandidatos((prev) =>
        prev.map((c) => (c.id === candidatoId ? { ...c, etapa: nuevaEtapa } : c)),
      );
      if (isSupabaseConfigured) {
        try {
          await supabase.from("postulantes").update({ estado: nuevaEtapa }).eq("id", candidatoId);
        } catch (error) {
          console.warn("Error updating candidato etapa in Supabase:", error);
        }
      }
      setPostulaciones((prev) =>
        prev.map((p) =>
          p.vacanteId === candidatoId || p.nombreCandidato === candidatoId
            ? { ...p, estatus: nuevaEtapa }
            : p,
        ),
      );
    },
    []
  );

  const postularseAVacante = useCallback(
    async (datos: {
      vacanteId: string;
      vacanteTitulo: string;
      nombre: string;
      email: string;
      telefono?: string;
      linkedin?: string;
      notas?: string;
    }) => {
      const iniciales = datos.nombre
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || "CA";

      const nuevoCandidato: Candidato = {
        id: "cand-" + Date.now(),
        nombre: datos.nombre,
        puesto: datos.vacanteTitulo,
        vacante: datos.vacanteTitulo,
        etapa: "Postulado",
        match: Math.floor(82 + Math.random() * 16),
        antiguedad: "Hoy",
        iniciales,
        etiqueta: "Nuevo",
      };

      setCandidatos((prev) => [nuevoCandidato, ...prev]);
      guardarCandidatos([nuevoCandidato, ...candidatos]);

      const nuevaPostulacion: PostulacionItem = {
        id: "post-" + Date.now(),
        vacanteId: datos.vacanteId,
        vacanteTitulo: datos.vacanteTitulo,
        empresa: "Malinalli Elite",
        ubicacion: "México",
        fecha: "Hoy",
        estatus: "Postulado",
        nombreCandidato: datos.nombre,
        emailCandidato: datos.email,
        telefono: datos.telefono,
        linkedin: datos.linkedin,
        notas: datos.notas,
      };
      setPostulaciones((prev) => [nuevaPostulacion, ...prev]);
      guardarPostulaciones([nuevaPostulacion, ...postulaciones]);

      if (isSupabaseConfigured) {
        try {
          await supabase.from("postulantes").insert({
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
    [candidatos, postulaciones]
  );

  return {
    vacantes,
    candidatos,
    postulaciones,
    crearVacante,
    actualizarEstadoVacante,
    actualizarEtapaCandidato,
    postularseAVacante,
    actualizarVacante,
    eliminarVacante,
  };
}
