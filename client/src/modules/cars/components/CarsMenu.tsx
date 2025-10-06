import { SortingState } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { formatApiError } from "src/modules/common/api/utils";
import { Paginator } from "src/modules/common/components/Paginator";
import {
  useCreateCarMutation,
  useDeleteCarMutation,
  useFindAllCarsQuery,
  useUpdateCarMutation,
} from "../api";
import { Car, FindAllCarsQueryParamsDto } from "../api/types";
import CarFormModal from "../components/CarFormModal";
import CarsFilters from "../components/CarsFilters";
import CarsTable from "../components/CarsTable";

export interface CarsMenuProps {
  onCarSelect?: (car: Car) => void; // if a new is created or existing selected
}

const CarsMenu: React.FC<CarsMenuProps> = ({ onCarSelect }) => {
  const [page, setPage] = useState(1);
  const limit = 5;

  const [filters, setFilters] = useState<Partial<FindAllCarsQueryParamsDto>>(
    {},
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [sortBy, setSortBy] = useState<
    FindAllCarsQueryParamsDto["sortBy"] | null
  >(null);
  const [sortAsc, setSortAsc] = useState(false);
  useEffect(() => {
    const item = sorting[0];
    if (item) {
      setSortBy(item.id as FindAllCarsQueryParamsDto["sortBy"]);
      setSortAsc(item.desc);
    } else {
      setSortBy(null);
      setSortAsc(false);
    }
  }, [sorting]);

  const { data, isLoading } = useFindAllCarsQuery(
    {
      limit,
      page: page,
      paginate: true,
      ...filters,
      sortBy: sortBy ?? undefined,
      sortOrder: sortBy === null ? undefined : sortAsc ? "ASC" : "DESC",
    },
    { pollingInterval: 5000 },
  );

  const [createCar, { isLoading: isCreating }] = useCreateCarMutation();
  const [deleteCar] = useDeleteCarMutation();
  const [updateCar] = useUpdateCarMutation();

  const [formModalShown, setFormModalShown] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  return (
    <>
      <Button onClick={() => setFormModalShown(true)} disabled={isLoading}>
        <FaPlus /> Create
      </Button>
      <hr />
      <CarsFilters disabled={isLoading} onChange={setFilters} />
      <hr />
      <CarsTable
        sorting={sorting}
        isLoading={isLoading}
        setSorting={setSorting}
        items={data?.items || null}
        onRowDelete={(item) => {
          const proceed = window.confirm(
            `Are you sure you want to delete car #${item.id}?`,
          );
          if (proceed) {
            deleteCar(item.id)
              .unwrap()
              .then(() => toast.success("Successfully deleted"))
              .catch((e) => toast.error(formatApiError(e)));
          }
        }}
        onRowEdit={(item) => {
          setEditingCar(item);
          setFormModalShown(true);
        }}
        onRowSelect={onCarSelect}
      />

      <Paginator
        limit={limit}
        page={page}
        setPage={setPage}
        totalPages={data?.totalPages ?? 1}
        totalCount={data?.totalItems ?? 0}
      />

      <CarFormModal
        existing={editingCar}
        isShown={formModalShown}
        isLoading={isCreating}
        onSubmit={(car) => {
          if (editingCar) {
            // edit mode
            updateCar({
              id: editingCar.id,
              dto: car,
            })
              .unwrap()
              .then(() => {
                toast.success("Successfully updated");
                setFormModalShown(false);
              })
              .catch((e) => toast.error(formatApiError(e)));
            setEditingCar(null);
          } else {
            // create mode
            createCar(car)
              .unwrap()
              .then((car) => {
                toast.success("Successfully created");
                onCarSelect?.(car);
                setFormModalShown(false);
              })
              .catch((e) => toast.error(formatApiError(e)));
          }
        }}
        onClose={() => setFormModalShown(false)}
      />
    </>
  );
};

export default CarsMenu;
