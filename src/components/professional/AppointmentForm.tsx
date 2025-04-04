
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define form schema
const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  date: z.date({
    required_error: "Data é obrigatória",
  }),
  time: z.string().min(1, 'Horário é obrigatório'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  initialDate?: Date;
  initialPatientId?: string;
  onComplete?: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  initialDate = new Date(), 
  initialPatientId,
  onComplete 
}) => {
  const { patients, currentUser, getAvailableTimeSlots, addAppointment } = useApp();
  
  // Initialize form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: initialPatientId || '',
      date: initialDate,
      time: '',
      notes: '',
    },
  });
  
  // Watch date to update available time slots
  const selectedDate = form.watch('date');
  
  // Get available time slots
  const professionalId = currentUser?.profileId || '';
  const availableTimeSlots = getAvailableTimeSlots(selectedDate, professionalId);
  
  // Form submission handler
  const onSubmit = (data: AppointmentFormValues) => {
    const patient = patients.find(p => p.id === data.patientId);
    
    if (!patient) return;
    
    addAppointment({
      patientId: data.patientId,
      patientName: patient.name,
      professionalId,
      date: data.date,
      time: data.time,
      status: 'scheduled',
      notes: data.notes || '',
      paymentStatus: 'pending',
    });
    
    // Reset form
    form.reset();
    
    // Call completion callback if provided
    if (onComplete) {
      onComplete();
    }
  };
  
  return (
    <div className="space-y-6 py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                  disabled={!!initialPatientId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal flex justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: pt })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);
                            // Reset time when date changes
                            form.setValue('time', '');
                          }
                        }}
                        disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
                        initialFocus
                        locale={pt}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimeSlots.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Sem horários disponíveis
                        </SelectItem>
                      ) : (
                        availableTimeSlots.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Adicione observações sobre esta consulta..." 
                    className="min-h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2">
            {onComplete && (
              <Button type="button" variant="outline" onClick={onComplete}>
                Cancelar
              </Button>
            )}
            <Button 
              type="submit"
              disabled={!form.formState.isValid || availableTimeSlots.length === 0}
            >
              Agendar Consulta
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AppointmentForm;
