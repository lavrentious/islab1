import { SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Dropdown,
  DropdownButton,
  Spinner,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import CarSelectModal from "src/modules/cars/components/CarSelectModal";
import { formatApiError } from "src/modules/common/api/utils";
import { Paginator } from "src/modules/common/components/Paginator";
import {
  useAssignCarToCarlessMutation,
  useCreateHumanBeingMutation,
  useDeleteHumanBeingMutation,
  useDeleteWithoutToothpicksMutation,
  useFindAllHumanBeingsQuery,
  useLazyCountImpactSpeedLessThanQuery,
  useLazyGroupByCarQuery,
  useUpdateHumanBeingMutation,
} from "../api";
import { FindAllHumanbeingsQueryParamsDto, HumanBeing } from "../api/types";
import CountImpactSpeedLessThanModal from "../components/CountImpactSpeedLessThanModal";
import GroupByCarsResult from "../components/GroupByCarsResult";
import HumanBeingFormModal from "../components/HumanBeingFormModal";
import HumanBeingsFilters from "../components/HumanBeingsFilters";
import HumanBeingsTable from "../components/HumanBeingsTable";

const MainPage = () => {
  const [page, setPage] = useState(1);
  const limit = 5;

  const [filters, setFilters] = useState<
    Partial<FindAllHumanbeingsQueryParamsDto>
  >({});

  const [sortBy, setSortBy] = useState<
    FindAllHumanbeingsQueryParamsDto["sortBy"] | null
  >(null);
  const [sortAsc, setSortAsc] = useState(false);
  const { data, isLoading } = useFindAllHumanBeingsQuery(
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

  const [createHumanBeing, { isLoading: isCreating }] =
    useCreateHumanBeingMutation();
  const [deleteHumanBeing] = useDeleteHumanBeingMutation();
  const [updateHumanBeing, { isLoading: isUpdating }] =
    useUpdateHumanBeingMutation();

  const [formModalShown, setFormModalShown] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  useEffect(() => {
    const item = sorting[0];
    if (item) {
      setSortBy(item.id as FindAllHumanbeingsQueryParamsDto["sortBy"]);
      setSortAsc(item.desc);
    } else {
      setSortBy(null);
      setSortAsc(false);
    }
  }, [sorting]);

  const [selectedHumanBeing, setSelectedHumanBeing] =
    useState<HumanBeing | null>(null);

  // special actions
  const [getCountByCars] = useLazyGroupByCarQuery();
  const [getCountImpactSpeedLessThan] = useLazyCountImpactSpeedLessThanQuery();
  const [deleteWithoutToothpicks] = useDeleteWithoutToothpicksMutation();
  const [assignCarToCarless] = useAssignCarToCarlessMutation();

  const [
    isCountImpactSpeedLessThanModalShown,
    setIsCountImpactSpeedLessThanModalShown,
  ] = useState(false);
  const [assignCarToCarlessModalShown, setAssignCarToCarlessModalShown] =
    useState(false);

  return (
    <>
      <Container>
        <h1>Human Beings</h1>
        {isLoading && (
          <Spinner
            className="d-block mx-auto my-5"
            variant="primary"
            animation="border"
          />
        )}
        <div className="d-flex">
          <Button className="me-2" onClick={() => setFormModalShown(true)}>
            <FaPlus /> Create
          </Button>
          <DropdownButton className="me-2" title="Special" variant="warning">
            <Dropdown.Item
              onClick={() => {
                getCountByCars()
                  .unwrap()
                  .then((res) => {
                    toast.success(<GroupByCarsResult result={res} />);
                    console.log(res);
                  })
                  .catch((e) => toast.error(formatApiError(e)));
              }}
            >
              Get count by cars
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => setIsCountImpactSpeedLessThanModalShown(true)}
            >
              Count human beings with impactSpeed less than X
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => setAssignCarToCarlessModalShown(true)}
            >
              Assign car to carless
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const confirm = window.confirm(
                  "Are you sure you want to delete human beings without toothpicks?",
                );
                if (confirm) {
                  deleteWithoutToothpicks()
                    .unwrap()
                    .then((res) => toast.success(`Deleted ${res} human beings`))
                    .catch((e) => toast.error(formatApiError(e)));
                }
              }}
            >
              Delete without toothpicks
            </Dropdown.Item>
          </DropdownButton>
        </div>
        <hr />
        <HumanBeingsFilters disabled={isLoading} onChange={setFilters} />
        <hr />
        {data && (
          <>
            <HumanBeingsTable
              sorting={sorting}
              setSorting={setSorting}
              items={data.items}
              onRowDelete={(item) => {
                const proceed = window.confirm(
                  `Are you sure you want to delete item #${item.id}?`,
                );
                if (proceed) {
                  deleteHumanBeing(item.id)
                    .unwrap()
                    .then(() => toast.success("Successfully deleted"))
                    .catch((e) => toast.error(formatApiError(e)));
                }
              }}
              onRowEdit={(item) => {
                setSelectedHumanBeing(item);
                setFormModalShown(true);
              }}
            />
          </>
        )}

        <Paginator
          limit={limit}
          page={page}
          setPage={setPage}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalItems ?? 0}
        />
      </Container>
      <HumanBeingFormModal
        disabled={isLoading || isUpdating}
        existing={selectedHumanBeing}
        isShown={formModalShown}
        isLoading={isCreating}
        onSubmit={(humanBeing) => {
          if (selectedHumanBeing) {
            // edit mode
            updateHumanBeing({
              id: selectedHumanBeing.id,
              dto: humanBeing,
            })
              .unwrap()
              .then(() => {
                toast.success("Successfully updated");
                setFormModalShown(false);
              })
              .catch((e) => toast.error(formatApiError(e)));
            setSelectedHumanBeing(null);
          } else {
            // create mode
            createHumanBeing(humanBeing)
              .unwrap()
              .then(() => {
                toast.success("Successfully created");
                setFormModalShown(false);
              })
              .catch((e) => toast.error(formatApiError(e)));
          }
        }}
        onClose={() => setFormModalShown(false)}
      />

      <CountImpactSpeedLessThanModal
        isShown={isCountImpactSpeedLessThanModalShown}
        setIsShown={setIsCountImpactSpeedLessThanModalShown}
        onSubmit={(threshold) => {
          setIsCountImpactSpeedLessThanModalShown(false);
          console.log(threshold);
          getCountImpactSpeedLessThan(threshold)
            .unwrap()
            .then((res) => {
              toast.success(
                `Human beings with impact speed less than ${threshold}: ${res}`,
              );
            })
            .catch((e) => toast.error(formatApiError(e)));
        }}
      />
      <CarSelectModal
        isShown={assignCarToCarlessModalShown}
        onClose={() => setAssignCarToCarlessModalShown(false)}
        onCarSelect={(car) => {
          assignCarToCarless(car.id)
            .unwrap()
            .then((res) => {
              toast.success(
                `Successfully assigned car #${car.id} to ${res} human beings`,
              );
              setAssignCarToCarlessModalShown(false);
            })
            .catch((e) => toast.error(formatApiError(e)));
        }}
      />
    </>
  );
};

export default MainPage;
