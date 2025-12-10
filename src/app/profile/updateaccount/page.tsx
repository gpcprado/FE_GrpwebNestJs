"use client";

import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, User, Mail, Phone, BookOpen, Save, Loader2, Key, CheckCircle, AlertTriangle, List, Pencil, UserCircle, Zap, Clock, Shield, XCircle, ListOrdered
} from "lucide-react";
import { API_BASE } from '@/lib/config'; 

type UserStatus = 'Active' | 'Not Active' | 'Busy';

interface UserProfile {
  id: number;
  userprofile_id?: number;
  profileusername: string;
  full_name: string;
  phone_number: string;
  email: string;
  bio: string;
  status?: UserStatus;
}

interface UserFormData {
  profileusername: string;
  full_name: string;
  phone_number: string;
  email: string;
  bio: string;
  status: UserStatus;
}

interface JwtPayload {
  sub?: number | string;
  id?: string | number;
  fullId?: string | number; 
}

const PAGE_CONTAINER_CLASSES = "min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8"; // Brighter background
const PROFILE_CONTAINER_CLASSES = "w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6"; // Two column layout
const MAIN_FORM_CLASSES = "lg:w-2/3";
const SIDEBAR_CLASSES = "lg:w-1/3";
const CARD_CLASSES = "bg-white shadow-xl border border-gray-200 relative transition-all duration-300 rounded-lg overflow-hidden";
const SUBMIT_BUTTON_CLASSES = "w-full font-bold py-3 shadow-lg transition-transform duration-200 transform hover:scale-[1.005]";

const INITIAL_FORM_DATA: UserFormData = {
  profileusername: '',
  full_name: '',
  phone_number: '',
  email: '',
  bio: '',
  status: 'Active',
};

interface StatusSelectorProps {
  currentStatus: UserStatus;
  onStatusChange: (status: UserStatus) => void;
}

const getStatusColorClasses = (status: UserStatus) => {
    switch (status) {
        case 'Active': return 'bg-green-100 text-green-700 border-green-500';
        case 'Busy': return 'bg-amber-100 text-amber-700 border-amber-500';
        case 'Not Active': return 'bg-red-100 text-red-700 border-red-500';
        default: return 'bg-gray-100 text-gray-700 border-gray-500';
    }
};

const StatusSelector: React.FC<StatusSelectorProps> = ({ currentStatus, onStatusChange }) => {
  const statuses: { label: string, value: UserStatus, icon: React.FC<any> }[] = [
    { label: 'Active', value: 'Active', icon: Zap },
    { label: 'Busy', value: 'Busy', icon: Clock },
    { label: 'Not Active', value: 'Not Active', icon: XCircle },
  ];

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-3">
      {statuses.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onStatusChange(s.value)}
          className={`
            flex items-center justify-center flex-1 py-2 px-3 text-sm rounded-lg font-semibold transition-all duration-200 
            border 
            ${s.value === currentStatus 
              ? `${getStatusColorClasses(s.value)} shadow-md ring-2 ring-offset-2 ring-blue-500` 
              : 'border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
            }
          `}
        >
          <s.icon className={`h-4 w-4 mr-1.5`} />
          {s.label}
        </button>
      ))}
    </div>
  );
};

