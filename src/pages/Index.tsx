import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, Activity, Users, TestTube, Zap, Baby, Building2, Stethoscope, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { icon: Heart, valueKey: '642', labelAr: 'عملية جراحية', labelEn: 'Surgeries' },
  { icon: Activity, valueKey: '3,305', labelAr: 'حالة طوارئ', labelEn: 'ER Cases' },
  { icon: Users, valueKey: '7,834', labelAr: 'مراجعة عيادات', labelEn: 'Outpatient' },
  { icon: TestTube, valueKey: '41,622', labelAr: 'فحص مخبري', labelEn: 'Lab Tests' },
  { icon: Zap, valueKey: '4,692', labelAr: 'صورة أشعة', labelEn: 'X-rays' },
  { icon: Baby, valueKey: '364', labelAr: 'ولادة', labelEn: 'Births' },
];

const features = [
  { icon: Stethoscope, titleAr: 'أطباء متخصصون', titleEn: 'Specialist Doctors', descAr: 'نخبة من أفضل الأطباء المتخصصين في مختلف المجالات', descEn: 'Elite specialized doctors in various fields' },
  { icon: Shield, titleAr: 'رعاية متكاملة', titleEn: 'Comprehensive Care', descAr: 'خدمات صحية شاملة تحت سقف واحد', descEn: 'Complete healthcare services under one roof' },
  { icon: Clock, titleAr: 'طوارئ ٢٤/٧', titleEn: '24/7 Emergency', descAr: 'قسم طوارئ يعمل على مدار الساعة', descEn: 'Round-the-clock emergency department' },
];

