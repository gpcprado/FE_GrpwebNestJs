"use client";

import { getToken, logoutUser } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { 
    User, Hash, Mail, ArrowLeft, Key, Check, Copy, Edit, LogOut, Phone, 
    Link, Clock
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from 'next/image';
import { API_BASE } from '@/lib/config';

interface UserProfile {
    userprofile_id?: number;
    id: number;
    profileusername: string;
    full_name: string;
    phone_number: string;
    email: string;
    bio: string;
    created_at?: string;
    status?: 'Active' | 'Not Active' | 'Busy';
}

interface JwtPayload {
    sub?: number | string;
    username?: string;
    role?: string;
    exp?: number;
    iat?: number;
    id?: string;
    fullId?: string | number; 
}

interface ProfileDetailProps {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
    isLoading: boolean;
}

const getStatusColor = (status: UserProfile['status']) => {
    switch (status) {
        case 'Busy':
            return 'bg-amber-500 text-white';
        case 'Active':
            return 'bg-green-500 text-white animate-pulse';
        case 'Not Active':
            return 'bg-gray-500 text-white';
        default:
            return 'bg-gray-500 text-white'; 
    }
};

const PAGE_CONTAINER_CLASSES = "min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8";
const PROFILE_CARD_CLASSES = "bg-white shadow-xl rounded-lg w-full max-w-4xl mx-auto mb-6";
const INTRO_CARD_CLASSES = "bg-white shadow-lg rounded-lg p-6 space-y-4";
const HEADER_COVER_CLASSES = "relative h-40 bg-blue-600/10 rounded-t-lg";

const AVATAR_CONTAINER_CLASSES = "absolute top-51 left-10 h-32 w-32 bg-white p-1 rounded-full shadow-lg";
const AVATAR_CLASSES = "h-full w-full bg-gray-200 border-4 border-white rounded-full flex items-center justify-center overflow-hidden";
const DETAIL_ITEM_CLASSES = "flex items-start space-x-3 text-gray-700";

const TOKEN_CARD_CLASSES = "bg-gray-50 border border-gray-200 p-4 shadow-inner";
const TOKEN_INPUT_CLASSES = "flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-mono truncate focus:outline-none focus:ring-2 focus:ring-blue-500";
const BUTTON_BLUE_CLASSES = "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors";

function useProfileData() {
    const token = getToken();
    const [copySuccess, setCopySuccess] = useState(false);

    const [profile, setProfile] = useState<{ 
        username: string; 
        role: string; 
        userId: string;
        fullUserId: string | number | undefined;
        loading: boolean 
    }>({
        username: "Loading...",
        role: "Loading...",
        userId: "Loading...",
        fullUserId: undefined,
        loading: true,
    });

    const handleCopyToken = useCallback(async () => {
        if (!token) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(token);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = token;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (!successful) {
                    throw new Error('Fallback copy failed');
                }
            }

            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            console.log("Token copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy token:", err);
            alert("Error: Could not automatically copy token.");
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            setProfile({ username: "Guest", role: "Unknown", userId: "N/A", fullUserId: undefined, loading: false });
            return;
        }

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                throw new Error("Token expired");
            }

            const decodedId = decoded.sub || decoded.id;
            const fullId = decoded.sub || decoded.id || decoded.fullId; 

            setProfile({
                username: decoded.username || "Guest",
                role: decoded.role || "Unknown",
                userId: decodedId ? String(decodedId).substring(0, 8) + "..." : "N/A",
                fullUserId: fullId, 
                loading: false,
            });

        } catch (error) {
            console.error("Error decoding token:", error);
            setProfile({ username: "Guest", role: "Unknown", userId: "N/A", fullUserId: undefined, loading: false });
        }
    }, [token]);

    return {
        ...profile,
        token,
        copySuccess,
        handleCopyToken
    };
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({ icon: Icon, label, value, color, isLoading }) => {
    const IconWrapperClass = `text-blue-600`; 
    
    return (
        <div className={DETAIL_ITEM_CLASSES}>
            <div className={IconWrapperClass}>
                <Icon className="h-5 w-5"/>
            </div>
            
            <div className="flex-1">
                {isLoading ? (
                    <div className="w-40 h-5 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                    <p className="text-gray-800 font-normal text-base break-words">
                        {value === 'N/A' || value === 'No bio provided.' ? (
                            <span className="italic text-gray-500">No {label.toLowerCase()} provided.</span>
                        ) : (
                            <strong className="font-semibold">{value}</strong>
                        )}
                        <span className="ml-2 text-gray-500 font-light">{label}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default function ProfilePage() {
    const router = useRouter();

    const { username, role, userId, fullUserId, loading: authLoading, token, copySuccess, handleCopyToken } = useProfileData();

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [userprofile, setUserProfile] = useState<UserProfile | null>(null);
    const [userprofileError, setUserProfileError] = useState<string | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    useEffect(() => {
        if (fullUserId !== undefined) {
            setCurrentUserId(Number(fullUserId)); 
        }
    }, [fullUserId]);
    
    const handleLogout = useCallback(() => {
        logoutUser();
        router.push('/');
    }, [router]);

    const authHeaders = useMemo(() => {
        return {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
        };
    }, [token]);

    const fetchUserProfileStatus = useCallback(async () => {
        if (!token || currentUserId === null) {
            setIsProfileLoading(false);
            return;
        }
        setIsProfileLoading(true);
        setUserProfileError(null);

        try {
            const res = await fetch(`${API_BASE}/userprofile/${currentUserId}`, { 
                method: 'GET',
                headers: authHeaders,
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (res.ok) {
                const contentType = res.headers.get("content-type");
                let data: UserProfile | { status: string } | null = null;

                if (contentType && contentType.includes("application/json") && res.headers.get("Content-Length") !== '0') {
                    data = await res.json();
                }

                if (!data || ('status' in data && data.status === 'No userprofile found')) {
                    setUserProfile(null);
                } else {
                    setUserProfile(data as UserProfile);
                }

            } else if (res.status === 404) {
                setUserProfile(null);
            } else {
                let errorMessage = `Fetch failed with status: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `${res.statusText} (${res.status})`;
                }
                throw new Error(errorMessage);
            }

        } catch (e: any) {
            setUserProfileError('Failed to load userprofile: ' + (e?.message || 'Unknown error'));
        } finally {
            setIsProfileLoading(false);
        }
    }, [token, currentUserId, authHeaders, handleLogout]);

    useEffect(() => {
        if (currentUserId !== null) {
            fetchUserProfileStatus();
        }
    }, [currentUserId, fetchUserProfileStatus]);

    const finalLoading = authLoading || isProfileLoading;
    const { 
        status, 
        profileusername, 
        full_name, 
        phone_number, 
        email, 
        bio,
        created_at
    } = userprofile || {};

    const renderProfileActions = () => (
        <div className="flex space-x-3 items-center justify-end p-4 border-t border-gray-200">
            <Button
                className={`flex-shrink-0 ${BUTTON_BLUE_CLASSES}`}
                onClick={() => router.push("/profile/updateaccount")}
                disabled={finalLoading}
            >
                <Edit className="h-4 w-4 mr-2" /> Modify Profile
            </Button> 
        </div>
    );
    
    const renderIntroCard = () => (
        <Card className={INTRO_CARD_CLASSES}>
            <CardTitle className="text-xl font-bold text-gray-800">
                <Link className="h-5 w-5 mr-2 inline text-blue-500" /> Intro
            </CardTitle>
            {isProfileLoading ? (
                <div className="space-y-3">
                    <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
            ) : userprofile ? (
                <div className="space-y-3 text-sm">
                    {bio && (
                        <div className="text-gray-800 text-center">
                            <i className="text-gray-400 mr-2">Bio:</i>{bio}
                        </div>
                    )}
                    <ProfileDetail icon={User} label="" value={profileusername || 'N/A'} color="text-pink-400" isLoading={false} />
                    <ProfileDetail icon={Mail} label="" value={email || 'N/A'} color="text-cyan-400" isLoading={false} />
                    <ProfileDetail icon={Phone} label="" value={phone_number || 'N/A'} color="text-lime-400" isLoading={false} />
                    <div className={DETAIL_ITEM_CLASSES}>
                        <Clock className="h-5 w-5 text-blue-600"/>
                        <p className="text-gray-800 font-normal text-sm break-words">
                            Joined <strong className="font-semibold">{created_at}</strong>
                        </p>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 italic">No detailed profile found. Update your account!</p>
            )}
        </Card>
    );

    const renderTokenCard = () => (
        <Card className={TOKEN_CARD_CLASSES}>
            <CardTitle className="text-xl font-bold mb-3 flex items-center text-gray-800">
                <Key className="mr-2 h-5 w-5 text-red-500" /> API Access Token
            </CardTitle>
            <p className="text-gray-600 text-sm mb-4">
                This secret Bearer token grants API access. Keep this secure!
            </p>

            <div className="flex items-center space-x-2">
                <input
                    value={token || 'Not logged in or token expired...'}
                    readOnly
                    className={TOKEN_INPUT_CLASSES}
                />
                <Button
                    onClick={handleCopyToken}
                    variant="ghost"
                    size="icon"
                    aria-label="Copy Token"
                    className={`w-10 h-10 flex-shrink-0 rounded-md transition-all duration-300 ${copySuccess ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    {copySuccess ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
            </div>
            <div className="h-4 mt-2">
                {copySuccess && <span className="text-green-600 text-xs flex items-center">Token Copied!</span>}
            </div>
        </Card>
    );


    return (
        <div className={PAGE_CONTAINER_CLASSES}>
            <Button 
                onClick={() => router.push("/dashboard")}
                variant="ghost" 
                className="absolute top-4 left-4 text-blue-600 hover:bg-blue-100 z-10"
            >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back
            </Button> 

            <Card className={PROFILE_CARD_CLASSES}>
                <CardHeader className="p-0">

                    <div className={HEADER_COVER_CLASSES}>
                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                            {finalLoading ? (
                                <div className="w-20 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                            ) : userprofileError ? (
                                <span className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-red-600 text-white">
                                    Error
                                </span>
                            ) : status ? (
                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(status)}`}>
                                    {status}
                                </span>
                            ) : (
                                <span className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-yellow-500 text-white">
                                    Incomplete
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-end px-6 -mt-16 pb-4">
                        <div className={AVATAR_CONTAINER_CLASSES}>
                            <div className={AVATAR_CLASSES}>
                                <Image 
                                    src="/GWEB.png"
                                    alt="Profile Avatar"
                                    width={128}
                                    height={128}
                                    priority
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 pl-[150px] pt-12">
                            <CardTitle className="text-4xl font-extrabold tracking-tight text-gray-900 break-words">
                                {full_name || 'Full Name Not Set'}
                            </CardTitle>
                            <p className="text-gray-500 text-lg font-medium">@{username}</p>
                            <p className="text-blue-600 text-sm mt-1 font-semibold">{role}</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {renderProfileActions()}
                    <hr className="border-gray-200 my-4" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            {renderIntroCard()}
                        </div>
                        
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-white shadow-lg rounded-lg p-6 space-y-4">
                                <CardTitle className="text-xl font-bold text-gray-800">
                                    <User className="h-5 w-5 mr-2 inline text-blue-500" />Account Identity
                                </CardTitle>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ProfileDetail 
                                        icon={User} 
                                        label="System Username" 
                                        value={username} 
                                        color="text-indigo-600" 
                                        isLoading={authLoading}
                                    />
                                    <ProfileDetail 
                                        icon={Hash} 
                                        label="User ID" 
                                        value={userId} 
                                        color="text-blue-600" 
                                        isLoading={authLoading}
                                    />
                                </div>
                            </Card>

                            {renderTokenCard()}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}