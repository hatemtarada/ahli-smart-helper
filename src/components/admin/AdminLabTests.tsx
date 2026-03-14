import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const AdminLabTests = () => {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient_id: '',
    test_name_ar: '',
    test_name_en: '',
    test_date: '',
    result: '',
    result_date: '',
    status: 'pending',
    notes: '',
  });

  const { data: patients } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('user_id, full_name, email');
      return data || [];
    },
  });

  const { data: labTests } = useQuery({
    queryKey: ['admin-labtests'],
    queryFn: async () => {
      const { data } = await supabase.from('lab_tests').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('lab_tests').insert({
        patient_id: form.patient_id,
        test_name_ar: form.test_name_ar.trim(),
        test_name_en: form.test_name_en.trim(),
        test_date: form.test_date || new Date().toISOString().split('T')[0],
        result: form.result.trim() || null,
        result_date: form.result_date || null,
        status: form.status,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-labtests'] });
      setOpen(false);
      setForm({ patient_id: '', test_name_ar: '', test_name_en: '', test_date: '', result: '', result_date: '', status: 'pending', notes: '' });
      toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added');
    },
    onError: () => toast.error(lang === 'ar' ? 'حدث خطأ' : 'Error'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('lab_tests').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-labtests'] });
      toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lab_tests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-labtests'] });
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    },
  });

  const statusLabel = (s: string) => {
    const map: Record<string, Record<string, string>> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      in_progress: { ar: 'جارٍ', en: 'In Progress' },
      completed: { ar: 'مكتمل', en: 'Completed' },
    };
    return map[s]?.[lang] || s;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-foreground">{lang === 'ar' ? 'الفحوصات المخبرية' : 'Lab Tests'} ({labTests?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 me-1" />{lang === 'ar' ? 'إضافة فحص' : 'Add Test'}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{lang === 'ar' ? 'إضافة فحص مخبري' : 'Add Lab Test'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.patient_id} onValueChange={v => setForm(f => ({ ...f, patient_id: v }))}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر المريض' : 'Select Patient'} /></SelectTrigger>
                <SelectContent>
                  {patients?.map((p: any) => (
                    <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder={lang === 'ar' ? 'اسم الفحص (عربي)' : 'Test Name (Arabic)'} value={form.test_name_ar} onChange={e => setForm(f => ({ ...f, test_name_ar: e.target.value }))} />
              <Input placeholder={lang === 'ar' ? 'اسم الفحص (إنجليزي)' : 'Test Name (English)'} value={form.test_name_en} onChange={e => setForm(f => ({ ...f, test_name_en: e.target.value }))} />
              <div>
                <label className="text-sm text-muted-foreground">{lang === 'ar' ? 'تاريخ الفحص' : 'Test Date'}</label>
                <Input type="date" value={form.test_date} onChange={e => setForm(f => ({ ...f, test_date: e.target.value }))} />
              </div>
              <Textarea placeholder={lang === 'ar' ? 'النتيجة (اختياري)' : 'Result (optional)'} value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))} />
              <div>
                <label className="text-sm text-muted-foreground">{lang === 'ar' ? 'تاريخ النتيجة' : 'Result Date'}</label>
                <Input type="date" value={form.result_date} onChange={e => setForm(f => ({ ...f, result_date: e.target.value }))} />
              </div>
              <Textarea placeholder={lang === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)'} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <Button onClick={() => addMutation.mutate()} disabled={!form.patient_id || !form.test_name_ar.trim() || addMutation.isPending} className="w-full">
                {addMutation.isPending ? '...' : (lang === 'ar' ? 'إضافة' : 'Add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {labTests?.map((test: any) => (
          <div key={test.id} className="bg-card rounded-lg border border-border p-3 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{test.test_name_ar}</p>
              <p className="text-xs text-muted-foreground">{test.test_name_en}</p>
              <p className="text-xs text-primary">{test.profiles?.full_name || test.patient_id?.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">{test.test_date}</p>
              {test.result && <p className="text-xs text-accent-foreground mt-1">📋 {test.result}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Select value={test.status} onValueChange={v => updateStatus.mutate({ id: test.id, status: v })}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{lang === 'ar' ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                  <SelectItem value="in_progress">{lang === 'ar' ? 'جارٍ' : 'In Progress'}</SelectItem>
                  <SelectItem value="completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(test.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {!labTests?.length && <p className="text-muted-foreground text-center py-8">{lang === 'ar' ? 'لا توجد فحوصات' : 'No lab tests'}</p>}
      </div>
    </div>
  );
};

export default AdminLabTests;
