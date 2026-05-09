import React from 'react';
import clsx from 'clsx';
import { Clock, CheckCircle2, XCircle, PlayCircle, Send, CheckSquare, Zap, CreditCard } from 'lucide-react';

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
  POP_APPROVED: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2, label: 'Approved by PoP' },
  POP_REJECTED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Rejected by PoP' },
  HOD_APPROVED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Approved by HOD' },
  HOD_REJECTED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Rejected by HOD' },
  CONDUCTED: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: PlayCircle, label: 'Conducted' },
  SUBMITTED: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Send, label: 'Submitted' },
  FACULTY_VERIFIED: { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: CheckSquare, label: 'Verified by Faculty' },
  GENERATED: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Zap, label: 'Generated' },
  PAID: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CreditCard, label: 'Paid' },
};

const StatusBadge = ({ status, className }) => {
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock, label: status };
  const Icon = config.icon;

  return (
    <span className={clsx("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm", config.color, className)}>
      <Icon size={14} className="mr-1.5" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
