/**
 * ImageUpload — drag & drop + Cloudinary direct upload
 * Props:
 *   value     {string}   current image URL
 *   onChange  {fn}       called with new URL string
 *   label     {string}   optional field label
 */
import { useRef, useState, useCallback } from "react";
import {
  MantineProvider, Box, Text, Progress, Image, ActionIcon, Group,
  TextInput, Button, UnstyledButton,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { FaUpload, FaXmark, FaImage, FaLink } from "react-icons/fa6";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { useToast } from "../../context/ToastContext";
import { mantineTheme } from "../../mantineTheme";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

function ImageUploadInner({ value, onChange, label }) {
  const toast = useToast();
  const inputRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const MAX_SIZE_MB = 2;
  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("يرجى اختيار ملف صورة"); return; }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم الصورة كبير — الحد الأقصى ${MAX_SIZE_MB} ميجابايت`);
      return;
    }
    if (!CLOUD_NAME) { toast.error("Cloudinary غير مضبوط — تحقق من VITE_CLOUDINARY_CLOUD_NAME"); return; }
    setUploading(true); setProgress(0);
    try {
      const data = await uploadToCloudinary(file, setProgress);
      onChange(data.url);
      toast.success("تم رفع الصورة بنجاح");
    } catch (err) {
      toast.error(err.message || "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }, []);
  const onDrop = useCallback((e) => { e.preventDefault(); setIsDragging(false); upload(e.dataTransfer.files[0]); }, []);
  const onFileInput = (e) => { upload(e.target.files[0]); e.target.value = ""; };

  const confirmUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) { onChange(trimmed); setUrlInput(""); setUrlMode(false); }
  };

  return (
    <Box>
      {label && <Text size="sm" fw={600} mb={4}>{label}</Text>}

      {uploading && (
        <Box bg="blue.0" p="md" style={{ border: "1px solid var(--mantine-color-blue-3)" }}>
          <Text size="sm" c="blue.7" fw={600} mb={8}>جاري الرفع... {progress}%</Text>
          <Progress value={progress} color="blue" size="sm" />
        </Box>
      )}

      {!uploading && value && (
        <Box pos="relative" style={{ border: "1px solid var(--mantine-color-gray-3)", overflow: "hidden" }}>
          <Image src={value} alt="" h={176} fit="cover" />
          <Group pos="absolute" bottom={8} left="50%" style={{ transform: "translateX(-50%)" }} gap={8}>
            <Button size="xs" variant="white" leftSection={<FaUpload size={12} />} onClick={() => inputRef.current?.click()}>تغيير</Button>
            <Button size="xs" color="red" leftSection={<FaXmark size={12} />} onClick={() => onChange("")}>حذف</Button>
          </Group>
        </Box>
      )}

      {!uploading && !value && urlMode && (
        <Group gap={8}>
          <TextInput
            autoFocus style={{ flex: 1 }} value={urlInput} placeholder="https://..."
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmUrl()}
          />
          <Button color="brand" onClick={confirmUrl}>إضافة</Button>
          <ActionIcon variant="default" size="lg" onClick={() => { setUrlMode(false); setUrlInput(""); }}><FaXmark size={14} /></ActionIcon>
        </Group>
      )}

      {!uploading && !value && !urlMode && (
        <UnstyledButton
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={() => CLOUD_NAME && inputRef.current?.click()}
          disabled={!CLOUD_NAME}
          w="100%" p="lg" ta="center"
          style={{
            border: `2px dashed ${isDragging ? "var(--mantine-color-brand-6)" : "var(--mantine-color-gray-3)"}`,
            background: isDragging ? "var(--mantine-color-brand-0)" : undefined,
            cursor: CLOUD_NAME ? "pointer" : "not-allowed",
            opacity: CLOUD_NAME ? 1 : 0.5,
          }}
        >
          <FaImage size={32} color={isDragging ? "var(--mantine-color-brand-6)" : "var(--mantine-color-gray-4)"} style={{ margin: "0 auto 8px" }} />
          <Text size="sm" fw={600} c={isDragging ? "brand.6" : "dimmed"}>
            {isDragging ? "أفلت الصورة هنا" : "اسحب صورة أو اضغط للاختيار"}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>PNG, JPG, WEBP • يرفع مباشرة على Cloudinary</Text>
          <Group justify="center" gap={4} mt="sm" c="brand.6" onClick={(e) => { e.stopPropagation(); setUrlMode(true); }}>
            <FaLink size={11} />
            <Text size="xs">أو أدخل رابط URL</Text>
          </Group>
        </UnstyledButton>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileInput} />
    </Box>
  );
}

export default function ImageUpload(props) {
  return (
    <MantineProvider theme={mantineTheme}>
      <ImageUploadInner {...props} />
    </MantineProvider>
  );
}
