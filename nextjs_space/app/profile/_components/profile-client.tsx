'use client';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, Save, User } from 'lucide-react';

export function ProfileClient() {
  const { data: session } = useSession() || {};
  const [alias, setAlias] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then((d: any) => {
      setAlias(d.alias || '');
      setAvatarUrl(d.avatarUrl || null);
      setFirstName(d.firstName || '');
      setEmail(d.email || '');
    }).catch(() => {});
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Solo imágenes'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const upRes = await fetch('/api/upload/presigned', { method: 'POST', body: formData });
      if (!upRes.ok) throw new Error('Upload failed');
      const { url } = await upRes.json();
      const saveRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: url }),
      });
      if (!saveRes.ok) throw new Error('Profile update failed');
      setAvatarUrl(url);
      toast.success('Foto actualizada');
    } catch {
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const saveAlias = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: alias.trim() }),
      });
      if (res.ok) toast.success('Alias guardado');
      else toast.error('Error');
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold mb-6">Mi Perfil</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto y Alias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center border-4 border-primary/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
              {uploading && <p className="text-xs text-muted-foreground animate-pulse">Subiendo...</p>}
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-xs">Nombre</Label>
                <p className="font-medium">{firstName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="font-medium">{email}</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="alias">Alias (nombre público)</Label>
                <div className="flex gap-2">
                  <Input
                    id="alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Tu apodo..."
                    maxLength={30}
                    className="flex-1"
                  />
                  <Button onClick={saveAlias} disabled={saving} size="sm">
                    <Save className="h-4 w-4 mr-1" /> Guardar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Este alias se mostrará en el ranking y el podio en lugar de tu nombre real.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
