import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  Patient, 
  HealthcareProfessional, 
  Appointment, 
  UserRole 
} from "../types";
import mockData from "../services/mockData";
import { toast } from "sonner";

interface AppContextType {
  currentUser: User | null;
  patients: Patient[];
  professionals: HealthcareProfessional[];
  appointments: Appointment[];
  currentProfile: Patient | HealthcareProfessional | null;
  
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  
  addPatient: (patient: Omit<Patient, "id" | "createdAt" | "appointments">) => void;
  updatePatient: (patientId: string, data: Partial<Patient>) => void;
  
  addAppointment: (appointment: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (appointmentId: string, data: Partial<Appointment>) => void;
  cancelAppointment: (appointmentId: string) => void;
  
  getAvailableTimeSlots: (date: Date, professionalId: string) => string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>(mockData.patients);
  const [professionals, setProfessionals] = useState<HealthcareProfessional[]>(mockData.professionals);
  const [appointments, setAppointments] = useState<Appointment[]>(mockData.appointments);
  const [currentProfile, setCurrentProfile] = useState<Patient | HealthcareProfessional | null>(null);

  useEffect(() => {
    if (!currentUser) {
      login("user1");
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setCurrentProfile(null);
      return;
    }

    if (currentUser.role === "professional") {
      const profile = professionals.find(p => p.id === currentUser.profileId);
      setCurrentProfile(profile || null);
    } else {
      const profile = patients.find(p => p.id === currentUser.profileId);
      setCurrentProfile(profile || null);
    }
  }, [currentUser, professionals, patients]);

  const login = (userId: string) => {
    const user = mockData.users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      toast.success(`Bem-vindo, ${user.name}!`);
    } else {
      toast.error("Usuário não encontrado");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentProfile(null);
    toast.info("Você saiu do sistema");
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    
    const newUser = mockData.users.find(u => u.role === role);
    
    if (newUser) {
      setCurrentUser(newUser);
      toast.success(`Alternado para modo ${role === "professional" ? "Profissional" : "Paciente"}`);
    } else {
      toast.error(`Não há usuário disponível com o perfil ${role}`);
    }
  };

  const addPatient = (patientData: Omit<Patient, "id" | "createdAt" | "appointments">) => {
    const newPatient: Patient = {
      id: `pat${patients.length + 1}`,
      ...patientData,
      createdAt: new Date(),
      appointments: []
    };
    
    setPatients(prevPatients => [...prevPatients, newPatient]);
    toast.success(`Paciente ${newPatient.name} cadastrado com sucesso`);
  };

  const updatePatient = (patientId: string, data: Partial<Patient>) => {
    setPatients(prevPatients => 
      prevPatients.map(patient => 
        patient.id === patientId ? { ...patient, ...data } : patient
      )
    );
    toast.success("Dados do paciente atualizados");
  };

  const addAppointment = (appointmentData: Omit<Appointment, "id">) => {
    const newAppointment: Appointment = {
      id: `app${appointments.length + 1}`,
      ...appointmentData
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    
    setPatients(prevPatients => 
      prevPatients.map(patient => 
        patient.id === appointmentData.patientId
          ? { ...patient, appointments: [...patient.appointments, newAppointment] }
          : patient
      )
    );
    
    setProfessionals(prevProfessionals => 
      prevProfessionals.map(professional => 
        professional.id === appointmentData.professionalId
          ? { ...professional, appointments: [...professional.appointments, newAppointment] }
          : professional
      )
    );
    
    toast.success("Consulta agendada com sucesso");
    return newAppointment;
  };

  const updateAppointment = (appointmentId: string, data: Partial<Appointment>) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === appointmentId ? { ...app, ...data } : app
      )
    );
    
    if (data.status) {
      toast.success(`Consulta ${data.status === "completed" ? "concluída" : "atualizada"} com sucesso`);
    } else {
      toast.success("Consulta atualizada");
    }
  };

  const cancelAppointment = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: "cancelled" });
    toast.info("Consulta cancelada");
  };

  const getAvailableTimeSlots = (date: Date, professionalId: string) => {
    return mockData.getAvailableTimeSlots(date, professionalId);
  };

  const value = {
    currentUser,
    patients,
    professionals,
    appointments,
    currentProfile,
    login,
    logout,
    switchRole,
    addPatient,
    updatePatient,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    getAvailableTimeSlots
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