export default function UpdateAccountPage() {
  const router = useRouter();
  const token = getToken();
  
  const [authUserId, setAuthUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); 
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }), [token]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const fullId = decoded.sub || decoded.id || decoded.fullId;
        if (fullId) {
          setAuthUserId(Number(fullId));
        } else {
          router.push('/'); 
        }
      } catch (error) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [token, router]);

  const fetchUserProfile = useCallback(async () => {
    if (!authUserId || !token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/userprofile/${authUserId}`, {
        method: 'GET',
        headers: authHeaders,
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (res.ok) {
        const data: UserProfile = await res.json(); 
        
        if (data && data.profileusername) {
          setFormData({
            profileusername: data.profileusername || '',
            full_name: data.full_name || '',
            phone_number: data.phone_number || '',
            email: data.email || '',
            bio: data.bio || '',
            status: data.status || 'Active', 
          });
          setHasProfile(true);
        } else {
          setHasProfile(false);
          setFormData(INITIAL_FORM_DATA);
        }
        
      } else if (res.status === 404) {
        setHasProfile(false);
        setFormData(INITIAL_FORM_DATA); 
      } else {
        throw new Error(`Failed to load profile (Status: ${res.status})`);
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: `Error loading profile: ${e.message}. Prepare to create new.` });
      setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, token, authHeaders, router]); 

  useEffect(() => {
    if (authUserId !== null && hasProfile === null) {
      fetchUserProfile();
    }
  }, [authUserId, fetchUserProfile, hasProfile]); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleStatusChange = (status: UserStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handlePostProfile = async () => {
    if (!authUserId) return;
    
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { status, ...postPayload } = formData;
      const payload = { ...postPayload, id: authUserId };

      const res = await fetch(`${API_BASE}/userprofile`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 201) {
        setMessage({ type: 'success', text: '✅ Profile successfully **created**! You can now update your status.' });
        setHasProfile(true); 
        fetchUserProfile();
      } else {
        let errorText = `Profile creation failed (Status: ${res.status}).`;
        try {
          const errorData = await res.json();
          errorText = errorData.detail || errorData.message || errorText;
        } catch {}
        throw new Error(errorText);
      }

    } catch (e: any) {
      setMessage({ type: 'error', text: `❌ POST Error: ${e.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePutProfile = async () => {
    if (!authUserId) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = { ...formData }; 

      const res = await fetch(`${API_BASE}/userprofile/${authUserId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile successfully updated!' });
      } else {
        let errorText = `Profile update failed (Status: ${res.status}).`;
        try {
          const errorData = await res.json();
          errorText = errorData.detail || errorData.message || errorText;
        } catch {}
        throw new Error(errorText);
      }

    } catch (e: any) {
      setMessage({ type: 'error', text: `❌ PUT Error: ${e.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasProfile) {
      handlePutProfile();
    } else {
      handlePostProfile();
    }
  };

const renderProfileSummary = () => (
    <Card className={`sticky top-6 ${CARD_CLASSES}`}>
      <CardHeader className="bg-blue-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <UserCircle className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl font-bold text-gray-800">Current Profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 text-sm">
        <div className="space-y-2">
          <p className="font-semibold text-gray-700 flex items-center"><User className="h-4 w-4 mr-2 text-blue-500"/> Full Name:</p>
          <p className="ml-6 text-gray-500 font-medium">{formData.full_name || "None Set"}</p> 
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-gray-700 flex items-center"><User className="h-4 w-4 mr-2 text-blue-500"/> Username:</p>
          <p className="ml-6 text-gray-500 font-medium">@{formData.profileusername || "None Set"}</p>
        </div>
        
        {hasProfile && (
            <div className="space-y-2">
              <p className="font-semibold text-gray-700 flex items-center"><Shield className="h-4 w-4 mr-2 text-blue-500"/> Status:</p>
              <span className={`ml-6 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColorClasses(formData.status)}`}>
                  {formData.status}
              </span>
            </div>
        )}

        <Separator className="my-4"/>

        <div className="space-y-2">
          <p className="font-semibold text-gray-700 flex items-center"><BookOpen className="h-4 w-4 mr-2 text-blue-500"/> Bio:</p>
          <p className="ml-6 text-gray-500 text-xs italic whitespace-pre-wrap max-h-24 overflow-y-auto">{formData.bio || "No bio provided"}</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderFormContent = () => (
    <Card className={CARD_CLASSES}>
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-3 text-gray-800">
          <ListOrdered className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl font-bold">
             {hasProfile ? "Update Profile Fields (PUT)" : "Create New Profile (POST)"}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-8">
        {message && (
          <div className={`p-4 rounded-lg text-sm border font-semibold flex items-start ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-3 mt-0.5" /> : <AlertTriangle className="h-5 w-5 mr-3 mt-0.5" />}
            <span>{message.text}</span>
          </div>
        )}
        {hasProfile === false && !message && (
          <div className="p-4 rounded-lg text-sm border font-semibold flex items-center bg-blue-50 text-blue-700 border-blue-300">
            <List className="h-5 w-5 mr-3"/>
            <span>Action Required: Profile Not Found. You must CREATE your profile first.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            {hasProfile && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
                    <Shield className="h-5 w-5 mr-2 text-blue-500"/> 1. User Status
                  </h3>
                  <div className="space-y-1.5 p-4 border rounded-lg bg-gray-50">
                    <Label className="text-gray-600 flex items-center">Select your current availability:</Label>
                    <StatusSelector 
                      currentStatus={formData.status} 
                      onStatusChange={handleStatusChange} 
                    />
                  </div>
                </div>
            )}

            <Separator className="bg-gray-200" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
                <Pencil className="h-5 w-5 mr-2 text-blue-500"/> 2. General Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-1.5">
                  <Label htmlFor="profileusername" className="text-gray-600 flex items-center"><User className="h-4 w-4 mr-1 text-sky-500"/> Profile Username</Label>
                  <Input
                    id="profileusername"
                    name="profileusername"
                    value={formData.profileusername}
                    onChange={handleInputChange}
                    required
                    className="bg-white text-gray-800 border-gray-300 placeholder:text-gray-400 focus:border-blue-500 transition duration-150"
                    placeholder="e.g., jane_app_user"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="full_name" className="text-gray-600 flex items-center"><User className="h-4 w-4 mr-1 text-sky-500"/> Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="bg-white text-gray-800 border-gray-300 placeholder:text-gray-400 focus:border-blue-500 transition duration-150"
                    placeholder="e.g., Jane Doe"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
                <Mail className="h-5 w-5 mr-2 text-blue-500"/> 3. Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-600 flex items-center"><Mail className="h-4 w-4 mr-1 text-emerald-500"/> Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-white text-gray-800 border-gray-300 placeholder:text-gray-400 focus:border-emerald-500 transition duration-150"
                    placeholder="e.g., example@domain.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone_number" className="text-gray-600 flex items-center"><Phone className="h-4 w-4 mr-1 text-emerald-500"/> Phone Number (Optional)</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="bg-white text-gray-800 border-gray-300 placeholder:text-gray-400 focus:border-emerald-500 transition duration-150"
                    placeholder="e.g., +123 456 7890"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
                <BookOpen className="h-5 w-5 mr-2 text-blue-500"/> 4. Bio / Description
              </h3>
              <div className="space-y-1.5 p-4 border rounded-lg bg-gray-50">
                <Label htmlFor="bio" className="text-gray-600 flex items-center">Tell us about yourself (Max 500 characters)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={500}
                  className="bg-white text-gray-800 border-gray-300 placeholder:text-gray-400 focus:border-blue-500 transition duration-150"
                  placeholder="e.g., I'm a full-stack developer focusing on Next.js and FastAPI..."
                />
                <p className="text-xs text-right text-gray-500">{formData.bio.length} / 500</p>
              </div>
            </div>
            <Button
              type="submit"
              className={`${SUBMIT_BUTTON_CLASSES} mt-8 ${hasProfile ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/50'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
              ) : (
                <Save className="h-5 w-5 mr-3" />
              )}
              {hasProfile ? "Save Profile Changes (PUT)" : "Create Profile Now (POST)"}
            </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className={PAGE_CONTAINER_CLASSES}>
      <div className="w-full max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <Button 
          onClick={() => router.push("/profile")}
          variant="ghost" 
          className="text-gray-700 hover:bg-gray-200 p-2 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Profile
        </Button> 
        <p className="text-gray-500 text-sm flex items-center">
          <Key className="h-3 w-3 mr-1"/> User ID: {authUserId || 'N/A'}
        </p>
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 w-full max-w-6xl mx-auto">
        Profile Settings ⚙️
      </h1>
      {isLoading || hasProfile === null ? (
        <div className="flex justify-center items-center py-20 w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" /> Loading Profile Data...
        </div>
      ) : (
        <div className={PROFILE_CONTAINER_CLASSES}>
          <div className={MAIN_FORM_CLASSES}>
            {renderFormContent()}
          </div>
          
          <div className={SIDEBAR_CLASSES}>
            {renderProfileSummary()}
          </div>
        </div>
      )}
    </div>
  );
}