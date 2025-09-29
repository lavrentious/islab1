import { useEffect, useState } from "react";
import { FormControl, Pagination } from "react-bootstrap";

interface PaginatorProps {
  page: number;
  setPage: (page: number) => void;
  limit: number;
  totalPages: number;
  totalCount?: number;
}

export function Paginator({
  page,
  totalPages,
  setPage,
  totalCount,
  limit,
}: PaginatorProps) {
  const [showInputLeft, setShowInputLeft] = useState(false);
  const [showInputRight, setShowInputRight] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (totalPages < page) setPage(totalPages);
  }, [page, setPage, totalPages]);

  const handlePageInput = () => {
    const parsed = parseInt(inputValue);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      setPage(parsed);
    }
    setShowInputLeft(false);
    setShowInputRight(false);
    setInputValue("");
  };

  const createPaginationItems = () => {
    const items: React.ReactNode[] = [];
    const delta = 2;
    const range: (number | "ellipsis-left" | "ellipsis-right")[] = [];

    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    range.push(1);

    if (left > 2) {
      range.push("ellipsis-left");
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) {
      range.push("ellipsis-right");
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    for (const item of range) {
      if (item === "ellipsis-left") {
        if (showInputLeft) {
          items.push(
            <Pagination.Item key="input-left" active>
              <FormControl
                type="number"
                size="sm"
                style={{ width: 70 }}
                autoFocus
                min={1}
                max={totalPages}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handlePageInput}
                onKeyDown={(e) => e.key === "Enter" && handlePageInput()}
              />
            </Pagination.Item>,
          );
        } else {
          items.push(
            <Pagination.Item
              key="ellipsis-left"
              onClick={() => {
                setShowInputLeft(true);
                setShowInputRight(false);
              }}
            >
              …
            </Pagination.Item>,
          );
        }
      } else if (item === "ellipsis-right") {
        if (showInputRight) {
          items.push(
            <Pagination.Item key="input-right" active>
              <FormControl
                type="number"
                size="sm"
                style={{ width: 70 }}
                autoFocus
                min={1}
                max={totalPages}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handlePageInput}
                onKeyDown={(e) => e.key === "Enter" && handlePageInput()}
              />
            </Pagination.Item>,
          );
        } else {
          items.push(
            <Pagination.Item
              key="ellipsis-right"
              onClick={() => {
                setShowInputRight(true);
                setShowInputLeft(false);
              }}
            >
              …
            </Pagination.Item>,
          );
        }
      } else {
        items.push(
          <Pagination.Item
            key={item}
            active={item === page}
            onClick={() => setPage(Number(item))}
          >
            {item}
          </Pagination.Item>,
        );
      }
    }

    return items;
  };

  return (
    <>
      <Pagination className="flex-wrap">
        <Pagination.Prev
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        />
        {createPaginationItems()}
        <Pagination.Next
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        />
      </Pagination>
      {totalCount === 0 && (
        <small className="text-muted">Нет результатов</small>
      )}
      {totalCount != null && totalCount > 0 && (
        <small className="text-muted">
          Показано {limit * (page - 1) + 1}-
          {Math.min(totalCount, limit * (page - 1) + limit)} из {totalCount}
        </small>
      )}
    </>
  );
}
