export type Vacante = {
  id: string;
  titulo: string;
  empresa: string;
  ubicacion: string;
  modalidad: "Remoto" | "Híbrido" | "Presencial";
  jornada: string;
  salario: string;
  area: string;
  publicada: string;
  destacada?: boolean;
  descripcion: string;
};

export const vacantes: Vacante[] = [
  {
    id: "v1",
    titulo: "Senior Full Stack Developer",
    empresa: "Techidion Corp",
    ubicacion: "Remoto (México)",
    modalidad: "Remoto",
    jornada: "Tiempo completo",
    salario: "$64,000 – $86,000 MXN",
    area: "Tecnología",
    publicada: "Hace 2 días",
    destacada: true,
    descripcion:
      "Buscamos una persona con experiencia sólida en React, Node y arquitecturas orientadas a servicios para liderar iniciativas de producto.",
  },
  {
    id: "v2",
    titulo: "Cloud Architecture Lead",
    empresa: "Quantum Financial",
    ubicacion: "CDMX, Híbrido",
    modalidad: "Híbrido",
    jornada: "Tiempo completo",
    salario: "Competitivo",
    area: "Tecnología",
    publicada: "Hace 1 semana",
    descripcion:
      "Diseño de infraestructura multi-cloud, gobierno de costos y liderazgo técnico de un equipo de 6 ingenieros.",
  },
  {
    id: "v3",
    titulo: "DevOps Engineer",
    empresa: "Innovatech Solutions",
    ubicacion: "Monterrey, Presencial",
    modalidad: "Presencial",
    jornada: "Tiempo completo",
    salario: "$57,000 – $74,000 MXN",
    area: "Tecnología",
    publicada: "Hace 3 días",
    descripcion:
      "Automatización de pipelines CI/CD, observabilidad y cultura de confiabilidad para plataformas de alto tráfico.",
  },
  {
    id: "v4",
    titulo: "Director of Enterprise Sales",
    empresa: "SalesCorp",
    ubicacion: "Remoto (LATAM)",
    modalidad: "Remoto",
    jornada: "Tiempo completo",
    salario: "Base + comisión",
    area: "Ventas",
    publicada: "Hace 1 semana",
    descripcion:
      "Responsable de la estrategia comercial enterprise en LATAM, con equipo directo de 12 personas.",
  },
  {
    id: "v5",
    titulo: "Diseñador UX/UI Senior",
    empresa: "Creative Labs MX",
    ubicacion: "Remoto, LATAM",
    modalidad: "Remoto",
    jornada: "Tiempo completo",
    salario: "$48,000 – $62,000 MXN",
    area: "Diseño",
    publicada: "Hace 5 días",
    destacada: true,
    descripcion:
      "Investigación, sistemas de diseño y prototipado de alta fidelidad para productos financieros.",
  },
  {
    id: "v6",
    titulo: "Especialista en Marketing",
    empresa: "Malinalli",
    ubicacion: "Presencial, Monterrey",
    modalidad: "Presencial",
    jornada: "Medio tiempo",
    salario: "$26,000 MXN",
    area: "Marketing",
    publicada: "Hace 2 semanas",
    descripcion:
      "Campañas de employer branding, contenido y gestión de comunidades de talento.",
  },
  {
    id: "v7",
    titulo: "Analista Financiero",
    empresa: "Fintech Global",
    ubicacion: "CDMX, Híbrido",
    modalidad: "Híbrido",
    jornada: "Tiempo completo",
    salario: "$38,000 – $46,000 MXN",
    area: "Finanzas",
    publicada: "Hace 4 días",
    descripcion:
      "Modelado financiero, forecasting y soporte analítico a la dirección general.",
  },
  {
    id: "v8",
    titulo: "Ingeniero Backend Java",
    empresa: "GlobalLogistics Inc",
    ubicacion: "Híbrido, CDMX",
    modalidad: "Híbrido",
    jornada: "Tiempo completo",
    salario: "$55,000 – $70,000 MXN",
    area: "Tecnología",
    publicada: "Hace 6 días",
    descripcion:
      "Servicios distribuidos, mensajería asíncrona y optimización de rendimiento en Java 21.",
  },
];

