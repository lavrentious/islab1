import { useState } from "react";
import { Button, Container, Spinner } from "react-bootstrap";
import { BsPlusLg } from "react-icons/bs";
import { Paginator } from "src/modules/common/components/Paginator";
import {
  useCreateHumanBeingMutation,
  useFindAllHumanBeingsQuery,
} from "../api";
import HumanBeingFormModal from "../components/HumanBeingFormModal";
import HumanBeingsTable from "../components/HumanBeingsTable";

const MainPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const { data, isLoading } = useFindAllHumanBeingsQuery({
    limit,
    page: page,
    paginate: true,
  });

  const [createHumanBeing, { isLoading: isCreating }] =
    useCreateHumanBeingMutation();

  const [formModalShown, setFormModalShown] = useState(false);

  return (
    <>
      <Container>
        <Button onClick={() => setFormModalShown(true)}>
          <BsPlusLg /> Create
        </Button>
        <Paginator
          limit={limit}
          page={page}
          setPage={setPage}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalItems ?? 0}
        />
        {isLoading && <Spinner animation="border" />}
        {data ? <HumanBeingsTable items={data.items} /> : <pre>no data</pre>}
      </Container>
      <HumanBeingFormModal
        isShown={formModalShown}
        isLoading={isCreating}
        onSubmit={(humanBeing) => {
          console.log(humanBeing);
          createHumanBeing(humanBeing);
        }}
        onClose={() => setFormModalShown(false)}
      />
    </>
  );
};

export default MainPage;
