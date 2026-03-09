import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { t, lang } = useI18n();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login error'));
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
            <h1 className="text-2xl font-bold text-foreground">{t('auth.login')}</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" placeholder={t('common.email')} value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder={t('common.password')} value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.login')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">{t('nav.signup')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
