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

## معلومات تفصيلية عن المستشفى (من الموقع الرسمي ahli.org):

### نبذة عن المستشفى:
المستشفى الأهلي هو مستشفى أهلي خيري في مدينة الخليل - فلسطين. تأسس بفضل المحسنين والمتبرعين. يقدم خدمات طبية شاملة تشمل العمليات الجراحية والعيادات الخارجية والطوارئ والعناية المركزة والمختبرات والأشعة.

### الأقسام الطبية الكاملة:
1. مركز الأهلي للقلب والشرايين
2. قسم الأطفال وحديثي الولادة
3. قسم العيادات الخارجية
4. قسم الأشعة والأشعة التداخلية
5. قسم الإسعاف والطوارئ
6. قسم الطب النووي
7. قسم العناية المركزة
8. قسم الجهاز الهضمي والتنظير
9. الأقسام الجراحية
10. قسم الأمراض الباطنية
11. قسم العمليات الجراحية
12. قسم النسائية والتوليد

### الكادر الطبي الكامل:
- د.هشام نصار نصار - رئيس قسم مركز الاهلي للقلب والشرايين
- د.يزن بلال الزعتري - التخدير والانعاش
- د.يوسف عاطف أبو عصبة - جراحة الصدر
- د.بسام غالب ناصر الدين - النسائية والتوليد
- د.رشاد مرشد الزرو - جراحة التجميل والحروق
- د.رفيق محمد سلهب - الجراحة العامة
- د.عبدالناصر محمد ابوريان - النسائية والتوليد
- د.أمجد شهاب مجاهد - جراحة العيون
- د.أمجد ناصر النتشة - الامراض الباطنية
- د.أنس يحيى شاور - القلب والقسطرة
- د.إبراهيم الزعتري - الاشعة التشخيصية
- د.إسماعيل محمد دبابسة - جراحة التجميل والحروق
- د.ابراهيم صالح شماسنة - أمراض الجهاز الهضمي للاطفال
- د.احمد أكرم أبو عياش - الجهاز الهضمي والكبد
- د.احمد اسماعيل ارزيقات - علاج الالم التداخلي
- د.احمد موسى دار سليم - جراحة القلب للاطفال
- د.احمد نادي عطاونة - أمراض وزراعة الكلى
- د.احمد نايف علي حساسنه - الاشعة التشخيصية
- د.اسامة باسم قمصية - جراحة الاطفال
- د.اسامه عبد الرحيم النتشة - الامراض الباطنية
- د.اشرف حمدي الزغير - رئيس وحدة العناية المركزة الباطنية
- د.انس غالب ابو رميله - الغدد الصماء والسكري
- د.باجس عبد الرحمن عمرو - القلب والقسطرة
- د.باسل امين الغروز - كلى الاطفال
- د.باسم عبد الله مجاهد - جراحة العظام والمفاصل
- د.بدوي محمد بدوي التميمي - الجهاز الهضمي والكبد
- د.بسام حسن البشيتي - اعصاب اطفال
- د.بشر مرزوق مرزوقة - جراحة القلب
- د.بلال يوسف الشوامرة - أمراض وزراعة الكلى
- د.تامر حسام قطينه - العناية المكثفة للأطفال
- د.جعفر احمد عايش - جراحة الوجه و الفم والفكين
- د.حازم عبد الحفيظ الاشهب - الجهاز الهضمي والكبد
- د.حبيب محمد شاور - الاشعة التشخيصية
- د.حسن ابراهيم الحروب - الامراض الباطنية
- د.حمزه محمد الزهور - الامراض الباطنية
- د.حمزه محمد زغير - علم التشريح
- د.خضر رسمي حسونة - جراحة الكلى و المسالك البولية
- د.رجائي محمد الحسيني - جراحة الاوردة والشرايين
- د.روند اديب العارضة - أمراض المفاصل والروماتيزم
- د.سائد اسماعيل العطاونة - أمراض المفاصل والروماتيزم
- د.سعيد محمد صبحي اتكيدك - جراحة الدماغ والاعصاب والعمود الفقري
- د.سفيان محمد ابو عوض - امراض الصدر والرئتين
- د.شريف عبد الحليم أبو عوض - الدماغ والأعصاب
- د.شريف عيسى بصل - جراحة الدماغ والاعصاب والعمود الفقري
- د.شهاب وليد القواسمي - الاطفال وحديثي الولادة
- د.صفوت رافع زيدات - الامراض المعدية
- د.صلاح الدين صادق الهشلمون - رئيس قسم تخدير النسائية والتوليد
- د.ضرار اسماعيل سميرات - النسائية والتوليد
- د.ضرار خالد الزعتري - رئيس قسم التخدير والانعاش
- د.طارق علي موسى - القلب والقسطرة
- د.طاهر محمد عيد الشريف - الاطفال وحديثي الولادة
- د.طلحة محمد اسعيد - جراحة القلب
- د.عامر ابو رميلة - الجراحة العامة
- د.عبد الفتاح عبد الحافظ نوفل - النسائية والتوليد
- د.عبدالودود احمد ابوتركي - الامراض الباطنية
- د.عبيدة يوسف ربعي - الطب النووي
- د.عروة محمد الفلاح - المدير الطبي
- د.عز الدين غازي اقطيط - امراض الدم
- د.عزالدين عبدالسميع البكري - علم التشريح
- د.عصام اسحق الشماس - رئيس وحدة العناية المركزة الجراحية
- د.علاء موسى العزة - جراحة الكلى و المسالك البولية
- د.علي محمد حميدات - الاطفال وحديثي الولادة
- د.فاطمة عبد المجيد الناظر - جراحة الفم و الاسنان
- د.فايز عبدالله مجاهد - التخدير والانعاش
- د.فلاح صلاح الدين عبيدو - التخدير والانعاش
- د.فهمي عبد الرحمن جبران - الجراحة العامة
- د.فوزي مازن ابو نجمة - حمى البحر المتوسط والروماتيزم للاطفال
- د.لؤي خميس المحتسب - الامراض الباطنية
- د.لؤي نسيم السعيد - الحمل الخطر وفحص اعضاء الجنين
- د.مجدي غانم حمامده - التخدير والانعاش
- د.محمد الجنيدي - جراحة العظام والمفاصل
- د.محمد جميل الهشلمون - الجراحة العامة
- د.محمد حمزه سياج - التخدير والانعاش
- د.محمد زياد العويوي - جراحة الدماغ والاعصاب والعمود الفقري
- د.محمد صلاح الشريف - الجلدية
- د.محمد علي نصر - القلب والقسطرة
- د.محمد ماجد الدويك - الامراض الباطنية
- د.محمد ماجد سكافي - العناية المركزة للاطفال
- د.محمود ابراهيم الهور - امراض الصدر والرئتين
- د.محمود علي سليمان - كهرباء القلب
- د.مراد ابراهيم قباجة - جراحة العظام والمفاصل
- د.مراد رافع الجعافرة - الجراحة العامة
- د.مراد ماهر النتشه - جراحة العظام والمفاصل
- د.مسعد عبد الرؤوف شاور - الامراض الباطنية
- د.مطيع حسن أبو عواد - الاطفال وحديثي الولادة
- د.معتز عبد الرحيم النتشة - علم التشريح
- د.معتز محمد بشارات - الجراحة العامة
- د.معتز محمد فوزي الكركي - الانف والاذن والحنجرة
- د.منذر برهان قفيشة - جراحة العظام والمفاصل
- د.مهند حسن علامة - جراحة الكلى و المسالك البولية
- د.نائل حسين اللحام - قلب الاطفال
- د.نادرة سعدي دعامسة - امراض الايض والجينات للأطفال
- د.نبيل اسحق عاشور - الانف والاذن والحنجرة
- د.نزار علي الحجه - جراحة القلب للاطفال
- د.نضال عيد الجبريني - الاورام
- د.نظام عبدالصمد ابوسنينه - التخدير والانعاش
- د.نور الهدى صوالحه - السكري والغدد الصماء للأطفال
- د.هاني محمد حور - الاورام
- د.هشام عزيز الدويك - قلب الاطفال

