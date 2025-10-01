import { SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Button, Container, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { formatApiError } from "src/modules/common/api/utils";
import { Paginator } from "src/modules/common/components/Paginator";
import {
  useCreateHumanBeingMutation,
  useDeleteHumanBeingMutation,
  useFindAllHumanBeingsQuery,
  useUpdateHumanBeingMutation,
} from "../api";
import { FindAllHumanbeingsQueryParamsDto, HumanBeing } from "../api/types";
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
  const [updateHumanBeing] = useUpdateHumanBeingMutation();

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

  return (
    <>
      <Container>
        {isLoading && (
          <Spinner
            className="d-block mx-auto my-5"
            variant="primary"
            animation="border"
          />
        )}
        <Button onClick={() => setFormModalShown(true)}>
          <FaPlus /> Create
        </Button>
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
              .then(() => toast.success("Successfully updated"))
              .catch((e) => toast.error(formatApiError(e)));
            setSelectedHumanBeing(null);
          } else {
            // create mode
            createHumanBeing(humanBeing)
              .unwrap()
              .then(() => toast.success("Successfully created"))
              .catch((e) => toast.error(formatApiError(e)));
          }
          setFormModalShown(false);
        }}
        onClose={() => setFormModalShown(false)}
      />
    </>
  );
};

export default MainPage;
