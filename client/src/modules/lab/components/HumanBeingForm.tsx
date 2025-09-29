import { useFormik } from "formik";
import React, { useEffect } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import NullableCheckBox from "src/modules/common/components/NullableCheckBox";
import * as Yup from "yup";
import {
  CreateHumanBeingDto,
  HumanBeing,
  Mood,
  WeaponType,
} from "../api/types";

const RequiredMark = () => <span className="text-danger"> *</span>;

export interface HumanBeingFormProps {
  existing?: HumanBeing | null;
  onSubmit: (humanBeing: CreateHumanBeingDto) => void;
  setIsValid?: (value: boolean) => void;
  formId?: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  coordinates: Yup.object().shape({
    x: Yup.number().required("X is required"),
    y: Yup.number().integer("Y must be an integer").required("Y is required"),
  }),
  realHero: Yup.boolean().required("Real hero is required"),
  hasToothpick: Yup.boolean().nullable(),
  car: Yup.object().shape({
    name: Yup.string().required("Car name is required"),
    cool: Yup.boolean().nullable(),
  }),
  mood: Yup.mixed<Mood>()
    .oneOf(Object.values(Mood))
    .required("Mood is required"),
  impactSpeed: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value,
    )
    .nullable()
    .typeError("Impact speed must be a number")
    .min(0, "Impact speed must be >= 0"),
  soundtrackName: Yup.string().required("Soundtrack name is required"),
  minutesOfWaiting: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value,
    )
    .nullable()
    .typeError("Minutes of waiting must be a number")
    .integer("Minutes of waiting must be an integer")
    .min(0, "Minutes of waiting must be >= 0"),
  weaponType: Yup.mixed<WeaponType>()
    .oneOf(Object.values(WeaponType))
    .required("Weapon type is required"),
});

