
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Patient, Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppointmentDetails from '../shared/AppointmentDetails';
import AppointmentForm from './AppointmentForm';
import { ClockIcon, CalendarIcon, FileTextIcon } from 'lucide-react';

interface PatientDetailsProps {
  patient: Patient;
  onClose: () => void;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, onClose }) => {
  const { appointments } = useApp();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  
  // Get patient's appointments
  const patientAppointments = appointments.filter(app => app.patientId === patient.id);
  
  // Sort appointments by date (most recent first)
  const sortedAppointments = [...patientAppointments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-sm text-muted-foreground">Nome</h3>
          <p className="font-medium">{patient.name}</p>
        </div>
        <div>
          <h3 className="font-medium text-sm text-muted-foreground">CPF</h3>
          <p>{patient.cpf}</p>
        </div>
        <div>
          <h3 className="font-medium text-sm text-muted-foreground">Telefone</h3>
          <p>{patient.phone}</p>
        </div>
        <div>
          <h3 className="font-medium text-sm text-muted-foreground">Plano de Saúde</h3>
          <p>{patient.insurance || "Particular"}</p>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium text-sm text-muted-foreground">Histórico Médico</h3>
        <p className="border p-3 rounded-md bg-gray-50 min-h-[60px]">{patient.medicalHistory || "Nenhum histórico registrado."}</p>
      </div>
      
      <Tabs defaultValue="appointments">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appointments" className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            Consultas
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-1">
            <FileTextIcon className="h-4 w-4" />
            Prontuário
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Histórico de Consultas</h3>
            <Button size="sm" onClick={() => setShowNewAppointment(true)}>
              Nova Consulta
            </Button>
          </div>
          
          {sortedAppointments.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Nenhuma consulta registrada.</p>
          ) : (
            <div className="space-y-3">
              {sortedAppointments.map(appointment => (
                <div 
                  key={appointment.id}
                  className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                    appointment.status === 'cancelled' ? 'border-l-4 border-l-red-500' : 
                    appointment.status === 'completed' ? 'border-l-4 border-l-green-500' : 
                    'border-l-4 border-l-medical-primary'
                  }`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(appointment.date), "dd/MM/yyyy", { locale: pt })}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {appointment.time}
                      </div>
                    </div>
                    <div className="text-sm">
                      {appointment.status === 'scheduled' && 'Agendada'}
                      {appointment.status === 'completed' && 'Concluída'}
                      {appointment.status === 'cancelled' && 'Cancelada'}
                      {appointment.status === 'no-show' && 'Não compareceu'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="records" className="pt-4">
          <div className="text-muted-foreground text-center p-6 border rounded-md">
            Os registros completos do prontuário estão disponíveis na versão completa do sistema.
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
      
      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog 
          open={!!selectedAppointment} 
          onOpenChange={(open) => !open && setSelectedAppointment(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Consulta</DialogTitle>
            </DialogHeader>
            <AppointmentDetails 
              appointment={selectedAppointment}
              onClose={() => setSelectedAppointment(null)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* New Appointment Dialog */}
      <Dialog 
        open={showNewAppointment} 
        onOpenChange={setShowNewAppointment}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Consulta para {patient.name}</DialogTitle>
          </DialogHeader>
          <AppointmentForm 
            initialPatientId={patient.id}
            onComplete={() => setShowNewAppointment(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDetails;
