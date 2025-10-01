import React from "react";
import { Card, ListGroup } from "react-bootstrap";
import { Car } from "../api/types";

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <Card>
      <Card.Header>{car.name}</Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item>ID: {car.id}</ListGroup.Item>
        <ListGroup.Item>Name: {car.name}</ListGroup.Item>
        <ListGroup.Item>
          Cool: {car.cool !== null ? (car.cool ? "Yes" : "No") : "N/A"}
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
};

export default CarCard;
