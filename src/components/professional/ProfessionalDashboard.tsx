
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientList from './PatientList';
import AppointmentCalendar from './AppointmentCalendar';
import PatientForm from './PatientForm';
import FinancialOverview from './FinancialOverview';
import { useApp } from '@/context/AppContext';

const ProfessionalDashboard: React.FC = () => {
  const { currentUser, currentProfile } = useApp();
  const [activeTab, setActiveTab] = useState<string>("calendar");
  
  if (!currentUser || !currentProfile || currentUser.role !== 'professional') {
    return <div>Carregando perfil profissional...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Profissional</h2>
          <p className="text-gray-500">{currentProfile.name} • {(currentProfile as any).specialty}</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-2xl grid grid-cols-4">
          <TabsTrigger value="calendar">Agenda</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="new-patient">Novo Paciente</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="calendar" className="space-y-4">
            <AppointmentCalendar />
          </TabsContent>
          
          <TabsContent value="patients" className="space-y-4">
            <PatientList />
          </TabsContent>
          
          <TabsContent value="new-patient" className="space-y-4">
            <PatientForm />
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            <FinancialOverview />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProfessionalDashboard;