### الهيئة الإدارية:
- أ. هدى عبد الغني عبد النبي - رئيس الجمعية
- د. نافذ كمال ناصر الدين - نائب الرئيس
- أ. مروان عمر شاهين - أمين السر
- م. أيمن يوسف صادق سلطان - أمين الصندوق
- أ. كفاح صبحي الشريف - مسؤول المشتريات والعطائات
- أ. سعدي السراحنة - مسؤول المشاريع
- أ. عز الدين عيسى فراح - مسؤول شؤون الموظفين
- أ. محمد زياد عثمان الجعبري - مسؤول التطوير والجودة والتخطيط
- أ. موسى محمد عوني البكري - مسؤول العلاقات العامة

### صندوق المريض المحتاج:
صندوق لجمع التبرعات للمرضى المحتاجين والغير قادرين على دفع تكاليف العلاج.
حسابات التبرع:
- Islamic Palestinian Bank: Hebron - Palestine - 31000
- Arab Islamic Bank: Hebron - Palestine - 19256

### إحصائيات شهرية:
- 642 عملية جراحية
- 3,305 زيارة لقسم الطوارئ
- 7,834 مراجعة للعيادات الخارجية
- 41,622 فحص مخبري
- 4,692 صورة إشعاعية
- 364 ولادة

