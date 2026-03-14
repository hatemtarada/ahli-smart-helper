import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, Megaphone } from 'lucide-react';
import ImageUpload from './ImageUpload';

const AdminAnnouncements = () => {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title_ar: '',
    title_en: '',
    content_ar: '',
    content_en: '',
    image_url: '',
    is_active: true,
    priority: 0,
  });

  const { data: announcements } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data } = await supabase.from('announcements').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false });
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('announcements').insert({
        title_ar: form.title_ar.trim(),
        title_en: form.title_en.trim(),
        content_ar: form.content_ar.trim(),
        content_en: form.content_en.trim(),
        image_url: form.image_url || '',
        is_active: form.is_active,
        priority: form.priority,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setOpen(false);
      setForm({ title_ar: '', title_en: '', content_ar: '', content_en: '', image_url: '', is_active: true, priority: 0 });
      toast.success(lang === 'ar' ? 'تمت الإضافة' : 'Added');
    },
    onError: () => toast.error(lang === 'ar' ? 'حدث خطأ' : 'Error'),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('announcements').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success(lang === 'ar' ? 'تم التحديث' : 'Updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-foreground">{lang === 'ar' ? 'الأخبار والإعلانات' : 'News & Announcements'} ({announcements?.length || 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 me-1" />{lang === 'ar' ? 'إضافة خبر' : 'Add News'}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{lang === 'ar' ? 'إضافة خبر / إعلان' : 'Add News / Announcement'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder={lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'} value={form.title_ar} onChange={e => setForm(f => ({ ...f, title_ar: e.target.value }))} />
              <Input placeholder={lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} value={form.title_en} onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))} />
              <Textarea placeholder={lang === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'} value={form.content_ar} onChange={e => setForm(f => ({ ...f, content_ar: e.target.value }))} rows={4} />
              <Textarea placeholder={lang === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'} value={form.content_en} onChange={e => setForm(f => ({ ...f, content_en: e.target.value }))} rows={4} />
              <div>
                <label className="text-sm text-muted-foreground block mb-1">{lang === 'ar' ? 'صورة الخبر' : 'News Image'}</label>
                <ImageUpload value={form.image_url} onChange={url => setForm(f => ({ ...f, image_url: url }))} folder="announcements" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">{lang === 'ar' ? 'الأولوية' : 'Priority'}</label>
                <Input type="number" className="w-20" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">{lang === 'ar' ? 'نشط' : 'Active'}</label>
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              </div>
              <Button onClick={() => addMutation.mutate()} disabled={!form.title_ar.trim() || addMutation.isPending} className="w-full">
                {addMutation.isPending ? '...' : (lang === 'ar' ? 'إضافة' : 'Add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {announcements?.map((ann: any) => (
          <div key={ann.id} className="bg-card rounded-lg border border-border p-4">
            <div className="flex gap-3">
              {ann.image_url && <img src={ann.image_url} alt="" className="w-20 h-20 object-cover rounded-md border border-border flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground text-sm flex items-center gap-1">
                      <Megaphone className="w-3 h-3" /> {ann.title_ar}
                    </p>
                    {ann.title_en && <p className="text-xs text-muted-foreground">{ann.title_en}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={ann.is_active}
                      onCheckedChange={v => toggleActive.mutate({ id: ann.id, is_active: v })}
                    />
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(ann.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ann.content_ar}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ann.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {ann.is_active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!announcements?.length && <p className="text-muted-foreground text-center py-8">{lang === 'ar' ? 'لا توجد أخبار' : 'No announcements'}</p>}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
