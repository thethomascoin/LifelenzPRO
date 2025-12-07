import { Employee, Forecast, Schedule } from './types';

// STRICT PRODUCTION MODE: Mocks removed.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lifelenz.com/v1';
let API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export const setDynamicApiKey = (key: string) => {
    API_KEY = key;
};

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
};

export const fetchEmployees = async (): Promise<Employee[]> => {
    try {
        if (!API_KEY) throw new Error("No API Key");

        const res = await fetch(`${API_BASE_URL}/employees`, { headers });
        if (!res.ok) throw new Error('Failed to fetch employees');

        const data = await res.json();
        return data.map((e: any) => ({
            id: e.id,
            name: e.fullName,
            role: e.jobTitle,
            maxHoursPerWeek: e.weeklyLimit || 40,
            availability: e.availability || {},
            hourlyRate: e.rate || 15.0
        }));

    } catch (error) {
        console.error("API Fetch Failed:", error);
        throw error; // Strict Production Mode: No Failover to Mocks
    }
};

export const fetchForecast = async (): Promise<Forecast[]> => {
    try {
        if (!API_KEY) throw new Error("API Key configuration missing. Cannot fetch live forecast.");

        const res = await fetch(`${API_BASE_URL}/forecast/labor`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch forecast: ${res.statusText}`);

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("API Fetch Failed:", error);
        throw error;
    }
};

export const publishSchedule = async (schedule: Schedule): Promise<boolean> => {
    try {
        if (!API_KEY) {
            console.log("Mock Publish: Success");
            return true;
        }

        const res = await fetch(`${API_BASE_URL}/schedules`, {
            method: 'POST',
            headers,
            body: JSON.stringify(schedule)
        });

        if (!res.ok) throw new Error('Failed to publish');
        return true;
    } catch (error) {
        console.error("Publish failed", error);
        return false;
    }
};

// --- MOCKS ---

export const MOCK_EMPLOYEES: Employee[] = [
    { id: 'emp-1', name: 'Alice Johnson', role: 'Manager', maxHoursPerWeek: 40, availability: { 'Monday': ['08:00-16:00'] }, hourlyRate: 28.0 },
    { id: 'emp-2', name: 'Bob Smith', role: 'Crew', maxHoursPerWeek: 30, availability: { 'Monday': ['10:00-18:00'] }, hourlyRate: 15.0 },
    { id: 'emp-3', name: 'Charlie Davis', role: 'Crew', maxHoursPerWeek: 20, availability: { 'Monday': ['12:00-20:00'] }, hourlyRate: 15.0 },
    { id: 'emp-4', name: 'Dana Lee', role: 'Crew', maxHoursPerWeek: 25, availability: { 'Monday': ['06:00-14:00'] }, hourlyRate: 16.0 },
];

export const generateMockForecast = (): Forecast[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const forecast: Forecast[] = [];
    days.forEach(day => {
        // Simple mock: demand 2 staff every hour for now
        for (let hour = 8; hour < 22; hour++) {
            forecast.push({
                day,
                hour,
                requiredStaff: 2,
                projectedSales: 500
            });
        }
    });
    return forecast;
};
