import apiClient from './apiClient';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const familiesApi = {
  list: async (params?: Record<string, any>) => apiClient.get('/families', { params }),
  getById: async (id: string) => apiClient.get(`/families/${id}`),
  create: async (data: any) => apiClient.post('/families', data),
  update: async (id: string, data: any) => apiClient.patch(`/families/${id}`, data),
  archive: async (id: string, force?: boolean) => apiClient.delete(`/families/${id}`, { params: { force } }),
  getMyFamily: async () => apiClient.get('/families/my-family'),
  getMembers: async (id: string) => apiClient.get(`/families/${id}/members`),
  addMember: async (id: string, data: any) => apiClient.post(`/families/${id}/members`, data),
  updateMember: async (familyId: string, memberId: string, data: any) =>
    apiClient.patch(`/families/${familyId}/members/${memberId}`, data),
  removeMember: async (familyId: string, memberId: string) =>
    apiClient.delete(`/families/${familyId}/members/${memberId}`),
};

export const membersApi = {
  list: async (params?: Record<string, any>) => apiClient.get('/members', { params }),
  search: async (q: string) => apiClient.get('/members/search', { params: { q } }),
  getById: async (id: string) => apiClient.get(`/members/${id}`),
  create: async (data: any) => apiClient.post('/members', data),
  update: async (id: string, data: any) => apiClient.patch(`/members/${id}`, data),
  delete: async (id: string) => apiClient.delete(`/members/${id}`),
};

export const familyRequestsApi = {
  list: async (params?: Record<string, any>) => apiClient.get('/family-change-requests', { params }),
  getById: async (id: string) => apiClient.get(`/family-change-requests/${id}`),
  create: async (data: any) => apiClient.post('/family-change-requests', data),
  approve: async (id: string, comment?: string) => apiClient.post(`/family-change-requests/${id}/approve`, { comment }),
  reject: async (id: string, reason: string) => apiClient.post(`/family-change-requests/${id}/reject`, { reason }),
};

export const paymentsApi = {
  list: async (params?: Record<string, any>) => apiClient.get('/payments', { params }),
  create: async (data: any) => apiClient.post('/payments', data),
  verify: async (id: string) => apiClient.patch(`/payments/${id}/verify`),
  getMyPayments: async () => apiClient.get('/payments/my-payments'),
};

export const financeApi = {
  getOverview: async (month?: string) => apiClient.get('/finance/overview', { params: { month } }),
  listExpenses: async (params?: Record<string, any>) => apiClient.get('/finance/expenses', { params }),
  recordExpense: async (data: any) => apiClient.post('/finance/expenses', data),
};

export const applicationsApi = {
  list: async (params?: Record<string, any>) => apiClient.get('/applications', { params }),
  getById: async (id: string) => apiClient.get(`/applications/${id}`),
  create: async (data: any) => apiClient.post('/applications', data),
  updateStatus: async (id: string, data: { status: string; decision?: string; comment?: string } | string, note?: string) => {
    const payload = typeof data === 'string' ? { status: data, comment: note, note } : data;
    return apiClient.patch(`/applications/${id}/status`, payload);
  },
};

export const announcementsApi = {
  list: async (): Promise<{ data: any[] }> => apiClient.get('/announcements'),
  create: async (data: any): Promise<{ data: any }> => apiClient.post('/announcements', data),
};

export const notificationsApi = {
  getMy: async (): Promise<{ data: { notifications: any[]; unreadCount: number } }> => apiClient.get('/notifications'),
  markRead: async (id: string): Promise<{ data: any }> => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: async (): Promise<{ data: any }> => apiClient.post('/notifications/mark-all-read'),
};

export const usersApi = {
  list: async (params?: Record<string, any>): Promise<{ data: { items: any[]; pagination: any } }> => apiClient.get('/users', { params }),
  updateRole: async (id: string, role: string): Promise<{ data: any }> => apiClient.patch(`/users/${id}/role`, { role }),
  updateStatus: async (id: string, isActive: boolean): Promise<{ data: any }> => apiClient.patch(`/users/${id}/status`, { isActive }),
};

export const eventsApi = {
  list: async (params?: Record<string, any>): Promise<{ data: any[] }> => apiClient.get('/events', { params }),
  getById: async (id: string): Promise<{ data: any }> => apiClient.get(`/events/${id}`),
  create: async (data: any): Promise<{ data: any }> => apiClient.post('/events', data),
  register: async (id: string): Promise<{ data: any }> => apiClient.post(`/events/${id}/register`),
};

