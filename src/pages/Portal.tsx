import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Calendar, FileText, TestTube, MessageSquare, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientPortal = () => {
  const { t, lang } = useI18n();
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return <div className="flex items-center justify-center min-h-[50vh]"><p>{t('common.loading')}</p></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">{t('nav.portal')}</h1>
        <Tabs defaultValue="appointments" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="appointments" className="gap-1"><Calendar className="w-4 h-4" />{t('portal.myAppointments')}</TabsTrigger>
            <TabsTrigger value="book" className="gap-1"><Plus className="w-4 h-4" />{t('common.bookAppointment')}</TabsTrigger>
            <TabsTrigger value="labtests" className="gap-1"><TestTube className="w-4 h-4" />{t('portal.myLabTests')}</TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1"><FileText className="w-4 h-4" />{t('portal.myInvoices')}</TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1"><MessageSquare className="w-4 h-4" />{t('portal.feedback')}</TabsTrigger>
            <TabsTrigger value="profile" className="gap-1"><User className="w-4 h-4" />{t('portal.profile')}</TabsTrigger>
          </TabsList>
          <TabsContent value="appointments"><AppointmentsList userId={user.id} /></TabsContent>
          <TabsContent value="book"><BookAppointment userId={user.id} /></TabsContent>
          <TabsContent value="labtests"><LabTestsList userId={user.id} /></TabsContent>
          <TabsContent value="invoices"><InvoicesList userId={user.id} /></TabsContent>
          <TabsContent value="feedback"><FeedbackForm userId={user.id} /></TabsContent>
          <TabsContent value="profile"><ProfileSection userId={user.id} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const AppointmentsList = ({ userId }: { userId: string }) => {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['my-appointments', userId],
    queryFn: async () => {
      const { data } = await supabase.from('appointments').select('*, doctors(name_ar, name_en, specialty_ar), departments(name_ar, name_en)').eq('patient_id', userId).order('appointment_date', { ascending: false });
      return data || [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success(lang === 'ar' ? 'تم إلغاء الموعد' : 'Appointment cancelled');
    },
  });

  if (isLoading) return <p className="text-muted-foreground">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>;

  const statusLabel = (s: string) => {
    const map: Record<string, Record<string, string>> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      confirmed: { ar: 'مؤكد', en: 'Confirmed' },
      cancelled: { ar: 'ملغي', en: 'Cancelled' },
      completed: { ar: 'مكتمل', en: 'Completed' },
    };
    return map[s]?.[lang] || s;
  };

  return (
    <div className="space-y-4">
      {appointments?.length === 0 && <p className="text-muted-foreground text-center py-8">{lang === 'ar' ? 'لا توجد مواعيد' : 'No appointments'}</p>}
      {appointments?.map((apt: any) => (
        <div key={apt.id} className="bg-card rounded-xl shadow-card border border-border p-4 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p className="font-bold text-foreground">{apt.doctors?.name_ar || ''}</p>
            <p className="text-sm text-primary">{apt.doctors?.specialty_ar || ''}</p>
            <p className="text-sm text-muted-foreground">{apt.appointment_date} - {apt.appointment_time}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${apt.status === 'confirmed' ? 'bg-accent/20 text-accent' : apt.status === 'cancelled' ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>
              {statusLabel(apt.status)}
            </span>
            {apt.status === 'pending' && (
              <Button size="sm" variant="destructive" onClick={() => cancelMutation.mutate(apt.id)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const BookAppointment = ({ userId }: { userId: string }) => {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [deptId, setDeptId] = useState('');
  const [docId, setDocId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const { data: departments } = useQuery({
    queryKey: ['departments-booking'],
    queryFn: async () => {
      const { data } = await supabase.from('departments').select('*').eq('is_active', true);
      return data || [];
    },
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors-booking', deptId],
    queryFn: async () => {
      let q = supabase.from('doctors').select('*').eq('is_active', true);
      if (deptId) q = q.eq('department_id', deptId);
      const { data } = await q;
      return data || [];
    },
    enabled: step >= 2,
  });

  const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];

  const bookMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('appointments').insert({
        patient_id: userId,
        doctor_id: docId,
        department_id: deptId || null,
        appointment_date: date,
        appointment_time: time,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success(t('booking.success'));
      setStep(1);
      setDeptId('');
      setDocId('');
      setDate('');
      setTime('');
    },
    onError: () => toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred'),
  });

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-6">
        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{s}</div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">{t('booking.chooseDepartment')}</h3>
            <Select value={deptId} onValueChange={(v) => { setDeptId(v); setStep(2); }}>
              <SelectTrigger><SelectValue placeholder={t('booking.chooseDepartment')} /></SelectTrigger>
              <SelectContent>
                {departments?.map(d => (
                  <SelectItem key={d.id} value={d.id}>{lang === 'ar' ? d.name_ar : d.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => setStep(2)}>{lang === 'ar' ? 'تخطي - عرض جميع الأطباء' : 'Skip - Show all doctors'}</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">{t('booking.chooseDoctor')}</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {doctors?.map(doc => (
                <button key={doc.id} onClick={() => { setDocId(doc.id); setStep(3); }} className={`w-full text-start p-3 rounded-lg border transition-colors ${docId === doc.id ? 'border-primary bg-secondary' : 'border-border hover:bg-muted'}`}>
                  <p className="font-medium text-foreground text-sm">{doc.name_ar}</p>
                  <p className="text-xs text-primary">{doc.specialty_ar}</p>
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setStep(1)}>{t('common.back')}</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">{t('booking.chooseDate')}</h3>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            {date && (
              <>
                <h3 className="font-bold text-foreground">{t('booking.chooseTime')}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {times.map(t => (
                    <button key={t} onClick={() => { setTime(t); setStep(4); }} className={`p-2 text-sm rounded-lg border transition-colors ${time === t ? 'border-primary bg-secondary' : 'border-border hover:bg-muted'}`}>{t}</button>
                  ))}
                </div>
              </>
            )}
            <Button variant="outline" onClick={() => setStep(2)}>{t('common.back')}</Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">{t('booking.confirm')}</h3>
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p><span className="font-medium">{lang === 'ar' ? 'الطبيب: ' : 'Doctor: '}</span>{doctors?.find(d => d.id === docId)?.name_ar}</p>
              <p><span className="font-medium">{lang === 'ar' ? 'التاريخ: ' : 'Date: '}</span>{date}</p>
              <p><span className="font-medium">{lang === 'ar' ? 'الوقت: ' : 'Time: '}</span>{time}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending} className="flex-1">
                {bookMutation.isPending ? t('common.loading') : t('booking.confirm')}
              </Button>
              <Button variant="outline" onClick={() => setStep(3)}>{t('common.back')}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LabTestsList = ({ userId }: { userId: string }) => {
  const { lang } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ['my-labtests', userId],
    queryFn: async () => {
      const { data } = await supabase.from('lab_tests').select('*').eq('patient_id', userId).order('test_date', { ascending: false });
      return data || [];
    },
  });

  if (isLoading) return <p className="text-muted-foreground">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>;
  if (!data?.length) return <p className="text-muted-foreground text-center py-8">{lang === 'ar' ? 'لا توجد فحوصات' : 'No lab tests'}</p>;

  return (
    <div className="space-y-4">
      {data.map((test: any) => (
        <div key={test.id} className="bg-card rounded-xl shadow-card border border-border p-4">
          <p className="font-bold text-foreground">{test.test_name_ar}</p>
          <p className="text-sm text-muted-foreground">{test.test_date}</p>
          <p className="text-sm text-primary">{test.status === 'completed' ? (lang === 'ar' ? 'مكتمل' : 'Completed') : (lang === 'ar' ? 'قيد الانتظار' : 'Pending')}</p>
          {test.result && <p className="text-sm text-foreground mt-2 bg-muted p-2 rounded">{test.result}</p>}
        </div>
      ))}
    </div>
  );
};

const InvoicesList = ({ userId }: { userId: string }) => {
  const { lang } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ['my-invoices', userId],
    queryFn: async () => {
      const { data } = await supabase.from('invoices').select('*').eq('patient_id', userId).order('created_at', { ascending: false });
      return data || [];
    },
  });

  if (isLoading) return <p className="text-muted-foreground">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>;
  if (!data?.length) return <p className="text-muted-foreground text-center py-8">{lang === 'ar' ? 'لا توجد فواتير' : 'No invoices'}</p>;

  return (
    <div className="space-y-4">
      {data.map((inv: any) => (
        <div key={inv.id} className="bg-card rounded-xl shadow-card border border-border p-4 flex justify-between items-center">
          <div>
            <p className="font-bold text-foreground">#{inv.invoice_number}</p>
            <p className="text-sm text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-end">
            <p className="font-bold text-foreground">₪{inv.total_amount}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${inv.status === 'paid' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}`}>
              {inv.status === 'paid' ? (lang === 'ar' ? 'مدفوع' : 'Paid') : (lang === 'ar' ? 'غير مدفوع' : 'Unpaid')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const FeedbackForm = ({ userId }: { userId: string }) => {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ subject: '', message: '', type: 'feedback' as string });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        patient_id: userId,
        subject: form.subject.trim().slice(0, 200),
        message: form.message.trim().slice(0, 1000),
        type: form.type,
      });
      if (error) throw error;
      toast.success(lang === 'ar' ? 'تم إرسال ملاحظتك بنجاح!' : 'Feedback submitted!');
      setForm({ subject: '', message: '', type: 'feedback' });
    } catch {
      toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-card rounded-xl shadow-card border border-border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="feedback">{lang === 'ar' ? 'ملاحظة' : 'Feedback'}</SelectItem>
              <SelectItem value="complaint">{lang === 'ar' ? 'شكوى' : 'Complaint'}</SelectItem>
              <SelectItem value="suggestion">{lang === 'ar' ? 'اقتراح' : 'Suggestion'}</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder={t('contact.subject')} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} maxLength={200} />
          <Textarea placeholder={t('contact.message')} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} maxLength={1000} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading') : t('common.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
};

const ProfileSection = ({ userId }: { userId: string }) => {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      return data;
    },
  });

  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [editing, setEditing] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('profiles').update({
        full_name: form.full_name.trim().slice(0, 100),
        phone: form.phone.trim().slice(0, 20),
      }).eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated');
      setEditing(false);
    },
  });

  if (isLoading) return <p>{t('common.loading')}</p>;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-4">
        {!editing ? (
          <>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.name')}</p>
              <p className="font-medium text-foreground">{profile?.full_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.email')}</p>
              <p className="font-medium text-foreground">{profile?.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.phone')}</p>
              <p className="font-medium text-foreground">{profile?.phone || '-'}</p>
            </div>
            <Button onClick={() => { setForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' }); setEditing(true); }}>{t('common.edit')}</Button>
          </>
        ) : (
          <>
            <Input placeholder={t('common.name')} value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} maxLength={100} />
            <Input placeholder={t('common.phone')} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={20} />
            <div className="flex gap-2">
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>{t('common.save')}</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientPortal;
