"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createSchool,
  createUserForSchool,
  getAllTenants,
  getTenantById,
  updateSchoolSettings,
  getUsersForTenant,
  resetUserPassword,
} from "@/server-actions/admin";
import { School, UserPlus, Loader2, Palette } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

const userRoles = [
  { value: "SCHOOL_ADMIN", label: "School Admin" },
  { value: "DSL", label: "Designated Safeguarding Lead (DSL)" },
  { value: "DEPUTY_DSL", label: "Deputy DSL" },
  { value: "COUNSELOR", label: "Counselor" },
  { value: "PRINCIPAL", label: "Principal" },
  { value: "TEACHER", label: "Teacher" },
  { value: "NURSE", label: "Nurse" },
  { value: "STUDENT_SUPPORT", label: "Student Support Staff" },
  { value: "READ_ONLY_AUDITOR", label: "Read-Only Auditor" },
];

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const locales = [
  "en-GB",
  "en-US",
  "fr-FR",
  "es-ES",
  "de-DE",
  "pt-PT",
  "ar-SA",
  "zh-CN",
  "ja-JP",
];

export default function AdminPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const userTenantId = (session?.user as any)?.tenantId;

  const [loading, setLoading] = useState(true);

  // Schools list (super admin)
  const [tenants, setTenants] = useState<{ id: string; name: string; slug: string }[]>([]);

  // School creation (super admin)
  const [schoolName, setSchoolName] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [creatingSchool, setCreatingSchool] = useState(false);

  // User creation
  const [selectedTenantForUser, setSelectedTenantForUser] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRoleState, setUserRoleState] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  // School settings
  const [selectedTenantForSettings, setSelectedTenantForSettings] = useState("");
  const [settingsName, setSettingsName] = useState("");
  const [logo, setLogo] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#7c3aed");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [locale, setLocale] = useState("en-GB");
  const [savingSettings, setSavingSettings] = useState(false);

  // Users list
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string; role: string; createdAt: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Password reset
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // Load initial data
  useEffect(() => {
    async function load() {
      try {
        if (userRole === "SUPER_ADMIN") {
          const data = await getAllTenants();
          setTenants(data);
        } else if (userRole === "SCHOOL_ADMIN" && userTenantId) {
          const tenant = await getTenantById(userTenantId);
          if (tenant) {
            setSettingsName(tenant.name || "");
            setLogo(tenant.logo || "");
            setPrimaryColor(tenant.primaryColor || "#2563eb");
            setSecondaryColor(tenant.secondaryColor || "#7c3aed");
            setAddress(tenant.address || "");
            setTimezone(tenant.timezone || "UTC");
            setLocale(tenant.locale || "en-GB");
          }
          setSelectedTenantForUser(userTenantId);
          loadUsers(userTenantId);
        }
      } catch (error: any) {
        toast.error("Failed to load data: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    if (session) load();
  }, [userRole, userTenantId, session]);

  const loadUsers = async (tenantId: string) => {
    if (!tenantId) return;
    setLoadingUsers(true);
    try {
      const data = await getUsersForTenant(tenantId);
      setUsers(data.map((u: any) => ({ ...u, createdAt: u.createdAt.toISOString() })));
    } catch (error: any) {
      toast.error("Could not load users: " + error.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadTenantSettings = async (tenantId: string) => {
    if (!tenantId) return;
    try {
      const tenant = await getTenantById(tenantId);
      if (tenant) {
        setSettingsName(tenant.name || "");
        setLogo(tenant.logo || "");
        setPrimaryColor(tenant.primaryColor || "#2563eb");
        setSecondaryColor(tenant.secondaryColor || "#7c3aed");
        setAddress(tenant.address || "");
        setTimezone(tenant.timezone || "UTC");
        setLocale(tenant.locale || "en-GB");
      }
      loadUsers(tenantId);
    } catch (error: any) {
      toast.error("Could not load school settings: " + error.message);
    }
  };

  // Handlers
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSchool(true);
    try {
      await createSchool({ name: schoolName, slug: schoolSlug });
      toast.success(`School "${schoolName}" created!`);
      setSchoolName("");
      setSchoolSlug("");
      const updated = await getAllTenants();
      setTenants(updated);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreatingSchool(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenantId = userRole === "SUPER_ADMIN" ? selectedTenantForUser : userTenantId;
    if (!tenantId || !userEmail || !userName || !userRoleState || !userPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    setCreatingUser(true);
    try {
      await createUserForSchool({
        tenantId,
        email: userEmail,
        name: userName,
        role: userRoleState,
        password: userPassword,
      });
      toast.success(`User "${userName}" created.`);
      setUserEmail("");
      setUserName("");
      setUserRoleState("");
      setUserPassword("");
      if (userRole === "SUPER_ADMIN") setSelectedTenantForUser("");
      loadUsers(tenantId);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenantId = userRole === "SUPER_ADMIN" ? selectedTenantForSettings : userTenantId;
    if (!tenantId) return;
    setSavingSettings(true);
    try {
      await updateSchoolSettings({
        tenantId,
        name: settingsName,
        logo: logo || undefined,
        primaryColor,
        secondaryColor,
        address,
        timezone,
        locale,
      });
      toast.success("School settings updated.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 12) {
      toast.error("Password must be at least 12 characters.");
      return;
    }
    setResettingPassword(true);
    try {
      await resetUserPassword(userId, newPassword);
      toast.success("Password reset successfully.");
      setResetUserId(null);
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setResettingPassword(false);
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {userRole === "SUPER_ADMIN" ? "Super Admin Panel" : "School Administration"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {userRole === "SUPER_ADMIN"
            ? "Manage schools and user accounts across the platform."
            : "Manage your school settings and staff accounts."}
        </p>
      </div>

      {/* Super Admin: Create School */}
      {userRole === "SUPER_ADMIN" && (
        <Card className="shadow-school-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-school-600" /> Add New School
            </CardTitle>
            <CardDescription>Create a new tenant (school) in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div>
                <Label htmlFor="schoolName">School Name *</Label>
                <Input
                  id="schoolName"
                  placeholder="e.g., Springfield International School"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="schoolSlug">Slug (unique identifier) *</Label>
                <Input
                  id="schoolSlug"
                  placeholder="e.g., springfield-is"
                  value={schoolSlug}
                  onChange={(e) => setSchoolSlug(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={creatingSchool}>
                  {creatingSchool ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      <School className="mr-2 h-4 w-4" /> Create School
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* User Creation */}
      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-school-600" /> Add User
            {userRole === "SCHOOL_ADMIN" ? " to Your School" : " to a School"}
          </CardTitle>
          <CardDescription>
            Create a new staff member in {userRole === "SCHOOL_ADMIN" ? "your school" : "a specific school"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            {userRole === "SUPER_ADMIN" && (
              <div>
                <Label>Select School *</Label>
                <Select
                  value={selectedTenantForUser}
                  onValueChange={setSelectedTenantForUser}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userName">Full Name *</Label>
                <Input
                  id="userName"
                  placeholder="John Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="userEmail">Email *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="john@school.org"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role *</Label>
                <Select value={userRoleState} onValueChange={setUserRoleState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="userPassword">Password *</Label>
                <Input
                  id="userPassword"
                  type="password"
                  placeholder="Min. 12 characters"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={creatingUser}>
                {creatingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Create User
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* School Settings */}
      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-school-600" /> School Settings
          </CardTitle>
          <CardDescription>
            Customize your school's branding, colours, and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            {userRole === "SUPER_ADMIN" && (
              <div>
                <Label>Select School to Edit *</Label>
                <Select
                  value={selectedTenantForSettings}
                  onValueChange={(value) => {
                    setSelectedTenantForSettings(value);
                    loadTenantSettings(value);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="settingsName">School Name</Label>
              <Input
                id="settingsName"
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                placeholder="https://example.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    className="w-12 h-10"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    className="w-12 h-10"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="School address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Locale</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select locale" />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingSettings}>
                {savingSettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle>Users in {userRole === "SCHOOL_ADMIN" ? "Your School" : "Selected School"}</CardTitle>
          <CardDescription>
            {users.length} active user(s) found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-4">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || "—"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDateShort(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {resetUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-28 h-8 text-xs"
                          />
                          <Button size="sm" onClick={() => handleResetPassword(user.id)} disabled={resettingPassword}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setResetUserId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setResetUserId(user.id); setNewPassword(""); }}>
                          Reset Password
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
