
export interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  insurance: string;
  medicalHistory: string;
  createdAt: Date;
  appointments: Appointment[];
}

export interface HealthcareProfessional {
  id: string;
  name: string;
  specialty: string;
  appointments: Appointment[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  date: Date;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes: string;
  symptoms?: string;
  diagnosis?: string;
  prescriptions?: string[];
  exams?: string[];
  paymentStatus?: "pending" | "paid" | "insurance";
  paymentAmount?: number;
}

export type UserRole = "professional" | "patient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileId: string; // Either patientId or professionalId
}