export const committeeApi = {
  getMembers: async (): Promise<{ data: any[] }> => apiClient.get('/committee/members'),
  getMeetings: async (): Promise<{ data: any[] }> => apiClient.get('/committee/meetings'),
  scheduleMeeting: async (data: any): Promise<{ data: any }> => apiClient.post('/committee/meetings', data),
  updateMinutes: async (id: string, data: any): Promise<{ data: any }> => apiClient.patch(`/committee/meetings/${id}/minutes`, data),
};

export const assetsApi = {
  list: async (params?: Record<string, any>): Promise<{ data: any[] }> => apiClient.get('/assets', { params }),
  getStats: async (): Promise<{ data: any }> => apiClient.get('/assets/stats'),
  create: async (data: any): Promise<{ data: any }> => apiClient.post('/assets', data),
  update: async (id: string, data: any): Promise<{ data: any }> => apiClient.patch(`/assets/${id}`, data),
};

export const mosqueApi = {
  getInfo: async (): Promise<{ data: any }> => apiClient.get('/mosque'),
  updateTimings: async (data: any): Promise<{ data: any }> => apiClient.patch('/mosque/timings', data),
  updatePrograms: async (programs: any[]): Promise<{ data: any }> => apiClient.put('/mosque/programs', { programs }),
};

export const ramadanApi = {
  getSchedule: async (): Promise<{ data: any }> => apiClient.get('/ramadan'),
};

// ─── Welfare ─────────────────────────────────────────────────────────────────
export const welfareApi = {
  getDashboard: async () => apiClient.get('/welfare/dashboard'),
  listCases: async (params?: Record<string, any>) => apiClient.get('/welfare/cases', { params }),
  createCase: async (data: any) => apiClient.post('/welfare/cases', data),
  updateCaseStatus: async (id: string, status: string, note?: string) => apiClient.patch(`/welfare/cases/${id}/status`, { status, note }),
  listBeneficiaries: async (params?: Record<string, any>) => apiClient.get('/welfare/beneficiaries', { params }),
  getZakat: async () => apiClient.get('/welfare/zakat'),
  distributeZakat: async (data: any) => apiClient.post('/welfare/zakat/distribute', data),
};

// ─── Funeral ─────────────────────────────────────────────────────────────────
export const funeralApi = {
  list: async (params?: Record<string, any>) => apiClient.get('/funeral', { params }),
  create: async (data: any) => apiClient.post('/funeral', data),
  updateStatus: async (id: string, status: string, plotNumber?: string) =>
    apiClient.patch(`/funeral/${id}/status`, { status, cemeteryPlotNumber: plotNumber }),
};

// ─── Marriage ─────────────────────────────────────────────────────────────────
export const marriageApi = {
  list: async (params?: Record<string, any>) => apiClient.get('/marriage', { params }),
  create: async (data: any) => apiClient.post('/marriage', data),
  updateStatus: async (id: string, status: string) => apiClient.patch(`/marriage/${id}/status`, { status }),
};

