
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from '@/context/AppContext';
import MyAppointments from './MyAppointments';
import BookAppointment from './BookAppointment';
import MedicalRecords from './MedicalRecords';

const PatientDashboard: React.FC = () => {
  const { currentUser, currentProfile } = useApp();
  const [activeTab, setActiveTab] = useState<string>("my-appointments");
  
  if (!currentUser || !currentProfile || currentUser.role !== 'patient') {
    return <div>Carregando perfil de paciente...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Área do Paciente</h2>
        <p className="text-gray-500">Bem-vindo(a), {currentProfile.name}</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-2xl grid grid-cols-3">
          <TabsTrigger value="my-appointments">Minhas Consultas</TabsTrigger>
          <TabsTrigger value="book">Agendar Consulta</TabsTrigger>
          <TabsTrigger value="records">Meu Prontuário</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="my-appointments" className="space-y-4">
            <MyAppointments />
          </TabsContent>
          
          <TabsContent value="book" className="space-y-4">
            <BookAppointment onAppointmentBooked={() => setActiveTab("my-appointments")} />
          </TabsContent>
          
          <TabsContent value="records" className="space-y-4">
            <MedicalRecords />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PatientDashboard;
