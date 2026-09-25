import React, { useState } from 'react';
import { Users2, Calendar, CheckSquare, Plus, Loader2, UserPlus, Trash2, FileEdit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import Modal from '../../../components/ui/Modal';
import Input, { Textarea } from '../../../components/ui/Input';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import { committeeApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const DESIGNATIONS = [
  { value: 'PRESIDENT', label: 'President' },
  { value: 'VICE_PRESIDENT', label: 'Vice President' },
  { value: 'SECRETARY', label: 'General Secretary' },
  { value: 'JOINT_SECRETARY', label: 'Joint Secretary' },
  { value: 'TREASURER', label: 'Treasurer' },
  { value: 'MEMBER', label: 'Executive Member' },
];

const CommitteePage: React.FC = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useTabs('members');

  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isMinutesOpen, setIsMinutesOpen] = useState(false);

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    meetingDate: '',
    location: 'Committee Boardroom',
    agendaText: '',
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    designation: 'MEMBER',
    phone: '',
    termStart: '2025-01-01',
    termEnd: '2027-01-01',
  });

  const [minutesForm, setMinutesForm] = useState({
    minutes: '',
    resolutionsText: '',
  });

  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['committee-members'],
    queryFn: committeeApi.getMembers,
  });

  const { data: meetingsData, isLoading: loadingMeetings } = useQuery({
    queryKey: ['committee-meetings'],
    queryFn: committeeApi.getMeetings,
  });

  const scheduleMutation = useMutation({
    mutationFn: (data: any) => committeeApi.scheduleMeeting(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['committee-meetings'] });
      setIsScheduleOpen(false);
      setMeetingForm({
        title: '',
        meetingDate: '',
        location: 'Committee Boardroom',
        agendaText: '',
      });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: any) => committeeApi.createMember(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['committee-members'] });
      setIsAddMemberOpen(false);
      setMemberForm({
        name: '',
        designation: 'MEMBER',
        phone: '',
        termStart: '2025-01-01',
        termEnd: '2027-01-01',
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => committeeApi.deleteMember(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['committee-members'] });
    },
  });

  const updateMinutesMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => committeeApi.updateMinutes(id, data),
    onSuccess: (updatedRes) => {
      qc.invalidateQueries({ queryKey: ['committee-meetings'] });
      setIsMinutesOpen(false);
      setSelectedMeeting(updatedRes.data);
    },
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const agenda = meetingForm.agendaText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    scheduleMutation.mutate({
      title: meetingForm.title,
      meetingDate: meetingForm.meetingDate,
      location: meetingForm.location,
      agenda,
    });
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMemberMutation.mutate(memberForm);
  };

  const handleMinutesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    const resolutions = minutesForm.resolutionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    updateMinutesMutation.mutate({
      id: selectedMeeting._id,
      data: {
        minutes: minutesForm.minutes,
        resolutions,
        status: 'COMPLETED',
      },
    });
  };

  const openMinutesModal = (meeting: any) => {
    setSelectedMeeting(meeting);
    setMinutesForm({
      minutes: meeting.minutes || '',
      resolutionsText: (meeting.resolutions || []).join('\n'),
    });
    setIsMinutesOpen(true);
  };

  const members: any[] = membersData?.data || [];
  const meetings: any[] = meetingsData?.data || [];

  const totalDecisions = meetings.reduce((s, m) => s + (m.resolutions?.length || 0), 0);

  // Dynamic term cycle calculation
  const termYears = members
    .map((m) => (m.termStart ? new Date(m.termStart).getFullYear() : null))
    .filter(Boolean) as number[];
  const termEndYears = members
    .map((m) => (m.termEnd ? new Date(m.termEnd).getFullYear() : null))
    .filter(Boolean) as number[];
  const startYear = termYears.length > 0 ? Math.min(...termYears) : new Date().getFullYear();
  const endYear = termEndYears.length > 0 ? Math.max(...termEndYears) : startYear + 2;
  const termCycle = `${startYear}–${endYear}`;

  const currentYear = new Date().getFullYear();

  return (
    <div>
      <PageHeader
        title="Committee & Executive Council"
        subtitle="Al-Noor Mahall Committee Administration — Live Synchronized with MongoDB"
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Committee' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              icon={<UserPlus size={16} />}
              onClick={() => setIsAddMemberOpen(true)}
            >
              Add Member
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              icon={<Plus size={16} />}
              onClick={() => setIsScheduleOpen(true)}
            >
              Schedule Meeting
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Committee Members" value={String(members.length)} icon={<Users2 size={20} />} />
        <StatCard label={`Meetings (${currentYear})`} value={String(meetings.length)} icon={<Calendar size={20} />} iconBg="bg-blue-50 text-blue-600" />
        <StatCard label="Resolutions Passed" value={String(totalDecisions)} icon={<CheckSquare size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard label="Active Term Cycle" value={termCycle} icon={<Calendar size={20} />} iconBg="bg-amber-50 text-amber-600" />
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
        tabs={[
          { key: 'members', label: `Committee Members (${members.length})` },
          { key: 'meetings', label: `Meetings (${meetings.length})` },
        ]}
        className="mb-5"
      />

      {activeTab === 'members' && (
        loadingMembers ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-sm">Loading committee members from database...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No committee members found in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(member => {
              const designation = (member.designation || 'MEMBER').replace('_', ' ');
              const isActive = member.status === 'ACTIVE';

              return (
                <Card key={member._id || member.id} padding="md" hover>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <Avatar name={member.name} size="lg" />
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">{designation}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{member.phone}</p>
                      </div>
                    </div>
                    {user?.role === 'super_admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove ${member.name} from committee?`)) {
                            deleteMemberMutation.mutate(member._id);
                          }
                        }}
                        className="text-gray-300 hover:text-red-600 transition-colors p-1"
                        title="Remove member"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                    <span>
                      Term: {member.termStart ? new Date(member.termStart).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : 'Jan 2025'} – {member.termEnd ? new Date(member.termEnd).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : 'Jan 2027'}
                    </span>
                    <Badge variant={isActive ? 'emerald' : 'gray'} dot size="sm">
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {activeTab === 'meetings' && (
        loadingMeetings ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-sm">Loading meetings from database...</span>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No meetings recorded in database.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {meetings.map(meeting => {
              const status = (meeting.status || 'SCHEDULED').toLowerCase();
              const dateStr = meeting.meetingDate || meeting.date;
              const dateObj = dateStr ? new Date(dateStr) : new Date();
              const agenda: string[] = meeting.agenda || [];
              const resolutions: string[] = meeting.resolutions || [];

              return (
                <Card key={meeting._id || meeting.id} padding="md" hover onClick={() => setSelectedMeeting(meeting)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={status === 'completed' ? 'teal' : status === 'scheduled' ? 'blue' : 'gray'}
                          dot
                          size="sm"
                        >
                          {status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-800">{meeting.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-400">{meeting.location || 'Committee Boardroom'}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500 flex flex-col items-end gap-2">
                      {resolutions.length > 0 && <p className="font-semibold text-emerald-600">{resolutions.length} resolutions</p>}
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<FileEdit size={13} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openMinutesModal(meeting);
                        }}
                      >
                        Record Minutes
                      </Button>
                    </div>
                  </div>
                  {agenda.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Agenda</p>
                      <div className="flex flex-col gap-1">
                        {agenda.slice(0, 3).map((item, i) => (
                          <p key={i} className="text-xs text-gray-500 flex items-start gap-2">
                            <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 mt-0.5">{i + 1}</span>
                            {item}
                          </p>
                        ))}
                        {agenda.length > 3 && <p className="text-xs text-gray-400">+{agenda.length - 3} more items</p>}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Meeting Detail Modal */}
      <Modal
        isOpen={!!selectedMeeting && !isMinutesOpen}
        onClose={() => setSelectedMeeting(null)}
        title="Meeting Details"
        size="lg"
      >
        {selectedMeeting && (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedMeeting.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedMeeting.meetingDate || selectedMeeting.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-sm text-gray-500">{selectedMeeting.location || 'Committee Boardroom'}</p>
              </div>
              <Button
                size="sm"
                icon={<FileEdit size={14} />}
                onClick={() => openMinutesModal(selectedMeeting)}
              >
                Edit Minutes &amp; Resolutions
              </Button>
            </div>

            {selectedMeeting.agenda?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Agenda</p>
                <div className="flex flex-col gap-1.5">
                  {selectedMeeting.agenda.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs flex-shrink-0">{i + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMeeting.minutes && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Minutes of the Meeting</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">{selectedMeeting.minutes}</p>
              </div>
            )}

            {selectedMeeting.resolutions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Decisions & Resolutions Passed</p>
                <div className="flex flex-col gap-2">
                  {selectedMeeting.resolutions.map((d: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <CheckSquare size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-900 font-medium">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Record Minutes Modal */}
      <Modal
        isOpen={isMinutesOpen}
        onClose={() => setIsMinutesOpen(false)}
        title="Record Minutes & Resolutions"
        size="md"
      >
        <form onSubmit={handleMinutesSubmit} className="space-y-4">
          <Textarea
            label="Meeting Minutes & Notes"
            rows={4}
            placeholder="Key discussion points, member suggestions, financial review summaries..."
            value={minutesForm.minutes}
            onChange={(e) => setMinutesForm({ ...minutesForm, minutes: e.target.value })}
          />

          <Textarea
            label="Resolutions Passed (One per line)"
            rows={4}
            placeholder="Approved budget allocation for annual maintenance&#10;Formed subcommittee for welfare inspection&#10;Scheduled next review meeting"
            value={minutesForm.resolutionsText}
            onChange={(e) => setMinutesForm({ ...minutesForm, resolutionsText: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setIsMinutesOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updateMinutesMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Save &amp; Mark Completed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Committee Meeting"
        size="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <Input
            label="Meeting Title / Subject"
            placeholder="e.g. Monthly Executive Committee Review"
            required
            value={meetingForm.title}
            onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Meeting Date & Time"
              type="datetime-local"
              required
              value={meetingForm.meetingDate}
              onChange={(e) => setMeetingForm({ ...meetingForm, meetingDate: e.target.value })}
            />
            <Input
              label="Meeting Location / Venue"
              placeholder="e.g. Committee Boardroom"
              required
              value={meetingForm.location}
              onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
            />
          </div>

          <Textarea
            label="Agenda Points (One per line)"
            placeholder="Review monthly financial statements&#10;Approve welfare applications&#10;Madrasa annual festival planning"
            required
            value={meetingForm.agendaText}
            onChange={(e) => setMeetingForm({ ...meetingForm, agendaText: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={scheduleMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Schedule &amp; Notify Members
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Committee Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Committee Member"
        size="md"
      >
        <form onSubmit={handleAddMemberSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Haji Sulaiman Faizy"
            required
            value={memberForm.name}
            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
            <select
              value={memberForm.designation}
              onChange={(e) => setMemberForm({ ...memberForm, designation: e.target.value })}
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 bg-white"
            >
              {DESIGNATIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Contact Phone Number"
            type="tel"
            placeholder="+91 9847..."
            required
            value={memberForm.phone}
            onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Term Start Date"
              type="date"
              required
              value={memberForm.termStart}
              onChange={(e) => setMemberForm({ ...memberForm, termStart: e.target.value })}
            />
            <Input
              label="Term End Date"
              type="date"
              required
              value={memberForm.termEnd}
              onChange={(e) => setMemberForm({ ...memberForm, termEnd: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={addMemberMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CommitteePage;
