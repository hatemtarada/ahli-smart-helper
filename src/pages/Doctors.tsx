import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Search, Filter, Stethoscope } from 'lucide-react';

const defaultDoctors = [
  { id: '1', name_ar: 'د.مراد رافع الجعافرة', name_en: 'Dr. Murad Al-Jaafra', specialty_ar: 'الجراحة العامة', specialty_en: 'General Surgery', department_id: null },
  { id: '2', name_ar: 'د.مراد ماهر النتشه', name_en: 'Dr. Murad Al-Natsheh', specialty_ar: 'جراحة العظام والمفاصل', specialty_en: 'Orthopedic Surgery', department_id: null },
  { id: '3', name_ar: 'د.منذر برهان قفيشة', name_en: 'Dr. Munther Qufeisheh', specialty_ar: 'جراحة العظام والمفاصل', specialty_en: 'Orthopedic Surgery', department_id: null },
  { id: '4', name_ar: 'د.بسام غالب ناصر الدين', name_en: 'Dr. Bassam Nasser Eddin', specialty_ar: 'النسائية والتوليد', specialty_en: 'OB/GYN', department_id: null },
  { id: '5', name_ar: 'د.رشاد مرشد الزرو', name_en: 'Dr. Rashad Al-Zaro', specialty_ar: 'جراحة التجميل والحروق', specialty_en: 'Plastic Surgery', department_id: null },
  { id: '6', name_ar: 'د.رفيق محمد سلهب', name_en: 'Dr. Rafiq Salhab', specialty_ar: 'الجراحة العامة', specialty_en: 'General Surgery', department_id: null },
  { id: '7', name_ar: 'د.عبدالناصر محمد ابوريان', name_en: 'Dr. Abdulnasser Abu Ryan', specialty_ar: 'النسائية والتوليد', specialty_en: 'OB/GYN', department_id: null },
  { id: '8', name_ar: 'د.أمجد ناصر النتشة', name_en: 'Dr. Amjad Al-Natsheh', specialty_ar: 'الامراض الباطنية', specialty_en: 'Internal Medicine', department_id: null },
  { id: '9', name_ar: 'د.أنس يحيى شاور', name_en: 'Dr. Anas Shawer', specialty_ar: 'القلب والقسطرة', specialty_en: 'Cardiology', department_id: null },
  { id: '10', name_ar: 'د.إسماعيل محمد دبابسة', name_en: 'Dr. Ismail Dababseh', specialty_ar: 'جراحة التجميل والحروق', specialty_en: 'Plastic Surgery', department_id: null },
  { id: '11', name_ar: 'د.باجس عبد الرحمن عمرو', name_en: 'Dr. Bajes Amro', specialty_ar: 'القلب والقسطرة', specialty_en: 'Cardiology', department_id: null },
  { id: '12', name_ar: 'د.باسم عبد الله مجاهد', name_en: 'Dr. Basem Mujahid', specialty_ar: 'جراحة العظام والمفاصل', specialty_en: 'Orthopedic Surgery', department_id: null },
  { id: '13', name_ar: 'د.بشر مرزوق مرزوقة', name_en: 'Dr. Bashar Marzouka', specialty_ar: 'جراحة القلب للكبار', specialty_en: 'Adult Cardiac Surgery', department_id: null },
  { id: '14', name_ar: 'د.طارق علي موسى', name_en: 'Dr. Tariq Mousa', specialty_ar: 'القلب والقسطرة', specialty_en: 'Cardiology', department_id: null },
  { id: '15', name_ar: 'د.عامر ابو رميلة', name_en: 'Dr. Amer Abu Rumeileh', specialty_ar: 'الجراحة العامة', specialty_en: 'General Surgery', department_id: null },
  { id: '16', name_ar: 'د.محمد علي نصر', name_en: 'Dr. Mohammad Nasr', specialty_ar: 'القلب والقسطرة', specialty_en: 'Cardiology', department_id: null },
  { id: '17', name_ar: 'د.محمد ماجد الدويك', name_en: 'Dr. Mohammad Al-Dweik', specialty_ar: 'الامراض الباطنية', specialty_en: 'Internal Medicine', department_id: null },
  { id: '18', name_ar: 'د.لؤي نسيم السعيد', name_en: 'Dr. Louay Al-Saeed', specialty_ar: 'الحمل الخطر وفحص اعضاء الجنين', specialty_en: 'High-Risk Pregnancy', department_id: null },
  { id: '19', name_ar: 'د.فهمي عبد الرحمن جبران', name_en: 'Dr. Fahmi Jibran', specialty_ar: 'الجراحة العامة', specialty_en: 'General Surgery', department_id: null },
  { id: '20', name_ar: 'د.عروة محمد الفلاح', name_en: 'Dr. Orwa Al-Falah', specialty_ar: 'المدير الطبي', specialty_en: 'Medical Director', department_id: null },
];

const DoctorsPage = () => {
  const { t, lang } = useI18n();
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const { data: doctors } = useQuery({
    queryKey: ['doctors-all'],
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*, departments(name_ar, name_en)').eq('is_active', true);
      return data && data.length > 0 ? data : null;
    },
  });

  const docs = doctors || defaultDoctors;

  const specialties = useMemo(() => {
    const set = new Set(docs.map((d: any) => d.specialty_ar));
    return Array.from(set).sort();
  }, [docs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((d: any) => {
      const matchSearch = !q || d.name_ar.toLowerCase().includes(q) || (d.name_en || '').toLowerCase().includes(q) || d.specialty_ar.toLowerCase().includes(q) || (d.specialty_en || '').toLowerCase().includes(q);
      const matchSpec = specialtyFilter === 'all' || d.specialty_ar === specialtyFilter;
      return matchSearch && matchSpec;
    });
  }, [docs, search, specialtyFilter]);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('doctors.title')}</h1>
          <p className="text-muted-foreground">{t('doctors.subtitle')}</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={lang === 'ar' ? 'ابحث باسم الطبيب أو التخصص...' : 'Search by name or specialty...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <Filter className="w-4 h-4 me-2 text-muted-foreground" />
              <SelectValue placeholder={lang === 'ar' ? 'كل التخصصات' : 'All Specialties'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === 'ar' ? 'كل التخصصات' : 'All Specialties'}</SelectItem>
              {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground text-center mb-6">
          {lang === 'ar' ? `عرض ${filtered.length} طبيب` : `Showing ${filtered.length} doctors`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((doc: any, i: number) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card rounded-xl shadow-card border border-border p-5 text-center hover:shadow-elevated transition-shadow"
            >
              {doc.image_url ? (
                <div className="w-20 h-20 rounded-2xl mx-auto mb-3 overflow-hidden shadow-glow">
                  <img src={doc.image_url} alt={doc.name_ar} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full gradient-hero mx-auto mb-3 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">
                    {doc.name_ar.charAt(doc.name_ar.indexOf('.') + 1) || doc.name_ar.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="font-bold text-foreground text-sm mb-1">
                {lang === 'ar' ? doc.name_ar : (doc.name_en || doc.name_ar)}
              </h3>
              <p className="text-xs text-primary font-medium mb-1">
                {lang === 'ar' ? doc.specialty_ar : (doc.specialty_en || doc.specialty_ar)}
              </p>
              {(doc as any).departments && (
                <p className="text-xs text-muted-foreground mb-3">
                  {lang === 'ar' ? (doc as any).departments.name_ar : ((doc as any).departments.name_en || (doc as any).departments.name_ar)}
                </p>
              )}
              <Link to="/login">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  {t('common.bookAppointment')}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Stethoscope className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
