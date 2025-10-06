import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import NullableCheckBox from "src/modules/common/components/NullableCheckBox";
import {
  FindAllHumanbeingsQueryParamsDto,
  Mood,
  WeaponType,
} from "../api/types";

interface HumanBeingsFiltersProps {
  initialFilters?: Partial<FindAllHumanbeingsQueryParamsDto>;
  onChange: (filters: Partial<FindAllHumanbeingsQueryParamsDto>) => void;
  onReset?: () => void;
  disabled?: boolean;
}

const HumanBeingsFilters: React.FC<HumanBeingsFiltersProps> = ({
  initialFilters = {},
  onChange,
  onReset,
  disabled,
}) => {
  const [filters, setFilters] =
    useState<Partial<FindAllHumanbeingsQueryParamsDto>>(initialFilters);

  const handleInputChange = (
    field: keyof FindAllHumanbeingsQueryParamsDto,
    value: FindAllHumanbeingsQueryParamsDto[keyof FindAllHumanbeingsQueryParamsDto],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
  };

  const handleBooleanChange = (
    field: keyof FindAllHumanbeingsQueryParamsDto,
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]:
        value === ""
          ? undefined
          : value === "true"
            ? true
            : value === "false"
              ? false
              : null,
    }));
  };

  const applyFilters = () => {
    onChange(filters);
  };

  const resetFilters = () => {
    setFilters({});
    onChange({});
    onReset?.();
  };

  return (
    <Form
      className="mb-3 p-3 border rounded bg-light"
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters();
      }}
    >
      <Row className="g-2">
        <Col md={4}>
          <Form.Group controlId="filterName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name"
              value={filters.name ?? ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="filterSoundtrackName">
            <Form.Label>Soundtrack Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by soundtrack"
              value={filters.soundtrackName ?? ""}
              onChange={(e) =>
                handleInputChange("soundtrackName", e.target.value)
              }
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="filterMood">
            <Form.Label>Mood</Form.Label>
            <Form.Select
              value={filters.mood ?? ""}
              onChange={(e) =>
                handleInputChange("mood", e.target.value || undefined)
              }
            >
              <option value="">Any</option>
              {Object.values(Mood).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="filterWeaponType">
            <Form.Label>Weapon Type</Form.Label>
            <Form.Select
              value={filters.weaponType ?? ""}
              onChange={(e) =>
                handleInputChange("weaponType", e.target.value || undefined)
              }
            >
              <option value="">Any</option>
              {Object.values(WeaponType).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="filterRealHero">
            <Form.Label>Real Hero</Form.Label>
            <Form.Select
              value={
                filters.realHero === undefined ? "" : String(filters.realHero)
              }
              onChange={(e) => handleBooleanChange("realHero", e.target.value)}
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="filterHasToothpick">
            <Form.Label>Has Toothpick</Form.Label>
            <Form.Select
              value={
                filters.hasToothpick === undefined
                  ? ""
                  : filters.hasToothpick === null
                    ? "null"
                    : String(filters.hasToothpick)
              }
              onChange={(e) =>
                handleBooleanChange("hasToothpick", e.target.value)
              }
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
              <option value="null">Null</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Label className="d-block">Has car?</Form.Label>
          <NullableCheckBox
            value={filters.hasCar}
            setValue={(value) =>
              handleBooleanChange("hasCar", value === null ? "" : String(value))
            }
          />
        </Col>

        <Col md={4}>
          <Form.Group controlId="filterCarName">
            <Form.Label>Car Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by car name"
              value={filters.carName ?? ""}
              onChange={(e) => handleInputChange("carName", e.target.value)}
              disabled={filters.hasCar === false}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group controlId="filterCarCool">
            <Form.Label>Car Cool</Form.Label>
            <Form.Select
              value={
                filters.carCool === undefined
                  ? ""
                  : filters.carCool === null
                    ? "null"
                    : String(filters.carCool)
              }
              onChange={(e) => handleBooleanChange("carCool", e.target.value)}
              disabled={filters.hasCar === false}
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
              <option value="null">Null</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3 gap-2">
        <Button variant="secondary" onClick={resetFilters} disabled={disabled}>
          Reset
        </Button>
        <Button
          type="submit"
          variant="primary"
          onClick={applyFilters}
          disabled={disabled}
        >
          Apply
        </Button>
      </div>
    </Form>
  );
};

export default HumanBeingsFilters;
