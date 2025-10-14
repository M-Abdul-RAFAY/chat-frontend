import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { BulkMessage } from "@/lib/api";

interface BulkMessageTableProps {
  bulkMessages: BulkMessage[];
  onViewAll?: () => void;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-100";
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "in_progress":
      return "text-blue-600 bg-blue-100";
    case "failed":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export default function BulkMessageTable({
  bulkMessages,
  onViewAll,
}: BulkMessageTableProps) {
  return (
    <div className="w-full">
      <TableContainer component={Paper} className="shadow-sm">
        <Table
          sx={{ minWidth: 650 }}
          size="small"
          aria-label="bulk messages table"
        >
          <TableHead>
            <TableRow>
              <TableCell className="font-semibold">Title</TableCell>
              <TableCell className="font-semibold">Message</TableCell>
              <TableCell className="font-semibold">Scheduled Date</TableCell>
              <TableCell className="font-semibold">Status</TableCell>
              <TableCell className="font-semibold" align="right">
                Recipients
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bulkMessages.length > 0 ? (
              bulkMessages.map((message) => (
                <TableRow
                  key={message._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  className="hover:bg-gray-50"
                >
                  <TableCell component="th" scope="row" className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{message.title}</span>
                      {message.isReminderMessage && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          🔔 Auto-Reminder
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={message.message}>
                      {message.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    {message.scheduledDate
                      ? formatDate(message.scheduledDate)
                      : "Sent immediately"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        message.status
                      )}`}
                    >
                      {message.status.charAt(0).toUpperCase() +
                        message.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {message.sentCount}/{message.totalCount}
                      </div>
                      <div className="text-gray-500">
                        {message.failedCount > 0 && (
                          <span className="text-red-600">
                            {message.failedCount} failed
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  No bulk messages found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {bulkMessages.length > 0 && onViewAll && (
        <div className="text-center mt-4">
          <button
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View all bulk messages
          </button>
        </div>
      )}
    </div>
  );
}
