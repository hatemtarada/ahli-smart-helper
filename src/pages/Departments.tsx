import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const defaultDepartments = [
  { id: '1', name_ar: 'مركز الأهلي للقلب والشرايين', name_en: 'Cardiology Center', description_ar: 'يُعد مركز الأهلي للقلب والشرايين من أبرز المراكز المتخصصة في تشخيص وعلاج أمراض القلب والأوعية الدموية في المنطقة. يضم المركز وحدة القسطرة القلبية وغرف العناية المركزة القلبية.', description_en: 'Leading center for cardiac diagnosis and treatment' },
  { id: '2', name_ar: 'قسم الأطفال وحديثي الولادة', name_en: 'Pediatrics & Neonatal', description_ar: 'يقدم رعاية متخصصة للأطفال وحديثي الولادة مع وحدة عناية مركزة لحديثي الولادة مجهزة بأحدث الأجهزة الطبية.', description_en: 'Specialized care for children and newborns with NICU' },
  { id: '3', name_ar: 'قسم العيادات الخارجية', name_en: 'Outpatient Clinics', description_ar: 'عيادات خارجية متعددة التخصصات تقدم خدمات الفحص والتشخيص والمتابعة للمرضى.', description_en: 'Multi-specialty outpatient clinics' },
  { id: '4', name_ar: 'قسم الأشعة والأشعة التداخلية', name_en: 'Radiology & Interventional Radiology', description_ar: 'يوفر خدمات التصوير الطبي المتقدمة بما في ذلك الأشعة المقطعية والرنين المغناطيسي والأشعة التداخلية.', description_en: 'Advanced medical imaging services' },
  { id: '5', name_ar: 'قسم الإسعاف والطوارئ', name_en: 'Emergency Department', description_ar: 'يعمل على مدار الساعة لاستقبال الحالات الطارئة وتقديم الرعاية العاجلة للمرضى.', description_en: '24/7 emergency services' },
  { id: '6', name_ar: 'قسم الطب النووي', name_en: 'Nuclear Medicine', description_ar: 'يستخدم المواد المشعة في تشخيص وعلاج الأمراض المختلفة باستخدام تقنيات حديثة.', description_en: 'Radioactive materials for diagnosis and treatment' },
  { id: '7', name_ar: 'قسم العناية المركزة', name_en: 'Intensive Care Unit', description_ar: 'وحدة عناية مركزة مجهزة بأحدث أجهزة المراقبة والإنعاش لرعاية الحالات الحرجة.', description_en: 'ICU with latest monitoring equipment' },
  { id: '8', name_ar: 'قسم الجهاز الهضمي والتنظير', name_en: 'Gastroenterology & Endoscopy', description_ar: 'تشخيص وعلاج أمراض الجهاز الهضمي باستخدام تقنيات التنظير المتقدمة.', description_en: 'GI diagnosis and endoscopy services' },
  { id: '9', name_ar: 'الأقسام الجراحية', name_en: 'Surgical Departments', description_ar: 'تشمل جراحة العظام والمفاصل وجراحة التجميل والحروق والجراحة العامة.', description_en: 'Orthopedic, plastic, and general surgery' },
  { id: '10', name_ar: 'قسم الأمراض الباطنية', name_en: 'Internal Medicine', description_ar: 'تشخيص وعلاج الأمراض الباطنية المختلفة بإشراف أطباء متخصصين.', description_en: 'Internal medicine diagnosis and treatment' },
  { id: '11', name_ar: 'قسم العمليات الجراحية', name_en: 'Operating Rooms', description_ar: 'غرف عمليات مجهزة بأحدث التقنيات الجراحية لإجراء مختلف أنواع العمليات.', description_en: 'Modern operating rooms for various surgeries' },
  { id: '12', name_ar: 'قسم النسائية والتوليد', name_en: 'Obstetrics & Gynecology', description_ar: 'رعاية متكاملة للمرأة في مراحل الحمل والولادة وأمراض النساء.', description_en: 'Comprehensive women\'s healthcare' },
];

const DepartmentsPage = () => {
  const { t, lang } = useI18n();

  const { data: departments } = useQuery({
    queryKey: ['departments-all'],
    queryFn: async () => {
      const { data } = await supabase.from('departments').select('*').eq('is_active', true);
      return data && data.length > 0 ? data : null;
    },
  });

  const depts = departments || defaultDepartments;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('departments.title')}</h1>
          <p className="text-muted-foreground">{t('departments.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depts.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl shadow-card border border-border overflow-hidden hover:shadow-elevated transition-shadow"
            >
              <div className="h-32 gradient-hero flex items-center justify-center">
                <Building2 className="w-10 h-10 text-primary-foreground/60" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-foreground mb-2">
                  {lang === 'ar' ? dept.name_ar : (dept.name_en || dept.name_ar)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lang === 'ar' ? dept.description_ar : (dept.description_en || dept.description_ar)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;
