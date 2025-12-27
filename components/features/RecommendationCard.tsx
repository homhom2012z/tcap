"use client";

import Link from "next/link";
import type { Recommendation } from "@/lib/utils/recommendations";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss?: (id: string) => void;
}

export default function RecommendationCard({
  recommendation,
  onDismiss,
}: RecommendationCardProps) {
  const { id, type, priority, title, description, action } = recommendation;

  const typeStyles = {
    warning: "bg-red-500/10 border-red-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
    success: "bg-green-500/10 border-green-500/20",
  };

  const iconMap = {
    warning: "warning",
    info: "info",
    success: "check_circle",
  };

  const iconColors = {
    warning: "text-red-400",
    info: "text-blue-400",
    success: "text-green-400",
  };

  const priorityBadges = {
    high: "bg-red-500/20 text-red-300 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    low: "bg-gray-500/20 text-text-secondary border-gray-500/30",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${typeStyles[type]} transition-all hover:border-opacity-40`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`material-symbols-outlined ${iconColors[type]} mt-0.5`}
        >
          {iconMap[type]}
        </span>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-text-primary font-semibold text-sm">{title}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadges[priority]}`}
            >
              {priority}
            </span>
          </div>

          <p className="text-text-secondary text-xs leading-relaxed mb-3">
            {description}
          </p>

          <div className="flex items-center gap-2">
            {action && action.route && (
              <Link
                href={action.route}
                className="text-xs font-medium text-primary hover:underline py-1"
              >
                {action.label} →
              </Link>
            )}

            {onDismiss && (
              <button
                onClick={() => onDismiss(id)}
                aria-label="Dismiss recommendation"
                className="ml-auto text-xs text-text-secondary hover:text-text-primary transition-colors py-1 px-2 -mr-2"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
