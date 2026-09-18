import { createFileRoute } from "@tanstack/react-router";
import ChangeEmailSettingsPage from "@/components/app/settings/ChangeEmailSettingsPage";
import ChangePasswordSettingsPage from "@/components/app/settings/ChangePasswordSettingsPage";
import DeleteAccountSettingsPage from "@/components/app/settings/DeleteAccountSettingsPage";
import SessionsPage from "@/components/app/settings/SessionsPage";
import ThemeSettingsPage from "@/components/app/settings/theme/ThemeSettingsPage";
import { useCurrentTheme } from "@/hooks/useThemeContext";

export const Route = createFileRoute("/app/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { theme, setTheme } = useCurrentTheme();

  return (
    <div className="flex flex-col gap-16 max-w-md mx-auto w-full my-20 px-8 py-8 sm:py-10 sm:px-6">
      <ThemeSettingsPage current={theme} onChoose={(pref) => setTheme(pref)} />
      <ChangeEmailSettingsPage /> {/* FIX: */}
      <ChangePasswordSettingsPage />
      <SessionsPage />
      <DeleteAccountSettingsPage />
    </div>
  );
}
