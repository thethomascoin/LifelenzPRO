// app/src/lib/api.ts

// Use Env Var or Fallback to localhost
let envBackend = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8000';
if (envBackend && !envBackend.startsWith('http')) {
    envBackend = `https://${envBackend}`;
}
const BACKEND_URL = envBackend;

export interface ScheduleRequestPayload {
    store_id: string;
    week_start_date: string;
    constraints: Record<string, any>;
}

export interface TaskResponse {
    task_id: string;
    status: 'PENDING' | 'STARTED' | 'RETRY' | 'FAILURE' | 'SUCCESS';
    result: any;
}

export const SchedulerApi = {
    /**
     * Triggers the schedule generation process.
     * Returns a Task ID.
     */
    async startGeneration(payload: ScheduleRequestPayload): Promise<string> {
        const response = await fetch(`${BACKEND_URL}/generate-schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to start generation: ${response.statusText}`);
        }

        const data = await response.json();
        return data.task_id;
    },

    /**
     * Checks the status of a generation task.
     */
    async getTaskStatus(taskId: string): Promise<TaskResponse> {
        const response = await fetch(`${BACKEND_URL}/tasks/${taskId}`);

        if (!response.ok) {
            throw new Error(`Failed to poll status: ${response.statusText}`);
        }

        return response.json();
    }
};
