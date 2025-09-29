import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";

interface NullableCheckBoxProps {
  value?: boolean | null;
  setValue: (value: boolean | null) => void;
  isValid?: boolean;
  isInvalid?: boolean;
}

const NullableCheckBox: React.FC<NullableCheckBoxProps> = ({
  value,
  setValue,
  isValid,
  isInvalid,
}) => {
  return (
    <>
      <ButtonGroup size="sm">
        <Button
          variant={value === true ? "success" : "outline-success"}
          onClick={() => setValue(true)}
        >
          Y
        </Button>
        <Button
          variant={value === false ? "danger" : "outline-danger"}
          onClick={() => setValue(false)}
        >
          N
        </Button>
        <Button
          variant={value === null ? "secondary" : "outline-secondary"}
          onClick={() => setValue(null)}
        >
          -
        </Button>
      </ButtonGroup>
      {isValid && <div className="valid-feedback">OK</div>}
      {isInvalid && <div className="invalid-feedback">X</div>}
    </>
  );
};

export default NullableCheckBox;
