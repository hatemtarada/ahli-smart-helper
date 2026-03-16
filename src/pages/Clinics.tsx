import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, Clock, Stethoscope, Building2 } from 'lucide-react';

const clinicsData = [
  { nameAr: 'الباطني', nameEn: 'Internal Medicine', doctors: ['د.عبدالودود ابو تركي', 'د.أمجد النتشة', 'د.محمد الدويك'] },
  { nameAr: 'الجراحة العامة', nameEn: 'General Surgery', doctors: ['د.مراد الجعافرة', 'د.رفيق سلهب', 'د.عامر ابو رميلة', 'د.فهمي جبران'] },
  { nameAr: 'النسائية والتوليد', nameEn: 'Gynecology', doctors: ['د.بسام ناصر الدين', 'د.عبد الفتاح نوفل'] },
  { nameAr: 'العظام', nameEn: 'Orthopedics', doctors: ['د.مراد النتشة', 'د.محمد الجنيدي', 'د.منذر قفيشة', 'د.باسم مجاهد'] },
  { nameAr: 'الأطفال', nameEn: 'Pediatrics', doctors: ['د.طاهر عيد الشريف', 'د.علي ابو ريش', 'د.شهاب القواسمي'] },
  { nameAr: 'جراحة الأعصاب', nameEn: 'Neurosurgery', doctors: ['د.بسام حسن البشيتي'] },
  { nameAr: 'المسالك البولية', nameEn: 'Urology', doctors: ['د.علاء العزة', 'د.مهند علامة'] },
  { nameAr: 'العيون', nameEn: 'Ophthalmology', doctors: [] },
  { nameAr: 'الأنف والأذن والحنجرة', nameEn: 'ENT', doctors: [] },
  { nameAr: 'الأسنان', nameEn: 'Dentistry', doctors: ['د.فاطمة الناظر'] },
  { nameAr: 'القلب', nameEn: 'Cardiology', doctors: ['د.طارق موسى', 'د.محمد نصر', 'د.أنس شاور', 'د.باجس عمرو'] },
  { nameAr: 'عيادة الأورام', nameEn: 'Oncology', doctors: [] },
  { nameAr: 'عيادة الأوعية الدموية', nameEn: 'Vascular', doctors: [] },
  { nameAr: 'عيادة التجميل', nameEn: 'Plastic Surgery', doctors: ['د.رشاد الزرو', 'د.إسماعيل دبابسة'] },
  { nameAr: 'عيادة الجبس', nameEn: 'Casting', doctors: [] },
  { nameAr: 'عيادة جراحة الصدر', nameEn: 'Thoracic Surgery', doctors: [] },
  { nameAr: 'عيادة الجلدية', nameEn: 'Dermatology', doctors: [] },
  { nameAr: 'عيادة الجهاز الهضمي', nameEn: 'Gastroenterology', doctors: ['د.حازم الأشهب'] },
  { nameAr: 'عيادة الروماتيزم', nameEn: 'Rheumatology', doctors: [] },
  { nameAr: 'عيادة الغدد الصماء', nameEn: 'Endocrinology', doctors: [] },
  { nameAr: 'عيادة الرئة', nameEn: 'Pulmonology', doctors: ['د.محمود الهور'] },
  { nameAr: 'عيادة العلاج الطبيعي', nameEn: 'Physiotherapy', doctors: [] },
  { nameAr: 'عيادة الكلى', nameEn: 'Nephrology', doctors: [] },
  { nameAr: 'عيادة الوجه والفكين', nameEn: 'Maxillofacial', doctors: [] },
  { nameAr: 'عيادة أعصاب الأطفال', nameEn: 'Pediatric Neurology', doctors: ['د.بسام حسن البشيتي'] },
  { nameAr: 'عيادة الأمراض الاستقلابية', nameEn: 'Metabolic Diseases', doctors: [] },
  { nameAr: 'عيادة جراحة الأطفال', nameEn: 'Pediatric Surgery', doctors: [] },
  { nameAr: 'عيادة روماتيزم الأطفال', nameEn: 'Pediatric Rheumatology', doctors: [] },
  { nameAr: 'عيادة الألم', nameEn: 'Pain Management', doctors: [] },
  { nameAr: 'عيادة غدد صماء الأطفال', nameEn: 'Pediatric Endocrinology', doctors: [] },
  { nameAr: 'عيادة قلب الأطفال', nameEn: 'Pediatric Cardiology', doctors: [] },
  { nameAr: 'عيادة كلى الأطفال', nameEn: 'Pediatric Nephrology', doctors: [] },
  { nameAr: 'عيادة الأطراف الصناعية', nameEn: 'Prosthetics', doctors: [] },
  { nameAr: 'الحمل الخطر', nameEn: 'High-Risk Pregnancy', doctors: ['د.لؤي السعيد'] },
];

const ClinicsPage = () => {
  const { t, lang } = useI18n();
  const [search, setSearch] = useState('');

  const { data: dbDoctors } = useQuery({
    queryKey: ['clinic-doctors'],
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*, departments(name_ar, name_en)').eq('is_active', true);
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clinicsData.filter(c =>
      !q || c.nameAr.includes(q) || c.nameEn.toLowerCase().includes(q) ||
      c.doctors.some(d => d.includes(q) || d.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Stethoscope className="w-4 h-4" />
            {lang === 'ar' ? 'أكثر من 34 عيادة' : '34+ Clinics'}
          </span>
          <h1 className="text-3xl font-black text-foreground mt-2 mb-2">
            {lang === 'ar' ? 'العيادات الخارجية' : 'Outpatient Clinics'}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {lang === 'ar' ? 'تستقبل أكثر من 300 مريض يومياً في مختلف التخصصات' : 'Serving 300+ patients daily across all specialties'}
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={lang === 'ar' ? 'ابحث عن عيادة أو طبيب...' : 'Search clinic or doctor...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((clinic, i) => (
            <motion.div
              key={clinic.nameAr}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card rounded-2xl border border-border p-5 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{lang === 'ar' ? clinic.nameAr : clinic.nameEn}</h3>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? clinic.nameEn : clinic.nameAr}</p>
                </div>
              </div>
              {clinic.doctors.length > 0 && (
                <div className="space-y-1.5 mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" />
                    {lang === 'ar' ? 'الأطباء' : 'Doctors'}
                  </p>
                  {clinic.doctors.map(doc => (
                    <p key={doc} className="text-xs text-foreground ps-4">{doc}</p>
                  ))}
                </div>
              )}
              {clinic.doctors.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {lang === 'ar' ? 'يرجى التواصل مع المستشفى لمعرفة المواعيد' : 'Contact hospital for schedule'}
                </p>
              )}
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">{lang === 'ar' ? 'لا توجد نتائج' : 'No results'}</p>
        )}
      </div>
    </div>
  );
};

export default ClinicsPage;
