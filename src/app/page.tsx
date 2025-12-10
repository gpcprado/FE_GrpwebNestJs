'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { saveToken } from '@/lib/auth';
import { API_BASE } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle  } from '@/components/ui/card';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Home() {

  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassword(''); 
        setError(data.message || 'Login Failed');
        return; 
      }
      
      saveToken(data.accessToken);
      router.push('/dashboard');
    
    } catch (err) {
      setError('Network Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="max-w-2xl w-full flex flex-col md:flex-row items-start md:items-center justify-center md:space-x-12 p-8">
            
            <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
            <Image
              src="/GWEB.png"
              alt="GRPWEB Logo"
              width={32}
              height={32}
              className="ml-21 mb-5 w-20 h-20 object-contain rounded-full border border-blue-500/50"
            />
                <h1 className="text-6xl font-extrabold text-blue-800 tracking-tighter">
                    GRPWEB
                </h1>
                <p className="text-2xl text-gray-700 mt-2">
                    Connect with GRPWEB.
                </p>
                
            </div>
            <Card 
                className="w-full max-w-md 
                bg-white border border-gray-300 
                text-gray-800 shadow-xl rounded-xl" 
            >
                <CardContent className="p-6 pt-8">
                    <form onSubmit={handleLogin} className="space-y-4">

                        <div className="relative">
                            <Input
                                placeholder="Email address or username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-4 pr-4 h-12 border border-gray-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1877F2] text-base"
                                required
                                disabled={loading}
                            ></Input>
                        </div>

                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-4 pr-10 h-12 border border-gray-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1877F2] text-base"
                                required
                                disabled={loading}
                            ></Input>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#1877F2] transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                            </button>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center bg-red-100 border border-red-300 rounded-md p-2">
                                {error}
                            </div>
                        )}

                        <Button 
                            className="w-full bg-blue-800 hover:bg-blue-700 text-white font-bold py-3 text-lg rounded-lg 
                            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                                    Authenticating...
                                </>
                            ) : (
                                'Log In'
                            )}
                        </Button>
                    </form>

                    <div className="mt-4 text-center border-b border-gray-200 pb-4">
                    </div>

                    <div className="mt-6 text-center">
                        <Button 
                            className="bg-[#4DD0E1] hover:bg-blue-200 text-white font-bold py-3 px-6 text-base rounded-lg shadow-md"
                            onClick={() => router.push('/register')}
                        >
                            Create New Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}