export const areas = ["Todas", "Tecnología", "Ventas", "Diseño", "Marketing", "Finanzas"];
export const modalidades = ["Cualquiera", "Remoto", "Híbrido", "Presencial"];

export type Etapa = "Postulado" | "Filtro" | "Entrevista" | "Oferta" | "Contratado";

export const etapas: Etapa[] = ["Postulado", "Filtro", "Entrevista", "Oferta", "Contratado"];

export type Candidato = {
  id: string;
  nombre: string;
  puesto: string;
  vacante: string;
  etapa: Etapa;
  match: number;
  antiguedad: string;
  iniciales: string;
  etiqueta?: "Nuevo" | "Urgente" | "Sustituto" | "Top";
};

export const candidatosIniciales: Candidato[] = [
  { id: "c1", nombre: "Ana Silva", puesto: "Senior Frontend Dev", vacante: "Senior Full Stack Developer", etapa: "Postulado", match: 92, antiguedad: "Hace 2 días", iniciales: "AS", etiqueta: "Nuevo" },
  { id: "c2", nombre: "Miguel Aranda", puesto: "Backend Java", vacante: "Ingeniero Backend Java", etapa: "Postulado", match: 78, antiguedad: "Hace 3 días", iniciales: "MA" },
  { id: "c3", nombre: "Lucía Morales", puesto: "Analista Financiero", vacante: "Analista Financiero", etapa: "Postulado", match: 71, antiguedad: "Hace 1 día", iniciales: "LM" },
  { id: "c4", nombre: "Carlos Mendoza", puesto: "Product Manager", vacante: "Cloud Architecture Lead", etapa: "Filtro", match: 88, antiguedad: "Hace 6 días", iniciales: "CM", etiqueta: "Top" },
  { id: "c5", nombre: "Valeria Torres", puesto: "Lead Frontend Engineer", vacante: "Senior Full Stack Developer", etapa: "Filtro", match: 95, antiguedad: "Hace 4 días", iniciales: "VT" },
  { id: "c6", nombre: "Laura Mendoza", puesto: "Director of UX", vacante: "Diseñador UX/UI Senior", etapa: "Entrevista", match: 90, antiguedad: "Hoy, 14:00", iniciales: "LM", etiqueta: "Urgente" },
  { id: "c7", nombre: "Elena Ríos", puesto: "Senior UX/UI Designer", vacante: "Diseñador UX/UI Senior", etapa: "Entrevista", match: 84, antiguedad: "Hace 1 día", iniciales: "ER" },
  { id: "c8", nombre: "Andrea Medina", puesto: "Product Manager", vacante: "Director of Enterprise Sales", etapa: "Oferta", match: 81, antiguedad: "Hace 1 semana", iniciales: "AM", etiqueta: "Sustituto" },
  { id: "c9", nombre: "Alejandro Silva", puesto: "Senior Frontend Developer", vacante: "Senior Full Stack Developer", etapa: "Contratado", match: 97, antiguedad: "Hace 2 semanas", iniciales: "AS" },
];

export const metricas = [
  { label: "Candidatos nuevos", valor: "124", detalle: "+12% vs semana pasada" },
  { label: "Vacantes activas", valor: "18", detalle: "5 agencias" },
  { label: "Entrevistas hoy", valor: "5", detalle: "Siguiente en 45 min" },
  { label: "Tiempo contratación", valor: "18 días", detalle: "-2 días vs mes ant." },
];

export const embudo = [
  { etapa: "Aplicación recibida", valor: 1240, pct: 100 },
  { etapa: "Filtro inicial", valor: 450, pct: 36 },
  { etapa: "Entrevista técnica", valor: 210, pct: 17 },
  { etapa: "Oferta extendida", valor: 52, pct: 4 },
  { etapa: "Contratado", valor: 31, pct: 2.5 },
];
