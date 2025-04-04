
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppointmentDetails from '../shared/AppointmentDetails';
import { Appointment } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ClockIcon } from 'lucide-react';

const MyAppointments: React.FC = () => {
  const { appointments, currentUser, cancelAppointment } = useApp();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  if (!currentUser) return null;
  
  // Filter appointments for the current patient
  const patientId = currentUser.profileId;
  const patientAppointments = appointments.filter(
    app => app.patientId === patientId
  );
  
  // Separate appointments by status
  const upcomingAppointments = patientAppointments.filter(
    app => app.status === 'scheduled' && new Date(app.date) >= new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastAppointments = patientAppointments.filter(
    app => app.status === 'completed' || app.status === 'cancelled' || app.status === 'no-show' || 
    (app.status === 'scheduled' && new Date(app.date) < new Date())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Handle appointment cancellation
  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointment(appointmentId);
    setSelectedAppointment(null);
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full max-w-xs grid grid-cols-2">
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="past">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Consultas</CardTitle>
              <CardDescription>
                {upcomingAppointments.length} 
                {upcomingAppointments.length === 1 ? ' consulta agendada' : ' consultas agendadas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Você não tem consultas agendadas.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map(appointment => (
                    <div 
                      key={appointment.id}
                      className="p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-l-medical-primary"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <div className="font-medium">
                            <span className="text-medical-primary">Dr(a). </span>
                            {appointment.professionalId}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {format(new Date(appointment.date), "dd/MM/yyyy", { locale: pt })}
                            <span className="mx-1">•</span>
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge>Confirmada</Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelAppointment(appointment.id);
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Consultas</CardTitle>
              <CardDescription>
                {pastAppointments.length} 
                {pastAppointments.length === 1 ? ' consulta realizada' : ' consultas realizadas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Você ainda não realizou consultas.
                </div>
              ) : (
                <div className="space-y-4">
                  {pastAppointments.map(appointment => (
                    <div 
                      key={appointment.id}
                      className={`p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                        appointment.status === 'cancelled' ? 'border-l-4 border-l-red-500 bg-red-50' : 
                        appointment.status === 'completed' ? 'border-l-4 border-l-green-500 bg-green-50' : 
                        'border-l-4 border-l-gray-500 bg-gray-50'
                      }`}
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <div className="font-medium">
                            <span className="text-medical-primary">Dr(a). </span>
                            {appointment.professionalId}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {format(new Date(appointment.date), "dd/MM/yyyy", { locale: pt })}
                            <span className="mx-1">•</span>
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                        <Badge variant={
                          appointment.status === 'completed' ? "success" :
                          appointment.status === 'cancelled' ? "destructive" :
                          appointment.status === 'no-show' ? "outline" :
                          "default"
                        }>
                          {appointment.status === 'completed' ? 'Concluída' :
                           appointment.status === 'cancelled' ? 'Cancelada' :
                           appointment.status === 'no-show' ? 'Não compareceu' :
                           'Agendada'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
              showCancelButton={selectedAppointment.status === 'scheduled' && new Date(selectedAppointment.date) >= new Date()}
              onCancel={() => handleCancelAppointment(selectedAppointment.id)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyAppointments;
