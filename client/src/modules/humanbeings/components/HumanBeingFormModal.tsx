import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
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
        <Modal.Title>
          {props.existing ? "Update" : "Create"} Human Being
        </Modal.Title>
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

export default HumanBeingFormModal;
