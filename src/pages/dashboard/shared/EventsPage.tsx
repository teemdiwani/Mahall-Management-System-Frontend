import React, { useState } from 'react';
import { MapPin, Users, Clock, Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import Modal from '../../../components/ui/Modal';
import Input, { Textarea } from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { eventsApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const categoryColors: Record<string, 'emerald' | 'blue' | 'purple' | 'amber' | 'teal' | 'orange' | 'gray' | 'red'> = {
  religious: 'emerald', RELIGIOUS: 'emerald',
  community: 'blue', COMMUNITY: 'blue',
  education: 'purple', EDUCATIONAL: 'purple',
  welfare: 'teal', CHARITY: 'teal',
  sports: 'orange', YOUTH: 'orange',
  other: 'gray',
};

const EventCard: React.FC<{ event: any; onRegister: (id: string) => void; isRegistering: boolean; isRegistered: boolean }> = ({
  event,
  onRegister,
  isRegistering,
  isRegistered,
}) => {
  const eventId = event._id || event.id;
  const status = (event.status || 'UPCOMING').toLowerCase();
  const dateStr = event.startDate || event.date || new Date();
  const dateObj = new Date(dateStr);
  const registeredCount = event.registeredAttendees?.length || event.registeredCount || 0;
  const maxCapacity = event.capacity || event.maxParticipants;
  const location = event.location || event.venue || 'Mahall Center';
  const category = (event.category || 'COMMUNITY').toLowerCase();

  return (
    <Card hover padding="none" className="overflow-hidden">
      <div className={`h-2 w-full ${status === 'upcoming' ? 'bg-emerald-500' : status === 'completed' ? 'bg-gray-300' : 'bg-amber-400'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={categoryColors[category] || 'blue'} size="sm">{category}</Badge>
              <Badge variant={status === 'upcoming' ? 'emerald' : status === 'completed' ? 'gray' : 'amber'} size="sm">{status}</Badge>
            </div>
            <h3 className="text-base font-semibold text-gray-800 leading-snug">{event.title}</h3>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-center flex-shrink-0 shadow-sm">
            <p className="text-xs text-gray-400 uppercase">{dateObj.toLocaleString('en', { month: 'short' })}</p>
            <p className="text-xl font-bold text-gray-800">{dateObj.getDate()}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{event.description}</p>
        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-2"><MapPin size={12} />{location}</div>
          <div className="flex items-center gap-2">
            <Clock size={12} />
            {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-2">
            <Users size={12} />
            {registeredCount} registered{maxCapacity ? ` / ${maxCapacity} max` : ''}
          </div>
        </div>
        {status === 'upcoming' && (
          <div className="mt-4">
            <Button
              variant={isRegistered ? 'outline' : 'secondary'}
              size="sm"
              fullWidth
              disabled={isRegistering || isRegistered}
              onClick={() => onRegister(eventId)}
            >
              {isRegistered ? '✓ Registered' : isRegistering ? 'Registering...' : 'Register for Event'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { activeTab, setActiveTab } = useTabs('all');
  const canManage = ['super_admin', 'SUPER_ADMIN', 'secretary', 'SECRETARY', 'committee_member', 'COMMITTEE_MEMBER'].includes(user?.role ?? '');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'COMMUNITY',
    startDate: '',
    endDate: '',
    location: 'Mahall Community Center',
    capacity: 200,
    description: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['events', activeTab],
    queryFn: () => eventsApi.list({ status: activeTab !== 'all' ? activeTab : undefined }),
  });

  const registerMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.register(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => eventsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        category: 'COMMUNITY',
        startDate: '',
        endDate: '',
        location: 'Mahall Community Center',
        capacity: 200,
        description: '',
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      capacity: Number(formData.capacity) || 200,
    });
  };

  const events: any[] = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Community events, programs and gatherings loaded live from MongoDB"
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Events' }]}
        action={canManage && (
          <Button icon={<Plus size={16} />} onClick={() => setIsAddModalOpen(true)}>
            Add Event
          </Button>
        )}
      />

      <div className="mb-6">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          tabs={[
            { key: 'all', label: 'All Events' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Past Events' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-sm">Loading events from database...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No events found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map(event => {
            const eventId = event._id || event.id;
            const isRegistered = Boolean(
              user?.id &&
              event.registeredAttendees?.some(
                (a: any) => (typeof a === 'string' ? a : a._id || a.id) === user.id
              )
            );

            return (
              <EventCard
                key={eventId}
                event={event}
                onRegister={(id) => registerMutation.mutate(id)}
                isRegistering={registerMutation.isPending}
                isRegistered={isRegistered}
              />
            );
          })}
        </div>
      )}

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Community Event"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Event Title"
            placeholder="e.g. Ramadan Spiritual Workshop"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category"
              options={[
                { value: 'RELIGIOUS', label: 'Religious' },
                { value: 'COMMUNITY', label: 'Community' },
                { value: 'EDUCATIONAL', label: 'Educational' },
                { value: 'CHARITY', label: 'Charity & Welfare' },
                { value: 'YOUTH', label: 'Youth & Sports' },
              ]}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Max Capacity"
              type="number"
              min={1}
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Location / Venue"
            placeholder="e.g. Al-Noor Central Masjid Hall"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <Textarea
            label="Event Description"
            placeholder="Provide event schedule, guest speakers, eligibility..."
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Publish Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsPage;

