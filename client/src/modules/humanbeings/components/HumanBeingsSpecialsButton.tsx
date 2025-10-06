import { useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import toast from "react-hot-toast";
import CarSelectModal from "src/modules/cars/components/CarSelectModal";
import { formatApiError } from "src/modules/common/api/utils";
import {
  useAssignCarToCarlessMutation,
  useDeleteWithoutToothpicksMutation,
  useLazyCountImpactSpeedLessThanQuery,
  useLazyGroupByCarQuery,
} from "../api";
import CountImpactSpeedLessThanModal from "../components/CountImpactSpeedLessThanModal";
import GroupByCarsResult from "../components/GroupByCarsResult";

const HumanBeingsSpecialsButton = () => {
  const [getCountByCars] = useLazyGroupByCarQuery();
  const [getCountImpactSpeedLessThan] = useLazyCountImpactSpeedLessThanQuery();
  const [deleteWithoutToothpicks] = useDeleteWithoutToothpicksMutation();
  const [assignCarToCarless] = useAssignCarToCarlessMutation();

  const [
    isCountImpactSpeedLessThanModalShown,
    setIsCountImpactSpeedLessThanModalShown,
  ] = useState(false);
  const [assignCarToCarlessModalShown, setAssignCarToCarlessModalShown] =
    useState(false);

  return (
    <>
      <DropdownButton className="me-2" title="Special" variant="warning">
        <Dropdown.Item
          onClick={() => {
            getCountByCars()
              .unwrap()
              .then((res) => {
                toast.success(<GroupByCarsResult result={res} />);
                console.log(res);
              })
              .catch((e) => toast.error(formatApiError(e)));
          }}
        >
          Get count by cars
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => setIsCountImpactSpeedLessThanModalShown(true)}
        >
          Count human beings with impactSpeed less than X
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setAssignCarToCarlessModalShown(true)}>
          Assign car to carless
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            const confirm = window.confirm(
              "Are you sure you want to delete human beings without toothpicks?",
            );
            if (confirm) {
              deleteWithoutToothpicks()
                .unwrap()
                .then((res) => toast.success(`Deleted ${res} human beings`))
                .catch((e) => toast.error(formatApiError(e)));
            }
          }}
        >
          Delete without toothpicks
        </Dropdown.Item>
      </DropdownButton>

      {/* modals */}
      <CountImpactSpeedLessThanModal
        isShown={isCountImpactSpeedLessThanModalShown}
        setIsShown={setIsCountImpactSpeedLessThanModalShown}
        onSubmit={(threshold) => {
          setIsCountImpactSpeedLessThanModalShown(false);
          console.log(threshold);
          getCountImpactSpeedLessThan(threshold)
            .unwrap()
            .then((res) => {
              toast.success(
                `Human beings with impact speed less than ${threshold}: ${res}`,
              );
            })
            .catch((e) => toast.error(formatApiError(e)));
        }}
      />
      <CarSelectModal
        isShown={assignCarToCarlessModalShown}
        onClose={() => setAssignCarToCarlessModalShown(false)}
        onCarSelect={(car) => {
          assignCarToCarless(car.id)
            .unwrap()
            .then((res) => {
              toast.success(
                `Successfully assigned car #${car.id} to ${res} human beings`,
              );
              setAssignCarToCarlessModalShown(false);
            })
            .catch((e) => toast.error(formatApiError(e)));
        }}
      />
    </>
  );
};

export default HumanBeingsSpecialsButton;