// ─── Madrasa ─────────────────────────────────────────────────────────────────
export const madrasaApi = {
  getDashboard: async () => apiClient.get('/madrasa/dashboard'),
  getParentPortal: async () => apiClient.get('/madrasa/parent-portal'),
  listMadrasas: async () => apiClient.get('/madrasa/madrasas'),
  getMadrasaDetails: async (id: string) => apiClient.get(`/madrasa/madrasas/${id}`),
  createMadrasa: async (data: any) => apiClient.post('/madrasa/madrasas', data),
  updateMadrasa: async (id: string, data: any) => apiClient.patch(`/madrasa/madrasas/${id}`, data),
  deleteMadrasa: async (id: string) => apiClient.delete(`/madrasa/madrasas/${id}`),

  // Classes (Standards 1 to 10 or 12)
  listClasses: async (params?: Record<string, any>) => apiClient.get('/madrasa/classes', { params }),
  createClass: async (data: any) => apiClient.post('/madrasa/classes', data),
  updateClass: async (id: string, data: any) => apiClient.patch(`/madrasa/classes/${id}`, data),
  deleteClass: async (id: string) => apiClient.delete(`/madrasa/classes/${id}`),

  // Timetables (Secretary uploads / manages class-wise)
  listTimetables: async (params?: Record<string, any>) => apiClient.get('/madrasa/timetables', { params }),
  getTimetableByClass: async (classId: string) => apiClient.get(`/madrasa/timetables/class/${classId}`),
  saveTimetable: async (data: any) => apiClient.post('/madrasa/timetables', data),
  deleteTimetable: async (id: string) => apiClient.delete(`/madrasa/timetables/${id}`),

  // Exam Results (Entered by Madrasa Manager)
  listResults: async (params?: Record<string, any>) => apiClient.get('/madrasa/results', { params }),
  createResult: async (data: any) => apiClient.post('/madrasa/results', data),
  updateResult: async (id: string, data: any) => apiClient.patch(`/madrasa/results/${id}`, data),
  deleteResult: async (id: string) => apiClient.delete(`/madrasa/results/${id}`),

  // Monthly Student Fees & Fee Alerts
  listFees: async (params?: Record<string, any>) => apiClient.get('/madrasa/fees', { params }),
  recordFeePayment: async (data: any) => apiClient.post('/madrasa/fees', data),
  updateFeeStatus: async (id: string, data: any) => apiClient.patch(`/madrasa/fees/${id}`, data),

  // Attendance
  listAttendance: async (params?: Record<string, any>) => apiClient.get('/madrasa/attendance', { params }),
  recordAttendance: async (data: any) => apiClient.post('/madrasa/attendance', data),

  // Madrasa Announcements (Parent / Student Notices)
  listAnnouncements: async (params?: Record<string, any>) => apiClient.get('/madrasa/announcements', { params }),
  createAnnouncement: async (data: any) => apiClient.post('/madrasa/announcements', data),
  deleteAnnouncement: async (id: string) => apiClient.delete(`/madrasa/announcements/${id}`),

  // Students & Teachers (Census & Rosters)
  listStudents: async (params?: Record<string, any>) => apiClient.get('/madrasa/students', { params }),
  createStudent: async (data: any) => apiClient.post('/madrasa/students', data),
  updateStudent: async (id: string, data: any) => apiClient.patch(`/madrasa/students/${id}`, data),
  deleteStudent: async (id: string) => apiClient.delete(`/madrasa/students/${id}`),
  listTeachers: async (params?: Record<string, any>) => apiClient.get('/madrasa/teachers', { params }),
  createTeacher: async (data: any) => apiClient.post('/madrasa/teachers', data),
  updateTeacher: async (id: string, data: any) => apiClient.patch(`/madrasa/teachers/${id}`, data),
  deleteTeacher: async (id: string) => apiClient.delete(`/madrasa/teachers/${id}`),
};

// ─── Volunteers ───────────────────────────────────────────────────────────────
export const volunteersApi = {
  list: async (params?: Record<string, any>) => apiClient.get('/volunteers', { params }),
  register: async (data: any) => apiClient.post('/volunteers/register', data),
  updateAvailability: async (id: string, data: any) => apiClient.patch(`/volunteers/${id}/availability`, data),
  updateStatus: async (id: string, status: string) => apiClient.patch(`/volunteers/${id}/status`, { status }),
};

// ─── Hajj & Umrah ─────────────────────────────────────────────────────────────
export const hajjUmrahApi = {
  listPosts: async (params?: Record<string, any>) => apiClient.get('/hajj-umrah/posts', { params }),
  getPostById: async (id: string) => apiClient.get(`/hajj-umrah/posts/${id}`),
  getStats: async () => apiClient.get('/hajj-umrah/stats'),
  createPost: async (data: any) => apiClient.post('/hajj-umrah/posts', data),
  updatePost: async (id: string, data: any) => apiClient.patch(`/hajj-umrah/posts/${id}`, data),
  deletePost: async (id: string) => apiClient.delete(`/hajj-umrah/posts/${id}`),
  register: async (postId: string, data: any) => apiClient.post(`/hajj-umrah/posts/${postId}/register`, data),
  listRegistrations: async (params?: Record<string, any>) => apiClient.get('/hajj-umrah/registrations', { params }),
  getMyRegistrations: async () => apiClient.get('/hajj-umrah/my-registrations'),
  updateRegistrationStatus: async (id: string, status: string) => apiClient.patch(`/hajj-umrah/registrations/${id}/status`, { status }),
  resendEmail: async (id: string) => apiClient.post(`/hajj-umrah/registrations/${id}/resend-email`),
};

