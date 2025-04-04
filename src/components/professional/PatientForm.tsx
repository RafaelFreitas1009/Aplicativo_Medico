
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Define form schema
const patientFormSchema = z.object({
  name: z.string().min(3, 'O nome precisa ter pelo menos 3 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  phone: z.string().min(10, 'Telefone inválido'),
  insurance: z.string().optional(),
  medicalHistory: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  onComplete?: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onComplete }) => {
  const { addPatient } = useApp();
  
  // Initialize form
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: '',
      cpf: '',
      phone: '',
      insurance: '',
      medicalHistory: '',
    },
  });
  
  // Form submission handler
  const onSubmit = (data: PatientFormValues) => {
    addPatient({
      name: data.name,
      cpf: data.cpf,
      phone: data.phone,
      insurance: data.insurance || '',
      medicalHistory: data.medicalHistory || '',
    });
    
    // Reset form
    form.reset();
    
    // Call completion callback if provided
    if (onComplete) {
      onComplete();
    }
  };
  
  // Format CPF as typing
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    
    form.setValue('cpf', value);
  };
  
  // Format phone as typing
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    if (value.length > 10) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    
    form.setValue('phone', value);
  };
  
  return (
    <div className="space-y-6 py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00" 
                      {...field}
                      onChange={handleCPFChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      {...field}
                      onChange={handlePhoneChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="insurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plano de Saúde (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do plano de saúde" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="medicalHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Histórico Médico (opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva o histórico médico relevante do paciente" 
                    className="min-h-24"
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
            <Button type="submit">
              Cadastrar Paciente
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PatientForm;
