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
import { Button, Spinner, Table } from "react-bootstrap";
import { FaArrowDown, FaArrowUp, FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { useFindOneCarQuery } from "src/modules/cars/api";
import { HumanBeing } from "../api/types";

interface HumanBeingsTableProps {
  items: HumanBeing[] | null;
  isLoading?: boolean;
  sorting: SortingState;
  setSorting?: OnChangeFn<SortingState>;
  onRowEdit?: (item: HumanBeing) => void;
  onRowDelete?: (item: HumanBeing) => void;
  onRowSelect?: (item: HumanBeing) => void;
}

export const CarIdCell: React.FC<{ id: number | null }> = ({ id }) => {
  return <>{id ?? "—"}</>;
};

export const CarNameCell: React.FC<{ id: number | null }> = ({ id }) => {
  const { data: car, isLoading } = useFindOneCarQuery(id!, {
    skip: id == null,
    pollingInterval: 5000,
  });

  if (id == null) return <>N/A</>;
  if (isLoading) return <Spinner size="sm" />;

  return <>{car?.name ?? "—"}</>;
};

export const CarCoolCell: React.FC<{ id: number | null }> = ({ id }) => {
  const { data: car, isLoading } = useFindOneCarQuery(id!, {
    skip: id == null,
    pollingInterval: 5000,
  });

  if (id == null) return <>N/A</>;
  if (isLoading) return <Spinner size="sm" />;

  return <>{car?.cool == null ? "—" : car.cool ? "Yes" : "No"}</>;
};

const HumanBeingsTable: React.FC<HumanBeingsTableProps> = ({
  items,
  isLoading,
  sorting,
  setSorting,
  onRowDelete,
  onRowEdit,
  onRowSelect,
}) => {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<HumanBeing>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        cell: ({ row }) => (
          <a href={`/humanbeings/${row.original.id}`}>{row.original.id}</a>
        ),
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
        id: "coordinates_x",
        accessorFn: (row) => row.coordinates.x,
      },
      {
        header: "Y",
        id: "coordinates_y",
        accessorFn: (row) => row.coordinates.y,
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
        header: "Car ID",
        id: "car.id",
        cell: ({ row }) => <CarIdCell id={row.original.car} />,
      },
      {
        header: "Car Name",
        id: "car.name",
        cell: ({ row }) => <CarNameCell id={row.original.car} />,
      },
      {
        header: "Car Cool?",
        id: "car.cool",
        cell: ({ row }) => <CarCoolCell id={row.original.car} />,
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
    data: items || [],
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
                  {header.column.getIsSorted() === "desc" ? <FaArrowUp /> : ""}
                  {header.column.getIsSorted() === "asc" ? <FaArrowDown /> : ""}
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
                  onRowSelect
                    ? onRowSelect(row.original)
                    : navigate(`/humanbeings/${row.original.id}`)
                }
                style={{
                  cursor: "pointer",
                }}
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
                {isLoading ? (
                  <Spinner variant="primary" className="my-2 mx-auto" />
                ) : (
                  <span>No results found</span>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default HumanBeingsTable;
