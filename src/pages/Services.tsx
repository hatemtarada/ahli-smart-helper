import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Stethoscope, Microscope, Pill, HeartPulse, Scan, Syringe, Baby, Brain, Bone } from 'lucide-react';

const servicesData = [
  { icon: HeartPulse, nameAr: 'جراحة القلب المفتوح', nameEn: 'Open Heart Surgery', descAr: 'عمليات القلب المفتوح بإشراف فريق متخصص', descEn: 'Open heart surgery by specialized team' },
  { icon: Stethoscope, nameAr: 'القسطرة القلبية', nameEn: 'Cardiac Catheterization', descAr: 'تشخيص وعلاج أمراض الشرايين التاجية', descEn: 'Diagnosis and treatment of coronary arteries' },
  { icon: Scan, nameAr: 'التصوير الطبي', nameEn: 'Medical Imaging', descAr: 'أشعة سينية، مقطعية، رنين مغناطيسي', descEn: 'X-ray, CT, MRI imaging services' },
  { icon: Microscope, nameAr: 'المختبرات الطبية', nameEn: 'Medical Labs', descAr: 'فحوصات مخبرية شاملة ودقيقة', descEn: 'Comprehensive and accurate lab tests' },
  { icon: Baby, nameAr: 'رعاية الأمومة', nameEn: 'Maternity Care', descAr: 'متابعة الحمل والولادة ورعاية الأم والطفل', descEn: 'Pregnancy, delivery, and mother-child care' },
  { icon: Syringe, nameAr: 'التخدير والإنعاش', nameEn: 'Anesthesia', descAr: 'خدمات تخدير متقدمة وآمنة', descEn: 'Advanced and safe anesthesia services' },
  { icon: Brain, nameAr: 'الطب النووي', nameEn: 'Nuclear Medicine', descAr: 'تشخيص وعلاج باستخدام المواد المشعة', descEn: 'Diagnosis using radioactive materials' },
  { icon: Bone, nameAr: 'جراحة العظام', nameEn: 'Orthopedic Surgery', descAr: 'علاج كسور وأمراض العظام والمفاصل', descEn: 'Bone fractures and joint treatment' },
  { icon: Pill, nameAr: 'الصيدلية', nameEn: 'Pharmacy', descAr: 'صيدلية متكاملة على مدار الساعة', descEn: '24/7 full-service pharmacy' },
];

const ServicesPage = () => {
  const { t, lang } = useI18n();

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('services.title')}</h1>
          <p className="text-muted-foreground">{t('services.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl shadow-card border border-border p-6 hover:shadow-elevated transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">
                {lang === 'ar' ? service.nameAr : service.nameEn}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === 'ar' ? service.descAr : service.descEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
