import React from "react";
import { Badge, Spinner } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useFindHumanBeingVersionsQuery } from "../api";

const HumanBeingVersionsTimeline: React.FC<{ id: number }> = ({ id }) => {
  const navigate = useNavigate();
  const { data: versions, isLoading } = useFindHumanBeingVersionsQuery(id);

  if (isLoading) return <Spinner className="mx-auto" />;
  if (!versions?.length) return <p>No versions found.</p>;

  return (
    <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
      {versions.map((v, idx) => (
        <React.Fragment key={v.id}>
          <div
            className="p-3 border rounded text-center"
            style={{ minWidth: 150, cursor: "pointer" }}
            onClick={() => navigate(`/humanbeings/${v.id}`)}
          >
            <div>
              <strong>v{v._version}</strong>
            </div>
            {v.id === id && (
              <Badge bg="secondary" className="m-1">
                This version
              </Badge>
            )}
            {v._next_version == null && (
              <Badge bg="success" className="m-1">
                Latest
              </Badge>
            )}
            {v._next_version != null && id !== v.id && (
              <Badge className="opacity-0 m-1">-</Badge>
            )}
            <div>#{v.id}</div>
            <small>{new Date(v.creationDate).toLocaleString()}</small>
          </div>
          {idx < versions.length - 1 && (
            <span className="mx-2">
              <FaArrowRight />
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default HumanBeingVersionsTimeline;