const HomePage = () => {
  const { t, lang } = useI18n();
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await supabase.from('departments').select('*').eq('is_active', true).limit(6);
      return data || [];
    },
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*').eq('is_active', true).limit(8);
      return data || [];
    },
  });

  const deptList = departments && departments.length > 0 ? departments : defaultDepartments;
  const docList = doctors && doctors.length > 0 ? doctors : defaultDoctors;

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(197_100%_40%/0.3),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(158_65%_36%/0.2),transparent_60%)]" />
        <div className="container mx-auto px-4 relative py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-primary-foreground/90 text-xs font-semibold">{t('hero.location')}</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-primary-foreground mb-5 leading-[1.1]">
              {t('hero.welcome')}
            </h1>
            <p className="text-lg lg:text-xl text-primary-foreground/80 mb-10 font-medium leading-relaxed max-w-lg">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" variant="secondary" className="font-bold text-sm shadow-elevated hover:scale-105 transition-transform">
                  {t('hero.book')}
                  <Arrow className="w-4 h-4 ms-2" />
                </Button>
              </Link>
              <Link to="/departments">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-bold text-sm backdrop-blur-sm">
                  {t('hero.explore')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="relative -mt-8 z-10">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-2xl shadow-elevated p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="text-center py-3"
                >
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl lg:text-3xl font-black text-foreground">{stat.valueKey}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{lang === 'ar' ? stat.labelAr : stat.labelEn}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="bg-card rounded-2xl border border-border p-7 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-5 shadow-glow group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{lang === 'ar' ? f.titleAr : f.titleEn}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{lang === 'ar' ? f.descAr : f.descEn}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="section-padding gradient-subtle">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">{lang === 'ar' ? 'أقسامنا' : 'Our Departments'}</span>
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mt-2 mb-3">{t('departments.title')}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t('departments.subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {deptList.map((dept, i) => (
              <motion.div
                key={dept.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-elevated transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="h-36 gradient-hero flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(158_65%_36%/0.4),transparent_70%)]" />
                  <Building2 className="w-10 h-10 text-primary-foreground/40 group-hover:scale-110 transition-transform relative z-10" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground mb-1.5 text-[15px]">
                    {lang === 'ar' ? dept.name_ar : (dept.name_en || dept.name_ar)}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {lang === 'ar' ? dept.description_ar : (dept.description_en || dept.description_ar)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/departments">
              <Button variant="outline" className="font-semibold">{t('common.viewAll')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">{lang === 'ar' ? 'طاقمنا الطبي' : 'Medical Staff'}</span>
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mt-2 mb-3">{t('doctors.title')}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t('doctors.subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {docList.map((doc, i) => (
              <motion.div
                key={doc.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-2xl border border-border p-5 text-center hover:shadow-elevated transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl gradient-hero mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                  <span className="text-primary-foreground font-black text-lg">
                    {doc.name_ar.charAt(doc.name_ar.indexOf('.') + 1) || doc.name_ar.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-[13px] mb-1 leading-snug">{doc.name_ar}</h3>
                <p className="text-xs text-primary font-semibold">{doc.specialty_ar}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/doctors">
              <Button variant="outline" className="font-semibold">{t('common.viewAll')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="gradient-hero rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(158_65%_36%/0.3),transparent_60%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-black text-primary-foreground mb-4">
                {lang === 'ar' ? 'احجز موعدك الآن' : 'Book Your Appointment Now'}
              </h2>
              <p className="text-primary-foreground/75 mb-8 max-w-md mx-auto text-base">
                {lang === 'ar'
                  ? 'سجّل دخولك واحجز موعدك مع أفضل الأطباء في المستشفى الأهلي'
                  : 'Sign in and book your appointment with the best doctors at Al-Ahli Hospital'}
              </p>
              <Link to="/login">
                <Button size="lg" variant="secondary" className="font-bold shadow-elevated hover:scale-105 transition-transform">
                  {t('hero.book')}
                  <Arrow className="w-4 h-4 ms-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const defaultDepartments = [
  { id: '1', name_ar: 'مركز الأهلي للقلب والشرايين', name_en: 'Cardiology Center', description_ar: 'تشخيص وعلاج أمراض القلب والأوعية الدموية', description_en: 'Diagnosis and treatment of heart and vascular diseases' },
  { id: '2', name_ar: 'قسم الأطفال وحديثي الولادة', name_en: 'Pediatrics & Neonatal', description_ar: 'رعاية متخصصة للأطفال وحديثي الولادة', description_en: 'Specialized care for children and newborns' },
  { id: '3', name_ar: 'قسم العيادات الخارجية', name_en: 'Outpatient Clinics', description_ar: 'عيادات خارجية متعددة التخصصات', description_en: 'Multi-specialty outpatient clinics' },
  { id: '4', name_ar: 'قسم الأشعة والأشعة التداخلية', name_en: 'Radiology', description_ar: 'تصوير طبي متقدم وإجراءات تداخلية', description_en: 'Advanced medical imaging and interventional procedures' },
  { id: '5', name_ar: 'قسم الإسعاف والطوارئ', name_en: 'Emergency', description_ar: 'خدمات طوارئ على مدار الساعة', description_en: '24/7 emergency services' },
  { id: '6', name_ar: 'قسم العناية المركزة', name_en: 'ICU', description_ar: 'عناية مركزة بأحدث الأجهزة الطبية', description_en: 'Intensive care with latest medical equipment' },
];

const defaultDoctors = [
  { id: '1', name_ar: 'د.أنس يحيى شاور', specialty_ar: 'القلب والقسطرة' },
  { id: '2', name_ar: 'د.مراد رافع الجعافرة', specialty_ar: 'الجراحة العامة' },
  { id: '3', name_ar: 'د.مراد ماهر النتشه', specialty_ar: 'جراحة العظام والمفاصل' },
  { id: '4', name_ar: 'د.بسام غالب ناصر الدين', specialty_ar: 'النسائية والتوليد' },
  { id: '5', name_ar: 'د.رشاد مرشد الزرو', specialty_ar: 'جراحة التجميل والحروق' },
  { id: '6', name_ar: 'د.أمجد ناصر النتشة', specialty_ar: 'الامراض الباطنية' },
  { id: '7', name_ar: 'د.باجس عبد الرحمن عمرو', specialty_ar: 'القلب والقسطرة' },
  { id: '8', name_ar: 'د.طارق علي موسى', specialty_ar: 'القلب والقسطرة' },
];

export default HomePage;