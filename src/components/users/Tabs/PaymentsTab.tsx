'use client';

import * as React from 'react';
import Image from 'next/image';
import { useAllPaymentRequests, useVerifyPaymentAndEnroll, useRejectPaymentRequest } from '@/hooks/courses/useCourseAccess';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import clsx from 'clsx';

type StatusFilter = 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED';

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function PaymentsTab() {
  const { data, isLoading, isError, refetch } = useAllPaymentRequests();
  const verifyMut = useVerifyPaymentAndEnroll();
  const rejectMut = useRejectPaymentRequest();

  const [status, setStatus] = React.useState<StatusFilter>('PENDING');
  const [q, setQ] = React.useState('');
  const debouncedQ = useDebouncedValue(q, 250);

  // Track which row is being acted on so other rows remain clickable
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const list = Array.isArray(data) ? data : [];

  const filtered = React.useMemo(() => {
    const byStatus = list.filter((r: any) => (status === 'ALL' ? true : r.status === status));
    if (!debouncedQ.trim()) return byStatus;
    const needle = debouncedQ.toLowerCase();
    return byStatus.filter((r: any) => {
      const courseTitle = r?.course?.title ?? r?.course?.name ?? '';
      const hay = `${r?.user?.name ?? ''} ${r?.user?.email ?? ''} ${courseTitle} ${r?.utrNumber ?? ''}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [list, status, debouncedQ]);

  const onVerify = async (id: string, adminNote?: string) => {
    try {
      setPendingId(id);
      await verifyMut.mutateAsync({ id, payload: { adminNote: adminNote ?? '' } });
      await refetch();
    } finally {
      setPendingId(null);
    }
  };

  const onReject = async (id: string, adminNote?: string) => {
    try {
      setPendingId(id);
      await rejectMut.mutateAsync({ id, payload: { adminNote: adminNote ?? '' } });
      await refetch();
    } finally {
      setPendingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading payment requests…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-sm text-red-600">
        Failed to load payment requests. <Button variant="link" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="flex-1 z-10">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by user, email, course, UTR…" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="ALL">All</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-gray-500">
          Showing <span className="font-medium">{filtered.length}</span>
          {status !== 'ALL' ? <> {status.toLowerCase()}</> : null} of <span className="font-medium">{list.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:text-left">
              <th>User</th>
              <th>Course</th>
              <th>Amount</th>
              <th>UTR</th>
              <th>Screenshot</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Requested</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((r: any) => {
              const rowPending = pendingId === r.id || verifyMut.isPending || rejectMut.isPending;
              const createdAt = r?.createdAt ? new Date(r.createdAt) : null;
              const courseTitle = r?.course?.title ?? r?.course?.name ?? '—';
              return (
                <tr key={r.id} className="align-top [&>td]:px-3 [&>td]:py-3">
                  <td>
                    <div className="font-medium">{r?.user?.name ?? '—'}</div>
                    <div className="text-xs text-gray-500 break-all">{r?.user?.email ?? '—'}</div>
                  </td>
                  <td>
                    <div className="font-medium">{courseTitle}</div>
                  </td>
                  <td>{r?.amountPaid != null ? inr.format(r.amountPaid) : '—'}</td>
                  <td className="text-xs break-all">{r?.utrNumber ?? '—'}</td>
                  <td>
                    {r?.screenshotUrl ? (
                      <ScreenshotPreview url={r.screenshotUrl} />
                    ) : (
                      <span className="text-xs text-gray-400">No file</span>
                    )}
                  </td>
                  {/* Plan column */}
                  <td className="text-xs">
                    <div>
                      {r?.pricingOption ? (r.pricingOption.label ?? r.pricingOption.id) : '—'}
                    </div>
                    {r?.installment && (
                      <div>
                        <span className="text-gray-500">Inst:</span>{' '}
                        {r.installment.label ?? r.installment.id} {r.installment.isPaid ? '(paid)' : '(unpaid)'}
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge
                      className={clsx(
                        'capitalize',
                        r.status === 'PENDING' && 'bg-amber-100 text-amber-700',
                        r.status === 'VERIFIED' && 'bg-emerald-100 text-emerald-700',
                        r.status === 'REJECTED' && 'bg-rose-100 text-rose-700'
                      )}
                    >
                      {r.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="text-xs text-gray-500">
                    {createdAt ? createdAt.toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="text-right">
                    <ActionButtons
                      disabled={rowPending || r.status !== 'PENDING'}
                      onVerify={(note) => onVerify(r.id, note)}
                      onReject={(note) => onReject(r.id, note)}
                      currentStatus={r.status}
                    />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-sm text-gray-500">
                  No payment requests match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScreenshotPreview({ url }: { url: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Eye className="h-4 w-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <Image
          src={url}
          alt="Payment screenshot"
          width={1200}
          height={800}
          className="w-full h-auto rounded-md"
          unoptimized
        />
      </DialogContent>
    </Dialog>
  );
}

function ActionButtons({
  disabled,
  onVerify,
  onReject,
  currentStatus,
}: {
  disabled?: boolean;
  onVerify: (note?: string) => void | Promise<void>;
  onReject: (note?: string) => void | Promise<void>;
  currentStatus: string;
}) {
  const [verifyOpen, setVerifyOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [adminNote, setAdminNote] = React.useState('');

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1" disabled={disabled || currentStatus !== 'PENDING'}>
            <CheckCircle2 className="h-4 w-4" />
            Verify & Enroll
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify & Enroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Admin note (optional)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
              rows={3}
              placeholder="Any note for audit trail…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                await onVerify(adminNote);
                setVerifyOpen(false);
                setAdminNote('');
              }}
              disabled={disabled}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="destructive" className="gap-1" disabled={disabled || currentStatus !== 'PENDING'}>
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Reason (visible in audit)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
              rows={3}
              placeholder="Short reason for rejection…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await onReject(adminNote);
                setRejectOpen(false);
                setAdminNote('');
              }}
              disabled={disabled}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
