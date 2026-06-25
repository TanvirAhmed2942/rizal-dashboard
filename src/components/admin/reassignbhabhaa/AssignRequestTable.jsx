"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetAllrequestForAssignReassignQuery } from "@/redux/Apis/admin/assignreassignApi/assignreassingApi";
import { getImageUrl } from "@/utils/getImageUrl";
function UserCell({ name, email, image, role }) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : "?";
  const roleLabel = role
    ? String(role).charAt(0).toUpperCase() + String(role).slice(1)
    : null;
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-10 shrink-0 rounded-full bg-muted">
        <AvatarImage src={getImageUrl(image)} alt={name} />
        <AvatarFallback className="rounded-full bg-muted text-muted-foreground text-sm font-medium">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-foreground truncate">
          {name || "—"}
          {roleLabel && (
            <span className="text-muted-foreground font-normal">
              {" "}
              ({roleLabel})
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {email || "—"}
        </span>
      </div>
    </div>
  );
}

/** Map API item to table/modal shape: user = userId, requestedPerson = doctorId or assistantId per role */
function mapRequestItem(item) {
  if (!item) return null;
  const user = item.userId;
  const requestedPerson =
    item.assignPersonRole === "doctor"
      ? user?.doctorId
      : user?.assistantId ?? user?.doctorId ?? user?.assistantId;
  return {
    _id: item._id,
    user,
    requestedPerson: requestedPerson ?? null,
    reason: item.reason,
    assignPersonRole: item.assignPersonRole,
    status: item.status,
    raw: item,
  };
}

function AssignRequestTable({ onAssign, type = "user-requested" }) {
  const { data: apiResponse, isLoading } =
    useGetAllrequestForAssignReassignQuery({});

  const requests = React.useMemo(() => {
    const list = apiResponse?.data ?? [];
    // TODO: Add filtering based on type if API supports it
    // For now, show all requests - adjust when API provides type distinction
    return list.map(mapRequestItem).filter(Boolean);
  }, [apiResponse?.data, type]);

  if (isLoading) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
        Loading requests...
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
        No assignment requests found.
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-clip border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
            <TableHead className="h-10 px-4 font-medium text-foreground">
              User Name
            </TableHead>
            <TableHead className="h-10 px-4 font-medium text-foreground">
              Requested Person
            </TableHead>
            <TableHead className="h-10 px-4 font-medium text-foreground">
              Reason
            </TableHead>
            <TableHead className="h-10 px-4 font-medium text-foreground text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((row) => (
            <TableRow key={row._id} className="border-b bg-card">
              <TableCell className="px-4 py-3 align-middle">
                <UserCell
                  name={row.user?.fullName}
                  email={row.user?.email}
                  image={row.user?.profile}
                  role={row.user?.role}
                />
              </TableCell>
              <TableCell className="px-4 py-3 align-middle">
                <UserCell
                  name={row.requestedPerson?.fullName}
                  email={row.requestedPerson?.email}
                  image={row.requestedPerson?.profile}
                  role={row.requestedPerson?.role}
                />
              </TableCell>
              <TableCell className="px-4 py-3 align-middle text-foreground">
                {row.reason || "—"}
              </TableCell>
              <TableCell className="px-4 py-3 align-middle text-right">
                {row.status === "pending" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-md border-green-600 bg-green-50 text-green-700",
                      "hover:bg-green-100 hover:text-green-800 hover:border-green-700"
                    )}
                    onClick={() => onAssign?.(row)}
                  >
                    Assign
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default AssignRequestTable;
