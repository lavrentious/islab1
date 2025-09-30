import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Button, Table } from "react-bootstrap";
import { BiPencil } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import { HumanBeing } from "../api/types";

interface HumanBeingsTableProps {
  items: HumanBeing[];
  sorting: SortingState;
  setSorting?: OnChangeFn<SortingState>;
  onRowEdit?: (item: HumanBeing) => void;
  onRowDelete?: (item: HumanBeing) => void;
}

const HumanBeingsTable: React.FC<HumanBeingsTableProps> = ({
  items,
  sorting,
  setSorting,
  onRowDelete,
  onRowEdit,
}) => {
  const columns = useMemo<ColumnDef<HumanBeing>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "Created At",
        accessorKey: "creationDate",
        accessorFn: (row) => dayjs(row.creationDate).format("LLL"),
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "X",
        accessorFn: (row) => row.coordinates.x,
        id: "coordinates.x",
      },
      {
        header: "Y",
        accessorFn: (row) => row.coordinates.y,
        id: "coordinates.y",
      },
      {
        header: "Real Hero",
        accessorFn: (row) => (row.realHero ? "Yes" : "No"),
        id: "realHero",
      },
      {
        header: "Has Toothpick",
        accessorFn: (row) =>
          row.hasToothpick === null ? "—" : row.hasToothpick ? "Yes" : "No",
        id: "hasToothpick",
      },
      {
        header: "Car",
        accessorFn: (row) => (row.car == null ? "—" : row.car.name),
        id: "car.name",
      },
      {
        header: "Cool Car",
        accessorFn: (row) =>
          row.car?.cool == null ? "—" : row.car.cool ? "Yes" : "No",
        id: "car.cool",
      },
      {
        header: "Mood",
        accessorKey: "mood",
      },
      {
        header: "Impact Speed",
        accessorKey: "impactSpeed",
        cell: (info) => info.getValue() ?? "—",
      },
      {
        header: "Soundtrack",
        accessorKey: "soundtrackName",
      },
      {
        header: "Minutes Waiting",
        accessorKey: "minutesOfWaiting",
        cell: (info) => info.getValue() ?? "—",
      },
      {
        header: "Weapon",
        accessorKey: "weaponType",
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
    manualFiltering: true,
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
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onRowDelete?.(row.original)}
                  >
                    <BsTrash />
                  </Button>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => onRowEdit?.(row.original)}
                  >
                    <BiPencil />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                No results found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default HumanBeingsTable;
