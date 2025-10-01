import { useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router";
import { formatApiError } from "src/modules/common/api/utils";
import {
  useDeleteHumanBeingMutation,
  useFindOneHumanBeingQuery,
  useUpdateHumanBeingMutation,
} from "../api";
import HumanBeingCard from "../components/HumanBeingCard";
import HumanBeingFormModal from "../components/HumanBeingFormModal";

const HumanBeingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: humanBeing,
    isLoading,
    error,
  } = useFindOneHumanBeingQuery(+id!, {});
  const [deleteHumanBeing] = useDeleteHumanBeingMutation();
  const [updateHumanBeing] = useUpdateHumanBeingMutation();

  const [modalShown, setModalShown] = useState(false);

  return (
    <>
      <Container>
        <h1>Human Being #{id}</h1>
        {error && <Alert variant="danger">{formatApiError(error)}</Alert>}
        {humanBeing && (
          <>
            <Button
              variant="danger"
              className="me-2 mb-2"
              onClick={() => {
                const confirm = window.confirm(
                  `Are you sure you want to delete human being #${humanBeing.id}?`,
                );
                if (confirm) {
                  deleteHumanBeing(humanBeing.id)
                    .unwrap()
                    .then(() => {
                      toast.success(`Human being ${humanBeing.id} deleted`);
                      navigate("/");
                    })
                    .catch((e) => {
                      toast.error(formatApiError(e));
                    });
                }
              }}
            >
              <FaTrash /> Delete
            </Button>
            <Button
              variant="secondary"
              className="me-2 mb-2"
              onClick={() => setModalShown(true)}
            >
              <FaPencil /> Edit
            </Button>
          </>
        )}
        {isLoading && <Spinner />}
        {humanBeing && <HumanBeingCard humanBeing={humanBeing} carLink />}
      </Container>
      {humanBeing && (
        <HumanBeingFormModal
          isShown={modalShown}
          existing={humanBeing}
          onSubmit={(dto) => {
            updateHumanBeing({ id: humanBeing.id, dto })
              .unwrap()
              .then(() => {
                toast.success(`Human being ${humanBeing.id} updated`);
                setModalShown(false);
              })
              .catch((e) => {
                toast.error(formatApiError(e));
              });
          }}
          onClose={() => setModalShown(false)}
        />
      )}
    </>
  );
};

export default HumanBeingPage;
