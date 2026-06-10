"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAction, completeAction } from "@/server-actions/safeguarding";
import { formatDate } from "@/lib/utils";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Action {
  id: string;
  concernId: string;
  actionType: string;
  description: string;
  assignedTo?: { id: string; name: string | null } | null;  // allow null
  completedBy?: { id: string; name: string | null } | null;
  dueDate?: string | null;
  status: string;
  priority: string;
  completedAt?: string | null;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

export function ActionItem({
  action,
  staffList,
  isDSL,
  concernId,
}: {
  action: Action;
  staffList: Staff[];
  isDSL: boolean;
  concernId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    actionType: action.actionType,
    description: action.description,
    assignedToId: action.assignedTo?.id || "",
    dueDate: action.dueDate ? new Date(action.dueDate).toISOString().split("T")[0] : "",
    priority: action.priority || "MEDIUM",
  });

  const handleSave = async () => {
    try {
      await updateAction(action.id, concernId, {
        actionType: formData.actionType,
        description: formData.description,
        assignedToId: formData.assignedToId || undefined,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority,
      });
      setEditing(false);
      toast.success("Action updated");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleComplete = async () => {
    try {
      await completeAction(action.id, concernId);
      toast.success("Action completed");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-4 rounded-xl border bg-white">
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs">Type</label>
              <Input
                value={formData.actionType}
                onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs">Assigned To</label>
              <Select
                value={formData.assignedToId}
                onValueChange={(v) => setFormData({ ...formData, assignedToId: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  {staffList.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs">Due Date</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{action.description}</p>
            <p className="text-xs text-muted-foreground">
                Type: {action.actionType} • Assigned to: {action.assignedTo?.name || "Unassigned"}
                {action.dueDate && ` • Due: ${formatDate(action.dueDate)}`}
            </p>
            {action.status === "COMPLETED" && action.completedBy && (
                <p className="text-xs text-green-600 mt-1">
                ✅ Completed by {action.completedBy.name || "Unknown"} on {formatDate(action.completedAt!)}
            </p>
          )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                action.status === "COMPLETED"
                  ? "success"
                  : action.status === "OVERDUE"
                  ? "destructive"
                  : "secondary"
              }
            >
              {action.status.replace(/_/g, " ")}
            </Badge>
            {isDSL && action.status !== "COMPLETED" && (
              <>
                <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleComplete}>
                  Complete
                </Button>
              </>
            )}
            {!isDSL && action.status !== "COMPLETED" && (
              <Button variant="outline" size="sm" onClick={handleComplete}>
                Complete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
