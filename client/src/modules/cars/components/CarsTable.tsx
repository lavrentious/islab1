import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Button, Table } from "react-bootstrap";
import { FaPencil, FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { Car } from "../api/types";

interface CarsTableProps {
  items: Car[];
  sorting: SortingState;
  setSorting?: OnChangeFn<SortingState>;
  onRowEdit?: (item: Car) => void;
  onRowDelete?: (item: Car) => void;
  isLoading?: boolean;
  onRowSelect?: (car: Car) => void; // click to select
}

const CarsTable: React.FC<CarsTableProps> = ({
  items,
  sorting,
  setSorting,
  onRowEdit,
  onRowDelete,
  isLoading,
  onRowSelect,
}) => {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<Car>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        cell: ({ row }) => (
          <a href={`/cars/${row.original.id}`}>{row.original.id}</a>
        ),
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Cool",
        accessorFn: (row) =>
          row.cool === null ? "—" : row.cool ? "Yes" : "No",
        id: "cool",
      },
    ],
    [],
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    onSortingChange: setSorting,
  });

  return (
    <>
      <Table bordered hover responsive>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ cursor: "pointer" }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {header.column.getIsSorted() === "desc" ? " 🔼" : ""}
                  {header.column.getIsSorted() === "asc" ? " 🔽" : ""}
                </th>
              ))}
              <th colSpan={2}>Manage</th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() =>
                  onRowSelect?.(row.original) ||
                  navigate(`/cars/${row.original.id}`)
                }
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowDelete?.(row.original);
                    }}
                  >
                    <FaTrash />
                  </Button>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowEdit?.(row.original);
                    }}
                  >
                    <FaPencil />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 2} className="text-center">
                {isLoading ? "Loading..." : "No results found"}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default CarsTable;
