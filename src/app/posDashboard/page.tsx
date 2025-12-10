'use client';

import React, { useEffect, useState } from 'react';
import { getToken, logoutUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {ArrowLeft } from "lucide-react";
import Image from 'next/image';

import { API_BASE } from '@/lib/config';

interface Position {
  position_id?: number;
  position_code: string;
  position_name: string;
}

export default function PosDashboardPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for create / edit
  const [positionCode, setPositionCode] = useState('');
  const [positionName, setPositionName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Ensure user is authenticated
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/');
      return;
    }

    fetchPositions();
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]);

  function authHeaders() {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }
/* Method to fetch the data from the backend [GET] */
async function fetchPositions() {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch(`${API_BASE}/positions`, {
            method: 'GET',
            headers: authHeaders(),
        });

        if (res.status === 401) {
            // unauthorized - log out and redirect
            logoutUser();
            router.push('/');
            return;
        }

        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);      
        const data = await res.json();         
        setPositions(data);
    } catch (e: any) {
        setError(e?.message || 'Failed to fetch positions');
    } finally {
        setLoading(false);
    }
}

async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: Position = { position_code: positionCode, position_name: positionName};

    try {
      let res: Response;
      if (editingId) {
            // update
        res = await fetch(`${`${API_BASE}/positions`}/${editingId}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
            // create
        res = await fetch(`${API_BASE}/positions`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (res.status === 401) {
          logoutUser();
          router.push('/');
          return;
      }

      if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || `Request failed: ${res.status}`);
      }

        // success - refresh list
      setPositionCode('');
      setPositionName('');
      setEditingId(null);
      await fetchPositions();
    } catch (e: any) {
        setError(e?.message || 'Save failed');
    }
}

    function startEdit(p: Position) {
        setEditingId(p.position_id ?? null);
        setPositionCode(p.position_code);
        setPositionName(p.position_name);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    
    async function handleDelete(id: number) {
        if (!id) return;
        if (!confirm('Delete this position?')) return;
        setError(null);
        
        try {
            const res = await fetch(`${API_BASE}/positions/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });

        if (res.status === 401) {
            logoutUser();
            router.push('/');
            return;
        }

        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        await fetchPositions();
    } catch (e: any) {
        setError(e?.message || 'Delete failed');
    }
}
    function handleCancelEdit() {
        setEditingId(null);
        setPositionCode('');
        setPositionName('');
    }

     function handleLogout() {
        logoutUser();
        router.push('/');
    }

return (
      <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide bg-transparent rounded-b-xl">
        <div className="max-w-4xl mx-auto">

          <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-400">
      <div className="flex items-center space-x-3">
          <Image 
            src="/GWEB.png"
            alt="GRPWEB Logo"
            width={32}
            height={32}
            priority
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-1xl font-extrabold tracking-tight text-blue-900">POSITION MANAGEMENT</h1> 
        </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => fetchPositions()} 
                className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-3"
              >
                Refresh
              </Button>
            </div>
          </header>
          
          <Card className="bg-transparent border-b border-gray-100 pb-2">
            <CardContent className="pt-6 px-30">
              <h2 className="text-xl font-extrabold mb-4 text-blue-900">
                {editingId ? 'Edit Position' : 'Create New Position'}
              </h2>
              <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">

                <div className="md:col-span-2">
                  <Input
                    placeholder="Position Code (e.g., PRES)"
                    value={positionCode}
                    onChange={(e) => setPositionCode(e.target.value)}
                    required
                    className="bg-transparent border-gray-400 text-black placeholder-purple-300 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    placeholder="Position Name (e.g., President)"
                    value={positionName}
                    onChange={(e) => setPositionName(e.target.value)}
                    required
                    className="bg-transparent border-gray-400 text-black placeholder-purple-300 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-3 md:col-span-1">
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  {editingId && (
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit} 
                      className="border-slate-500 text-gray-900 hover:bg-slate-700 hover:text-white"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
              {error && <p className="text-red-400 text-sm mt-3 p-2 bg-red-900/30 rounded-md border border-red-700">{error}</p>}
            </CardContent>
          </Card>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">
              Positions List {loading && (<span className="text-sm text-blue-500 font-normal">Loading...</span>)}
            </h2>
            
            <div className="overflow-x-auto bg-transparent border-b border-gray-100 pb-2 rounded-lg shadow-xl">
              <table className="min-w-full text-left ">
                <thead className="bg-gray-400 border-b border-gray-400">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">Code</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-base text-slate-400">
                        No positions found. Create one to get started!
                      </td>
                    </tr>
                  ) : (
                    positions.map((p, index) => (
                      <tr 
                        key={p.position_id} 
                        className={`border-b border-gray-300 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'} hover:bg-gray-300 transition duration-150`}
                      >
                        <td className="px-5 py-3 align-top text-sm font-medium text-black">{p.position_id}</td>
                        <td className="px-5 py-3 align-top text-sm font-medium text-black">{p.position_code}</td>
                        <td className="px-5 py-3 align-top text-sm font-medium text-black">{p.position_name}</td>
                        <td className="px-5 py-3 align-top">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => startEdit(p)} 
                              className="border-gray-400 text-gray-900 hover:bg-gray-300 hover:text-white"
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(p.position_id!)} 
                              className="bg-red-700 hover:bg-red-900 text-white"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <Button
                className="text-1xl w-full bg-gray-400 hover:bg-gray-500 text-white border b border-gray-300 font-medium py-3"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard Home
              </Button>
            </div>
          </section>
        </div>
      </div>
    );
}