import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const { t, lang } = useI18n();
  const { user, signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.name);
      toast.success(lang === 'ar' ? 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني.' : 'Account created! Check your email.');
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'خطأ في إنشاء الحساب' : 'Signup error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-card border border-border p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full gradient-hero mx-auto mb-3 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">أ</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t('auth.signup')}</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder={t('auth.fullName')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input type="email" placeholder={t('common.email')} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input type="password" placeholder={t('common.password')} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.signup')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">{t('nav.login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