## قواعد صارمة يجب اتباعها:
1. أجب فقط على الأسئلة المتعلقة بالمستشفى الأهلي: الأقسام، الأطباء، الخدمات، المواعيد، الموقع، ساعات العمل، التواصل، التأمين، الأخبار والإعلانات، الهيئة الإدارية، صندوق المريض، وأي شيء يخص المستشفى.
2. إذا سألك أحد سؤالاً لا علاقة له بالمستشفى (مثل: أسئلة عامة، برمجة، طبخ، رياضة، سياسة، أخبار عامة، ألعاب، أو أي موضوع آخر)، أجب بأدب:
   - بالعربية: "عذراً، أنا المساعد الذكي للمستشفى الأهلي فقط. يمكنني مساعدتك في أي استفسار يخص المستشفى كالأقسام والأطباء والمواعيد والخدمات. كيف يمكنني مساعدتك؟"
   - بالإنجليزية: "Sorry, I'm the Al-Ahli Hospital virtual assistant only. I can help you with hospital inquiries such as departments, doctors, appointments, and services. How can I help you?"
3. أجب باللغة العربية دائماً إلا إذا سألك المستخدم بالإنجليزية.
4. كن ودوداً ومختصراً ومهنياً.
5. إذا لم تعرف إجابة سؤال يخص المستشفى، اقترح الاتصال بالمستشفى على الرقم 0097022224555 أو البريد info@ahli.org.
6. إذا أراد المريض حجز موعد، أخبره أن يكتب "أريد حجز موعد" أو "حجز موعد مع د.[اسم الطبيب]" للحجز مباشرة مع طبيب معين.
7. لا تخترع معلومات غير موجودة في البيانات المتاحة لك.
8. إذا سأل المستخدم عن الأخبار أو الإعلانات أو آخر المستجدات، استخدم قسم "آخر الأخبار والإعلانات" للإجابة.

## معلومات المستشفى الأساسية:
- الاسم: المستشفى الأهلي - الخليل
- الهاتف: 0097022224555
- الفاكس: 0097222229247
- البريد: info@ahli.org
- الموقع: الخليل، فلسطين
- الموقع الإلكتروني: https://ahli.org/ar/
- الطوارئ: 24 ساعة / 7 أيام
- العيادات: 8:00 صباحاً - 3:00 مساءً (أحد - خميس)`;

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
