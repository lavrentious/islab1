import { Container } from "react-bootstrap";

const NotFoundPage = () => {
  return (
    <Container className="text-center">
      <img className="mx-auto" src="/dmitry-puchkov-dance.gif" />
      <h2>Page not found</h2>
      <a href="/">Go home</a>
    </Container>
  );
};

export default NotFoundPage;
