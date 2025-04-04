
import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileTextIcon, ClipboardCheckIcon, PillIcon } from 'lucide-react';

const MedicalRecords: React.FC = () => {
  const { appointments, currentUser } = useApp();
  
  if (!currentUser) return null;
  
  // Filter appointments for the current patient
  const patientId = currentUser.profileId;
  const patientAppointments = appointments.filter(
    app => app.patientId === patientId && app.status === 'completed'
  );
  
  // Sort by date (most recent first)
  const sortedAppointments = [...patientAppointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Extract prescriptions and exams
  const allPrescriptions = sortedAppointments
    .flatMap(app => app.prescriptions || [])
    .filter((prescription, index, self) => self.indexOf(prescription) === index);
  
  const allExams = sortedAppointments
    .flatMap(app => app.exams || [])
    .filter((exam, index, self) => self.indexOf(exam) === index);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="consultations" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="consultations" className="flex items-center gap-1">
            <FileTextIcon className="h-4 w-4" />
            Consultas
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="flex items-center gap-1">
            <PillIcon className="h-4 w-4" />
            Prescrições
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-1">
            <ClipboardCheckIcon className="h-4 w-4" />
            Exames
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="consultations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Consultas</CardTitle>
              <CardDescription>
                Consultas realizadas e seus detalhes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Você ainda não realizou consultas.
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedAppointments.map(appointment => (
                    <div key={appointment.id} className="border-t pt-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                        <div>
                          <div className="font-medium">
                            <span className="text-medical-primary">Dr(a). </span>
                            {appointment.professionalId}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(appointment.date), "dd/MM/yyyy", { locale: pt })} • {appointment.time}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Sintomas</h4>
                          <p className="text-sm bg-gray-50 p-2 rounded-md min-h-[40px]">
                            {appointment.symptoms || "Nenhum sintoma registrado."}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Diagnóstico</h4>
                          <p className="text-sm bg-gray-50 p-2 rounded-md min-h-[40px]">
                            {appointment.diagnosis || "Nenhum diagnóstico registrado."}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Prescrições</h4>
                          {appointment.prescriptions?.length ? (
                            <ul className="list-disc list-inside text-sm bg-gray-50 p-2 rounded-md">
                              {appointment.prescriptions.map((prescription, i) => (
                                <li key={i}>{prescription}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm bg-gray-50 p-2 rounded-md">
                              Nenhuma prescrição registrada.
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Exames</h4>
                          {appointment.exams?.length ? (
                            <ul className="list-disc list-inside text-sm bg-gray-50 p-2 rounded-md">
                              {appointment.exams.map((exam, i) => (
                                <li key={i}>{exam}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm bg-gray-50 p-2 rounded-md">
                              Nenhum exame solicitado.
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Observações</h4>
                          <p className="text-sm bg-gray-50 p-2 rounded-md">
                            {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prescriptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescrições</CardTitle>
              <CardDescription>
                Medicações prescritas em suas consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allPrescriptions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Você não possui prescrições registradas.
                </div>
              ) : (
                <div className="space-y-2">
                  {allPrescriptions.map((prescription, index) => (
                    <div key={index} className="p-3 bg-white border rounded-md">
                      <div className="flex items-start gap-3">
                        <PillIcon className="h-5 w-5 text-medical-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{prescription}</p>
                          <p className="text-sm text-muted-foreground">
                            Prescrito em {format(
                              new Date(sortedAppointments.find(
                                app => app.prescriptions?.includes(prescription)
                              )?.date || new Date()),
                              "dd/MM/yyyy",
                              { locale: pt }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exams" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Exames</CardTitle>
              <CardDescription>
                Exames solicitados em suas consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allExams.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Você não possui exames registrados.
                </div>
              ) : (
                <div className="space-y-2">
                  {allExams.map((exam, index) => (
                    <div key={index} className="p-3 bg-white border rounded-md">
                      <div className="flex items-start gap-3">
                        <ClipboardCheckIcon className="h-5 w-5 text-medical-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{exam}</p>
                          <p className="text-sm text-muted-foreground">
                            Solicitado em {format(
                              new Date(sortedAppointments.find(
                                app => app.exams?.includes(exam)
                              )?.date || new Date()),
                              "dd/MM/yyyy",
                              { locale: pt }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalRecords;
