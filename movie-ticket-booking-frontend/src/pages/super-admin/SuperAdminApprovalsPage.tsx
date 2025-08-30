import React, { useState } from 'react';
import { Card, Button, Input, Alert } from '../../components/ui';
import { approvalService } from '../../services/approvalService';
import toast from 'react-hot-toast';

const SuperAdminApprovalsPage: React.FC = () => {
  const [movieId, setMovieId] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const run = async (action: 'approve' | 'deny', type: 'MOVIE' | 'SCHEDULE', idStr: string) => {
    setError(null);
    const id = Number(idStr);
    if (!id) {
      setError('Please enter a valid numeric ID.');
      return;
    }
    try {
      if (action === 'approve') {
        await approvalService.approve(type, id, notes || undefined);
        toast.success(`${type} #${id} approved`);
      } else {
        await approvalService.deny(type, id, notes || undefined);
        toast.success(`${type} #${id} denied`);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Operation failed';
      toast.error(msg);
      setError(msg);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-600">Approve or deny Movies and Schedules by ID</p>
      </div>

      {error && (
        <Alert type="error" title="Error" message={error} />
      )}

      <Card padding="lg">
        <h2 className="text-xl font-semibold mb-4">Movie Approval</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Input label="Movie ID" value={movieId} onChange={(e) => setMovieId(e.target.value)} placeholder="e.g. 12" />
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason or notes" />
          <div className="flex gap-2">
            <Button onClick={() => run('approve', 'MOVIE', movieId)} className="flex-1">✅ Approve</Button>
            <Button variant="outline" onClick={() => run('deny', 'MOVIE', movieId)} className="flex-1">❌ Deny</Button>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-xl font-semibold mb-4">Schedule Approval</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Input label="Schedule ID" value={scheduleId} onChange={(e) => setScheduleId(e.target.value)} placeholder="e.g. 45" />
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason or notes" />
          <div className="flex gap-2">
            <Button onClick={() => run('approve', 'SCHEDULE', scheduleId)} className="flex-1">✅ Approve</Button>
            <Button variant="outline" onClick={() => run('deny', 'SCHEDULE', scheduleId)} className="flex-1">❌ Deny</Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">Approving a schedule will put it ON_SALE immediately.</p>
      </Card>
    </div>
  );
};

export default SuperAdminApprovalsPage;
