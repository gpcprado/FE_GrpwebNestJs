'use client';

import Image from 'next/image';
import { getToken, logoutUser } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from "react";
import {  User, LogOut, Feather, Settings, Gamepad2, Zap, BellRing, XCircle, AlertTriangle, Send, 
    CheckCircle, Briefcase, Calendar, Loader2, Clock, Shield} from "lucide-react"; 
import { TicTacToe } from '@/components/TicTacToe';
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
  status?: 'Active' | 'Not Active' | 'Busy' | 'Unknown';
}

interface Application {
    id: number;
    application_id?: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string;
    applicant_address: string;
    job_positions: string;
    position_applied_for: 'Unknown' | 'Full Time' | 'Part Time';
    status: 'Pending Review' | 'Under Consideration' | 'Interview Scheduled' | 'Rejected' | 'Hired';
    application_date: string;
}

interface JwtPayload {
    sub: number;
    username: string;
    role: string;
    exp: number;
    iat: number;
}

interface SystemMessage {
    message_id: number;
    message_code: string;
    message_content: string;
}

const quotes = [
    { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Happiness is not something readymade. It comes from your own actions.", author: "Dalai Lama" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "It is better to be hated for what you are than to be loved for what you are not.", author: "André Gide" },
    { text: "Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.", author: "Martin Luther King Jr." },
    { text: "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.", author: "Oprah Winfrey" },
    { text: "The past is a place of reference, not a place of residence; the past is a place of learning, not a place of living.", author: "Roy T. Bennett" },
    { text: "Change the world by being yourself.", author: "Amy Poehler" },
    { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.", author: "Vince Lombardi" },
    { text: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.", author: "Martin Luther King Jr." },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas A. Edison" },
    { text: "We accept the love we think we deserve.", author: "Stephen Chbosky" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
    { text: "You must do the things you think you cannot do.", author: "Eleanor Roosevelt" },
    { text: "Keep your eyes on the stars, and your feet on the ground.", author: "Theodore Roosevelt" },
    { text: "Tough times never last, but tough people do.", author: "Robert H. Schuller" },
    { text: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.", author: "Helen Keller" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "The mind is its own place, and in itself can make a heaven of hell, a hell of heaven.", author: "John Milton" },
    { text: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" },
    { text: "A reader lives a thousand lives before he dies . . . The man who never reads lives only one.", author: "George R.R. Martin" },
    { text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", author: "Thomas A. Edison" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { text: "The measure of a man is what he does with power.", author: "Plato" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle Onassis" }
];

const CARD_CLASSES = "border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300";

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 text-gray-800 ${CARD_CLASSES} ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-0 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-xl font-bold text-gray-800 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-0 pt-4 ${className}`}>
        {children}
    </div>
);


const getStatusClasses = (status: Application['status']) => {
    switch (status) {
        case 'Hired':
            return 'bg-green-100 text-green-700 font-semibold animate-pulse';
        case 'Interview Scheduled':
            return 'bg-blue-100 text-blue-700 font-semibold';
        case 'Under Consideration':
            return 'bg-yellow-100 text-yellow-700 font-semibold';
        case 'Rejected':
            return 'bg-red-100 text-red-700 font-semibold';
        case 'Pending Review':
        default:
            return 'bg-gray-100 text-gray-700 font-semibold';
    }
}

interface UserProfileFeedProps {
    authHeaders: { [key: string]: string };
}

const getProfileStatusVisuals = (status: UserProfile['status']) => {
    switch (status) {
        case 'Active':
            return { color: 'border-green-500', icon: Zap, iconBg: 'bg-green-500' };
        case 'Busy':
            return { color: 'border-yellow-500', icon: Clock, iconBg: 'bg-yellow-500'};
        case 'Not Active':
            return { color: 'border-gray-400', icon: XCircle, iconBg: 'bg-gray-400' };
        default:
            return { color: 'border-red-500', icon: Shield, iconBg: 'bg-red-500' };
    }
};

const UserProfileFeed: React.FC<UserProfileFeedProps> = ({ authHeaders }) => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleProfileClick = useCallback((profile: UserProfile) => {
        alert(
            `👤 User Profile: ${profile.profileusername} ( ${profile.status} )\n` +
            `Full Name: ${profile.full_name}\n` +
            `User ID: ${profile.id}\n` +
            `Phone Number: ${profile.phone_number}\n` +
            `Email: ${profile.email}\n` +
            `Bio: ${profile.bio}\n` +
            `Account Created: ${profile.created_at}`
        );
    }, []);

    const fetchAllProfiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/userprofile`, {
                method: 'GET',
                headers: authHeaders,
            });

            if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

            const data: UserProfile[] = await res.json().catch(() => []);
            setProfiles(data);

        } catch (e: any) {
            console.error('Failed to fetch all profiles:', e);
            setError('Failed to load user profiles.');
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        if (authHeaders.Authorization) {
            fetchAllProfiles();
        }
    }, [authHeaders.Authorization, fetchAllProfiles]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-500" />
                <span className='text-gray-600'>Loading other users...</span>
            </div>
        );
    }
    const placeholderAvatar = "/GWEB.png";

    return (
        <div className="flex space-x-4 p-4 overflow-x-auto border-b border-gray-200 scrollbar-hide bg-gray-50 rounded-b-xl">
            <h3 className="text-sm font-semibold text-gray-600 flex items-center min-w-max pr-4 border-r border-gray-300">
                <Shield className="h-4 w-4 mr-1 text-blue-500"/> User Profiles:
            </h3>
            {profiles.length > 0 ? (
                profiles.map((profile) => {
                    const { color, icon: StatusIcon, iconBg } = getProfileStatusVisuals(profile.status);
                    return (
                        <div 
                            key={profile.id} 
                            className="flex flex-col items-center flex-shrink-0 cursor-pointer group relative"
                            title={`Status: ${profile.status}`}
                            onClick={() => handleProfileClick(profile)} 
                        >
                            <div className={`relative w-16 h-16 rounded-full border-4 ${color} transition-all duration-300 group-hover:scale-105`}>
                                <Image
                                    src={placeholderAvatar}
                                    alt={profile.profileusername}
                                    width={64}
                                    height={64}
                                    className="rounded-full w-full h-full object-cover p-0.5 bg-white"
                                />
                                <div className={`absolute bottom-0 right-0 p-1 rounded-full border-2 border-white ${iconBg}`}>
                                    <StatusIcon className="h-3 w-3 text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 truncate max-w-[64px] group-hover:text-blue-600 transition duration-150">
                                {profile.profileusername}
                            </p>
                        </div>
                    );
                })
            ) : (
                <p className="text-gray-500 text-sm">{error || 'No other user profiles found.'}</p>
            )}
        </div>
    );
};

