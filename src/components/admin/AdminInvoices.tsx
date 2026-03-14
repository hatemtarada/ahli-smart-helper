import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import ImageUpload from './ImageUpload';

const AdminInvoices = () => {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient_id: '',
    invoice_number: '',
    total_amount: '',
    paid_amount: '',
    due_date: '',
    status: 'unpaid',
    image_url: '',
  });

  const { data: patients } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('user_id, full_name, email');
      return data || [];
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('invoices').insert({
        patient_id: form.patient_id,
        invoice_number: form.invoice_number.trim(),
        total_amount: parseFloat(form.total_amount) || 0,
        paid_amount: parseFloat(form.paid_amount) || 0,
        due_date: form.due_date || null,
        status: form.status,
        image_url: form.image_url || '',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      setOpen(false);
      setForm({ patient_id: '', invoice_number: '', total_amount: '', paid_amount: '', due_date: '', status: 'unpaid', image_url: '' });
      toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added');
    },
    onError: () => toast.error(lang === 'ar' ? 'حدث خطأ' : 'Error'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-foreground">{lang === 'ar' ? 'الفواتير' : 'Invoices'} ({invoices?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 me-1" />{lang === 'ar' ? 'إضافة فاتورة' : 'Add Invoice'}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{lang === 'ar' ? 'إضافة فاتورة' : 'Add Invoice'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.patient_id} onValueChange={v => setForm(f => ({ ...f, patient_id: v }))}>
                <SelectTrigger><SelectValue placeholder={lang === 'ar' ? 'اختر المريض' : 'Select Patient'} /></SelectTrigger>
                <SelectContent>
                  {patients?.map((p: any) => (
                    <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder={lang === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'} value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} />
              <Input type="number" placeholder={lang === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'} value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} />
              <Input type="number" placeholder={lang === 'ar' ? 'المبلغ المدفوع' : 'Paid Amount'} value={form.paid_amount} onChange={e => setForm(f => ({ ...f, paid_amount: e.target.value }))} />
              <div>
                <label className="text-sm text-muted-foreground">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">{lang === 'ar' ? 'غير مدفوعة' : 'Unpaid'}</SelectItem>
                  <SelectItem value="partial">{lang === 'ar' ? 'مدفوعة جزئياً' : 'Partial'}</SelectItem>
                  <SelectItem value="paid">{lang === 'ar' ? 'مدفوعة' : 'Paid'}</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">{lang === 'ar' ? 'صورة الفاتورة' : 'Invoice Image'}</label>
                <ImageUpload value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} folder="invoices" />
              </div>
              <Button onClick={() => addMutation.mutate()} disabled={!form.patient_id || !form.invoice_number.trim() || addMutation.isPending} className="w-full">
                {addMutation.isPending ? '...' : (lang === 'ar' ? 'إضافة' : 'Add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {invoices?.map((inv: any) => (
          <div key={inv.id} className="bg-card rounded-lg border border-border p-3 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-3 flex-1 min-w-0">
              {inv.image_url && (
                <img src={inv.image_url} alt="" className="w-14 h-14 object-cover rounded-md border border-border" />
              )}
              <div>
                <p className="font-medium text-foreground text-sm">#{inv.invoice_number}</p>
                <p className="text-xs text-primary">{patients?.find((p: any) => p.user_id === inv.patient_id)?.full_name || inv.patient_id?.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'الإجمالي' : 'Total'}: {inv.total_amount} | {lang === 'ar' ? 'المدفوع' : 'Paid'}: {inv.paid_amount}
                </p>
                {inv.due_date && <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الاستحقاق' : 'Due'}: {inv.due_date}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={inv.status} onValueChange={v => updateStatus.mutate({ id: inv.id, status: v })}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">{lang === 'ar' ? 'غير مدفوعة' : 'Unpaid'}</SelectItem>
                  <SelectItem value="partial">{lang === 'ar' ? 'جزئية' : 'Partial'}</SelectItem>
                  <SelectItem value="paid">{lang === 'ar' ? 'مدفوعة' : 'Paid'}</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(inv.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {!invoices?.length && <p className="text-muted-foreground text-center py-8">{lang === 'ar' ? 'لا توجد فواتير' : 'No invoices'}</p>}
      </div>
    </div>
  );
};

export default AdminInvoices;
