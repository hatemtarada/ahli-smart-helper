import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, X, Send, Building2, Stethoscope, Calendar, Clock, Phone, MessageSquare, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type BookingStep = 'idle' | 'select_department' | 'select_doctor' | 'select_date' | 'select_time' | 'confirm';

interface BookingState {
  step: BookingStep;
  departmentId?: string;
  departmentName?: string;
  doctorId?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  departments?: { id: string; name_ar: string; name_en: string }[];
  doctors?: { id: string; name_ar: string; name_en: string; specialty_ar: string; specialty_en: string }[];
  availableSlots?: string[];
}

const quickActions = [
  { icon: Building2, labelAr: 'الأقسام', labelEn: 'Departments', query: 'ما هي أقسام المستشفى الأهلي؟' },
  { icon: Stethoscope, labelAr: 'الأطباء', labelEn: 'Doctors', query: 'من هم أطباء المستشفى؟' },
  { icon: Calendar, labelAr: 'حجز موعد', labelEn: 'Book', query: '__BOOK_APPOINTMENT__' },
  { icon: Clock, labelAr: 'ساعات العمل', labelEn: 'Hours', query: 'ما هي ساعات عمل المستشفى؟' },
  { icon: Phone, labelAr: 'تواصل', labelEn: 'Contact', query: 'كيف أتواصل مع المستشفى؟' },
  { icon: MessageSquare, labelAr: 'شكوى', labelEn: 'Feedback', query: 'أريد تقديم شكوى أو اقتراح' },
];

