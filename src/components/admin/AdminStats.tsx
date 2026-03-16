import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Calendar, TestTube, FileText, Stethoscope, Building2, Megaphone, MessageSquare } from 'lucide-react';

const AdminStats = () => {
  const { lang } = useI18n();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [appointments, doctors, departments, labTests, invoices, announcements, feedback, profiles] = await Promise.all([
        supabase.from('appointments').select('id, status', { count: 'exact', head: false }),
        supabase.from('doctors').select('id', { count: 'exact', head: true }),
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase.from('lab_tests').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('id, total_amount, paid_amount, status', { count: 'exact', head: false }),
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
        supabase.from('feedback').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const aptData = appointments.data || [];
      const pending = aptData.filter(a => a.status === 'pending').length;
      const confirmed = aptData.filter(a => a.status === 'confirmed').length;
      const completed = aptData.filter(a => a.status === 'completed').length;

      const invData = invoices.data || [];
      const totalRevenue = invData.reduce((s, i) => s + Number(i.total_amount || 0), 0);
      const paidRevenue = invData.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
      const unpaidInv = invData.filter(i => i.status === 'unpaid').length;

      return {
        patients: profiles.count || 0,
        doctors: doctors.count || 0,
        departments: departments.count || 0,
        totalAppointments: appointments.count || 0,
        pending, confirmed, completed,
        labTests: labTests.count || 0,
        totalInvoices: invoices.count || 0,
        totalRevenue, paidRevenue, unpaidInv,
        announcements: announcements.count || 0,
        feedback: feedback.count || 0,
      };
    },
  });

  if (!stats) return null;

  const cards = [
    { icon: Users, value: stats.patients, labelAr: 'مريض مسجل', labelEn: 'Registered Patients', color: 'text-blue-500' },
    { icon: Stethoscope, value: stats.doctors, labelAr: 'طبيب', labelEn: 'Doctors', color: 'text-emerald-500' },
    { icon: Building2, value: stats.departments, labelAr: 'قسم', labelEn: 'Departments', color: 'text-purple-500' },
    { icon: Calendar, value: stats.totalAppointments, labelAr: 'موعد', labelEn: 'Appointments', color: 'text-orange-500' },
    { icon: TestTube, value: stats.labTests, labelAr: 'فحص مخبري', labelEn: 'Lab Tests', color: 'text-pink-500' },
    { icon: FileText, value: stats.totalInvoices, labelAr: 'فاتورة', labelEn: 'Invoices', color: 'text-amber-500' },
    { icon: Megaphone, value: stats.announcements, labelAr: 'خبر', labelEn: 'News', color: 'text-teal-500' },
    { icon: MessageSquare, value: stats.feedback, labelAr: 'ملاحظة', labelEn: 'Feedback', color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Main stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 hover:shadow-card transition-shadow">
            <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
            <p className="text-2xl font-black text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground">{lang === 'ar' ? card.labelAr : card.labelEn}</p>
          </div>
        ))}
      </div>

      {/* Appointment breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {lang === 'ar' ? 'حالة المواعيد' : 'Appointment Status'}
          </h3>
          <div className="space-y-3">
            {[
              { labelAr: 'قيد الانتظار', labelEn: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
              { labelAr: 'مؤكد', labelEn: 'Confirmed', value: stats.confirmed, color: 'bg-blue-500' },
              { labelAr: 'مكتمل', labelEn: 'Completed', value: stats.completed, color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-foreground">{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{item.value}</span>
              </div>
            ))}
            {stats.totalAppointments > 0 && (
              <div className="pt-2 border-t border-border">
                <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                  {stats.pending > 0 && <div className="bg-yellow-500" style={{ width: `${(stats.pending / stats.totalAppointments) * 100}%` }} />}
                  {stats.confirmed > 0 && <div className="bg-blue-500" style={{ width: `${(stats.confirmed / stats.totalAppointments) * 100}%` }} />}
                  {stats.completed > 0 && <div className="bg-emerald-500" style={{ width: `${(stats.completed / stats.totalAppointments) * 100}%` }} />}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {lang === 'ar' ? 'ملخص الفواتير' : 'Invoice Summary'}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{lang === 'ar' ? 'إجمالي المبالغ' : 'Total Amount'}</span>
              <span className="text-sm font-bold text-foreground">₪{stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{lang === 'ar' ? 'المبالغ المدفوعة' : 'Paid Amount'}</span>
              <span className="text-sm font-bold text-emerald-600">₪{stats.paidRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{lang === 'ar' ? 'المبالغ المتبقية' : 'Outstanding'}</span>
              <span className="text-sm font-bold text-red-500">₪{(stats.totalRevenue - stats.paidRevenue).toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between">
              <span className="text-sm text-muted-foreground">{lang === 'ar' ? 'فواتير غير مدفوعة' : 'Unpaid Invoices'}</span>
              <span className="text-sm font-bold text-foreground">{stats.unpaidInv}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
