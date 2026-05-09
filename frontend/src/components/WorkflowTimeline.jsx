import React from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

const lectureSteps = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'POP_APPROVED', label: 'PoP Assessed' },
  { key: 'HOD_APPROVED', label: 'HOD Approved' },
  { key: 'CONDUCTED', label: 'Conducted' }
];

const reportSteps = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'FACULTY_VERIFIED', label: 'Faculty Verified' },
  { key: 'HOD_APPROVED', label: 'HOD Approved' }
];

const honorariumSteps = [
  { key: 'GENERATED', label: 'Generated' },
  { key: 'FACULTY_VERIFIED', label: 'Faculty Verified' },
  { key: 'HOD_APPROVED', label: 'HOD Approved' },
  { key: 'PAID', label: 'Paid' }
];

const WorkflowTimeline = ({ currentStatus, type = 'lecture' }) => {
  const steps = type === 'lecture' ? lectureSteps : type === 'report' ? reportSteps : honorariumSteps;
  
  // Find current step index based on status. Handle rejections
  let currentIndex = steps.findIndex(s => s.key === currentStatus);
  if (currentStatus === 'POP_REJECTED') currentIndex = 1; // It reached step 1 but failed
  if (currentStatus === 'HOD_REJECTED') currentIndex = 2;

  const isRejected = currentStatus.includes('REJECTED');

  return (
    <div className="flex flex-col space-y-4 py-4 px-2">
      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Workflow Progress</h4>
      <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || (idx === currentIndex && !isRejected && currentStatus === step.key);
          const isCurrent = idx === currentIndex && !isCompleted && !isRejected;
          const isCurrentRejected = idx === currentIndex && isRejected;
          
          return (
            <div key={step.key} className="relative flex items-center">
              <div className={clsx(
                "absolute -left-[9px] w-4 h-4 rounded-full border-2 bg-white transition-colors duration-300",
                isCompleted ? "border-green-500 bg-green-500" : 
                isCurrentRejected ? "border-red-500 bg-red-500" :
                isCurrent ? "border-indigo-500 bg-indigo-100" : "border-gray-300"
              )}>
                {isCompleted && <Check size={12} className="text-white relative top-[-1px] left-[-0.5px]" />}
              </div>
              <div className="ml-6 pl-2">
                <span className={clsx(
                  "text-sm font-semibold transition-colors duration-300",
                  isCompleted ? "text-green-700" :
                  isCurrentRejected ? "text-red-600" :
                  isCurrent ? "text-indigo-700 font-bold" : "text-gray-400"
                )}>
                  {step.label} {isCurrentRejected ? '(Rejected)' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowTimeline;
