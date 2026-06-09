"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Lock, Bell, ShieldCheck } from "lucide-react";

// Placeholder server action imports – replace with real ones later
// import { updateProfile } from "@/server-actions/profile";
// import { changePassword } from "@/server-actions/auth";
// import { updateNotificationPrefs } from "@/server-actions/notifications";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  // Profile tab state
  const [name, setName] = useState(user?.name || "");
  const [title, setTitle] = useState(user?.title || "");
  const [isSaving, setIsSaving] = useState(false);

  // Password tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification tab state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [digest, setDigest] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // TODO: call server action
    setTimeout(() => {
      toast.success("Profile updated (demo)");
      setIsSaving(false);
    }, 1000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsChangingPassword(true);
    // TODO: call server action
    setTimeout(() => {
      toast.success("Password changed (demo)");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    }, 1000);
  };

  const handleNotificationSave = async () => {
    // TODO: call server action
    toast.success("Notification preferences saved (demo)");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-school-900">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, security, and notification preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start gap-2 bg-background p-1 rounded-xl shadow-school-card">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-school-50 data-[state=active]:text-school-700">
            <User className="h-4 w-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="rounded-lg data-[state=active]:bg-school-50 data-[state=active]:text-school-700">
            <Lock className="h-4 w-4 mr-2" /> Password
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-school-50 data-[state=active]:text-school-700">
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="shadow-school-card border-0">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your name and job title visible to colleagues.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Grade 10 Teacher"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card className="shadow-school-card border-0">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account uses a strong, unique password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Changing…" : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="shadow-school-card border-0">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about safeguarding alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive critical safeguarding alerts via email.</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">In‑App Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show notifications inside the platform.</p>
                </div>
                <Switch checked={inAppAlerts} onCheckedChange={setInAppAlerts} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a summary of all unread notifications once a day.</p>
                </div>
                <Switch checked={digest} onCheckedChange={setDigest} />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleNotificationSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
