import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { BsCheckLg, BsXLg } from "react-icons/bs";
import LoadingButton from "src/modules/common/components/LoadingButton";
import HumanBeingForm, { HumanBeingFormProps } from "./HumanBeingForm";

interface HumanBeingFormModalProps extends HumanBeingFormProps {
  isShown: boolean;
  onClose?: () => void;
  isLoading?: boolean;
}

const formId = "humanBeingForm";

const HumanBeingFormModal: React.FC<HumanBeingFormModalProps> = ({
  isShown,
  onClose,
  isLoading,
  ...props
}) => {
  const [isValid, setIsValid] = useState(false);

  return (
    <Modal show={isShown} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Modal heading</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <HumanBeingForm formId={formId} setIsValid={setIsValid} {...props} />
      </Modal.Body>
      <Modal.Footer>
        <LoadingButton
          isLoading={isLoading || false}
          variant="success"
          type="submit"
          form={formId}
          disabled={!isValid}
        >
          <BsCheckLg /> Submit
        </LoadingButton>
        <Button variant="secondary" onClick={onClose}>
          <BsXLg /> Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HumanBeingFormModal;
