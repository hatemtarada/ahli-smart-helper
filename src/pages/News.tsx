import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Megaphone, Calendar } from 'lucide-react';

const NewsPage = () => {
  const { lang } = useI18n();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['news-all'],
    queryFn: async () => {
      const { data } = await supabase.from('announcements').select('*').eq('is_active', true).order('priority', { ascending: false }).order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Megaphone className="w-4 h-4" />
            {lang === 'ar' ? 'آخر المستجدات' : 'Latest Updates'}
          </span>
          <h1 className="text-3xl font-black text-foreground mt-2 mb-2">
            {lang === 'ar' ? 'أخبار وإعلانات المستشفى' : 'Hospital News & Announcements'}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {lang === 'ar' ? 'تابع آخر الأخبار والفعاليات والإنجازات' : 'Follow the latest news, events and achievements'}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : announcements && announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((ann, i) => (
              <motion.article
                key={ann.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-elevated transition-all duration-300 group hover:-translate-y-1"
              >
                {ann.image_url ? (
                  <div className="h-52 overflow-hidden">
                    <img
                      src={ann.image_url}
                      alt={lang === 'ar' ? ann.title_ar : ann.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-52 gradient-hero flex items-center justify-center">
                    <Megaphone className="w-14 h-14 text-primary-foreground/30" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(ann.created_at).toLocaleDateString(lang === 'ar' ? 'ar-PS' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="font-bold text-foreground text-base mb-3 leading-snug">
                    {lang === 'ar' ? ann.title_ar : (ann.title_en || ann.title_ar)}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lang === 'ar' ? ann.content_ar : (ann.content_en || ann.content_ar)}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{lang === 'ar' ? 'لا توجد أخبار حالياً' : 'No news at the moment'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
