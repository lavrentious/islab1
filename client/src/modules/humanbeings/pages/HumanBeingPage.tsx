import { Container, Spinner } from "react-bootstrap";
import { useParams } from "react-router";
import { useFindOneHumanBeingQuery } from "../api";
import HumanBeingCard from "../components/HumanBeingCard";

const HumanBeingPage = () => {
  const { id } = useParams();

  const { data: humanBeing, isLoading } = useFindOneHumanBeingQuery(+id!, {});
  return (
    <Container>
      <h1>Human Being #{id}</h1>
      {isLoading && <Spinner />}
      {humanBeing && <HumanBeingCard humanBeing={humanBeing} carLink />}
    </Container>
  );
};

export default HumanBeingPage;
