
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons/logo";
import type { UserRole } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Berhasil",
        description: `Selamat datang kembali!`,
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      let description = "Terjadi kesalahan. Silakan coba lagi.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = "Email atau kata sandi salah.";
      }
      toast({
        title: "Login Gagal",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !confirmPassword) {
        toast({ title: "Pendaftaran Gagal", description: "Semua kolom harus diisi.", variant: "destructive"});
        return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Pendaftaran Gagal", description: "Kata sandi tidak cocok.", variant: "destructive"});
      return;
    }

    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
        const user = userCredential.user;

        // Store user role in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: selectedRole
        });
        
        toast({ title: "Akun Dibuat", description: "Akun baru Anda telah berhasil dibuat. Silakan login." });
        setIsRegisterOpen(false);
        setNewEmail("");
        setNewPassword("");
        setConfirmPassword("");
    } catch (error: any) {
        console.error("Registration error:", error);
        let description = "Terjadi kesalahan saat pendaftaran.";
        if (error.code === 'auth/email-already-in-use') {
            description = "Email ini sudah terdaftar.";
        } else if (error.code === 'auth/weak-password') {
            description = "Kata sandi terlalu lemah. Minimal 6 karakter.";
        }
        toast({ title: "Pendaftaran Gagal", description: description, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Logo className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle>GUDANG MAJU SEJAHTRA</CardTitle>
            <CardDescription>Gunakan akun Firebase Anda. Belum punya? Buat akun untuk mencoba semua fitur. Contoh email: admin@contoh.com, kepala@contoh.com, dll.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cth., admin@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </CardFooter>
          </form>
           <div className="p-6 pt-0 text-center text-sm">
              Belum punya akun?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => setIsRegisterOpen(true)}>
                Buat akun baru
              </Button>
            </div>
        </Card>
      </div>
      
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Akun Baru</DialogTitle>
            <DialogDescription>
              Buat akun baru untuk mengakses inventaris.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="cth., namaanda@contoh.com"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Kata Sandi</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  disabled={isLoading}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Kata Sandi</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Masukkan kembali kata sandi"
                  disabled={isLoading}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="role">Peran (Role)</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)} disabled={isLoading}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin Gudang</SelectItem>
                        <SelectItem value="kepala">Kepala Gudang</SelectItem>
                        <SelectItem value="manajer">Manajer</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)} disabled={isLoading}>Batal</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Mendaftarkan...' : 'Daftar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
