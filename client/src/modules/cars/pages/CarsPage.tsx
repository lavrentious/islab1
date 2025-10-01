import { Container } from "react-bootstrap";
import CarsMenu from "../components/CarsMenu";

const CarsPage = () => {
  return (
    <Container>
      <h1>Cars</h1>
      <CarsMenu onSelect={(car) => console.log("select", car)} />
    </Container>
  );
};

export default CarsPage;
