import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Building2, Stethoscope, Calendar, TestTube, FileText, MessageSquare, Plus, Trash2, LayoutDashboard, Megaphone, BarChart3 } from 'lucide-react';
import AdminLabTests from '@/components/admin/AdminLabTests';
import AdminInvoicesComponent from '@/components/admin/AdminInvoices';
import AdminAnnouncements from '@/components/admin/AdminAnnouncements';
import ImageUpload from '@/components/admin/ImageUpload';
import AdminStats from '@/components/admin/AdminStats';

const AdminDashboard = () => {
  const { t, lang } = useI18n();
  const { user, isAdmin, loading: authLoading } = useAuth();

  if (authLoading) return <div className="flex items-center justify-center min-h-[50vh]"><p>{t('common.loading')}</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-destructive font-bold">{lang === 'ar' ? 'ليس لديك صلاحية الوصول' : 'Access denied'}</p></div>;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" /> {t('admin.dashboard')}
        </h1>
        <Tabs defaultValue="stats" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="stats" className="gap-1"><BarChart3 className="w-4 h-4" />{lang === 'ar' ? 'الإحصائيات' : 'Statistics'}</TabsTrigger>
            <TabsTrigger value="departments" className="gap-1"><Building2 className="w-4 h-4" />{t('admin.manageDepartments')}</TabsTrigger>
            <TabsTrigger value="doctors" className="gap-1"><Stethoscope className="w-4 h-4" />{t('admin.manageDoctors')}</TabsTrigger>
            <TabsTrigger value="appointments" className="gap-1"><Calendar className="w-4 h-4" />{t('admin.manageAppointments')}</TabsTrigger>
            <TabsTrigger value="labtests" className="gap-1"><TestTube className="w-4 h-4" />{t('admin.manageLabTests')}</TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1"><FileText className="w-4 h-4" />{t('admin.manageInvoices')}</TabsTrigger>
            <TabsTrigger value="announcements" className="gap-1"><Megaphone className="w-4 h-4" />{lang === 'ar' ? 'الأخبار' : 'News'}</TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1"><MessageSquare className="w-4 h-4" />{t('admin.manageFeedback')}</TabsTrigger>
          </TabsList>
          <TabsContent value="stats"><AdminStats /></TabsContent>
          <TabsContent value="departments"><AdminDepartments /></TabsContent>
          <TabsContent value="doctors"><AdminDoctors /></TabsContent>
          <TabsContent value="appointments"><AdminAppointments /></TabsContent>
          <TabsContent value="labtests"><AdminLabTests /></TabsContent>
          <TabsContent value="invoices"><AdminInvoicesComponent /></TabsContent>
          <TabsContent value="announcements"><AdminAnnouncements /></TabsContent>
          <TabsContent value="feedback"><AdminFeedback /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const AdminDepartments = () => {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name_ar: '', name_en: '', description_ar: '', description_en: '', image_url: '' });

  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => {
      const { data } = await supabase.from('departments').select('*').order('created_at');
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('departments').insert({
        name_ar: form.name_ar.trim(),
        name_en: form.name_en.trim(),
        description_ar: form.description_ar.trim(),
        description_en: form.description_en.trim(),
        image_url: form.image_url || '',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      setOpen(false);
      setForm({ name_ar: '', name_en: '', description_ar: '', description_en: '', image_url: '' });
      toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added');
    },
    onError: () => toast.error(lang === 'ar' ? 'حدث خطأ' : 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-foreground">{lang === 'ar' ? 'الأقسام' : 'Departments'} ({departments?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 me-1" />{lang === 'ar' ? 'إضافة قسم' : 'Add Department'}</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{lang === 'ar' ? 'إضافة قسم' : 'Add Department'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder={lang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
              <Input placeholder={lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'} value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
              <Textarea placeholder={lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'} value={form.description_ar} onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} />
              <Textarea placeholder={lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} />
              <div>
                <label className="text-sm text-muted-foreground block mb-1">{lang === 'ar' ? 'صورة القسم' : 'Department Image'}</label>
                <ImageUpload value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} folder="departments" />
              </div>
              <Button onClick={() => addMutation.mutate()} disabled={!form.name_ar.trim() || addMutation.isPending} className="w-full">
                {addMutation.isPending ? '...' : (lang === 'ar' ? 'إضافة' : 'Add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {departments?.map((dept: any) => (
          <div key={dept.id} className="bg-card rounded-lg border border-border p-3 flex justify-between items-center">
            <div className="flex gap-3">
              {dept.image_url && <img src={dept.image_url} alt="" className="w-12 h-12 object-cover rounded-md border border-border" />}
              <div>
                <p className="font-medium text-foreground text-sm">{dept.name_ar}</p>
                <p className="text-xs text-muted-foreground">{dept.name_en}</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(dept.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDoctors = () => {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name_ar: '', name_en: '', specialty_ar: '', specialty_en: '', department_id: '', image_url: '' });

  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => {
      const { data } = await supabase.from('departments').select('*');
      return data || [];
    },
  });

  const { data: doctors } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*, departments(name_ar)').order('created_at');
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('doctors').insert({
        name_ar: form.name_ar.trim(),
        name_en: form.name_en.trim(),
        specialty_ar: form.specialty_ar.trim(),
        specialty_en: form.specialty_en.trim(),
        department_id: form.department_id || null,
        image_url: form.image_url || '',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setOpen(false);
      setForm({ name_ar: '', name_en: '', specialty_ar: '', specialty_en: '', department_id: '', image_url: '' });
      toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added');
    },
    onError: () => toast.error(lang === 'ar' ? 'حدث خطأ' : 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-foreground">{lang === 'ar' ? 'الأطباء' : 'Doctors'} ({doctors?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 me-1" />{lang === 'ar' ? 'إضافة طبيب' : 'Add Doctor'}</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{lang === 'ar' ? 'إضافة طبيب' : 'Add Doctor'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder={lang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
              <Input placeholder={lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'} value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
              <Input placeholder={lang === 'ar' ? 'التخصص (عربي)' : 'Specialty (Arabic)'} value={form.specialty_ar} onChange={e => setForm(f => ({ ...f, specialty_ar: e.target.value }))} />
              <Input placeholder={lang === 'ar' ? 'التخصص (إنجليزي)' : 'Specialty (English)'} value={form.specialty_en} onChange={e => setForm(f => ({ ...f, specialty_en: e.target.value }))} />
              <Select value={form.department_id} onValueChange={v => setForm(f => ({ ...f, department_id: v }))}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'القسم' : 'Department'} /></SelectTrigger>
                <SelectContent>
                  {departments?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name_ar}</SelectItem>)}
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">{lang === 'ar' ? 'صورة الطبيب' : 'Doctor Photo'}</label>
                <ImageUpload value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} folder="doctors" />
              </div>
              <Button onClick={() => addMutation.mutate()} disabled={!form.name_ar.trim() || addMutation.isPending} className="w-full">
                {addMutation.isPending ? '...' : (lang === 'ar' ? 'إضافة' : 'Add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {doctors?.map((doc: any) => (
          <div key={doc.id} className="bg-card rounded-lg border border-border p-3 flex justify-between items-center">
            <div className="flex gap-3">
              {doc.image_url && <img src={doc.image_url} alt="" className="w-12 h-12 object-cover rounded-full border border-border" />}
              <div>
                <p className="font-medium text-foreground text-sm">{doc.name_ar}</p>
                <p className="text-xs text-primary">{doc.specialty_ar}</p>
                <p className="text-xs text-muted-foreground">{doc.departments?.name_ar || ''}</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(doc.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminAppointments = () => {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const { data: appointments } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const { data } = await supabase.from('appointments').select('*, doctors(name_ar), profiles!appointments_patient_id_fkey(full_name)').order('appointment_date', { ascending: false });
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated');
    },
  });

  return (
    <div className="space-y-2">
      {appointments?.map((apt: any) => (
        <div key={apt.id} className="bg-card rounded-lg border border-border p-3 flex flex-wrap gap-3 justify-between items-center">
          <div>
            <p className="font-medium text-foreground text-sm">{apt.profiles?.full_name || apt.patient_id}</p>
            <p className="text-xs text-primary">{apt.doctors?.name_ar} - {apt.appointment_date} {apt.appointment_time}</p>
          </div>
          <Select value={apt.status} onValueChange={v => updateStatus.mutate({ id: apt.id, status: v })}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</SelectItem>
              <SelectItem value="confirmed">{lang === 'ar' ? 'مؤكد' : 'Confirmed'}</SelectItem>
              <SelectItem value="completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
              <SelectItem value="cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))
      }
      {!appointments?.length && <p className="text-muted-foreground text-center py-8">{lang === 'ar' ? 'لا توجد مواعيد' : 'No appointments'}</p>}
    </div>
  );
};

const AdminFeedback = () => {
  const { lang } = useI18n();
  const { data: feedback } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const typeLabel = (t: string) => {
    const map: Record<string, Record<string, string>> = {
      feedback: { ar: 'ملاحظة', en: 'Feedback' },
      complaint: { ar: 'شكوى', en: 'Complaint' },
      suggestion: { ar: 'اقتراح', en: 'Suggestion' },
    };
    return map[t]?.[lang] || t;
  };

  return (
    <div className="space-y-2">
      {feedback?.map((fb: any) => (
        <div key={fb.id} className="bg-card rounded-lg border border-border p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium text-foreground text-sm">{fb.patient_name || fb.patient_email || 'Anonymous'}</p>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{typeLabel(fb.type)}</span>
            </div>
            <span className="text-xs text-muted-foreground">{new Date(fb.created_at).toLocaleDateString()}</span>
          </div>
          {fb.subject && <p className="text-sm font-medium text-foreground">{fb.subject}</p>}
          <p className="text-sm text-muted-foreground mt-1">{fb.message}</p>
        </div>
      ))}
      {!feedback?.length && <p className="text-muted-foreground text-center py-8">{lang === 'ar' ? 'لا توجد ملاحظات' : 'No feedback'}</p>}
    </div>
  );
};

export default AdminDashboard;
