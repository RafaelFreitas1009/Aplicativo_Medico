
import React from 'react';
import { useApp } from '@/context/AppContext';
import { Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon } from 'lucide-react';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ 
  appointment, 
  onClose, 
  showCancelButton = false,
  onCancel
}) => {
  const { currentUser, updateAppointment } = useApp();
  const isProfessional = currentUser?.role === 'professional';
  
  // States for editable fields (only for professionals)
  const [notes, setNotes] = React.useState(appointment.notes || '');
  const [symptoms, setSymptoms] = React.useState(appointment.symptoms || '');
  const [diagnosis, setDiagnosis] = React.useState(appointment.diagnosis || '');
  const [prescriptions, setPrescriptions] = React.useState(appointment.prescriptions?.join('\n') || '');
  const [exams, setExams] = React.useState(appointment.exams?.join('\n') || '');
  
  // Handle saving appointment changes
  const handleSaveChanges = () => {
    updateAppointment(appointment.id, {
      notes,
      symptoms,
      diagnosis,
      prescriptions: prescriptions ? prescriptions.split('\n').filter(p => p.trim()) : undefined,
      exams: exams ? exams.split('\n').filter(e => e.trim()) : undefined,
      status: 'completed'
    });
    toast.success("Consulta atualizada com sucesso");
    onClose();
  };
  
  // Handle completing appointment
  const handleCompleteAppointment = () => {
    updateAppointment(appointment.id, { status: 'completed' });
    toast.success("Consulta concluída com sucesso");
    onClose();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-sm text-muted-foreground">Paciente</h3>
          <p className="font-medium">{appointment.patientName}</p>
        </div>
        <div>
          <h3 className="font-medium text-sm text-muted-foreground">Profissional</h3>
          <p className="font-medium">Dr(a). {appointment.professionalId}</p>
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(appointment.date), "dd/MM/yyyy", { locale: pt })}</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
          <span>{appointment.time}</span>
        </div>
      </div>
      
      {isProfessional && appointment.status !== 'cancelled' && (
        <div className="space-y-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sintomas
            </label>
            <Textarea 
              value={symptoms} 
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Descreva os sintomas apresentados"
              disabled={appointment.status === 'cancelled' || appointment.status === 'no-show'}
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnóstico
            </label>
            <Textarea 
              value={diagnosis} 
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Diagnóstico do paciente"
              disabled={appointment.status === 'cancelled' || appointment.status === 'no-show'}
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescrições (uma por linha)
            </label>
            <Textarea 
              value={prescriptions} 
              onChange={(e) => setPrescriptions(e.target.value)}
              placeholder="Adicione prescrições (uma por linha)"
              disabled={appointment.status === 'cancelled' || appointment.status === 'no-show'}
              className="min-h-[120px]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exames (um por linha)
            </label>
            <Textarea 
              value={exams} 
              onChange={(e) => setExams(e.target.value)}
              placeholder="Adicione exames solicitados (um por linha)"
              disabled={appointment.status === 'cancelled' || appointment.status === 'no-show'}
              className="min-h-[120px]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione notas sobre a consulta"
              disabled={appointment.status === 'cancelled' || appointment.status === 'no-show'}
              className="min-h-[100px]"
            />
          </div>
        </div>
      )}
      
      {!isProfessional && appointment.status === 'completed' && (
        <div className="space-y-4 pt-4 border-t">
          {appointment.symptoms && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Sintomas</h3>
              <p className="bg-gray-50 p-2 rounded-md">{appointment.symptoms}</p>
            </div>
          )}
          
          {appointment.diagnosis && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Diagnóstico</h3>
              <p className="bg-gray-50 p-2 rounded-md">{appointment.diagnosis}</p>
            </div>
          )}
          
          {appointment.prescriptions?.length ? (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Prescrições</h3>
              <ul className="list-disc list-inside bg-gray-50 p-2 rounded-md">
                {appointment.prescriptions.map((prescription, i) => (
                  <li key={i}>{prescription}</li>
                ))}
              </ul>
            </div>
          ) : null}
          
          {appointment.exams?.length ? (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Exames</h3>
              <ul className="list-disc list-inside bg-gray-50 p-2 rounded-md">
                {appointment.exams.map((exam, i) => (
                  <li key={i}>{exam}</li>
                ))}
              </ul>
            </div>
          ) : null}
          
          {appointment.notes && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Observações</h3>
              <p className="bg-gray-50 p-2 rounded-md">{appointment.notes}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end gap-2 pt-4">
        {showCancelButton && onCancel && (
          <Button variant="destructive" onClick={onCancel}>
            Cancelar Consulta
          </Button>
        )}
        
        {isProfessional && appointment.status === 'scheduled' && (
          <Button variant="default" onClick={handleCompleteAppointment}>
            Marcar como Concluída
          </Button>
        )}
        
        {isProfessional && appointment.status === 'completed' && (
          <Button variant="default" onClick={handleSaveChanges}>
            Salvar Alterações
          </Button>
        )}
        
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default AppointmentDetails;
