import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { FaCar, FaCarCrash } from "react-icons/fa";
import { useFindOneCarQuery } from "src/modules/cars/api";
import CarCard from "src/modules/cars/components/CarCard";
import NullableCheckBox from "src/modules/common/components/NullableCheckBox";
import * as Yup from "yup";
import CarSelectModal from "../../cars/components/CarSelectModal";
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
  disabled?: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  coordinates: Yup.object().shape({
    x: Yup.number().required("X is required"),
    y: Yup.number().integer("Y must be an integer").required("Y is required"),
  }),
  realHero: Yup.boolean().required("Real hero is required"),
  hasToothpick: Yup.boolean().nullable(),
  car: Yup.number().integer().nullable(),
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
  disabled,
}) => {
  const formik = useFormik<CreateHumanBeingDto>({
    initialValues: {
      name: existing?.name ?? "",
      coordinates: existing?.coordinates ?? { x: 0, y: 0 },
      realHero: existing?.realHero ?? false,
      hasToothpick: existing?.hasToothpick ?? null,
      car: existing?.car ?? null,
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

  const [carSelectModalShown, setCarSelectModalShown] = useState(false);

  const { data: selectedCar, isLoading: carLoading } = useFindOneCarQuery(
    formik.values.car!,
    { skip: formik.values.car == null },
  );

  return (
    <>
      <fieldset disabled={disabled}>
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

          <hr />
          <Button
            className="me-2 mb-2"
            onClick={() => setCarSelectModalShown(true)}
          >
            <FaCar /> Select car
          </Button>
          {formik.values.car !== null && (
            <>
              <Button
                className="me-2 mb-2"
                onClick={() => formik.setFieldValue("car", null)}
                variant="danger"
              >
                <FaCarCrash /> Remove car
              </Button>
              {selectedCar && <CarCard car={selectedCar} />}
            </>
          )}
          {carLoading && <Spinner animation="border" />}
          <hr />

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
              onBlur={(e) => {
                const val = e.target.value;
                formik.setFieldValue(
                  "impactSpeed",
                  val === "" ? null : Number(val),
                );
                formik.handleBlur(e);
              }}
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
              onBlur={(e) => {
                const val = e.target.value;
                formik.setFieldValue(
                  "minutesOfWaiting",
                  val === "" ? null : Number(val),
                );
                formik.handleBlur(e);
              }}
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

      <CarSelectModal
        isShown={carSelectModalShown}
        onClose={() => setCarSelectModalShown(false)}
        onCarSelect={(car) => {
          formik.setFieldValue("car", car.id);
          setCarSelectModalShown(false);
        }}
      />
    </>
  );
};

export default HumanBeingForm;
