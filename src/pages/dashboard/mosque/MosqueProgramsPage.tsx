import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Clock, User, Trash2, Edit2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { mosqueApi } from '../../../api/domainApis';

interface Program {
  title: string;
  dayTime: string;
  instructor: string;
  description: string;
}

export const MosqueProgramsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: mosqueRes, isLoading } = useQuery({
    queryKey: ['mosque-info'],
    queryFn: mosqueApi.getInfo,
  });

  const mosque = mosqueRes?.data;
  const programs: Program[] = mosque?.programs || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Program>({
    title: '',
    dayTime: '',
    instructor: '',
    description: '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const mutation = useMutation({
    mutationFn: (newPrograms: Program[]) => mosqueApi.updatePrograms(newPrograms),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosque-info'] });
      setIsModalOpen(false);
      setEditingIndex(null);
      setFormData({ title: '', dayTime: '', instructor: '', description: '' });
      setFeedback({ type: 'success', text: 'Mosque programs updated successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: any) => {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update programs',
      });
    },
  });

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({ title: '', dayTime: '', instructor: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(programs[index]);
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to remove this program?')) {
      const updated = programs.filter((_, i) => i !== index);
      mutation.mutate(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Program[];
    if (editingIndex !== null) {
      updated = [...programs];
      updated[editingIndex] = formData;
    } else {
      updated = [...programs, formData];
    }
    mutation.mutate(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Mosque Programs & Study Circles"
          subtitle="Manage Islamic study halaqahs, lectures, and educational sessions conducted at the mosque"
          breadcrumb={[{ label: 'Mosque', href: '/app/mosque' }, { label: 'Programs' }]}
        />
        <Button onClick={handleOpenAdd} className="self-start sm:self-auto flex items-center gap-2">
          <Plus size={16} /> Add Program
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {programs.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen size={48} className="mx-auto text-neutral-400 mb-3" />
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            No Programs Scheduled
          </h3>
          <p className="text-sm text-neutral-500 mb-4 max-w-sm mx-auto">
            Schedule regular Quran circles, Hadith classes, or youth halaqahs to engage the community.
          </p>
          <Button onClick={handleOpenAdd}>Schedule First Program</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, idx) => (
            <Card key={idx} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    <BookOpen size={22} />
                  </div>
                  <Badge variant="emerald">Active</Badge>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {program.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed line-clamp-3">
                  {program.description}
                </p>
              </div>

              <div className="space-y-2 border-t pt-4 border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-emerald-600 shrink-0" />
                  <span className="font-medium">{program.dayTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-emerald-600 shrink-0" />
                  <span>{program.instructor}</span>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(idx)}
                    className="flex items-center gap-1.5 py-1 px-2.5 text-xs"
                  >
                    <Edit2 size={13} /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(idx)}
                    className="flex items-center gap-1.5 py-1 px-2.5 text-xs text-red-600 hover:bg-red-50 border-red-200 dark:border-red-900"
                  >
                    <Trash2 size={13} /> Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 shadow-xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
              {editingIndex !== null ? 'Edit Program' : 'Schedule New Program'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Program Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Weekly Hadith Circle, Tajweed for Adults"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Day & Time Schedule
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Every Sunday 10:00 AM - 11:30 AM"
                  value={formData.dayTime}
                  onChange={(e) => setFormData({ ...formData, dayTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Instructor / Scholar
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Usthad Abdullah Faizy"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Curriculum
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details about subjects covered, target audience, and materials provided..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : editingIndex !== null ? 'Update Program' : 'Create Program'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MosqueProgramsPage;
