import { useState, useId } from 'react';
import type { CancellationInfo } from '../../types/hotel';

interface CancellationPolicyProps {
  cancellationInfo?: CancellationInfo;
}

export function CancellationPolicy({
  cancellationInfo,
}: CancellationPolicyProps) {
  const [showCancellation, setShowCancellation] = useState(false);
  const panelId = useId();

  return (
    <div
      className="space-y-2 pt-2 border-t border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={`text-sm font-medium text-left flex items-center gap-1 transition-colors ${cancellationInfo
          ? 'text-green-600 cursor-pointer'
          : 'text-gray-400'
          }`}
        onClick={(e) => {
          e.stopPropagation();
          if (!cancellationInfo) return;
          setShowCancellation((prev) => !prev);
        }}
        aria-expanded={showCancellation}
        aria-controls={panelId}
        disabled={!cancellationInfo}
      >
        <span>Cancellation policy</span>
        <span aria-hidden="true">{showCancellation ? '^' : '>'}</span>
      </button>

      {showCancellation && cancellationInfo && (
        <div
          id={panelId}
          className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-gray-800 space-y-3"
        >
          {cancellationInfo.free_cancellation_info && (
            <p className="font-semibold text-gray-900">
              {cancellationInfo.free_cancellation_info}
            </p>
          )}
          {cancellationInfo.free_cancel_description && (
            <p className="whitespace-pre-line">
              {cancellationInfo.free_cancel_description}
            </p>
          )}
          {cancellationInfo.free_amendment_description && (
            <p className="text-xs text-gray-600 whitespace-pre-line">
              {cancellationInfo.free_amendment_description}
            </p>
          )}

          {cancellationInfo.cancellation_rules?.length ? (
            <div className="space-y-2 pt-2 border-t border-green-100">
              {cancellationInfo.cancellation_rules.map((rule, index) => (
                <div
                  key={`${rule.date_info ?? 'rule'}-${index}`}
                  className="space-y-1"
                >
                  {rule.date_info && (
                    <p className="font-medium text-gray-900">
                      {rule.date_info}
                    </p>
                  )}
                  {rule.description && (
                    <p className="text-gray-700 whitespace-pre-line">
                      {rule.description}
                    </p>
                  )}
                  {rule.cost !== undefined && rule.cost !== null && (
                    <p className="text-xs text-gray-600">Cost: {rule.cost}</p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
