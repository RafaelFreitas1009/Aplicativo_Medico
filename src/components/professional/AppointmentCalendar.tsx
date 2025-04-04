import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { Appointment } from '@/types';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from 'lucide-react';
import { pt } from 'date-fns/locale';
import AppointmentForm from './AppointmentForm';
import AppointmentDetails from '../shared/AppointmentDetails';

const AppointmentCalendar: React.FC = () => {
  const { appointments, currentUser, professionals } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  
  const professionalId = currentUser?.profileId || '';
  const professionalAppointments = appointments.filter(
    app => app.professionalId === professionalId
  );
  
  const dayAppointments = professionalAppointments.filter(
    appointment => appointment.date.toDateString() === selectedDate.toDateString()
  );
  
  const sortedDayAppointments = [...dayAppointments].sort((a, b) => 
    a.time.localeCompare(b.time)
  );
  
  const getDateHighlight = (date: Date) => {
    const dateString = date.toDateString();
    const hasAppointments = professionalAppointments.some(
      app => app.date.toDateString() === dateString
    );
    
    if (!hasAppointments) return null;
    
    const hasConfirmed = professionalAppointments.some(
      app => app.date.toDateString() === dateString && app.status === 'scheduled'
    );
    
    if (hasConfirmed) {
      return "bg-blue-50 rounded-md font-bold text-medical-primary";
    }
    return "bg-gray-50 rounded-md";
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Calendário
            </CardTitle>
            <CardDescription>Selecione uma data para ver as consultas</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={pt}
              modifiersClassNames={{
                selected: "bg-medical-primary text-white hover:bg-medical-primary hover:text-white",
              }}
              modifiers={{
                booked: (date) => {
                  return professionalAppointments.some(
                    app => app.date.toDateString() === date.toDateString() && app.status === 'scheduled'
                  );
                },
              }}
              styles={{
                selected: { 
                  backgroundColor: '#0EA5E9', 
                  color: 'white',
                },
                outside: { opacity: 0.5 },
              }}
              components={{
                DayContent: ({ date }) => (
                  <div className={getDateHighlight(date)}>
                    {date.getDate()}
                  </div>
                ),
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Agenda do Dia: {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
              </CardTitle>
              <CardDescription>
                {sortedDayAppointments.length} 
                {sortedDayAppointments.length === 1 ? ' consulta' : ' consultas'} agendadas
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewAppointmentDialog(true)}>
              Nova Consulta
            </Button>
          </CardHeader>
          
          <CardContent>
            {sortedDayAppointments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Não há consultas agendadas para este dia.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDayAppointments.map(appointment => (
                  <div 
                    key={appointment.id}
                    className={`p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                      appointment.status === 'cancelled' ? 'border-l-4 border-l-red-500 bg-red-50' : 
                      appointment.status === 'completed' ? 'border-l-4 border-l-green-500 bg-green-50' : 
                      'border-l-4 border-l-medical-primary bg-blue-50'
                    }`}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{appointment.patientName}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" /> {appointment.time}
                        </div>
                      </div>
                      
                      <Badge variant={
                        appointment.status === 'scheduled' ? "default" :
                        appointment.status === 'completed' ? "success" :
                        appointment.status === 'cancelled' ? "destructive" : 
                        "outline"
                      }>
                        {appointment.status === 'scheduled' ? 'Agendada' :
                         appointment.status === 'completed' ? 'Concluída' :
                         appointment.status === 'cancelled' ? 'Cancelada' :
                         appointment.status === 'no-show' ? 'Não compareceu' : 
                         ''}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
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
      
      <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Consulta</DialogTitle>
          </DialogHeader>
          <AppointmentForm 
            initialDate={selectedDate} 
            onComplete={() => setShowNewAppointmentDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;
