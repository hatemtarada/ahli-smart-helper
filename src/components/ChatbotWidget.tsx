import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, X, Send, Building2, Stethoscope, Calendar, Clock, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickActions = [
  { icon: Building2, labelAr: 'الأقسام', labelEn: 'Departments', query: 'ما هي أقسام المستشفى الأهلي؟' },
  { icon: Stethoscope, labelAr: 'الأطباء', labelEn: 'Doctors', query: 'من هم أطباء المستشفى؟' },
  { icon: Calendar, labelAr: 'حجز موعد', labelEn: 'Book', query: 'كيف أحجز موعد في المستشفى؟' },
  { icon: Clock, labelAr: 'ساعات العمل', labelEn: 'Hours', query: 'ما هي ساعات عمل المستشفى؟' },
  { icon: Phone, labelAr: 'تواصل', labelEn: 'Contact', query: 'كيف أتواصل مع المستشفى؟' },
  { icon: MessageSquare, labelAr: 'شكوى', labelEn: 'Feedback', query: 'أريد تقديم شكوى أو اقتراح' },
];

const ChatbotWidget = () => {
  const { t, lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Fetch context from database
      const [depts, docs, services, kb] = await Promise.all([
        supabase.from('departments').select('name_ar, name_en, description_ar, description_en').eq('is_active', true),
        supabase.from('doctors').select('name_ar, name_en, specialty_ar, specialty_en').eq('is_active', true),
        supabase.from('services').select('name_ar, name_en, description_ar, description_en').eq('is_active', true),
        supabase.from('knowledge_base').select('title, content, category'),
      ]);

      const context = `
Hospital: المستشفى الأهلي - الخليل (Al-Ahli Hospital - Hebron)
Phone: 0097022224555 | Email: info@ahli.org
Location: Hebron, Palestine

Departments: ${depts.data?.map(d => `${d.name_ar} (${d.name_en})`).join(', ') || 'مركز القلب والشرايين, قسم الأطفال, العيادات الخارجية, الأشعة, الطوارئ, الطب النووي, العناية المركزة, الجهاز الهضمي, الأقسام الجراحية, الأمراض الباطنية, العمليات الجراحية, النسائية والتوليد'}

Doctors: ${docs.data?.map(d => `${d.name_ar} - ${d.specialty_ar}`).join(', ') || 'No doctors data'}

Services: ${services.data?.map(s => `${s.name_ar}`).join(', ') || 'No services data'}

Knowledge Base: ${kb.data?.map(k => k.content).join('\n') || ''}

Monthly Stats: 642 surgeries, 3305 ER visits, 7834 outpatient visits, 41622 lab tests, 4692 x-rays, 364 births
`.trim();

      const allMessages = [...messages, userMsg];

      const resp = await supabase.functions.invoke('chat', {
        body: {
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          context,
        },
      });

      if (resp.error) throw resp.error;

      const data = resp.data;
      if (data?.choices?.[0]?.message?.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      } else if (typeof data === 'string') {
        // Handle streaming response
        setMessages(prev => [...prev, { role: 'assistant', content: data }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Sorry, an error occurred. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: lang === 'ar' ? 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.' : 'Sorry, connection error. Please try again later.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 end-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-card rounded-2xl shadow-elevated border border-border overflow-hidden flex flex-col"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="gradient-hero px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-primary-foreground font-bold text-sm">{t('chat.title')}</h3>
                  <p className="text-primary-foreground/70 text-xs">
                    {lang === 'ar' ? 'المستشفى الأهلي' : 'Al-Ahli Hospital'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="bg-secondary rounded-xl rounded-tl-sm p-3 text-sm">
                    {t('chat.welcome')}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(action.query)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-xs font-medium text-foreground"
                      >
                        <action.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{lang === 'ar' ? action.labelAr : action.labelEn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-xl rounded-bl-sm p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 end-4 z-50 w-14 h-14 rounded-full gradient-hero shadow-elevated flex items-center justify-center text-primary-foreground"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </>
  );
};

export default ChatbotWidget;
