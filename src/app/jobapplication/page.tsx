'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, Send, CheckCircle, XCircle, ArrowLeft, Edit, Sun, Moon} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { API_BASE } from '@/lib/config';
import { getToken } from "@/lib/auth";

const JOB_POSITIONS = ['Unknown', 'Cashier', 'Accountant', 'Security Guard', 'Electrician', 'Helper', 'Editor', 'Documentator'];
const POSITION_TYPES = ['Unknown','Full Time', 'Part Time'];

export default function JobApplicationSubmitForm() {
    
    const router = useRouter(); 
    const token = getToken();
    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
    };

    const initialFormData = {
        applicant_name: '',
        applicant_email: '',
        applicant_phone: '',
        applicant_address: '',
        job_positions: JOB_POSITIONS[0],
        position_applied_for: POSITION_TYPES[0],
    };

    const [formData, setFormData] = useState(initialFormData);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage(null);

        if (!token) {
            setStatusMessage({ type: 'error', message: 'Authentication required. Please log in again.' });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/application`, { 
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Failed to submit application.' }));
                throw new Error(errorData.message || `Server error: ${res.status}`);
            }

            setStatusMessage({ type: 'success', message: 'Job application submitted successfully! Review status on your dashboard.' });
            setFormData(initialFormData); 
            
        } catch (error: any) {
            console.error('Application Submission Error:', error);
            setStatusMessage({ type: 'error', message: error.message || 'An unexpected error occurred during submission.' });
        } finally {
            setIsLoading(false);
        }
    };

return (
    <div className="w-full">
            <main className="bg-transparent md:p-8 max-w-4xl mx-auto border-b border-gray-200">
                    <h3 className="text-xl font-extrabold mb-3 flex items-center text-blue-800">
                        <Briefcase className="mr-2 h-5 w-5 font-bold text-blue-700" />
                        JOB APPLICATION FORM
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                        Fill out the form below to apply for a position. You can only have one active application at a time.
                    </p>

                    {statusMessage && (
                        <div className={`p-3 rounded-md mb-4 flex items-center ${statusMessage.type === 'success' ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}>
                            {statusMessage.type === 'success' ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                            {statusMessage.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-md transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Submitting...</span>
                                </div>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    <span>Submit Application</span>
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            onClick={() => router.push('/jobapplication/modifyapplication')}
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <Edit className="h-4 w-4" />
                            <span>Modify your job application</span>
                        </Button>

                        <Button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back To Dashboard</span>
                        </Button>
                    </form>

            </main>
    </div>
    );
}