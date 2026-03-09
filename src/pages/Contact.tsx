import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        patient_id: user?.id || null,
        patient_name: form.name.trim().slice(0, 100),
        patient_email: form.email.trim().slice(0, 255),
        subject: form.subject.trim().slice(0, 200),
        message: form.message.trim().slice(0, 1000),
        type: 'feedback',
      });
      if (error) throw error;
      toast.success(lang === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Message sent successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error(lang === 'ar' ? 'حدث خطأ، يرجى المحاولة لاحقاً' : 'An error occurred, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">{t('contact.title')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-6">
              <h2 className="text-xl font-bold text-foreground">{t('contact.sendMessage')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder={t('contact.yourName')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={100} required />
                <Input type="email" placeholder={t('contact.yourEmail')} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} maxLength={255} required />
                <Input placeholder={t('contact.subject')} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} maxLength={200} />
                <Textarea placeholder={t('contact.message')} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} maxLength={1000} required />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t('common.submit')}
                </Button>
              </form>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-card rounded-xl shadow-card border border-border p-6 space-y-6">
              <h2 className="text-xl font-bold text-foreground">
                {lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('common.phone')}</p>
                    <p className="text-muted-foreground text-sm" dir="ltr">0097022224555</p>
                    <p className="text-muted-foreground text-sm" dir="ltr">Fax: 0097222229247</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('common.email')}</p>
                    <p className="text-muted-foreground text-sm">info@ahli.org</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {lang === 'ar' ? 'العنوان' : 'Address'}
                    </p>
                    <p className="text-muted-foreground text-sm">{t('contact.address')}</p>
                  </div>
                </div>
              </div>
              <div className="gradient-hero rounded-xl p-6 text-center">
                <p className="text-primary-foreground font-bold mb-1">
                  {lang === 'ar' ? 'صندوق المريض المحتاج' : 'Patient Aid Fund'}
                </p>
                <p className="text-primary-foreground/80 text-sm">
                  {lang === 'ar'
                    ? 'صندوق لجمع التبرعات للمرضى المحتاجين والغير قادرين على دفع تكاليف العلاج'
                    : 'A fund to collect donations for patients in need who cannot afford treatment costs'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
