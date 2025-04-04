
import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowLeftIcon, ArrowRightIcon, BarChart3Icon, DollarSignIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const FinancialOverview: React.FC = () => {
  const { appointments, currentUser } = useApp();
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(new Date());

  // Get appointments for the current professional
  const professionalId = currentUser?.profileId || '';
  const professionalAppointments = appointments.filter(
    app => app.professionalId === professionalId
  );

  // Get start and end of selected month
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  // Filter appointments for selected month
  const monthAppointments = professionalAppointments.filter(
    app => {
      const appDate = new Date(app.date);
      return appDate >= monthStart && appDate <= monthEnd;
    }
  );

  // Calculate financial data
  const completedAppointments = monthAppointments.filter(app => app.status === 'completed');
  const totalRevenue = completedAppointments.reduce(
    (total, app) => total + (app.paymentAmount || 0), 0
  );

  // Group by payment status
  const paymentStatusCount = {
    paid: completedAppointments.filter(app => app.paymentStatus === 'paid').length,
    pending: completedAppointments.filter(app => app.paymentStatus === 'pending').length,
    insurance: completedAppointments.filter(app => app.paymentStatus === 'insurance').length,
  };
  
  // Format data for the chart
  const chartData = [
    { name: 'Pago', value: paymentStatusCount.paid, color: 'rgba(34, 197, 94, 0.6)' },
    { name: 'Pendente', value: paymentStatusCount.pending, color: 'rgba(245, 158, 11, 0.6)' },
    { name: 'Convênio', value: paymentStatusCount.insurance, color: 'rgba(59, 130, 246, 0.6)' },
  ];

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setSelectedMonth(prevMonth => addMonths(prevMonth, -1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setSelectedMonth(prevMonth => addMonths(prevMonth, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg font-semibold">
          Visão Financeira - {format(selectedMonth, "MMMM 'de' yyyy", { locale: pt })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base">Total de Consultas</CardTitle>
              <CardDescription>No mês selecionado</CardDescription>
            </div>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedAppointments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base">Receita Total</CardTitle>
              <CardDescription>No mês selecionado</CardDescription>
            </div>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base">Valor Médio</CardTitle>
              <CardDescription>Por consulta</CardDescription>
            </div>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {completedAppointments.length > 0 
                ? (totalRevenue / completedAppointments.length).toFixed(2).replace('.', ',')
                : '0,00'
              }
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status de Pagamento</CardTitle>
            <CardDescription>Distribuição por tipo de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            {completedAppointments.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Sem dados de pagamento para o período selecionado
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Pagamentos Pendentes</CardTitle>
            <CardDescription>Lista de pagamentos a receber</CardDescription>
          </CardHeader>
          <CardContent>
            {monthAppointments.filter(app => app.paymentStatus === 'pending').length > 0 ? (
              <div className="space-y-4">
                {monthAppointments
                  .filter(app => app.paymentStatus === 'pending')
                  .map(app => (
                    <div key={app.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-medium">{app.patientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(app.date), "dd/MM/yyyy", { locale: pt })} • {app.time}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-medical-primary">
                          {app.paymentAmount 
                            ? `R$ ${app.paymentAmount.toFixed(2).replace('.', ',')}`
                            : 'Valor não definido'
                          }
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Não há pagamentos pendentes para este mês
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
