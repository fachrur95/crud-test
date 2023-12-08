import type { IDataOption } from "./options";

export interface IDivision {
  id: number;
  division_id: number | null;
  name: string;
  deskripsi: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
  divisionParent?: IDivision;
}

export interface IDivisionMutation extends Pick<IDivision, "division_id" | "name" | "deskripsi"> {
  divisionParent?: IDataOption | null;
}