export default function DashboardHome() {
    const router = useRouter();
    const token = getToken();

    const [username, setUsername] = useState("Guest");
    const [userId, setUserId] = useState<number | null>(null); 

    const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
    const [messageError, setMessageError] = useState<string | null>(null);

    const [usernameCon, setUsernameCon] = useState('');
    const [concernContent, setConcernContent] = useState('');
    const [concernError, setConcernError] = useState('');
    const [concernSuccess, setConcernSuccess] = useState(false);

    const [currentQuote, setCurrentQuote] = useState(quotes[0].text);
    const [currentAuthor, setCurrentQuoteAuthor] = useState(quotes[0].author);

    const [application, setApplication] = useState<Application | null>(null);
    const [applicationError, setApplicationError] = useState<string | null>(null);

    const authHeaders = useMemo(() => {
        return {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
        };
    }, [token]);
    
    const handleLogout = useCallback(() => {
        logoutUser();
        router.push('/');
    }, [router]);


    const generateRandomQuote = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        setCurrentQuote(quote.text);
        setCurrentQuoteAuthor(quote.author);
    }, []);

    const fetchSystemMessages = useCallback(async () => {
        if (!token) return;
        setMessageError(null);

        try {
            const res = await fetch(`${API_BASE}/messages`, {
                method: 'GET',
                headers: authHeaders,
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            const data: SystemMessage[] = await res.json();
            
            const sortedData = data.sort((a, b) => b.message_id - a.message_id);

            setSystemMessages(sortedData);
        } catch (e: any) {
            if (token) {
                setMessageError('Failed to load system messages: ' + (e?.message || 'Unknown error'));
            }
        }
    }, [token, authHeaders, handleLogout]);

    const fetchApplicationStatus = useCallback(async (currentUserId: number | null) => { 
        if (!token || currentUserId === null) return;
        setApplicationError(null);

        try {
            const res = await fetch(`${API_BASE}/application/${currentUserId}`, { 
                method: 'GET',
                headers: authHeaders,
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json") && res.headers.get("Content-Length") !== '0') {
                    const data: Application | { status: string } = await res.json();
                    
                    if ('status' in data && data.status === 'No application found') {
                        setApplication(null);
                    } else {
                        setApplication(data as Application);
                    }
                } else {
                    setApplication(null); 
                }

            } else if (res.status === 404) {
                    setApplication(null);
            }
             else {
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
            setApplicationError('Failed to load application status: ' + (e?.message || 'Unknown error'));
        }
    }, [token, authHeaders, handleLogout]);

    const handleSubmitConcern = async (e: React.FormEvent) => {
        e.preventDefault();
        setConcernError('');
        setConcernSuccess(false);

        if (!token) {
            setConcernError('No authentication token found. Please log in again.');
            return;
        }

        if (!usernameCon || !concernContent) {
            setConcernError('Please fill out both the Name and Concern Details.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/concern`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    usernameCon: usernameCon,
                    concern_content: concernContent,
                    status: 'pending',
                }),
            });

            if (!res.ok) {

                const errorData = await res.json().catch(() => ({ message: `Server responded with status: ${res.status}` }));
                throw new Error(errorData.message || `Server responded with status: ${res.status}`);
            }

            setConcernSuccess(true);
            setUsernameCon('');
            setConcernContent('');
            setTimeout(() => setConcernSuccess(false), 3000);
        } catch (error: any) {
            console.error('Concern Submission Error:', error);
            setConcernError(error.message || 'An unexpected error occurred while submitting your concern.');
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (!token) {
            console.log("No token found. Redirecting to login.");
            router.push('/');
            return;
        }

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            if (decoded.exp * 1000 < Date.now()) {
                throw new Error("Token expired");
            }
            
            const userDecodedId = decoded.sub;
            
            if (isMounted) {
                setUsername(decoded.username || 'User');
                setUsernameCon(decoded.username || '');
                setUserId(userDecodedId);
            }

            fetchSystemMessages();
            generateRandomQuote();
            fetchApplicationStatus(userDecodedId); 
        } catch (e) {
            console.error("Token invalid or expired. Redirecting.", e);
            handleLogout();
        }

        return () => {
            isMounted = false;
        };
    }, [router, token, fetchSystemMessages, handleLogout, generateRandomQuote, fetchApplicationStatus]); 

    const renderApplicationStatusCard = () => (
        <Card className="mb-6">
            <CardHeader className="border-b border-gray-100 pb-2">
                <CardTitle className="flex items-center text-blue-600">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Your Job Application Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                {applicationError ? (
                    <p className="text-red-500 text-sm flex items-center">
                        <XCircle className="h-4 w-4 mr-1"/> {applicationError}
                    </p>
                ) : application ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center text-sm">
                        <div className="space-y-2">
                            <p className="text-gray-600">Application ID: <span className="font-mono text-gray-800">{application.application_id}</span></p>
                            <p className="text-gray-600">Applicant Name: <span className="font-semibold text-gray-800">{application.applicant_name}</span></p>
                            <p className="text-gray-600">Job Applied For: <span className="font-semibold text-gray-800">{application.job_positions} ({application.position_applied_for})</span></p>
                            <p className="text-gray-600 flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-blue-400"/> 
                                Date Submitted: <span className="font-semibold text-gray-800 ml-1">{new Date(application.application_date).toLocaleDateString()}</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-center justify-center space-y-2 pt-4 md:pt-0">
                            <p className="text-base font-medium text-gray-700">Current Status:</p>
                            <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${getStatusClasses(application.status)} shadow-sm`}>
                                {application.status}
                            </div>
                            <p className="text-xs text-gray-400 text-center pt-1">
                                For detailed updates, please contact administration.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-500 text-base flex items-center justify-center">
                            <Briefcase className="h-5 w-5 mr-2 text-blue-400" />
                            You have not submitted a job application yet.
                        </p>
                        <Button
                            onClick={() => router.push('/jobapplication')}
                            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        >
                            Apply Now
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderAnnouncementsCard = () => (
        <Card className="mb-6">
            <CardHeader className="border-b border-gray-100 pb-2">
                <CardTitle className="flex items-center text-blue-600">
                    <BellRing className="mr-2 h-5 w-5" />
                    Announcements
                </CardTitle>
            </CardHeader>
            <CardContent>
                {messageError ? (
                    <p className="text-red-500 text-sm flex items-center">
                        <XCircle className="h-4 w-4 mr-1"/>{messageError}
                    </p>
                ) : systemMessages.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {systemMessages.map((msg, index) => (
                            <div key={msg.message_id || index} className="bg-gray-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-gray-700 text-sm">{msg.message_content}</p>
                                <p className="text-xs text-blue-500 mt-1">From: {msg.message_code}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No new announcements available.</p>
                )}
            </CardContent>
        </Card>
    );

    const renderQuoteCard = () => (
        <Card className="mb-6">
            <CardHeader className="border-b border-gray-100 pb-2">
                <CardTitle className="flex items-center text-blue-600">
                    <Feather className="mr-2 h-5 w-5" />
                    Daily Inspiration
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-auto min-h-24 flex flex-col justify-between">
                    <blockquote className="text-gray-700 italic text-base leading-relaxed mb-3">
                        &ldquo;{currentQuote}&rdquo;
                    </blockquote>
                    <p className="text-blue-500 font-semibold text-right text-sm">
                        — {currentAuthor}
                    </p>
                </div>
                <Button
                    onClick={generateRandomQuote}
                    className="bg-blue-600 hover:bg-blue-700 w-full mt-4 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm"
                >
                    <Feather className="h-4 w-4" />
                    <span>Get New Quote</span>
                </Button>
            </CardContent>
        </Card>
    );

    const renderGameCard = () => (
        <Card className="mb-6 flex flex-col items-center">
            <CardHeader className="border-b border-gray-100 pb-2 w-full flex justify-center">
                <CardTitle className="flex items-center text-blue-600">
                    <Gamepad2 className="mr-2 h-6 w-6"/>
                    Daily Tic-Tac-Toe
                </CardTitle>
            </CardHeader>
            <CardContent className="w-full flex flex-col items-center">
                <p className="text-gray-600 text-sm mb-4 text-center">
                    Challenge the AI in this quick game! {username} is X.
                </p>
                <div className="max-w-xs mx-auto"> 
                    <TicTacToe username={username} /> 
                </div>
            </CardContent>
        </Card>
    );

    const renderConcernFormCard = () => (
        <Card className="mb-6">
            <CardHeader className="border-b border-gray-100 pb-2">
                <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Submit Concern
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-500 text-sm mb-4">
                    Have an issue or concern? Submit it here, and it will be sent to the admin for review.
                </p>
                <form onSubmit={handleSubmitConcern} className="space-y-3">
                    <div>
                        <label htmlFor="usernameCon" className="block text-sm font-medium text-gray-800 mb-1">
                            Name:
                        </label>
                        <input
                            type="text"
                            id="usernameCon"
                            value={usernameCon}
                            onChange={(e) => setUsernameCon(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div>
                        <label htmlFor="concernContent" className="block text-sm font-medium text-gray-800 mb-1">
                            Concern Details:
                        </label>
                        <textarea
                            id="concernContent"
                            value={concernContent}
                            onChange={(e) => setConcernContent(e.target.value)}
                            required
                            rows={4}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your concern in detail"
                        />
                    </div>
                    {concernError && <p className="text-red-500 text-sm flex items-center"><XCircle className="h-4 w-4 mr-1"/>{concernError}</p>}
                    {concernSuccess && <p className="text-green-500 text-sm flex items-center"><CheckCircle className="h-4 w-4 mr-1"/>Concern submitted successfully! The admin will review it.</p>}
                    <Button
                        type="submit"
                        className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition duration-200 flex items-center justify-center space-x-2 text-sm"
                    >
                        <Send className="h-4 w-4" />
                        <span>Submit Concern</span>
                    </Button>
                </form>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-4 sm:p-8 bg-transparent min-h-screen text-gray-800 font-sans">
            
            <header className="bg-white shadow-md p-3 border border-gray-200 rounded-xl max-w-7xl mx-auto flex flex-col lg:flex-row justify-between lg:items-center top-4 z-10 mb-6">
                <div className="flex items-center space-x-4 w-full lg:w-auto mb-3 lg:mb-0">
                    <Button variant="ghost" size="icon" 
                    onClick={() => window.location.href = 'creator' }
                    className="p-0 h-auto w-auto hover:bg-transparent"
                    >
                        <Image
                            src="/GWEB.png"
                            alt="GRPWEB Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain rounded-full border border-blue-500/50"
                        />
                    </Button>
                    <div className="hidden sm:block">
                        <h1 className="text-xl font-extrabold tracking-tight text-gray-800">GRPWEB</h1>
                    </div>
                </div>

                <div className="flex items-center space-x-2 justify-center lg:justify-end">

                    <Button
                        onClick={() => router.push('/jobapplication')}
                        className="text-gray-600 hover:bg-blue-100 hover:text-blue-700 flex items-center space-x-1 p-2 text-sm"
                        variant="ghost"
                    >
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        <span className='hidden sm:inline'>Job Apps</span>
                    </Button>
                    <Button
                        onClick={() => router.push('/posDashboard')}
                        className="text-gray-600 hover:bg-blue-100 hover:text-blue-700 flex items-center space-x-1 p-2 text-sm"
                        variant="ghost"
                    >
                        <Settings className="h-4 w-4 text-blue-500" />
                        <span className='hidden sm:inline'>Position</span>
                    </Button>
                    <Button
                        onClick={handleLogout}
                        className="text-gray-600 hover:bg-red-100 hover:text-red-700 flex items-center space-x-1 p-2 text-sm"
                        variant="ghost"
                    >
                        <LogOut className="h-4 w-4 text-red-500" />
                        <span className='hidden sm:inline'>Logout</span>
                    </Button>
                    <Button
                        onClick={() => router.push('/profile')}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 flex items-center space-x-1"
                        aria-label="User Profile"
                    >
                        <User className="h-4 w-4" />
                        <span className='hidden sm:inline text-sm'>User Profile</span>
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                <Card className="mb-6 p-0 overflow-hidden shadow-none border-0 bg-white">
                    <UserProfileFeed authHeaders={authHeaders} />
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-12 gap-6">

                    <div className="lg:col-span-3 xl:col-span-3 hidden lg:block space-y-6">
                        {renderQuoteCard()}
                    </div>

                    <div className="lg:col-span-4 xl:col-span-6 space-y-6">
                        {renderApplicationStatusCard()}                 
                        {renderAnnouncementsCard()}
                        {renderConcernFormCard()}
                    </div>
                    <div className="lg:col-span-5 xl:col-span-3 space-y-6">
                        {renderGameCard()}
                        <Card className='p-6'>
                             <h4 className='text-lg font-semibold text-blue-600'>Dashboard Tips:</h4>
                             <ul className='text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside'>
                                 <li>Use the Users Online bar to quickly see other users.</li>
                                 <li>Check Announcements for system updates.</li>
                                 <li>Click the User Profile button to update your details.</li>
                             </ul>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}