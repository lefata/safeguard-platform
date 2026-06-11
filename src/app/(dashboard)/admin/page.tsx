"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createSchool, createUserForSchool, getAllTenants } from "@/server-actions/admin";
import { School, UserPlus, Loader2 } from "lucide-react";

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

export default function SuperAdminPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  // School form state
  const [schoolName, setSchoolName] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [creatingSchool, setCreatingSchool] = useState(false);

  // User form state
  const [selectedTenant, setSelectedTenant] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  // Load all tenants
  useEffect(() => {
    async function loadTenants() {
      try {
        const data = await getAllTenants();
        setTenants(data);
      } catch (error: any) {
        toast.error("Failed to load schools: " + error.message);
      } finally {
        setLoadingTenants(false);
      }
    }
    loadTenants();
  }, []);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !schoolSlug) {
      toast.error("Please fill in both fields.");
      return;
    }
    setCreatingSchool(true);
    try {
      await createSchool({ name: schoolName, slug: schoolSlug });
      toast.success(`School "${schoolName}" created!`);
      setSchoolName("");
      setSchoolSlug("");
      // Reload tenants
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
    if (!selectedTenant || !userEmail || !userName || !userRole || !userPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    setCreatingUser(true);
    try {
      await createUserForSchool({
        tenantId: selectedTenant,
        email: userEmail,
        name: userName,
        role: userRole,
        password: userPassword,
      });
      toast.success(`User "${userName}" created in school.`);
      setUserEmail("");
      setUserName("");
      setUserRole("");
      setUserPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Manage schools and user accounts across the platform.
        </p>
      </div>

      {/* Add New School */}
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
              <p className="text-xs text-muted-foreground mt-1">
                Used in the URL: your-school-slug
              </p>
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

      {/* Add User to a School */}
      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-school-600" /> Add User to School
          </CardTitle>
          <CardDescription>Create a new staff member in a specific school.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label htmlFor="tenantId">Select School *</Label>
              <Select
                value={selectedTenant}
                onValueChange={setSelectedTenant}
                disabled={loadingTenants}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingTenants ? "Loading schools…" : "Choose a school"} />
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
                <Label htmlFor="userRole">Role *</Label>
                <Select value={userRole} onValueChange={setUserRole}>
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
                  placeholder="Min. 6 characters"
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
    </div>
  );
}
