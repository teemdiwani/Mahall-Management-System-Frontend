import React, { useState } from 'react';
import { Users2, Calendar, CheckSquare, Plus, Loader2 } from 'lucide-react';
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

const CommitteePage: React.FC = () => {
  const qc = useQueryClient();
  const { activeTab, setActiveTab } = useTabs('members');
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    meetingDate: '',
    location: 'Committee Boardroom',
    agendaText: '',
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

  const members: any[] = membersData?.data || [];
  const meetings: any[] = meetingsData?.data || [];

  const totalDecisions = meetings.reduce((s, m) => s + (m.resolutions?.length || 0), 0);

  return (
    <div>
      <PageHeader
        title="Committee"
        subtitle="Al-Noor Mahall Committee Administration — Synchronized with MongoDB"
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Committee' }]}
        action={<Button icon={<Plus size={16} />} onClick={() => setIsScheduleOpen(true)}>Schedule Meeting</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Committee Members" value={String(members.length)} icon={<Users2 size={20} />} />
        <StatCard label="Meetings (2026)" value={String(meetings.length)} icon={<Calendar size={20} />} iconBg="bg-blue-50 text-blue-600" />
        <StatCard label="Resolutions Passed" value={String(totalDecisions)} icon={<CheckSquare size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard label="Term Cycle" value="2025–2027" icon={<Calendar size={20} />} iconBg="bg-amber-50 text-amber-600" />
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
                  <div className="flex items-center gap-4">
                    <Avatar name={member.name} size="lg" />
                    <div>
                      <p className="font-semibold text-gray-800">{member.name}</p>
                      <p className="text-sm text-emerald-600 font-medium capitalize">{designation}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{member.phone}</p>
                    </div>
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
                    <div className="text-right text-sm text-gray-500">
                      {resolutions.length > 0 && <p className="font-semibold text-emerald-600">{resolutions.length} resolutions</p>}
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
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
        title="Meeting Details"
        size="lg"
      >
        {selectedMeeting && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{selectedMeeting.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(selectedMeeting.meetingDate || selectedMeeting.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-gray-500">{selectedMeeting.location || 'Committee Boardroom'}</p>
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
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Minutes</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed">{selectedMeeting.minutes}</p>
              </div>
            )}

            {selectedMeeting.resolutions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Decisions & Resolutions</p>
                <div className="flex flex-col gap-2">
                  {selectedMeeting.resolutions.map((d: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl">
                      <CheckSquare size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-800">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
    </div>
  );
};

export default CommitteePage;

