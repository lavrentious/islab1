import { useState } from "react";
import { Alert, Button, Container, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router";
import { formatApiError } from "src/modules/common/api/utils";
import {
  useDeleteCarMutation,
  useFindOneCarQuery,
  useUpdateCarMutation,
} from "../api";
import CarCard from "../components/CarCard";
import CarFormModal from "../components/CarFormModal";

const CarPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: car, isLoading, error } = useFindOneCarQuery(+id!, {});
  const [deleteCar] = useDeleteCarMutation();
  const [updateCar] = useUpdateCarMutation();

  const [modalShown, setModalShown] = useState(false);

  return (
    <>
      <Container>
        <h1>car #{id}</h1>
        {error && <Alert variant="danger">{formatApiError(error)}</Alert>}
        {car && (
          <>
            <Button
              variant="danger"
              className="me-2 mb-2"
              onClick={() => {
                const confirm = window.confirm(
                  `Are you sure you want to delete car #${car.id}?`,
                );
                if (confirm) {
                  deleteCar(car.id)
                    .unwrap()
                    .then(() => {
                      toast.success(`Car ${car.id} deleted`);
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
        {car && <CarCard car={car} />}
      </Container>
      {car && (
        <CarFormModal
          isShown={modalShown}
          existing={car}
          onSubmit={(dto) => {
            updateCar({ id: car.id, dto })
              .unwrap()
              .then(() => {
                toast.success(`car ${car.id} updated`);
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

export default CarPage;
