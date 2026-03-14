import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context, action, actionData, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle appointment booking action
    if (action === 'book_appointment' && actionData && userId) {
      const { doctor_id, department_id, appointment_date, appointment_time } = actionData;
      
      const { data: existing } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', doctor_id)
        .eq('appointment_date', appointment_date)
        .eq('appointment_time', appointment_time)
        .neq('status', 'cancelled');

      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({
          type: 'booking_conflict',
          message: 'هذا الموعد محجوز بالفعل. يرجى اختيار وقت آخر.',
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: apt, error: aptError } = await supabase
        .from('appointments')
        .insert({
          patient_id: userId,
          doctor_id,
          department_id,
          appointment_date,
          appointment_time,
          status: 'pending',
        })
        .select()
        .single();

      if (aptError) {
        console.error('Booking error:', aptError);
        return new Response(JSON.stringify({
          type: 'booking_error',
          message: 'حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.',
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        type: 'booking_success',
        message: `تم حجز موعدك بنجاح! رقم الحجز: ${apt.id.slice(0, 8)}`,
        appointment: apt,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Handle fetching departments list
    if (action === 'get_departments') {
      const { data } = await supabase.from('departments').select('id, name_ar, name_en').eq('is_active', true);
      return new Response(JSON.stringify({ type: 'departments', data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle fetching doctors by department
    if (action === 'get_doctors') {
      let query = supabase.from('doctors').select('id, name_ar, name_en, specialty_ar, specialty_en, department_id').eq('is_active', true);
      if (actionData?.department_id) {
        query = query.eq('department_id', actionData.department_id);
      }
      const { data } = await query;
      return new Response(JSON.stringify({ type: 'doctors', data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle fetching available time slots
    if (action === 'get_available_slots') {
      const { doctor_id, date } = actionData;
      
      const { data: booked } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctor_id)
        .eq('appointment_date', date)
        .neq('status', 'cancelled');

      const bookedTimes = new Set((booked || []).map(a => a.appointment_time));
      
      const slots: string[] = [];
      for (let h = 8; h <= 15; h++) {
        for (const m of ['00', '30']) {
          if (h === 15 && m === '30') continue;
          const time = `${h.toString().padStart(2, '0')}:${m}:00`;
          if (!bookedTimes.has(time)) {
            slots.push(time);
          }
        }
      }

      return new Response(JSON.stringify({ type: 'available_slots', data: slots }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch active announcements to include in chatbot context
    const { data: announcements } = await supabase
      .from('announcements')
      .select('title_ar, title_en, content_ar, content_en')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(20);

    const announcementsContext = announcements && announcements.length > 0
      ? `\n\n## آخر الأخبار والإعلانات:\n${announcements.map((a, i) => `${i + 1}. ${a.title_ar}: ${a.content_ar}`).join('\n')}`
      : '';

    // Regular chat - AI response (HOSPITAL-ONLY)
    const systemPrompt = `أنت المساعد الذكي الرسمي للمستشفى الأهلي في مدينة الخليل - فلسطين.

## دورك:
أنت مساعد متخصص فقط وحصرياً بالمستشفى الأهلي وخدماته. لا تجيب على أي أسئلة خارج نطاق المستشفى.

## البيانات المتاحة لك:
${context || ''}
${announcementsContext}

## قواعد صارمة يجب اتباعها:
1. أجب فقط على الأسئلة المتعلقة بالمستشفى الأهلي: الأقسام، الأطباء، الخدمات، المواعيد، الموقع، ساعات العمل، التواصل، التأمين، الأخبار والإعلانات، وأي شيء يخص المستشفى.
2. إذا سألك أحد سؤالاً لا علاقة له بالمستشفى (مثل: أسئلة عامة، برمجة، طبخ، رياضة، سياسة، أخبار، ألعاب، أو أي موضوع آخر)، أجب بأدب:
   - بالعربية: "عذراً، أنا المساعد الذكي للمستشفى الأهلي فقط. يمكنني مساعدتك في أي استفسار يخص المستشفى كالأقسام والأطباء والمواعيد والخدمات. كيف يمكنني مساعدتك؟"
   - بالإنجليزية: "Sorry, I'm the Al-Ahli Hospital virtual assistant only. I can help you with hospital inquiries such as departments, doctors, appointments, and services. How can I help you?"
3. أجب باللغة العربية دائماً إلا إذا سألك المستخدم بالإنجليزية.
4. كن ودوداً ومختصراً ومهنياً.
5. إذا لم تعرف إجابة سؤال يخص المستشفى، اقترح الاتصال بالمستشفى على الرقم 0097022224555 أو البريد info@ahli.org.
6. إذا أراد المريض حجز موعد، أخبره أن يضغط على زر "حجز موعد" في القائمة السريعة أو يكتب "أريد حجز موعد".
7. لا تخترع معلومات غير موجودة في البيانات المتاحة لك.
8. إذا سأل المستخدم عن الأخبار أو الإعلانات أو آخر المستجدات، استخدم قسم "آخر الأخبار والإعلانات" للإجابة.

## معلومات المستشفى الأساسية:
- الاسم: المستشفى الأهلي - الخليل
- الهاتف: 0097022224555
- الفاكس: 0097222229247
- البريد: info@ahli.org
- الموقع: الخليل، فلسطين
- الطوارئ: 24 ساعة / 7 أيام
- العيادات: 8:00 صباحاً - 3:00 مساءً`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
