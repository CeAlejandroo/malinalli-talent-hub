export type EstadoVacante = "abierta" | "cerrada";

export type EstadoPostulante =
  | "nuevo"
  | "en_revision"
  | "entrevista"
  | "oferta"
  | "rechazado"
  | "contratado";

export type Etapa = "Postulado" | "Filtro" | "Entrevista" | "Oferta" | "Contratado";

export interface Candidato {
  id: string;
  nombre: string;
  puesto: string;
  vacante: string;
  vacanteId?: string | undefined;
  email?: string | undefined;
  telefono?: string | undefined;
  linkedin?: string | undefined;
  etapa: Etapa;
  match: number;
  antiguedad: string;
  iniciales: string;
  etiqueta?: "Nuevo" | "Urgente" | "Sustituto" | "Top" | undefined;
  created_at?: string | undefined;
  cv_url?: string | null | undefined;
}

export interface MensajeATS {
  id: string;
  conversacionId: string;
  de: "rh" | "candidato";
  texto: string;
  timestamp: string;
  leido?: boolean | undefined;
}

export interface ConversacionATS {
  id: string;
  candidatoId: string;
  nombre: string;
  email: string;
  vacante: string;
  vacanteId?: string | undefined;
  ultimaHora: string;
  mensajes: MensajeATS[];
}

export interface Vacante {
  id: string;
  titulo: string;
  departamento: string;
  ubicacion: string;
  tipo_jornada: string;
  descripcion: string;
  estado: EstadoVacante;
  created_at: string;
}

export type VacanteInsert = Omit<Vacante, "id" | "created_at" | "estado"> & {
  id?: string | undefined;
  estado?: EstadoVacante | undefined;
  created_at?: string | undefined;
};

export type VacanteUpdate = Partial<VacanteInsert>;

export interface Postulante {
  id: string;
  vacante_id: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  linkedin_url: string | null;
  cv_url: string | null;
  estado: EstadoPostulante;
  created_at: string;
}

export type PostulanteInsert = Omit<Postulante, "id" | "created_at" | "estado"> & {
  id?: string | undefined;
  estado?: EstadoPostulante | undefined;
  created_at?: string | undefined;
};

export type PostulanteUpdate = Partial<PostulanteInsert>;

export interface Database {
  public: {
    Tables: {
      vacantes: {
        Row: Vacante;
        Insert: VacanteInsert;
        Update: VacanteUpdate;
        Relationships: [];
      };
      postulantes: {
        Row: Postulante;
        Insert: PostulanteInsert;
        Update: PostulanteUpdate;
        Relationships: [
          {
            foreignKeyName: "postulantes_vacante_id_fkey";
            columns: ["vacante_id"];
            isOneToOne: false;
            referencedRelation: "vacantes";
            referencedColumns: ["id"];
          },
        ];
      };
      mensajes: {
        Row: MensajeATS;
        Insert: Omit<MensajeATS, "id"> & { id?: string | undefined };
        Update: Partial<MensajeATS>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      estado_vacante: EstadoVacante;
      estado_postulante: EstadoPostulante;
    };
    CompositeTypes: Record<string, never>;
  };
}
