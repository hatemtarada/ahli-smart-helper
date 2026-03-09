import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const { lang } = useI18n();

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-6 text-center">
            {lang === 'ar' ? 'عن المستشفى الأهلي' : 'About Al-Ahli Hospital'}
          </h1>
          <div className="bg-card rounded-xl shadow-card border border-border p-8 space-y-6">
            <div className="gradient-hero rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                {lang === 'ar' ? 'نحن بعون الله نرعاكم' : 'With God\'s Help, We Care for You'}
              </h2>
              <p className="text-primary-foreground/80">
                {lang === 'ar' ? 'المستشفى الأهلي - الخليل' : 'Al-Ahli Hospital - Hebron'}
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {lang === 'ar'
                ? 'إلى كل يد بيضاء أسهمت في بناء هذا الصرح الطبي الشامخ وتجهيزه. إلى كل من أسهم بجهده أو ماله في تخفيف آلام المرضى والجرحى. إلى كل من داوى مريضاً بزكاة أو صدقة عبر صندوق المريض الفقير. بفضل الله سبحانه وتعالى ثم بفضلكم تنجز مهمتنا وتتحقق رسالتنا.'
                : 'To every generous hand that contributed to building and equipping this prominent medical institution. To everyone who contributed their effort or money to alleviate the pain of patients and the wounded. Through God\'s grace and then yours, our mission is accomplished.'}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {lang === 'ar'
                ? 'المستشفى الأهلي في الخليل هو مؤسسة طبية رائدة تقدم خدمات صحية شاملة ومتكاملة. يضم المستشفى أحدث الأجهزة الطبية وكادراً طبياً متميزاً من أمهر الأطباء في مختلف التخصصات.'
                : 'Al-Ahli Hospital in Hebron is a leading medical institution providing comprehensive healthcare services. The hospital features the latest medical equipment and an outstanding medical staff of the most skilled doctors in various specialties.'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              {[
                { valueAr: '+30', valueEn: '30+', labelAr: 'طبيب متخصص', labelEn: 'Specialist Doctors' },
                { valueAr: '12', valueEn: '12', labelAr: 'قسم طبي', labelEn: 'Departments' },
                { valueAr: '24/7', valueEn: '24/7', labelAr: 'خدمة طوارئ', labelEn: 'Emergency Service' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 bg-muted rounded-xl">
                  <p className="text-2xl font-bold text-primary">{lang === 'ar' ? stat.valueAr : stat.valueEn}</p>
                  <p className="text-sm text-muted-foreground">{lang === 'ar' ? stat.labelAr : stat.labelEn}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
