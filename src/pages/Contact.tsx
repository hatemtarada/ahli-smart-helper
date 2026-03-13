import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
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

  const contactInfo = [
    { icon: Phone, label: lang === 'ar' ? 'الهاتف' : 'Phone', value: '0097022224555', extra: 'Fax: 0097222229247', dir: 'ltr' as const },
    { icon: Mail, label: lang === 'ar' ? 'البريد' : 'Email', value: 'info@ahli.org' },
    { icon: MapPin, label: lang === 'ar' ? 'العنوان' : 'Address', value: t('contact.address') },
    { icon: Clock, label: lang === 'ar' ? 'الطوارئ' : 'Emergency', value: lang === 'ar' ? '٢٤ ساعة / ٧ أيام' : '24/7' },
  ];

  return (
    <div className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">{lang === 'ar' ? 'نحن هنا لمساعدتك' : 'We are here to help'}</span>
          <h1 className="text-3xl lg:text-4xl font-black text-foreground mt-2">{t('contact.title')}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="bg-card rounded-2xl shadow-card border border-border p-7">
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                {t('contact.sendMessage')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder={t('contact.yourName')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={100} required className="h-11" />
                  <Input type="email" placeholder={t('contact.yourEmail')} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} maxLength={255} required className="h-11" />
                </div>
                <Input placeholder={t('contact.subject')} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} maxLength={200} className="h-11" />
                <Textarea placeholder={t('contact.message')} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} maxLength={1000} required />
                <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
                  {loading ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t('common.submit')}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Info + Map */}
          <motion.div initial={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-5">
            <div className="bg-card rounded-2xl shadow-card border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-5">
                {lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
              </h2>
              <div className="space-y-4">
                {contactInfo.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.label}</p>
                      <p className="text-muted-foreground text-sm" dir={item.dir}>{item.value}</p>
                      {item.extra && <p className="text-muted-foreground text-xs" dir="ltr">{item.extra}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <iframe
                title={lang === 'ar' ? 'موقع المستشفى الأهلي' : 'Al-Ahli Hospital Location'}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.5!2d35.1005!3d31.5265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1502d7d2a0f0e6ed%3A0x4b1f3f8c1e4b0a0!2sAl-Ahli%20Hospital!5e0!3m2!1sar!2sps!4v1710000000000"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>

            {/* Fund CTA */}
            <div className="gradient-hero rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(158_65%_36%/0.3),transparent_60%)]" />
              <div className="relative z-10">
                <p className="text-primary-foreground font-bold mb-1.5">
                  {lang === 'ar' ? 'صندوق المريض المحتاج' : 'Patient Aid Fund'}
                </p>
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
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