import React, { useEffect, useState } from "react";
import axios from "axios";

export type Permission =
  | "servers:view"
  | "servers:manage"
  | "logs:view"
  | "console:access"
  | "configs:edit"
  | "backups:manage"
  | "schedules:manage"
  | "alerts:manage"
  | "settings:edit"
  | "system:diagnose"
  | "users:manage";

export default function PermissionsEditor({ username, value, onChange, disabled }: {
  username: string;
  value: Permission[];
  onChange: (perms: Permission[]) => void;
  disabled?: boolean;
}) {
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  useEffect(() => {
    axios.get("/api/admin/permissions").then(res => setAllPerms(res.data.permissions));
  }, []);

  const toggle = (perm: Permission) => {
    if (value.includes(perm)) {
      onChange(value.filter(p => p !== perm));
    } else {
      onChange([...value, perm]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {allPerms.map((perm) => (
        <label key={perm} className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={value.includes(perm)}
            onChange={() => toggle(perm)}
            disabled={disabled}
          />
          <span className="text-xs">{perm}</span>
        </label>
      ))}
    </div>
  );
}
