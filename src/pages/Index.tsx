import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, Activity, Users, TestTube, Zap, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { icon: Heart, valueKey: '642', labelKey: 'stats.surgeries' },
  { icon: Activity, valueKey: '3,305', labelKey: 'stats.er' },
  { icon: Users, valueKey: '7,834', labelKey: 'stats.outpatient' },
  { icon: TestTube, valueKey: '41,622', labelKey: 'stats.lab' },
  { icon: Zap, valueKey: '4,692', labelKey: 'stats.xray' },
  { icon: Baby, valueKey: '364', labelKey: 'stats.births' },
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

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-primary-foreground/80 mb-2 text-sm font-medium">{t('hero.location')}</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              {t('hero.welcome')}
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 font-medium">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" variant="secondary" className="font-semibold">
                  {t('hero.book')}
                  <Arrow className="w-4 h-4 ms-2" />
                </Button>
              </Link>
              <Link to="/departments">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold">
                  {t('hero.explore')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.valueKey}</p>
                <p className="text-xs text-muted-foreground">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">{t('departments.title')}</h2>
            <p className="text-muted-foreground">{t('departments.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(departments && departments.length > 0 ? departments : defaultDepartments).map((dept, i) => (
              <motion.div
                key={dept.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl shadow-card border border-border overflow-hidden hover:shadow-elevated transition-shadow group"
              >
                <div className="h-40 gradient-hero flex items-center justify-center">
                  <Building2Icon className="w-12 h-12 text-primary-foreground/60" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground mb-1">
                    {lang === 'ar' ? dept.name_ar : (dept.name_en || dept.name_ar)}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lang === 'ar' ? dept.description_ar : (dept.description_en || dept.description_ar)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/departments">
              <Button variant="outline">{t('common.viewAll')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">{t('doctors.title')}</h2>
            <p className="text-muted-foreground">{t('doctors.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(doctors && doctors.length > 0 ? doctors : defaultDoctors).map((doc, i) => (
              <motion.div
                key={doc.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl shadow-card border border-border p-5 text-center hover:shadow-elevated transition-shadow"
              >
                <div className="w-20 h-20 rounded-full gradient-hero mx-auto mb-3 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">
                    {doc.name_ar.charAt(doc.name_ar.indexOf('.') + 1) || doc.name_ar.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{doc.name_ar}</h3>
                <p className="text-xs text-primary font-medium">{doc.specialty_ar}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/doctors">
              <Button variant="outline">{t('common.viewAll')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {lang === 'ar' ? 'احجز موعدك الآن' : 'Book Your Appointment Now'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {lang === 'ar'
              ? 'سجّل دخولك واحجز موعدك مع أفضل الأطباء في المستشفى الأهلي'
              : 'Sign in and book your appointment with the best doctors at Al-Ahli Hospital'}
          </p>
          <Link to="/login">
            <Button size="lg">
              {t('hero.book')}
              <Arrow className="w-4 h-4 ms-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

import { Building2 as Building2Icon } from 'lucide-react';

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