const HumanBeingForm: React.FC<HumanBeingFormProps> = ({
  existing,
  onSubmit,
  formId,
  setIsValid,
}) => {
  const formik = useFormik<CreateHumanBeingDto>({
    initialValues: {
      name: existing?.name ?? "",
      coordinates: existing?.coordinates ?? { x: 0, y: 0 },
      realHero: existing?.realHero ?? false,
      hasToothpick: existing?.hasToothpick ?? null,
      car: existing?.car ?? { name: "", cool: null },
      mood: existing?.mood ?? Mood.CALM,
      impactSpeed: existing?.impactSpeed ?? null,
      soundtrackName: existing?.soundtrackName ?? "",
      minutesOfWaiting: existing?.minutesOfWaiting ?? null,
      weaponType: existing?.weaponType ?? WeaponType.HAMMER,
    },
    onSubmit: (values) => {
      const payload: CreateHumanBeingDto = {
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
        <Form id={formId ?? "humanBeingForm"} onSubmit={formik.handleSubmit}>
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

          <Card className="mb-3">
            <Card.Header>Coordinates</Card.Header>
            <Card.Body>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="coordinates.x">
                      X <RequiredMark />
                    </Form.Label>
                    <Form.Control
                      id="coordinates.x"
                      type="number"
                      inputMode="decimal"
                      placeholder="X"
                      onBlur={formik.handleBlur}
                      value={formik.values.coordinates.x.toString()}
                      onChange={formik.handleChange}
                      isInvalid={
                        formik.touched.coordinates?.x &&
                        !!formik.errors.coordinates?.x
                      }
                      isValid={
                        formik.touched.coordinates?.x &&
                        !formik.errors.coordinates?.x
                      }
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="coordinates.y">
                      Y <RequiredMark />
                    </Form.Label>
                    <Form.Control
                      id="coordinates.y"
                      type="number"
                      placeholder="Y"
                      onBlur={formik.handleBlur}
                      value={formik.values.coordinates.y.toString()}
                      onChange={formik.handleChange}
                      isInvalid={
                        formik.touched.coordinates?.y &&
                        !!formik.errors.coordinates?.y
                      }
                      isValid={
                        formik.touched.coordinates?.y &&
                        !formik.errors.coordinates?.y
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Form.Group className="mb-3" controlId="realHero">
            <Form.Check
              type="checkbox"
              label="Real Hero?"
              checked={!!formik.values.realHero}
              onChange={(e) =>
                formik.setFieldValue("realHero", e.target.checked)
              }
              name="realHero"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="realHero">
            <Form.Label as="div">Has Toothpick?</Form.Label>
            <NullableCheckBox
              value={formik.values.hasToothpick}
              setValue={(value) =>
                formik.setFieldValue(
                  "hasToothpick" as keyof CreateHumanBeingDto,
                  value,
                )
              }
              isValid={
                !formik.errors.hasToothpick && formik.touched.hasToothpick
              }
              isInvalid={
                !!formik.errors.hasToothpick && formik.touched.hasToothpick
              }
            />
          </Form.Group>

          <Card className="mb-3">
            <Card.Header>Car</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="car.name">
                  Car name
                  <RequiredMark />
                </Form.Label>
                <Form.Control
                  id="car.name"
                  placeholder="Enter car name"
                  value={formik.values.car.name}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  isInvalid={
                    formik.touched.car?.name && !!formik.errors.car?.name
                  }
                  isValid={formik.touched.car?.name && !formik.errors.car?.name}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label as="div">Cool?</Form.Label>
                <NullableCheckBox
                  value={formik.values.car.cool}
                  setValue={(value) =>
                    formik.setFieldValue(
                      "car.cool" as keyof CreateHumanBeingDto,
                      value,
                    )
                  }
                  isValid={!formik.errors.car?.cool && formik.touched.car?.cool}
                  isInvalid={
                    !!formik.errors.car?.cool && formik.touched.car?.cool
                  }
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <Form.Group className="mb-3" controlId="mood">
            <Form.Label>
              Mood <RequiredMark />
            </Form.Label>
            <Form.Select
              name="mood"
              value={formik.values.mood}
              onChange={formik.handleChange}
              isInvalid={!!formik.errors.mood && formik.touched.mood}
            >
              {Object.values(Mood).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="impactSpeed">
              Impact speed (optional)
            </Form.Label>
            <Form.Control
              id="impactSpeed"
              type="number"
              placeholder="Enter impact speed"
              onBlur={formik.handleBlur}
              value={formik.values.impactSpeed ?? ""}
              onChange={formik.handleChange}
              isInvalid={
                formik.touched.impactSpeed && !!formik.errors.impactSpeed
              }
              isValid={formik.touched.impactSpeed && !formik.errors.impactSpeed}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="soundtrackName">
              Soundtrack name
              <RequiredMark />
            </Form.Label>
            <Form.Control
              id="soundtrackName"
              placeholder="Enter soundtrack name"
              value={formik.values.soundtrackName}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              isInvalid={
                formik.touched.soundtrackName && !!formik.errors.soundtrackName
              }
              isValid={
                formik.touched.soundtrackName && !formik.errors.soundtrackName
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="minutesOfWaiting">
              Minutes of waiting (optional)
            </Form.Label>
            <Form.Control
              id="minutesOfWaiting"
              placeholder="Enter minutes of waiting"
              type="number"
              onBlur={formik.handleBlur}
              value={formik.values.minutesOfWaiting ?? ""}
              onChange={formik.handleChange}
              isInvalid={
                formik.touched.minutesOfWaiting &&
                !!formik.errors.minutesOfWaiting
              }
              isValid={
                formik.touched.minutesOfWaiting &&
                !formik.errors.minutesOfWaiting
              }
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="weaponType">
            <Form.Label>
              Weapon Type <RequiredMark />
            </Form.Label>
            <Form.Select
              name="weaponType"
              value={formik.values.weaponType}
              onChange={formik.handleChange}
              isInvalid={
                !!formik.errors.weaponType && formik.touched.weaponType
              }
            >
              {Object.values(WeaponType).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </fieldset>

      <pre>{JSON.stringify(formik.errors, null, 2)}</pre>
    </>
  );
};

export default HumanBeingForm;
