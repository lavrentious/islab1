import React from "react";
import { Modal } from "react-bootstrap";
import CarsMenu, { CarsMenuProps } from "src/modules/cars/components/CarsMenu";

interface CarSelectModalProps extends CarsMenuProps {
  isShown: boolean;
  onClose?: () => void;
}

const CarSelectModal: React.FC<CarSelectModalProps> = ({
  isShown,
  onClose,
  ...props
}) => {
  return (
    <Modal show={isShown} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Car</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CarsMenu {...props} />
      </Modal.Body>
    </Modal>
  );
};

export default CarSelectModal;
