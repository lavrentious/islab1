import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Badge, Spinner, Table } from "react-bootstrap";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useFindOneImportOpQuery } from "../api";
import { ImportOperation, ImportStatus } from "../api/types";
import { timeDiffToPreciseString } from "../utils";

interface Props {
  items: ImportOperation[] | null;
  sorting: SortingState;
  isLoading?: boolean;
  onRowSelect?: (item: ImportOperation) => void;
}

const ImportOperationsTable: React.FC<Props> = ({
  items,
  sorting,
  isLoading,
  onRowSelect,
}) => {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<ImportOperation>[]>(
    () => [
      { header: "ID", accessorKey: "id" },
      { header: "File Name", accessorKey: "fileName" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const status = getValue() as ImportStatus;
          const variant: Record<ImportStatus, string> = {
            [ImportStatus.PENDING]: "secondary",
            [ImportStatus.IN_PROGRESS]: "info",
            [ImportStatus.SUCCESS]: "success",
            [ImportStatus.FAILED]: "danger",
          };
          const label = status.replace("_", " ").toLowerCase();
          return (
            <Badge bg={variant[status]} className="px-2 py-1 text-uppercase">
              {(status === ImportStatus.IN_PROGRESS ||
                status === ImportStatus.PENDING) && (
                <Spinner animation="border" size="sm" className="me-1" />
              )}{" "}
              {label}
            </Badge>
          );
        },
      },
      { header: "Total", accessorKey: "entryCount" },
      { header: "OK", accessorKey: "okCount" },
      { header: "Duplicates", accessorKey: "duplicateCount" },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
      },
      {
        header: "Started At",
        accessorKey: "startedAt",
        cell: ({ getValue }) =>
          getValue() ? new Date(getValue() as string).toLocaleString() : "—",
      },
      {
        header: "Finished At",
        accessorKey: "finishedAt",
        cell: ({ getValue }) =>
          getValue() ? new Date(getValue() as string).toLocaleString() : "—",
      },
      {
        header: "Duration",
        id: "duration",
        cell: ({ row }) => {
          const { createdAt, startedAt, finishedAt } = row.original;
          if (!finishedAt) return "—";
          const totalDuration = dayjs(finishedAt).diff(dayjs(createdAt)) / 1000; // in sec
          const processDuration =
            dayjs(finishedAt).diff(dayjs(startedAt)) / 1000; // in sec
          if (startedAt) {
            return (
              <>
                <div>{timeDiffToPreciseString(processDuration)}</div>
                <div className="text-muted">
                  ({timeDiffToPreciseString(totalDuration)} total)
                </div>
              </>
            );
          }
          return timeDiffToPreciseString(totalDuration);
        },
      },
      {
        header: "Error Message",
        accessorKey: "errorMessage",
        cell: ({ getValue }) => getValue() || "—",
      },
    ],
    [],
  );

  const table = useReactTable({
    data: items || [],
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <Table bordered hover responsive>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((header) => (
              <th
                key={header.id}
                style={{ cursor: "pointer" }}
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
                {header.column.getIsSorted() === "desc" && <FaArrowUp />}
                {header.column.getIsSorted() === "asc" && <FaArrowDown />}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <RowWrapper
              key={row.original.id}
              importOp={row.original}
              navigate={navigate}
              onRowSelect={onRowSelect}
              renderRow={(op) => (
                <tr
                  onClick={() =>
                    onRowSelect
                      ? onRowSelect(op)
                      : navigate(`/imports/${op.id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, {
                        ...cell.getContext(),
                        row: { ...cell.row, original: op },
                      })}
                    </td>
                  ))}
                </tr>
              )}
            />
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="text-center">
              {isLoading ? (
                <Spinner variant="primary" className="my-2 mx-auto" />
              ) : (
                <span>No import history found</span>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

const RowWrapper: React.FC<{
  importOp: ImportOperation;
  navigate: ReturnType<typeof useNavigate>;
  onRowSelect?: (item: ImportOperation) => void;
  renderRow: (op: ImportOperation) => React.ReactNode;
}> = ({ importOp, renderRow }) => {
  const isInProgress =
    importOp.status === ImportStatus.IN_PROGRESS ||
    importOp.status === ImportStatus.PENDING;

  const { data: latest } = useFindOneImportOpQuery(importOp.id, {
    pollingInterval: isInProgress ? 1000 : 0,
    skip: !isInProgress,
  });

  return <>{renderRow(latest ?? importOp)}</>;
};

export default ImportOperationsTable;
