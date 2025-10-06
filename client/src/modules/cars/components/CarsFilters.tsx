import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { FindAllCarsQueryParamsDto } from "../api/types";

interface CarsFiltersProps {
  initialFilters?: Partial<FindAllCarsQueryParamsDto>;
  onChange: (filters: Partial<FindAllCarsQueryParamsDto>) => void;
  onReset?: () => void;
  disabled?: boolean;
}

const CarsFilters: React.FC<CarsFiltersProps> = ({
  initialFilters = {},
  onChange,
  onReset,
  disabled,
}) => {
  const [filters, setFilters] =
    useState<Partial<FindAllCarsQueryParamsDto>>(initialFilters);

  const handleInputChange = (
    field: keyof FindAllCarsQueryParamsDto,
    value: FindAllCarsQueryParamsDto[keyof FindAllCarsQueryParamsDto],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
  };

  const handleBooleanChange = (
    field: keyof FindAllCarsQueryParamsDto,
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
      <Row className="g-3 align-items-end">
        {/* Name filter */}
        <Col md={6}>
          <Form.Group controlId="filterCarName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by car name"
              value={filters.name ?? ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={disabled}
            />
          </Form.Group>
        </Col>

        {/* Cool filter */}
        <Col md={6}>
          <Form.Group controlId="filterCarCool">
            <Form.Label>Cool</Form.Label>
            <Form.Select
              value={
                filters.cool === undefined
                  ? ""
                  : filters.cool === null
                    ? "null"
                    : String(filters.cool)
              }
              onChange={(e) => handleBooleanChange("cool", e.target.value)}
              disabled={disabled}
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

export default CarsFilters;
