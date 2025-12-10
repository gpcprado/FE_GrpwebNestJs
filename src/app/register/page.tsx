"use client";

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE } from '@/lib/config'; 
import Image from 'next/image';

import { User, Lock, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassword('');
        setConfirmPassword('');
        setError(data.message || 'Registration failed');
        return;
      }

      router.push('/');
    } catch (err) {
      setError('Network error. Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      
      <Card 
        className="w-full max-w-md 
                bg-white border border-gray-300 
                text-gray-800 shadow-xl rounded-xl" 
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none opacity-50"></div>

        <CardHeader className="text-center pt-8 pb-4 relative border-b border-white/10">
                  <div className="mx-auto mb-4 h-20 w-20 
                    bg-transparent border-4 border-blue-900 
                    rounded-full flex items-center justify-center shadow-xl"
                  >
            <Image 
              src="/GWEB.png"
              alt="GRPWEB Logo"
              width={50}
              height={50}
              priority
              className="w-20 h-20 object-contain"
            />
          </div>
          
          <CardTitle className="text-3xl font-extrabold text-blue-900 tracking-tight mb-2">
            REGISTER
          </CardTitle>
          <p className="text-gray-500 text-sm">Join GRPWEB by creating new account</p>
        </CardHeader>

        <CardContent className="px-8 pb-8 relative">
          <form onSubmit={handleRegister} className="space-y-5">
            
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 pr-4 bg-white border border-gray-300 text-black placeholder-white/50 focus-visible:ring-2 focus-visible:ring-purple-500/50"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-white border border-gray-300 text-black placeholder-white/50 focus-visible:ring-2 focus-visible:ring-purple-500/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="pl-10 pr-10 bg-white border border-gray-300 text-black placeholder-white/50 focus-visible:ring-2 focus-visible:ring-purple-500/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-300 transition-colors"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
              </button>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                {error}
              </div>
            )}


            <Button 
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 
                transition-all duration-200 shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              className="text-gray-500 text-sm hover:text-purple-300" 
              onClick={() => router.push('/')}
            >
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}