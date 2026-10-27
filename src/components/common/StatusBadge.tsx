import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'stage' | 'status' | 'priority' | 'compliance';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status' }) => {
  // Format readable label
  const label = status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());

  // Domain-native styling (subtle borders and backgrounds, avoiding garish candy pills)
  let colorClasses = 'bg-slate-50 text-slate-700 border-slate-200';

  if (['APPROVED', 'COMPLETED', 'COMPLIANT', 'VERIFIED'].includes(status)) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (['REJECTED', 'CRITICAL', 'EXPIRED', 'OVERDUE'].includes(status)) {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (['UNDER_SCRUTINY', 'IN_PROGRESS', 'EVC_SCHEDULED', 'HIGH', 'WARNING', 'DUE_SOON'].includes(status)) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (['SCRUTINY_REVERTED', 'AWAITING_INSTITUTION', 'CORRECTION_REQUIRED', 'URGENT'].includes(status)) {
    colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
  } else if (['FINAL_DECISION_PENDING', 'SAC_REVIEW', 'SHC_REVIEW'].includes(status)) {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClasses}`}>
      {label}
    </span>
  );
};
