import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { AiFillAlert } from "react-icons/ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const tableData = [
  {
    clientName: "John Doe",
    emial: "john.doe@example.com",
    joindate: "2025-05-12",
    contactBumber: "01781576822",
    address: "12th Apt South Goran, Gasabo",
    status: "Active",
  },
  {
    clientName: "John Doe",
    emial: "john.doe@example.com",
    joindate: "2025-05-12",
    contactBumber: "01781576822",
    address: "12th Apt South Goran, Gasabo",
    status: "Inactive",
  },
  {
    clientName: "John Doe",
    emial: "john.doe@example.com",
    joindate: "2025-05-12",
    contactBumber: "01781576822",
    address: "12th Apt South Goran, Gasabo",
    status: "Active",
  },
  {
    clientName: "John Doe",
    emial: "john.doe@example.com",
    joindate: "2025-05-12",
    contactBumber: "01781576822",
    address: "12th Apt South Goran, Gasabo",
    status: "Inactive",
  },
  {
    clientName: "John Doe",
    emial: "john.doe@example.com",
    joindate: "2025-05-12",
    contactBumber: "01781576822",
    address: "12th Apt South Goran, Gasabo",
    status: "Inactive",
  },
  {
    clientName: "John Doe",
    emial: "john.doe@example.com",
    joindate: "2025-05-12",
    contactBumber: "01781576822",
    address: "12th Apt South Goran, Gasabo",
    status: "Inactive",
  },
];
function ManagementTable() {
  return (
    <ScrollArea className="w-full rounded-md border whitespace-nowrap">
      <Table className="bg-white">
        <TableHeader>
          <TableRow className="bg-gray-200">
            <TableHead className="w-1/6">Client Name</TableHead>
            <TableHead className="w-1/6">Email</TableHead>
            <TableHead className="w-1/6">Address</TableHead>
            <TableHead className="w-1/6">Contact Number</TableHead>
            <TableHead className="w-1/6">Join Date</TableHead>
            <TableHead className="w-1/6">Status</TableHead>

            <TableHead className="w-1/6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((data, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium w-1/6">
                <div className="flex items-center gap-2">
                  <Avatar className="size-9">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {data.clientName}
                </div>
              </TableCell>
              <TableCell className="w-1/6">{data.emial}</TableCell>

              <TableCell className="w-1/6">{data.address}</TableCell>
              <TableCell className="w-1/6">{data.contactBumber}</TableCell>
              <TableCell className="w-1/6">{data.joindate}</TableCell>
              <TableCell className="w-1/6">
                <p
                  className={`${
                    data.status === "Active"
                      ? "bg-lime-500/50 text-black"
                      : data.status === "Inactive"
                        ? "bg-red-500/50 text-white"
                        : "bg-yellow-500/55 text-gray-500"
                  } px-2 py-1 rounded-full text-center font-medium text-xs inline-block w-20`}
                >
                  {data.status}
                </p>
              </TableCell>
              <TableCell className="w-1/6  text-right flex gap-2">
                <Button
                  variant="outline"
                  className="border border-gray-400 h-8"
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  className="border border-red-400 h-8 text-red-500"
                >
                  Block
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
      <Scrollbar orientation="horizontal" className="h-2 w-full" />
    </ScrollArea>
  );
}

export default ManagementTable;
