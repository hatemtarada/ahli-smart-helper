import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Heart, Phone, Mail, MapPin, HandHeart, Users, Shield, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { icon: Users, valueAr: '+500', valueEn: '500+', labelAr: 'مريض مستفيد سنوياً', labelEn: 'Patients helped yearly' },
  { icon: HandHeart, valueAr: '+30', valueEn: '30+', labelAr: 'سنة من العطاء', labelEn: 'Years of giving' },
  { icon: Shield, valueAr: '100%', valueEn: '100%', labelAr: 'شفافية في التوزيع', labelEn: 'Transparent distribution' },
];

const DonationsPage = () => {
  const { lang } = useI18n();

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(197_100%_40%/0.3),transparent_70%)]" />
        <div className="container mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Heart className="w-4 h-4 text-red-300" />
              <span className="text-primary-foreground/90 text-xs font-semibold">
                {lang === 'ar' ? 'صندوق إعانة المرضى' : 'Patient Aid Fund'}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-primary-foreground mb-5 leading-[1.1]">
              {lang === 'ar' ? 'ساهم في علاج من لا يستطيع' : 'Help Those Who Cannot Afford Treatment'}
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed max-w-lg">
              {lang === 'ar'
                ? 'صندوق إعانة المرضى يهدف لمساعدة المرضى غير القادرين على تحمل تكاليف العلاج. تبرعك يصنع الفرق.'
                : 'The Patient Aid Fund helps patients who cannot afford treatment costs. Your donation makes a difference.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-8 z-10">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl shadow-elevated p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center py-4">
                  <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-black text-foreground">{lang === 'ar' ? s.valueAr : s.valueEn}</p>
                  <p className="text-sm text-muted-foreground mt-1">{lang === 'ar' ? s.labelAr : s.labelEn}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Fund */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-black text-foreground mb-4">
                {lang === 'ar' ? 'عن صندوق إعانة المرضى' : 'About the Patient Aid Fund'}
              </h2>
              <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                <p>
                  {lang === 'ar'
                    ? 'أُنشئ صندوق إعانة المرضى بهدف تقديم المساعدة الطبية للمرضى غير القادرين على تحمل تكاليف العلاج. يعمل الصندوق تحت إشراف إدارة المستشفى الأهلي بشفافية كاملة.'
                    : 'The Patient Aid Fund was established to provide medical assistance to patients who cannot afford treatment costs. The fund operates under the supervision of Al-Ahli Hospital administration with full transparency.'}
                </p>
                <p>
                  {lang === 'ar'
                    ? 'يغطي الصندوق تكاليف العمليات الجراحية، والإقامة في المستشفى، والفحوصات المخبرية، والأدوية للمرضى المحتاجين.'
                    : 'The fund covers surgical costs, hospital stays, lab tests, and medications for patients in need.'}
                </p>
                <p>
                  {lang === 'ar'
                    ? 'جمعية أصدقاء المريض تساهم أيضاً في دعم الصندوق من خلال جمع التبرعات وتنظيم الحملات الخيرية.'
                    : 'The Friends of the Patient Society also contributes by organizing fundraising campaigns and charitable events.'}
                </p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card rounded-2xl border border-border p-8">
                <h3 className="font-bold text-foreground text-lg mb-6 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-primary" />
                  {lang === 'ar' ? 'كيف تتبرع؟' : 'How to Donate?'}
                </h3>
                <div className="space-y-5">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{lang === 'ar' ? 'اتصل بنا' : 'Call Us'}</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">+970 2 229 247</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                      <p className="text-sm text-muted-foreground">info@ahli.org</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{lang === 'ar' ? 'زيارة المستشفى' : 'Visit Hospital'}</p>
                      <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'الخليل - فرش الهوى' : 'Hebron - Farsh Al-Hawa'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-4">
                    {lang === 'ar' ? 'يمكنك أيضاً التبرع عبر التحويل البنكي. تواصل معنا للحصول على بيانات الحساب.' : 'You can also donate via bank transfer. Contact us for account details.'}
                  </p>
                  <a href="tel:+9702229247">
                    <Button className="w-full font-bold">
                      <Heart className="w-4 h-4 me-2" />
                      {lang === 'ar' ? 'تبرع الآن' : 'Donate Now'}
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonationsPage;
