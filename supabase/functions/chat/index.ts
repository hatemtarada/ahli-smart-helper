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
      
      // Check if slot is already taken
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
      
      // Get booked appointments for this doctor on this date
      const { data: booked } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctor_id)
        .eq('appointment_date', date)
        .neq('status', 'cancelled');

      const bookedTimes = new Set((booked || []).map(a => a.appointment_time));
      
      // Generate standard time slots (8 AM to 3 PM, 30-min intervals)
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

    // Regular chat - AI response
    const systemPrompt = `أنت المساعد الذكي للمستشفى الأهلي في الخليل - فلسطين. أجب على أسئلة المرضى والزوار بشكل ودود ومفيد.

${context || ''}

تعليمات مهمة:
- أجب باللغة العربية دائماً إلا إذا سألك المستخدم بالإنجليزية
- كن ودوداً ومختصراً
- إذا لم تعرف الإجابة، اقترح الاتصال بالمستشفى على الرقم 0097022224555
- ساعد المرضى في معرفة الأقسام والأطباء والخدمات
- إذا أراد المريض حجز موعد، أخبره أن يضغط على زر "حجز موعد" في القائمة السريعة أو يكتب "أريد حجز موعد"
- وجه المرضى لحجز المواعيد من خلال بوابة المريض أو الشات بوت`;

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
