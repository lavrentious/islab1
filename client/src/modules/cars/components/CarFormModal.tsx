import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import LoadingButton from "src/modules/common/components/LoadingButton";
import CarForm, { CarFormProps } from "./CarForm";

interface CarFormModalProps extends CarFormProps {
  isShown: boolean;
  onClose?: () => void;
  isLoading?: boolean;
}

const formId = "carForm";

const CarFormModal: React.FC<CarFormModalProps> = ({
  isShown,
  onClose,
  isLoading,
  ...props
}) => {
  const [isValid, setIsValid] = useState(false);

  return (
    <Modal show={isShown} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{props.existing ? "Update" : "Create"} Car</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CarForm formId={formId} setIsValid={setIsValid} {...props} />
      </Modal.Body>
      <Modal.Footer>
        <LoadingButton
          isLoading={isLoading || false}
          variant="success"
          type="submit"
          form={formId}
          disabled={!isValid}
          icon={<FaCheck />}
        >
          Submit
        </LoadingButton>
        <Button variant="secondary" onClick={onClose}>
          <FaX /> Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CarFormModal;
