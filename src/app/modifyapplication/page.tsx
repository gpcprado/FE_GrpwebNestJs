'use client';

import Image from 'next/image';
import { getToken, logoutUser } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from "react";
import { XCircle, ArrowLeft, CheckCircle, Briefcase, Calendar, Edit, Save, Trash2 } from "lucide-react"; 

import { API_BASE } from '@/lib/config';

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

const JOB_POSITIONS = ['Unknown', 'Cashier', 'Accountant', 'Security Guard', 'Electrician', 'Helper', 'Editor', 'Documentator'];
const POSITION_TYPES = ['Unknown', 'Full Time', 'Part Time'];

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-[#1b0a4d] rounded-xl shadow-2xl p-6 ${className}`}>
        {children}
    </div>
);

const getStatusClasses = (status: Application['status']) => {
    switch (status) {
        case 'Hired':
            return 'bg-green-600 text-white';
        case 'Interview Scheduled':
            return 'bg-blue-600 text-white animate-pulse';
        case 'Under Consideration':
            return 'bg-yellow-600 text-white';
        case 'Rejected':
            return 'bg-red-600 text-white';
        case 'Pending Review':
        default:
            return 'bg-gray-600 text-white';
    }
}

export default function DashboardHome() {
    const router = useRouter();
    const token = getToken();

    const [username, setUsername] = useState("Guest");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const [application, setApplication] = useState<Application | null>(null);
    const [applicationError, setApplicationError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    useEffect(() => {
        if (token) {
            try {
                const decoded: JwtPayload = jwtDecode(token);
                setUsername(decoded.username);
                setCurrentUserId(decoded.sub);
            } catch (error) {
                console.error("Error decoding token:", error);
                handleLogout();
            }
        } else {
            handleLogout();
        }
    }, [token, handleLogout]);

    const fetchApplicationStatus = useCallback(async () => { 
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
            setApplicationError('Failed to load application status: ' + (e?.message || 'Unknown error'));
        }
    }, [token, currentUserId, authHeaders, handleLogout]);

    useEffect(() => {
        fetchApplicationStatus();
    }, [fetchApplicationStatus]);

    const [formData, setFormData] = useState({
        applicant_name: '',
        applicant_email: '',
        applicant_phone: '',
        applicant_address: '',
        job_positions: JOB_POSITIONS[0],
        position_applied_for: POSITION_TYPES[0],
    });

    useEffect(() => {
        if (application) {
            setFormData({
                applicant_name: application.applicant_name,
                applicant_email: application.applicant_email,
                applicant_phone: application.applicant_phone,
                applicant_address: application.applicant_address,
                job_positions: application.job_positions,
                position_applied_for: application.position_applied_for,
            });
        }
    }, [application]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setStatusMessage(null);

        if (!token || !application) {
            setStatusMessage({ type: 'error', message: 'Cannot update: Application or authentication missing.' });
            setIsUpdating(false);
            return;
        }

        const updateBody = {
            ...application,
            ...formData,
        };
        
        try {
            const res = await fetch(`${API_BASE}/application/${application.application_id}`, { 
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify(updateBody),
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                let errorMessage = `Update failed with status: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    const errorText = await res.text();
                    errorMessage = errorText || `${res.statusText} (${res.status})`;
                }
                throw new Error(errorMessage);
            }

            const updatedData: Application = await res.json();
            setApplication(updatedData);
            setStatusMessage({ type: 'success', message: 'Application updated successfully!' });

        } catch (error: any) {
            console.error('Application Update Error:', error);
            setStatusMessage({ type: 'error', message: error.message || 'An unexpected error occurred during update.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your application? This action cannot be undone.')) return;

        setIsDeleting(true);
        setStatusMessage(null);

        if (!token || !application) {
            setStatusMessage({ type: 'error', message: 'Cannot delete: Application or authentication missing.' });
            setIsDeleting(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/application/${application.application_id}`, { 
                method: 'DELETE',
                headers: authHeaders,
            });

            if (res.status === 401) {
                handleLogout();
                return;
            }

            if (!res.ok) {
                let errorMessage = `Delete failed with status: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    const errorText = await res.text();
                    errorMessage = errorText || `${res.statusText} (${res.status})`;
                }
                throw new Error(errorMessage);
            }

            setApplication(null);
            setStatusMessage({ type: 'success', message: 'Application deleted successfully!' });

        } catch (error: any) {
            console.error('Application Delete Error:', error);
            setStatusMessage({ type: 'error', message: error.message || 'An unexpected error occurred during deletion.' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen text-white font-sans">

            <header className="flex justify-between items-center pb-4 border-b border-white/10 mb-8">
                <div className="flex items-center space-x-3">
                    <Image
                        src="/GWEB.png"
                        alt="GRPWEB Logo"
                        width={32}
                        height={32}
                        className="w-9 h-9 object-contain"
                    />
                    <h1 className="text-3xl font-semibold tracking-tight text-black">Job Application</h1>
                </div>
            </header>

            <main className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-3 bg-gray-100 border-b border-gray-200">
                        <h3 className="text-xl text-blue-800 font-bold mb-4 flex items-center border-b border-white/10 pb-2">
                            <Briefcase className="mr-2 h-5 w-5 text-blue-900" />
                            Your Job Application Status
                        </h3>

                        {applicationError ? (
                            <p className="text-red-400 text-sm flex items-center">
                                <XCircle className="h-4 w-4 mr-1"/> {applicationError}
                            </p>
                        ) : application ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-gray-400 text-sm">Application ID: <span className="font-mono text-gray-500">{application.application_id}</span></p>
                                    <p className="text-gray-400 text-sm">Applicant Name: <span className="font-mono text-gray-500">{application.applicant_name}</span></p>
                                    <p className="text-gray-400 text-sm">Applicant Email: <span className="font-mono text-gray-500">{application.applicant_email}</span></p>
                                    <p className="text-gray-400 text-sm">Applicant Phone: <span className="font-mono text-gray-500">{application.applicant_phone}</span></p>
                                    <p className="text-gray-400 text-sm">Applicant Address: <span className="font-mono text-gray-500">{application.applicant_address}</span></p>
                                    <p className="text-gray-400 text-sm">Job Applied For: <span className="font-mono text-gray-500">{application.job_positions} ({application.position_applied_for})</span></p>
                                    <p className="text-gray-400 text-sm flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-gray-400 text-sm"/> 
                                        Date Submitted: <span className="font-semibold font-mono text-gray-500 ml-1">{new Date(application.application_date).toLocaleDateString()}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <p className="text-lg font-medium text-blue-900">Current Status:</p>
                                    <div className={`px-4 py-2 rounded-full font-bold text-lg ${getStatusClasses(application.status)} shadow-lg`}>
                                        {application.status}
                                    </div>
                                    <p className="text-xs text-gray-400 text-center pt-1">
                                        For detailed updates, please contact administration.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-500 text-lg flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                                    You have not submitted a job application yet.
                                </p>
                                <Button
                                    onClick={() => router.push('/jobapplication')}
                                    className="mt-4 bg-blue-800 hover:bg-blue-900 text-white"
                                >
                                    Submit Application
                                </Button>
                            </div>
                        )}
                    </Card>

                    {application && (
                        <Card className="lg:col-span-3 bg-gray-100 border-b border-gray-200">
                            <h3 className="text-xl font-bold mb-3 flex items-center text-blue-900">
                                <Edit className="mr-2 h-5 w-5 text-blue-800" />
                                Modify Your Job Application
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Update your application details below. Submitted on {new Date(application.application_date).toLocaleDateString()}.
                            </p>

                            {statusMessage && (
                                <div className={`p-3 rounded-md mb-4 flex items-center ${statusMessage.type === 'success' ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>
                                    {statusMessage.type === 'success' ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                    {statusMessage.message}
                                </div>
                            )}

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div>
                                        <label htmlFor="applicant_name" className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                                        <input type="text" id="applicant_name" value={formData.applicant_name} onChange={handleChange} required className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded-md text-gray-500" placeholder="Your Full Name" />
                                    </div>

                                    <div>
                                        <label htmlFor="applicant_email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                        <input type="email" id="applicant_email" value={formData.applicant_email} onChange={handleChange} required className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded-md text-gray-500" placeholder="your.email@example.com" />
                                    </div>

                                    <div>
                                        <label htmlFor="applicant_phone" className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                                        <input type="tel" id="applicant_phone" value={formData.applicant_phone} onChange={handleChange} required className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded-md text-gray-500" placeholder="e.g. 0917-1234567" />
                                    </div>

                                    <div>
                                        <label htmlFor="job_positions" className="block text-sm font-medium text-gray-600 mb-1">Job Position</label>
                                        <select id="job_positions" value={formData.job_positions} onChange={handleChange} required className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded-md text-gray-500">
                                            {JOB_POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="position_applied_for" className="block text-sm font-medium text-gray-600 mb-1">Employment Type</label>
                                        <select id="position_applied_for" value={formData.position_applied_for} onChange={handleChange} required className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded-md text-gray-500">
                                            {POSITION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="applicant_address" className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                                    <textarea id="applicant_address" rows={2} value={formData.applicant_address} onChange={handleChange} required className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded-md text-gray-500" placeholder="Your current mailing address" />
                                </div>

                                <div className="flex space-x-4">
                                    <Button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Updating...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Deleting...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                <span>Delete Application</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                                    <Button
                                        type="button"
                                        onClick={() => router.push('/jobapplication')}
                                        className="w-full mt-5 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back to Job Apps</span>
                                    </Button>
                        </Card>
                    )}
                </div> 
            </main>
        </div>
    );
}