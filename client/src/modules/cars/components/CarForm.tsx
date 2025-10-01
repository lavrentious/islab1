import { useFormik } from "formik";
import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import NullableCheckBox from "src/modules/common/components/NullableCheckBox";
import * as Yup from "yup";
import { Car, CreateCarDto } from "../api/types";

const RequiredMark = () => <span className="text-danger"> *</span>;

export interface CarFormProps {
  existing?: Car | null;
  onSubmit: (dto: CreateCarDto) => void;
  setIsValid?: (value: boolean) => void;
  formId?: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Car name is required"),
  cool: Yup.boolean().nullable(),
});

const CarForm: React.FC<CarFormProps> = ({
  existing,
  onSubmit,
  formId,
  setIsValid,
}) => {
  const formik = useFormik<CreateCarDto>({
    initialValues: {
      name: existing?.name ?? "",
      cool: existing?.cool ?? null,
    },
    onSubmit: (values) => {
      const payload: CreateCarDto = {
        ...values,
      };
      onSubmit(payload);
    },
    validationSchema,
    validateOnBlur: true,
  });

  useEffect(() => {
    if (setIsValid) {
      setIsValid(formik.isValid);
    }
  }, [setIsValid, formik.isValid]);

  return (
    <>
      <fieldset disabled={formik.isSubmitting}>
        <Form id={formId ?? "carForm"} onSubmit={formik.handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="name">
              Name <RequiredMark />
            </Form.Label>
            <Form.Control
              id="name"
              placeholder="Enter name"
              onBlur={formik.handleBlur}
              value={formik.values.name}
              onChange={formik.handleChange}
              isInvalid={formik.touched.name && !!formik.errors.name}
              isValid={formik.touched.name && !formik.errors.name}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="d-block">Cool</Form.Label>
            <NullableCheckBox
              value={formik.values.cool}
              setValue={(value) => formik.setFieldValue("cool", value)}
              isInvalid={formik.touched.cool && !!formik.errors.cool}
              isValid={formik.touched.cool && !formik.errors.cool}
            />
          </Form.Group>
        </Form>
      </fieldset>
    </>
  );
};

export default CarForm;
