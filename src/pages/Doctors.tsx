import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const defaultDoctors = [
  { id: '1', name_ar: 'د.مراد رافع الجعافرة', name_en: 'Dr. Murad Al-Jaafra', specialty_ar: 'الجراحة العامة', specialty_en: 'General Surgery' },
  { id: '2', name_ar: 'د.مراد ماهر النتشه', name_en: 'Dr. Murad Al-Natsheh', specialty_ar: 'جراحة العظام والمفاصل', specialty_en: 'Orthopedic Surgery' },
  { id: '3', name_ar: 'د.منذر برهان قفيشة', name_en: 'Dr. Munther Qufeisheh', specialty_ar: 'جراحة العظام والمفاصل', specialty_en: 'Orthopedic Surgery' },
  { id: '4', name_ar: 'د.بسام غالب ناصر الدين', name_en: 'Dr. Bassam Nasser Eddin', specialty_ar: 'النسائية والتوليد', specialty_en: 'OB/GYN' },
  { id: '5', name_ar: 'د.رشاد مرشد الزرو', name_en: 'Dr. Rashad Al-Zaro', specialty_ar: 'جراحة التجميل والحروق', specialty_en: 'Plastic Surgery' },
  { id: '6', name_ar: 'د.رفيق محمد سلهب', name_en: 'Dr. Rafiq Salhab', specialty_ar: 'الجراحة العامة', specialty_en: 'General Surgery' },
  { id: '7', name_ar: 'د.عبدالناصر محمد ابوريان', name_en: 'Dr. Abdulnasser Abu Ryan', specialty_ar: 'النسائية والتوليد', specialty_en: 'OB/GYN' },
  { id: '8', name_ar: 'د.أمجد ناصر النتشة', name_en: 'Dr. Amjad Al-Natsheh', specialty_ar: 'الامراض الباطنية', specialty_en: 'Internal Medicine' },
  { id: '9', name_ar: 'د.أنس يحيى شاور', name_en: 'Dr. Anas Shawer', specialty_ar: 'القلب والقسطرة', specialty_en: 'Cardiology' },
  { id: '10', name_ar: 'د.إسماعيل محمد دبابسة', name_en: 'Dr. Ismail Dababseh', specialty_ar: 'جراحة التجميل والحروق', specialty_en: 'Plastic Surgery' },
  { id: '11', name_ar: 'د.باجس عبد الرحمن عمرو', name_en: 'Dr. Bajes Amro', specialty_ar: 'القلب والقسطرة', specialty_en: 'Cardiology' },
  { id: '12', name_ar: 'د.باسم عبد الله مجاهد', name_en: 'Dr. Basem Mujahid', specialty_ar: 'جراحة العظام والمفاصل', specialty_en: 'Orthopedic Surgery' },
  { id: '13', name_ar: 'د.بشر مرزوق مرزوقة', name_en: 'Dr. Bashar Marzouka', specialty_ar: 'جراحة القلب للكبار', specialty_en: 'Adult Cardiac Surgery' },
  { id: '14', name_ar: 'د.طارق علي موسى', name_en: 'Dr. Tariq Mousa', specialty_ar: 'القلب والقسطرة', specialty_en: 'Cardiology' },
  { id: '15', name_ar: 'د.عامر ابو رميلة', name_en: 'Dr. Amer Abu Rumeileh', specialty_ar: 'الجراحة العامة', specialty_en: 'General Surgery' },
  { id: '16', name_ar: 'د.محمد علي نصر', name_en: 'Dr. Mohammad Nasr', specialty_ar: 'القلب والقسطرة', specialty_en: 'Cardiology' },
  { id: '17', name_ar: 'د.محمد ماجد الدويك', name_en: 'Dr. Mohammad Al-Dweik', specialty_ar: 'الامراض الباطنية', specialty_en: 'Internal Medicine' },
  { id: '18', name_ar: 'د.لؤي نسيم السعيد', name_en: 'Dr. Louay Al-Saeed', specialty_ar: 'الحمل الخطر وفحص اعضاء الجنين', specialty_en: 'High-Risk Pregnancy' },
  { id: '19', name_ar: 'د.فهمي عبد الرحمن جبران', name_en: 'Dr. Fahmi Jibran', specialty_ar: 'الجراحة العامة', specialty_en: 'General Surgery' },
  { id: '20', name_ar: 'د.عروة محمد الفلاح', name_en: 'Dr. Orwa Al-Falah', specialty_ar: 'المدير الطبي', specialty_en: 'Medical Director' },
];

const DoctorsPage = () => {
  const { t, lang } = useI18n();

  const { data: doctors } = useQuery({
    queryKey: ['doctors-all'],
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*').eq('is_active', true);
      return data && data.length > 0 ? data : null;
    },
  });

  const docs = doctors || defaultDoctors;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('doctors.title')}</h1>
          <p className="text-muted-foreground">{t('doctors.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {docs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl shadow-card border border-border p-5 text-center hover:shadow-elevated transition-shadow"
            >
              <div className="w-20 h-20 rounded-full gradient-hero mx-auto mb-3 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">
                  {doc.name_ar.charAt(doc.name_ar.indexOf('.') + 1) || doc.name_ar.charAt(0)}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">
                {lang === 'ar' ? doc.name_ar : (doc.name_en || doc.name_ar)}
              </h3>
              <p className="text-xs text-primary font-medium mb-3">
                {lang === 'ar' ? doc.specialty_ar : (doc.specialty_en || doc.specialty_ar)}
              </p>
              <Link to="/login">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  {t('common.bookAppointment')}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;