const ChatbotWidget = () => {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<BookingState>({ step: 'idle' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, booking]);

  const startBooking = async () => {
    if (!user) {
      setMessages(prev => [...prev,
        { role: 'user', content: lang === 'ar' ? 'أريد حجز موعد' : 'I want to book an appointment' },
        { role: 'assistant', content: lang === 'ar' ? 'يجب تسجيل الدخول أولاً لحجز موعد. يرجى الذهاب إلى صفحة تسجيل الدخول.' : 'You need to log in first to book an appointment. Please go to the login page.' },
      ]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: lang === 'ar' ? 'أريد حجز موعد' : 'I want to book an appointment' }]);
    setIsLoading(true);

    try {
      const resp = await supabase.functions.invoke('chat', {
        body: { action: 'get_departments' },
      });
      if (resp.data?.data) {
        setBooking({ step: 'select_department', departments: resp.data.data });
        setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'اختر القسم الذي تريد حجز موعد فيه:' : 'Choose the department you want to book in:' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'حدث خطأ. يرجى المحاولة لاحقاً.' : 'An error occurred. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectDepartment = async (dept: { id: string; name_ar: string; name_en: string }) => {
    const name = lang === 'ar' ? dept.name_ar : dept.name_en;
    setMessages(prev => [...prev, { role: 'user', content: name }]);
    setIsLoading(true);

    try {
      const resp = await supabase.functions.invoke('chat', {
        body: { action: 'get_doctors', actionData: { department_id: dept.id } },
      });
      
      // If no doctors in this department, get all doctors
      let doctors = resp.data?.data || [];
      if (doctors.length === 0) {
        const allResp = await supabase.functions.invoke('chat', {
          body: { action: 'get_doctors' },
        });
        doctors = allResp.data?.data || [];
      }

      setBooking(prev => ({
        ...prev, step: 'select_doctor', departmentId: dept.id, departmentName: name, doctors,
      }));
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? `اختر الطبيب من قسم ${name}:` : `Choose a doctor from ${name}:` }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'حدث خطأ.' : 'An error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectDoctor = (doc: { id: string; name_ar: string; name_en: string }) => {
    const name = lang === 'ar' ? doc.name_ar : doc.name_en;
    setMessages(prev => [...prev,
      { role: 'user', content: name },
      { role: 'assistant', content: lang === 'ar' ? 'اختر تاريخ الموعد:' : 'Choose the appointment date:' },
    ]);
    setBooking(prev => ({ ...prev, step: 'select_date', doctorId: doc.id, doctorName: name }));
  };

  const selectDate = async (date: string) => {
    setMessages(prev => [...prev, { role: 'user', content: date }]);
    setIsLoading(true);

    try {
      const resp = await supabase.functions.invoke('chat', {
        body: { action: 'get_available_slots', actionData: { doctor_id: booking.doctorId, date } },
      });

      const slots = resp.data?.data || [];
      if (slots.length === 0) {
        setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'لا توجد مواعيد متاحة في هذا اليوم. اختر تاريخاً آخر:' : 'No available slots on this date. Choose another date:' }]);
        return;
      }

      setBooking(prev => ({ ...prev, step: 'select_time', date, availableSlots: slots }));
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'اختر الوقت المناسب:' : 'Choose a suitable time:' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'حدث خطأ.' : 'An error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectTime = (time: string) => {
    const displayTime = time.slice(0, 5);
    setMessages(prev => [...prev, { role: 'user', content: displayTime }]);
    setBooking(prev => ({ ...prev, step: 'confirm', time }));
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: lang === 'ar'
        ? `تأكيد الحجز:\n📋 القسم: ${booking.departmentName}\n👨‍⚕️ الطبيب: ${booking.doctorName}\n📅 التاريخ: ${booking.date}\n🕐 الوقت: ${displayTime}\n\nهل تريد تأكيد الحجز؟`
        : `Booking confirmation:\n📋 Department: ${booking.departmentName}\n👨‍⚕️ Doctor: ${booking.doctorName}\n📅 Date: ${booking.date}\n🕐 Time: ${displayTime}\n\nDo you want to confirm?`,
    }]);
  };

  const confirmBooking = async () => {
    setIsLoading(true);
    try {
      const resp = await supabase.functions.invoke('chat', {
        body: {
          action: 'book_appointment',
          userId: user?.id,
          actionData: {
            doctor_id: booking.doctorId,
            department_id: booking.departmentId,
            appointment_date: booking.date,
            appointment_time: booking.time,
          },
        },
      });

      if (resp.data?.type === 'booking_success') {
        setMessages(prev => [...prev, { role: 'assistant', content: `✅ ${resp.data.message}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${resp.data?.message || 'حدث خطأ'}` }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? '❌ حدث خطأ أثناء الحجز.' : '❌ Booking error occurred.' }]);
    } finally {
      setIsLoading(false);
      setBooking({ step: 'idle' });
    }
  };

  const cancelBooking = () => {
    setBooking({ step: 'idle' });
    setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'تم إلغاء الحجز. كيف يمكنني مساعدتك؟' : 'Booking cancelled. How can I help you?' }]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (text === '__BOOK_APPOINTMENT__') {
      startBooking();
      return;
    }

    // Detect booking intent
    const bookingKeywords = ['حجز', 'موعد', 'احجز', 'بدي احجز', 'book', 'appointment'];
    if (bookingKeywords.some(k => text.toLowerCase().includes(k)) && booking.step === 'idle') {
      startBooking();
      return;
    }

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
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

Departments: ${depts.data?.map(d => `${d.name_ar} (${d.name_en})`).join(', ') || 'N/A'}

Doctors: ${docs.data?.map(d => `${d.name_ar} - ${d.specialty_ar}`).join(', ') || 'N/A'}

Services: ${services.data?.map(s => `${s.name_ar}`).join(', ') || 'N/A'}

