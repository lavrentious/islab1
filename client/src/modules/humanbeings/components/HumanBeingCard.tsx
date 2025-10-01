import React, { useMemo } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { useFindOneCarQuery } from "src/modules/cars/api";
import CarCard from "src/modules/cars/components/CarCard";
import { HumanBeing } from "../api/types";

interface HumanBeingCardProps {
  humanBeing: HumanBeing;
  link?: boolean;
  carLink?: boolean;
}

const HumanBeingCard: React.FC<HumanBeingCardProps> = ({
  humanBeing,
  link,
  carLink,
}) => {
  const { data: fetchedCar } = useFindOneCarQuery(humanBeing.car!, {
    skip: humanBeing.car == null,
    pollingInterval: 5000,
  });
  const car = useMemo(
    () => (humanBeing.car === null ? null : fetchedCar),
    [fetchedCar, humanBeing.car],
  );

  return (
    <Card>
      <Card.Header>
        {link ? (
          <a href={`/humanbeings/${humanBeing.id}`}>
            Human Being #{humanBeing.id}
          </a>
        ) : (
          <>Human Being ID #{humanBeing.id}</>
        )}
      </Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item>ID: {humanBeing.id}</ListGroup.Item>
        <ListGroup.Item>Name: {humanBeing.name}</ListGroup.Item>
        <ListGroup.Item>
          Real Hero: {humanBeing.realHero ? "Yes" : "No"}
        </ListGroup.Item>
        <ListGroup.Item>
          Has Toothpick:{" "}
          {humanBeing.hasToothpick !== null
            ? humanBeing.hasToothpick
              ? "Yes"
              : "No"
            : "N/A"}
        </ListGroup.Item>
        <ListGroup.Item>Mood: {humanBeing.mood}</ListGroup.Item>
        <ListGroup.Item>Weapon Type: {humanBeing.weaponType}</ListGroup.Item>
        <ListGroup.Item>
          Impact Speed:{" "}
          {humanBeing.impactSpeed !== null ? humanBeing.impactSpeed : "N/A"}
        </ListGroup.Item>
        <ListGroup.Item>
          Soundtrack Name: {humanBeing.soundtrackName}
        </ListGroup.Item>
        <ListGroup.Item>
          Minutes of Waiting:{" "}
          {humanBeing.minutesOfWaiting !== null
            ? humanBeing.minutesOfWaiting
            : "N/A"}
        </ListGroup.Item>
        <ListGroup.Item>
          Car: {car ? <CarCard car={car} link={carLink} /> : "N/A"}
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
};

export default HumanBeingCard;
