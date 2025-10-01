import { Container, Spinner } from "react-bootstrap";
import { useParams } from "react-router";
import { useFindOneCarQuery } from "../api";
import CarCard from "../components/CarCard";

const CarPage = () => {
  const { id } = useParams();

  const { data: car, isLoading } = useFindOneCarQuery(+id!, {});

  return (
    <Container>
      <h1>Car #{id}</h1>
      {isLoading && <Spinner />}
      {car && <CarCard car={car} />}
    </Container>
  );
};

export default CarPage;
