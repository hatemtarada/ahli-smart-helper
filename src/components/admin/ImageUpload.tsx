import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { ImagePlus, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
}

const ImageUpload = ({ value, onChange, folder = 'general' }: ImageUploadProps) => {
  const { lang } = useI18n();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(lang === 'ar' ? 'حجم الملف كبير جداً (الحد 5MB)' : 'File too large (max 5MB)');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('hospital-uploads')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hospital-uploads')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success(lang === 'ar' ? 'تم رفع الصورة' : 'Image uploaded');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(lang === 'ar' ? 'خطأ في رفع الصورة' : 'Upload error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="w-24 h-24 object-cover rounded-lg border border-border" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -end-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-1"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {uploading
            ? (lang === 'ar' ? 'جاري الرفع...' : 'Uploading...')
            : (lang === 'ar' ? 'إضافة صورة' : 'Add Image')}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

export default ImageUpload;
