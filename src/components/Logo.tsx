interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-9 w-9' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="11" fill="#0F766E" />
      <circle cx="20" cy="20" r="12" stroke="#CCFBF1" strokeWidth="2.2" />
      {/* Kompasnaald: Noord-Oost in warm geel, Zuid-West in wit */}
      <polygon points="20,10 23.5,20 20,21.5 16.5,20" fill="#FBBF24" />
      <polygon points="20,30 23.5,20 20,18.5 16.5,20" fill="#FFFFFF" />
      <circle cx="20" cy="20" r="2" fill="#0F766E" />
    </svg>
  );
}
