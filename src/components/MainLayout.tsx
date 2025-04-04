
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfessionalDashboard from '@/components/professional/ProfessionalDashboard';
import PatientDashboard from '@/components/patient/PatientDashboard';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { CalendarIcon, UserIcon } from 'lucide-react';
import ChatbotMedico from './shared/ChatbotMedico';

const MainLayout: React.FC = () => {
  const { currentUser, switchRole, logout } = useApp();
  
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-medical-primary">
                Médico Conectado
              </h1>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-sm text-gray-600 mr-4">
              Olá, <span className="font-medium">{currentUser.name}</span>
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => switchRole(currentUser.role === 'professional' ? 'patient' : 'professional')}
            >
              Alternar para {currentUser.role === 'professional' ? 'Paciente' : 'Profissional'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <div className="bg-white shadow rounded-lg p-6">
          <Tabs defaultValue={currentUser.role} className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="professional" onClick={() => switchRole('professional')} className="flex gap-2 items-center">
                  <UserIcon className="h-4 w-4" />
                  Profissional
                </TabsTrigger>
                <TabsTrigger value="patient" onClick={() => switchRole('patient')} className="flex gap-2 items-center">
                  <CalendarIcon className="h-4 w-4" />
                  Paciente
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="professional" className="space-y-4">
              <ProfessionalDashboard />
            </TabsContent>
            
            <TabsContent value="patient" className="space-y-4">
              <PatientDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 Médico Conectado. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Adicionar o Chatbot Médico */}
      <ChatbotMedico />
    </div>
  );
};

const LoginView: React.FC = () => {
  const { login } = useApp();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-medical-primary mb-2">Médico Conectado</h1>
          <p className="text-gray-500">Gerenciamento de consultas médicas</p>
        </div>
        
        <div className="space-y-4 pt-4">
          <h2 className="text-center text-xl font-medium text-gray-900">Selecione um perfil para demonstração</h2>
          
          <Button 
            onClick={() => login("user1")} 
            className="w-full flex items-center justify-center gap-2 py-5"
          >
            <UserIcon className="h-5 w-5" />
            Entrar como Profissional
          </Button>
          
          <Button 
            onClick={() => login("user2")} 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 py-5"
          >
            <CalendarIcon className="h-5 w-5" />
            Entrar como Paciente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
