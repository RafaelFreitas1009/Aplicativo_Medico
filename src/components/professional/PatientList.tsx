
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import PatientForm from './PatientForm';
import PatientDetails from './PatientDetails';
import { Patient } from '@/types';
import { SearchIcon, UserIcon } from 'lucide-react';

const PatientList: React.FC = () => {
  const { patients } = useApp();
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(search.toLowerCase()) ||
    patient.cpf.includes(search) ||
    patient.phone.includes(search)
  );
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Lista de Pacientes
            </CardTitle>
            <CardDescription>Total de {patients.length} pacientes cadastrados</CardDescription>
          </div>
          <Button onClick={() => setShowAddPatient(true)}>
            Novo Paciente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, CPF ou telefone" 
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-4">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum paciente encontrado.
              </div>
            ) : (
              filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">CPF: {patient.cpf}</div>
                      <div className="text-sm text-muted-foreground">Tel: {patient.phone}</div>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {patient.insurance || "Particular"}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        Cadastrado em: {format(new Date(patient.createdAt), "dd/MM/yyyy", { locale: pt })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <PatientDetails 
              patient={selectedPatient} 
              onClose={() => setSelectedPatient(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Patient Dialog */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Paciente</DialogTitle>
          </DialogHeader>
          <PatientForm onComplete={() => setShowAddPatient(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientList;
