import React, { useCallback, useEffect, useState } from "react";
import { Form, FormControlProps } from "react-bootstrap";
import { isStrictFloat } from "../utils/utils";

interface FloatInputProps extends FormControlProps {
  value: string;
  setValue: (value: string) => void;
}

const FloatInput: React.FC<FloatInputProps> = ({
  value,
  setValue,
  ...props
}) => {
  const [stringFloat, setStringFloat] = useState("");

  useEffect(() => {
    setStringFloat(value);
  }, [value]);

  const handleBlur = useCallback(() => {
    if (!isStrictFloat(stringFloat)) {
      setStringFloat(value);
    } else {
      setValue(stringFloat);
    }
  }, [stringFloat, value, setValue]);

  return (
    <Form.Control
      type="text"
      inputMode="decimal"
      value={stringFloat}
      onChange={(e) => setStringFloat(e.target.value)}
      onBlur={handleBlur}
      {...props}
    />
  );
};

export default FloatInput;
