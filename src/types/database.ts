export type EstadoVacante = "abierta" | "cerrada";

export type EstadoPostulante =
  | "nuevo"
  | "en_revision"
  | "entrevista"
  | "rechazado"
  | "contratado";

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
  id?: string;
  estado?: EstadoVacante;
  created_at?: string;
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
  id?: string;
  estado?: EstadoPostulante;
  created_at?: string;
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
