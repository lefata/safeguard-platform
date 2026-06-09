import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and notifications.</p>
      </div>

      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Update your name, profile picture, and contact details.
        </CardContent>
      </Card>

      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Configure how you receive alerts and updates.
        </CardContent>
      </Card>

      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Change your password and enable multi‑factor authentication.
        </CardContent>
      </Card>

      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Customise the look and feel of your workspace.
        </CardContent>
      </Card>
    </div>
  );
}
