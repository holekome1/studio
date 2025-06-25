
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons/logo";
import type { UserRole } from "@/types";

const USERS_STORAGE_KEY = "motorparts_users";

const defaultUsers: Record<string, { password: string, role: UserRole }> = {
  admin: { password: 'password', role: 'admin' },
  kepala: { password: 'password', role: 'kepala' },
  manajer: { password: 'password', role: 'manajer' },
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // This state is now primarily for UI, logic will use localStorage as source of truth
  const [users, setUsers] = useState<Record<string, { password: string; role: UserRole }>>({});

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        const initialUsers = defaultUsers;
        setUsers(initialUsers);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
      }
    } catch (error) {
      console.error("Failed to load users from localStorage", error);
      setUsers(defaultUsers);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // FIX: Read directly from localStorage to get the most up-to-date user list
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const currentUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
      const user = currentUsers[username.toLowerCase()];
      
      if (user && user.password === password) {
        const currentUser = { username: username.toLowerCase(), role: user.role };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${currentUser.username}!`,
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Login Gagal",
          description: "Nama pengguna atau kata sandi salah.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }, 1000);
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword || !confirmPassword) {
        toast({ title: "Pendaftaran Gagal", description: "Semua kolom harus diisi.", variant: "destructive"});
        return;
    }
    
    // FIX: Use localStorage as the single source of truth for user data
    const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    const currentUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};

    if (currentUsers[newUsername.toLowerCase()]) {
      toast({ title: "Pendaftaran Gagal", description: "Nama pengguna sudah digunakan.", variant: "destructive"});
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Pendaftaran Gagal", description: "Kata sandi tidak cocok.", variant: "destructive"});
      return;
    }

    const updatedUsers = { ...currentUsers, [newUsername.toLowerCase()]: { password: newPassword, role: 'admin' as UserRole } };
    setUsers(updatedUsers); // Update state for any UI relying on it
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    toast({ title: "Akun Dibuat", description: "Akun baru Anda telah berhasil dibuat. Silakan login." });
    setIsRegisterOpen(false);
    setNewUsername("");
    setNewPassword("");
    setConfirmPassword("");
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
            <CardDescription>Silakan masuk untuk melanjutkan</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nama Pengguna</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin / kepala / manajer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="pt-2 text-center text-xs text-muted-foreground">
                <p>Untuk demo, gunakan salah satu akun di atas.</p>
                <p>Kata sandi untuk semua akun adalah: <strong>password</strong></p>
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
              Buat akun baru untuk mengakses inventaris. Akun baru akan memiliki peran 'admin' secara default.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">Nama Pengguna Baru</Label>
                <Input
                  id="new-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Masukkan nama pengguna"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Kata Sandi Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                   placeholder="Masukkan kata sandi"
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)}>Batal</Button>
              <Button type="submit">Daftar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
