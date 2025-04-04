
import { Patient, HealthcareProfessional, Appointment, User } from "../types";

// Mock Users
export const users: User[] = [
  {
    id: "user1",
    name: "Dr. Ana Silva",
    email: "ana.silva@example.com",
    role: "professional",
    profileId: "prof1",
  },
  {
    id: "user2",
    name: "João Santos",
    email: "joao.santos@example.com",
    role: "patient",
    profileId: "pat1",
  },
  {
    id: "user3",
    name: "Maria Oliveira",
    email: "maria@example.com",
    role: "patient",
    profileId: "pat2",
  },
];

// Mock Patients
export const patients: Patient[] = [
  {
    id: "pat1",
    name: "João Santos",
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
    insurance: "Unimed",
    medicalHistory: "Hipertensão, diabetes tipo 2",
    createdAt: new Date("2023-01-15"),
    appointments: [],
  },
  {
    id: "pat2",
    name: "Maria Oliveira",
    cpf: "987.654.321-00",
    phone: "(11) 91234-5678",
    insurance: "Amil",
    medicalHistory: "Asma, alergia a penicilina",
    createdAt: new Date("2023-03-22"),
    appointments: [],
  },
  {
    id: "pat3",
    name: "Pedro Almeida",
    cpf: "456.789.123-00",
    phone: "(11) 95555-7777",
    insurance: "SulAmérica",
    medicalHistory: "Colesterol alto",
    createdAt: new Date("2023-05-10"),
    appointments: [],
  },
];

// Mock Healthcare Professionals
export const professionals: HealthcareProfessional[] = [
  {
    id: "prof1",
    name: "Dra. Ana Silva",
    specialty: "Clínica Geral",
    appointments: [],
  },
  {
    id: "prof2",
    name: "Dr. Carlos Mendes",
    specialty: "Cardiologia",
    appointments: [],
  },
];

// Create dates for the next 30 days
const generateDates = (days: number) => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

// Generate time slots
const generateTimeSlots = () => {
  return [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30"
  ];
};

// Generate Mock Appointments
export const generateAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  const dates = generateDates(30);
  const timeSlots = generateTimeSlots();
  const statuses: Appointment["status"][] = ["scheduled", "completed", "cancelled", "no-show"];
  const paymentStatuses: Appointment["paymentStatus"][] = ["pending", "paid", "insurance"];
  
  // Generate some appointments
  let id = 1;
  for (let i = 0; i < 25; i++) {
    // Random selection
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const professional = professionals[Math.floor(Math.random() * professionals.length)];
    const dateIndex = Math.floor(Math.random() * dates.length);
    const date = dates[dateIndex];
    const time = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    
    const appointment: Appointment = {
      id: `app${id}`,
      patientId: patient.id,
      patientName: patient.name,
      professionalId: professional.id,
      date: date,
      time: time,
      status: status,
      notes: status === "completed" ? "Consulta realizada com sucesso." : "",
      symptoms: status === "completed" ? "Dor de cabeça, febre" : undefined,
      diagnosis: status === "completed" ? "Infecção viral" : undefined,
      prescriptions: status === "completed" ? ["Paracetamol 500mg", "Repouso"] : undefined,
      exams: status === "completed" ? ["Hemograma completo"] : undefined,
      paymentStatus: paymentStatus,
      paymentAmount: paymentStatus !== "pending" ? Math.floor(Math.random() * 300) + 100 : undefined,
    };
    
    appointments.push(appointment);
    id++;
  }
  
  // Sort appointments by date and time
  return appointments.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime() || a.time.localeCompare(b.time);
  });
};

// Mock Appointments
export const appointments = generateAppointments();

// Update patients and professionals with appointments
appointments.forEach(appointment => {
  const patient = patients.find(p => p.id === appointment.patientId);
  const professional = professionals.find(p => p.id === appointment.professionalId);
  
  if (patient) {
    patient.appointments.push(appointment);
  }
  
  if (professional) {
    professional.appointments.push(appointment);
  }
});

// Function to get available time slots for a specific date
export const getAvailableTimeSlots = (date: Date, professionalId: string): string[] => {
  const profAppointments = appointments.filter(
    app => app.professionalId === professionalId && 
    app.date.toDateString() === date.toDateString() &&
    app.status !== "cancelled"
  );
  
  const allTimeSlots = generateTimeSlots();
  const bookedTimes = profAppointments.map(app => app.time);
  
  return allTimeSlots.filter(time => !bookedTimes.includes(time));
};

// Initial mock data export
export const mockData = {
  users,
  patients,
  professionals,
  appointments,
  getAvailableTimeSlots,
};

export default mockData;
