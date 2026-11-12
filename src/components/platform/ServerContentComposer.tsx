import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SectionCard } from "@/components/platform/PlatformShell";
import { Badge, Button, EmptyState, Field, Input, Select, Textarea } from "@/components/lux/ui";
import { supabase } from "@/integrations/supabase/client";
import { AUTH_MODE } from "@/lib/auth/mode";
import { useSession } from "@/lib/auth/SessionProvider";
import {
  createContent,
  hideContent,
  listMyContent,
  type MyContent,
} from "@/lib/content/content.functions";
import { formatDate } from "@/lib/format";

const MAX_COVER_BYTES = 8 * 1024 * 1024;
const MAX_MEDIA_BYTES = 200 * 1024 * 1024;

function extensionOf(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && /^[a-z0-9]{2,5}$/i.test(fromName)) return fromName.toLowerCase();
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "video/quicktime") return "mov";
  if (file.type === "video/webm") return "webm";
  return file.type.startsWith("video/") ? "mp4" : "jpg";
}

/**
 * Publicación real desde el estudio.
 *
 * La portada va al bucket público y la pieza completa al bucket privado. La
 * ruta siempre empieza por `creators/<uid>/`, que es lo que exige la política
 * de Storage. El registro lo crea una server function que valida rol y
 * pertenencia: el navegador no puede inventar precio ni estado.
 */
