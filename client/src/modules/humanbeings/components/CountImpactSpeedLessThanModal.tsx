import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface CountImpactSpeedLessThanModalProps {
  isShown: boolean;
  setIsShown: (value: boolean) => void;
  onSubmit: (threshold: number) => void;
}

const CountImpactSpeedLessThanModal: React.FC<
  CountImpactSpeedLessThanModalProps
> = ({ isShown, setIsShown, onSubmit }) => {
  const [threshold, setThreshold] = useState(0);

  return (
    <Modal show={isShown}>
      <Modal.Body>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(threshold);
          }}
        >
          <Form.Group className="mb-3">
            <Form.Label>Threshold</Form.Label>
            <Form.Control
              type="number"
              name="threshold"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => onSubmit(threshold)}>
          Submit
        </Button>
        <Button onClick={() => setIsShown(false)} variant="secondary">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CountImpactSpeedLessThanModal;
