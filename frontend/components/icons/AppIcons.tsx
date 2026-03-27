"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type Props = { className?: string };

function Svg({
  className,
  children,
  viewBox = "0 0 24 24"
}: {
  className?: string;
  children: React.ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconDashboard({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M4.5 12.2c0-4.25 3.44-7.7 7.7-7.7h.6c4.25 0 7.7 3.45 7.7 7.7v.9c0 3.7-2.6 6.83-6.1 7.53-.39.08-.69-.26-.69-.66v-3.37a1.7 1.7 0 0 0-1.7-1.7h-3.3a1.7 1.7 0 0 0-1.7 1.7v3.37c0 .4-.3.74-.69.66-3.5-.7-6.1-3.83-6.1-7.53v-.9Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.6v3.4l2.2 1.3"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </Svg>
  );
}

export function IconAnalytics({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="4" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M4.5 18.5V6.3c0-.99.81-1.8 1.8-1.8h11.4c.99 0 1.8.81 1.8 1.8v12.2"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7.2 14.8l2.6-3.1 2.3 2 3.2-4.2"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <path d="M6.8 18.5h12.4" stroke={`url(#${g})`} strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    </Svg>
  );
}

export function IconInsights({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M6.2 18.2V7.2c0-1.1.9-2 2-2h7.6c1.1 0 2 .9 2 2v11"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 14.4 10.8 12l2 1.8 3-3.4"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <path d="M6.2 18.2h13.6" stroke={`url(#${g})`} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <path d="M16.7 6.2h1.6M17.5 5.4v1.6" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
    </Svg>
  );
}

export function IconOrders({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="4" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M7.2 7.2h13l-1.2 6.4a2.2 2.2 0 0 1-2.16 1.8H9.2a2.2 2.2 0 0 1-2.16-1.8L5.4 5.5H3.8"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.5 19.2a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" fill="var(--app-b)" opacity="0.9" />
      <path d="M16.8 19.2a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" fill="var(--app-b)" opacity="0.9" />
    </Svg>
  );
}

export function IconHR({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="6" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M12 12.2a3.4 3.4 0 1 0-3.4-3.4 3.4 3.4 0 0 0 3.4 3.4Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
      />
      <path
        d="M5.8 19.2c.8-3 3.2-5 6.2-5s5.4 2 6.2 5"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.8 7.1h1.2M19.4 6.5v1.2"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />
    </Svg>
  );
}

export function IconInventory({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M6.2 8.2 12 5l5.8 3.2v7.6L12 19l-5.8-3.2V8.2Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 5v14" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      <path d="M6.2 8.2 12 11.4l5.8-3.2" stroke="var(--app-b)" strokeWidth="1.8" strokeLinejoin="round" opacity="0.55" />
    </Svg>
  );
}

export function IconCRM({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M7.2 18.6h9.6c1.1 0 2-.9 2-2V9.4c0-1.1-.9-2-2-2H7.2c-1.1 0-2 .9-2 2v7.2c0 1.1.9 2 2 2Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
      />
      <path
        d="M8 7.4V6.6c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v.8"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path d="M9 12.2h6" stroke={`url(#${g})`} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 14.8h4.2" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
    </Svg>
  );
}

export function IconFinance({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M12 19.2c4 0 7.2-3.2 7.2-7.2S16 4.8 12 4.8 4.8 8 4.8 12s3.2 7.2 7.2 7.2Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
      />
      <path
        d="M13.2 8.6h-1.6a1.8 1.8 0 0 0 0 3.6h.8a1.8 1.8 0 0 1 0 3.6h-1.6"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path d="M12 7.4v1.2M12 15.4v1.2" stroke={`url(#${g})`} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
    </Svg>
  );
}

export function IconExports({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="4" y1="7" x2="20" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M4.8 16.2v-5.1c0-1.2.6-2.3 1.6-3.1L12 4.8l5.6 3.2c1 .8 1.6 1.9 1.6 3.1v5.1"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8.4 14.2h7.2" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M12 10v8.8" stroke={`url(#${g})`} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <path d="M9.6 12.4 12 10l2.4 2.4" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </Svg>
  );
}

export function IconReadiness({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M7 6.2h8.2l1.8 1.8V18c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V8.2c0-1.1.9-2 2-2Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8.2 12h5.8" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      <path d="M8.2 14.8h4.2" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      <path d="m9 10.2 1 1 2-2.4" stroke={`url(#${g})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconAssistant({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M6.2 12.2c0-3.3 2.7-6 6-6h1.1c3.3 0 6 2.7 6 6 0 3-2.2 5.5-5.1 5.9l-2.2 1.5c-.4.3-1-.1-1-.6v-.9h-.8c-2.2 0-4-1.8-4-4v-1.8Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 12.2h4.4" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
      <path d="M10.7 9.8h3" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
    </Svg>
  );
}

export function IconAdmin({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M12 4.8 18.4 8v5.4c0 3.3-2.3 6.2-6.4 7.8-4.1-1.6-6.4-4.5-6.4-7.8V8L12 4.8Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m9.2 12.2 1.6 1.7 3.9-4.1" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    </Svg>
  );
}

export function IconStorefront({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M5.6 10.2h12.8c.7 0 1.2.6 1.1 1.3l-.6 7.1a2.2 2.2 0 0 1-2.2 2H7.3a2.2 2.2 0 0 1-2.2-2l-.6-7.1c-.1-.7.4-1.3 1.1-1.3Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6.8 10.2 8.2 5.8h7.6l1.4 4.4"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <path d="M9 14.2h6" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
    </Svg>
  );
}

export function IconSystem({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M12 4.8a7.2 7.2 0 1 0 7.2 7.2A7.2 7.2 0 0 0 12 4.8Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
      />
      <path
        d="M12 8.2v3.9l2.7 1.6"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <path d="M4.8 19.2h14.4" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />
    </Svg>
  );
}

export function IconBell({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M12 19.2a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 19.2Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.8 16.2h10.4c-.9-1.2-1.4-2.6-1.4-4.1V10a3.8 3.8 0 1 0-7.6 0v2.1c0 1.5-.5 2.9-1.4 4.1Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 6.2v-.7"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
    </Svg>
  );
}

export function IconProfile({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M12 12a3.3 3.3 0 1 0-3.3-3.3A3.3 3.3 0 0 0 12 12Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
      />
      <path
        d="M6.3 19.2c.8-2.8 3.1-4.6 5.7-4.6s4.9 1.8 5.7 4.6"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19.2 12a7.2 7.2 0 1 1-14.4 0 7.2 7.2 0 0 1 14.4 0Z"
        stroke="var(--app-b)"
        strokeWidth="1.8"
        opacity="0.35"
      />
    </Svg>
  );
}

export function IconTrendingUp({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M7 17 17 7M17 7H7M17 7v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconTrendingDown({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M7 7l10 10M7 17H17M7 7v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconBox({ className }: Props) {
  const g = useId();
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={g} x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--app-a)" />
          <stop offset="1" stopColor="var(--app-b)" />
        </linearGradient>
      </defs>
      <path
        d="M6.2 8.2 12 5l5.8 3.2v7.6L12 19l-5.8-3.2V8.2Z"
        stroke={`url(#${g})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 5v14" stroke="var(--app-b)" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      <path d="M6.2 8.2 12 11.4l5.8-3.2" stroke="var(--app-b)" strokeWidth="1.8" strokeLinejoin="round" opacity="0.55" />
    </Svg>
  );
}