export function ServerContentComposer() {
  const session = useSession();
  const [form, setForm] = useState({
    kind: "clip" as "post" | "clip",
    title: "",
    description: "",
    category: "Editorial",
    visibility: "ppv" as "public" | "members" | "ppv",
    priceMXN: 120,
  });
  const [cover, setCover] = useState<File | null>(null);
  const [media, setMedia] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<MyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const coverInput = useRef<HTMLInputElement | null>(null);
  const mediaInput = useRef<HTMLInputElement | null>(null);

  const reload = useCallback(async () => {
    try {
      setItems(await listMyContent());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (AUTH_MODE !== "live") {
      setLoading(false);
      return;
    }
    void reload();
  }, [reload]);

  if (AUTH_MODE !== "live") return null;

  if (session.viewer?.role !== "creator") {
    return (
      <SectionCard
        title="Publicar en la plataforma"
        description="Solo las cuentas vinculadas a un perfil de creadora pueden publicar."
      >
        <p className="text-xs leading-relaxed text-muted-foreground">
          Tu cuenta está registrada como miembro. Si eres creadora, pide a administración que
          vincule tu correo a tu perfil.
        </p>
      </SectionCard>
    );
  }

  const upload = async (file: File, bucket: "xclusive-public" | "vault") => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error("Sesión no válida.");
    const path = `creators/${userData.user.id}/${crypto.randomUUID()}.${extensionOf(file)}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    return path;
  };

  const submit = async (publish: boolean) => {
    if (busy) return;
    if (form.title.trim().length < 3) {
      toast.error("Escribe un título de al menos 3 caracteres.");
      return;
    }
    if (!cover) {
      toast.error("Sube una portada para la pieza.");
      return;
    }
    if (cover.size > MAX_COVER_BYTES) {
      toast.error("La portada supera 8 MB.");
      return;
    }
    if (media && media.size > MAX_MEDIA_BYTES) {
      toast.error("El archivo supera 200 MB.");
      return;
    }

    setBusy(true);
    try {
      const coverPath = await upload(cover, "xclusive-public");
      const { data: publicUrl } = supabase.storage.from("xclusive-public").getPublicUrl(coverPath);
      const mediaPath = media ? await upload(media, "vault") : "";

      const result = await createContent({
        data: {
          kind: form.kind,
          title: form.title,
          description: form.description,
          category: form.category,
          priceMXN: form.priceMXN,
          visibility: form.visibility,
          coverUrl: publicUrl.publicUrl,
          mediaPath,
          publish,
        },
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(publish ? "Pieza publicada." : "Borrador guardado.");
      setForm((prev) => ({ ...prev, title: "", description: "" }));
      setCover(null);
      setMedia(null);
      if (coverInput.current) coverInput.current.value = "";
      if (mediaInput.current) mediaInput.current.value = "";
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo publicar.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    const result = await hideContent({ data: { id } });
    toast(result.message);
    if (result.ok) await reload();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <SectionCard
        title="Publicar en la plataforma"
        description="Portada pública; archivo completo en la bóveda privada."
        className="lg:col-span-6"
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tipo">
              <Select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as "post" | "clip" })}
              >
                <option value="clip">Clip</option>
                <option value="post">Publicación</option>
              </Select>
            </Field>
            <Field label="Categoría">
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Editorial"
              />
            </Field>
          </div>

          <Field label="Título" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Sesión de medianoche"
              maxLength={120}
            />
          </Field>

          <Field label="Descripción">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={2000}
              placeholder="Qué incluye la pieza y qué encontrará quien la compre."
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Acceso">
              <Select
                value={form.visibility}
                onChange={(e) =>
                  setForm({
                    ...form,
                    visibility: e.target.value as "public" | "members" | "ppv",
                  })
                }
              >
                <option value="ppv">Pago por pieza</option>
                <option value="members">Solo miembros</option>
                <option value="public">Público</option>
              </Select>
            </Field>
            <Field label="Precio MXN">
              <Input
                type="number"
                min={10}
                max={20000}
                value={form.priceMXN}
                onChange={(e) => setForm({ ...form, priceMXN: Number(e.target.value) })}
                disabled={form.visibility !== "ppv"}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer flex-col gap-1.5 rounded-xl border border-dashed border-hairline p-3 text-xs text-muted-foreground hover:border-signal/40">
              <span className="flex items-center gap-2 text-pearl">
                <ImagePlus className="h-3.5 w-3.5" /> Portada
              </span>
              <span>{cover ? cover.name : "JPG, PNG o WebP · máx. 8 MB"}</span>
              <input
                ref={coverInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              />
            </label>
            <label className="flex cursor-pointer flex-col gap-1.5 rounded-xl border border-dashed border-hairline p-3 text-xs text-muted-foreground hover:border-signal/40">
              <span className="flex items-center gap-2 text-pearl">
                <Upload className="h-3.5 w-3.5" /> Archivo privado
              </span>
              <span>{media ? media.name : "Video o imagen · máx. 200 MB"}</span>
              <input
                ref={mediaInput}
                type="file"
                accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => setMedia(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void submit(true)}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Publicar
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => void submit(false)}>
              Guardar borrador
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Mis piezas en servidor"
        description="Lo que se ve en el catálogo público sale de aquí, no del navegador."
        className="lg:col-span-6"
      >
        {loading ? (
          <p className="text-xs text-muted-foreground">Consultando…</p>
        ) : items.length === 0 ? (
          <EmptyState
            title="Sin piezas todavía."
            description="Publica tu primera pieza: la portada será visible y el archivo quedará protegido."
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-hairline bg-white/[0.02] p-2.5"
              >
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt=""
                    width={48}
                    height={64}
                    loading="lazy"
                    className="h-16 w-12 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-16 w-12 shrink-0 rounded-md bg-white/5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-pearl">{item.title}</p>
                  <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                    {formatDate(item.createdAt)} · {item.kind}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone={item.status === "published" ? "success" : "outline"}>
                      {item.status === "published"
                        ? "Publicada"
                        : item.status === "draft"
                          ? "Borrador"
                          : "Oculta"}
                    </Badge>
                    <Badge tone="dark">
                      {item.visibility === "ppv" ? `$${item.priceMXN} MXN` : item.visibility}
                    </Badge>
                    {item.hasMedia ? <Badge tone="info">Archivo privado</Badge> : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(item.id)}
                  aria-label="Ocultar pieza"
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-pearl"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