Knowledge Base: ${kb.data?.map(k => `${k.title}: ${k.content}`).join('\n') || ''}
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
      const content = data?.choices?.[0]?.message?.content || (typeof data === 'string' ? data : (lang === 'ar' ? 'عذراً، حدث خطأ.' : 'Sorry, an error occurred.'));
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ar' ? 'عذراً، حدث خطأ في الاتصال.' : 'Sorry, connection error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDateOptions = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 5 && d.getDay() !== 6) { // Skip Fri/Sat
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const renderBookingUI = () => {
    if (booking.step === 'select_department' && booking.departments) {
      return (
        <div className="space-y-1.5 px-1">
          {booking.departments.map(dept => (
            <button key={dept.id} onClick={() => selectDepartment(dept)}
              className="w-full text-start p-2.5 rounded-lg bg-muted hover:bg-secondary transition-colors text-xs font-medium flex items-center justify-between group">
              <span>{lang === 'ar' ? dept.name_ar : dept.name_en}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
            </button>
          ))}
          <button onClick={cancelBooking} className="w-full text-center p-2 text-xs text-muted-foreground hover:text-destructive">
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      );
    }

    if (booking.step === 'select_doctor' && booking.doctors) {
      return (
        <div className="space-y-1.5 px-1">
          {booking.doctors.slice(0, 10).map(doc => (
            <button key={doc.id} onClick={() => selectDoctor(doc)}
              className="w-full text-start p-2.5 rounded-lg bg-muted hover:bg-secondary transition-colors text-xs">
              <span className="font-medium">{lang === 'ar' ? doc.name_ar : doc.name_en}</span>
              <span className="block text-muted-foreground text-[10px]">{lang === 'ar' ? doc.specialty_ar : doc.specialty_en}</span>
            </button>
          ))}
          <button onClick={cancelBooking} className="w-full text-center p-2 text-xs text-muted-foreground hover:text-destructive">
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      );
    }

    if (booking.step === 'select_date') {
      const dates = generateDateOptions();
      return (
        <div className="space-y-1.5 px-1">
          <div className="grid grid-cols-2 gap-1.5">
            {dates.map(date => (
              <button key={date} onClick={() => selectDate(date)}
                className="p-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-xs font-medium text-center">
                {new Date(date + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-PS' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>
          <button onClick={cancelBooking} className="w-full text-center p-2 text-xs text-muted-foreground hover:text-destructive">
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      );
    }

    if (booking.step === 'select_time' && booking.availableSlots) {
      return (
        <div className="space-y-1.5 px-1">
          <div className="grid grid-cols-3 gap-1.5">
            {booking.availableSlots.map(slot => (
              <button key={slot} onClick={() => selectTime(slot)}
                className="p-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-xs font-medium text-center">
                {slot.slice(0, 5)}
              </button>
            ))}
          </div>
          <button onClick={cancelBooking} className="w-full text-center p-2 text-xs text-muted-foreground hover:text-destructive">
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      );
    }

    if (booking.step === 'confirm') {
      return (
        <div className="flex gap-2 px-1">
          <Button size="sm" onClick={confirmBooking} disabled={isLoading} className="flex-1 text-xs">
            {lang === 'ar' ? '✅ تأكيد الحجز' : '✅ Confirm'}
          </Button>
          <Button size="sm" variant="outline" onClick={cancelBooking} className="flex-1 text-xs">
            {lang === 'ar' ? '❌ إلغاء' : '❌ Cancel'}
          </Button>
        </div>
      );
    }

    return null;
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
                {booking.step !== 'idle' && (
                  <Button variant="ghost" size="icon" onClick={cancelBooking} className="text-primary-foreground hover:bg-primary-foreground/20 h-7 w-7">
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                  </Button>
                )}
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-primary-foreground font-bold text-sm">
                    {booking.step !== 'idle' ? (lang === 'ar' ? 'حجز موعد' : 'Book Appointment') : t('chat.title')}
                  </h3>
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
              {messages.length === 0 && booking.step === 'idle' && (
                <div className="space-y-3">
                  <div className="bg-secondary rounded-xl rounded-tl-sm p-3 text-sm">
                    {t('chat.welcome')}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, i) => (
                      <button key={i} onClick={() => sendMessage(action.query)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-secondary transition-colors text-xs font-medium text-foreground">
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
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}

              {/* Booking UI */}
              {renderBookingUI()}

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
            {booking.step === 'idle' && (
              <div className="p-3 border-t border-border">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
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
            )}
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
