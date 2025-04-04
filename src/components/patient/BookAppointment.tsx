
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { CalendarIcon, ClockIcon } from 'lucide-react';

interface BookAppointmentProps {
  onAppointmentBooked?: () => void;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ onAppointmentBooked }) => {
  const { currentUser, professionals, getAvailableTimeSlots, addAppointment } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Get available time slots
  const availableTimeSlots = selectedDate && selectedProfessionalId 
    ? getAvailableTimeSlots(selectedDate, selectedProfessionalId) 
    : [];
  
  // Handle booking appointment
  const handleBookAppointment = () => {
    if (!currentUser || !selectedDate || !selectedProfessionalId || !selectedTime) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    const patientId = currentUser.profileId;
    const professional = professionals.find(p => p.id === selectedProfessionalId);
    
    if (!professional) {
      toast.error("Profissional não encontrado");
      return;
    }
    
    addAppointment({
      patientId,
      patientName: currentUser.name,
      professionalId: selectedProfessionalId,
      date: selectedDate,
      time: selectedTime,
      status: 'scheduled',
      notes: '',
      paymentStatus: 'pending',
    });
    
    // Reset form
    setSelectedDate(new Date());
    setSelectedProfessionalId('');
    setSelectedTime('');
    
    // Call completion callback if provided
    if (onAppointmentBooked) {
      onAppointmentBooked();
    }
  };
  
  // Function to get the date highlight
  const getDateHighlight = (date: Date) => {
    if (!selectedProfessionalId) return null;
    
    const hasSlots = getAvailableTimeSlots(date, selectedProfessionalId).length > 0;
    
    if (hasSlots) {
      return "bg-blue-50 rounded-md font-bold text-medical-primary";
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agendar Nova Consulta</CardTitle>
          <CardDescription>
            Selecione o profissional, data e horário para agendar sua consulta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional
                </label>
                <Select
                  value={selectedProfessionalId}
                  onValueChange={(value) => {
                    setSelectedProfessionalId(value);
                    setSelectedTime('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map(professional => (
                      <SelectItem key={professional.id} value={professional.id}>
                        Dr(a). {professional.name} • {professional.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <div className="border rounded-md p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime('');
                    }}
                    disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
                    locale={pt}
                    className="pointer-events-auto"
                    modifiersClassNames={{
                      selected: "bg-medical-primary text-white hover:bg-medical-primary hover:text-white",
                    }}
                    components={{
                      DayContent: ({ date }) => (
                        <div className={getDateHighlight(date)}>
                          {date.getDate()}
                        </div>
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horários Disponíveis
                </label>
                
                {selectedProfessionalId ? (
                  availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                      {availableTimeSlots.map(time => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
                          className="justify-start"
                        >
                          <ClockIcon className="h-3 w-3 mr-2" />
                          {time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 border rounded-md bg-gray-50">
                      <p className="text-muted-foreground">
                        {selectedDate
                          ? "Não há horários disponíveis para esta data"
                          : "Selecione uma data para ver os horários disponíveis"
                        }
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-32 border rounded-md bg-gray-50">
                    <p className="text-muted-foreground">
                      Selecione um profissional para ver os horários
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="w-full"
                  disabled={!selectedProfessionalId || !selectedDate || !selectedTime}
                  onClick={handleBookAppointment}
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Confirmar Agendamento
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookAppointment;
