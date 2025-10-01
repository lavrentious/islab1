import { type FormikValues, useFormik } from "formik";
import { useMemo } from "react";
import { Form, FormControl, type FormControlProps } from "react-bootstrap";
import { Leaves } from "src/modules/common/types";

interface IFieldProps<Values extends FormikValues> extends FormControlProps {
  f: ReturnType<typeof useFormik<Values>>;
  field: Leaves<Values>;
  getTouched?: () => boolean | undefined;
  getError?: () => string | undefined;
  label?: string;
  required?: boolean;
}
export function Field<Values extends FormikValues>({
  f,
  field,
  label,
  required,
  getTouched,
  getError,
  ...props
}: IFieldProps<Values>) {
  const touched = useMemo(
    () => (getTouched ? getTouched() : f.touched[field]),
    [f.touched, field, getTouched],
  );
  const error = useMemo(
    () => (getError ? getError() : f.errors[field]),
    [f.errors, field, getError],
  );

  return (
    <Form.Group className="my-2">
      {label && (
        <Form.Label htmlFor={field.toString()}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </Form.Label>
      )}
      <FormControl
        {...props}
        id={field.toString()}
        onBlur={f.handleBlur}
        value={f.values[field]}
        onChange={f.handleChange}
        isInvalid={touched && !!error}
        isValid={touched && !error}
      />
    </Form.Group>
  );
}
