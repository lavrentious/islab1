import { SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { Container } from "react-bootstrap";
import { useFindAllImportOpsQuery } from "../api";
import ImportOperationsTable from "../components/ImportOperationsTable";
import ImportUploadForm from "../components/ImportUploadForm";

const ImportsPage = () => {
  const { data: allImports, isLoading } = useFindAllImportOpsQuery(void 0, {
    pollingInterval: 5000,
  });
  const [sorting] = useState<SortingState>([]);

  return (
    <Container>
      <h1>Imports</h1>
      <ImportUploadForm />
      <ImportOperationsTable
        items={allImports ?? null}
        sorting={sorting}
        isLoading={isLoading}
        onRowSelect={() => {}}
      />
    </Container>
  );
};

export default ImportsPage;
