import React from "react";
import { ListGroup } from "react-bootstrap";

interface GroupByCarsResultProps {
  result: {
    car: number | null;
    total: number;
  }[];
}

const GroupByCarsResult: React.FC<GroupByCarsResultProps> = ({ result }) => {
  return (
    <ListGroup variant="flush">
      {result.map(({ car, total }) => (
        <ListGroup.Item key={car}>
          {car ? `#${car}` : "No car"}: {total}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default GroupByCarsResult;
