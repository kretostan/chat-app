const SystemIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label="System"
    >
      <defs>
        <clipPath id="half">
          <rect x="12" y="3" width="8" height="18" rx="1" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="9" />
      <g clip-path="url(#half)">
        <path d="M12 3v5" />
      </g>
      <path d="M12 7a5 5 0 0 0-.4-9.6" />
    </svg>
  );
};

const DarkIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label="Dark"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
};

const LightIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label="Light"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
};

export const THEME_ICONS: Record<"system" | "dark" | "light", React.ReactNode> =
  {
    system: <SystemIcon />,
    dark: <DarkIcon />,
    light: <LightIcon />,
  };
