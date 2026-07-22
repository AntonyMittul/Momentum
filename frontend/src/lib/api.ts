export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchTasks(targetDate?: string) {
  const url = targetDate ? `${API_BASE_URL}/api/tasks/?target_date=${targetDate}` : `${API_BASE_URL}/api/tasks/`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function createTask(data: any) {
  const res = await fetch(`${API_BASE_URL}/api/tasks/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateTask(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function generateReport(date: string) {
  const res = await fetch(`${API_BASE_URL}/api/reports/?date=${date}`);
  if (!res.ok) throw new Error("Failed to generate report");
  return res.json();
}

export async function fetchNotes() {
  const res = await fetch(`${API_BASE_URL}/api/notes/`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export async function createNote(data: any) {
  const res = await fetch(`${API_BASE_URL}/api/notes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

export async function updateNote(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

export async function deleteNote(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete note");
  return res.json();
}

export async function deleteTask(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
}

export async function getMorningCoach() {
  const res = await fetch(`${API_BASE_URL}/api/ai/morning-coach`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function getMission() {
  const res = await fetch(`${API_BASE_URL}/api/ai/mission`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function getMetrics() {
  const res = await fetch(`${API_BASE_URL}/api/metrics/`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function calculateMetrics() {
  const res = await fetch(`${API_BASE_URL}/api/metrics/calculate`, {
    method: 'POST',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchNonNegotiables(targetDate?: string) {
  const url = targetDate ? `${API_BASE_URL}/api/non-negotiables/?target_date=${targetDate}` : `${API_BASE_URL}/api/non-negotiables/`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch non-negotiables");
  return res.json();
}

export async function createNonNegotiable(data: any) {
  const res = await fetch(`${API_BASE_URL}/api/non-negotiables/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create non-negotiable");
  return res.json();
}

export async function deleteNonNegotiable(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/non-negotiables/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error("Failed to delete non-negotiable");
  return res.json();
}

export async function toggleNonNegotiable(id: number, completed: boolean) {
  const res = await fetch(`${API_BASE_URL}/api/non-negotiables/${id}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to toggle non-negotiable");
  return res.json();
}
