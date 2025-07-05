
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { DummyUser } from "@/types";

const dummyUsers: DummyUser[] = [
    { username: 'admin', password: 'password', role: 'admin' },
    { username: 'kepala', password: 'password', role: 'kepala' },
    { username: 'manajer', password: 'password', role: 'manajer' },
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        const foundUser = dummyUsers.find(
            (user) => user.username === username && user.password === password
        );

        if (foundUser) {
            // Don't store password in localStorage
            const { password, ...userToStore } = foundUser;
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
            
            toast({
                title: "Login Berhasil",
                description: `Selamat datang kembali, ${foundUser.username}!`,
            });
            // Use window.location to force a full reload, ensuring useAuth hook gets the new user
            window.location.href = '/dashboard';
        } else {
            toast({
                title: "Login Gagal",
                description: "Username atau kata sandi salah.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
    }, 500); // Simulate network delay
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
               <Image src="/logo.png" alt="Gudang Maju Sejahtera Logo" width={64} height={64} className="rounded-md" />
            </div>
            <CardTitle>GUDANG MAJU SEJAHTRA</CardTitle>
            <CardDescription>
              Gunakan akun demo di bawah ini untuk masuk. <br/>
              Semua kata sandi adalah: <b>password</b>
              <ul className="list-disc list-inside mt-2 text-left w-fit mx-auto">
                  <li><b>admin</b> (Akses Penuh)</li>
                  <li><b>kepala</b> (Transaksi & Stok)</li>
                  <li><b>manajer</b> (Hanya Lihat)</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="cth., admin"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
