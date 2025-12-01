import { SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { Container } from "react-bootstrap";
import toast from "react-hot-toast";
import { formatApiError } from "src/modules/common/api/utils";
import {
  useFindAllImportOpsQuery,
  useLazyGetFileDownloadUrlQuery,
} from "../api";
import { ImportStatus } from "../api/types";
import ImportOperationsTable from "../components/ImportOperationsTable";
import ImportUploadForm from "../components/ImportUploadForm";

const ImportsPage = () => {
  const { data: allImports, isLoading } = useFindAllImportOpsQuery(void 0, {
    pollingInterval: 5000,
  });
  const [sorting] = useState<SortingState>([]);
  const [getFileDownloadUrl] = useLazyGetFileDownloadUrlQuery();

  return (
    <Container>
      <h1>Imports</h1>
      <ImportUploadForm />
      <ImportOperationsTable
        items={allImports ?? null}
        sorting={sorting}
        isLoading={isLoading}
        onRowSelect={({ id, status }) => {
          if (status !== ImportStatus.SUCCESS) return;
          toast
            .promise(getFileDownloadUrl(id).unwrap(), {
              loading: "Getting link...",
              success: "Downloading",
              error: formatApiError,
            })
            .then(({ url }) => {
              window.open(url, "_blank");
            });
        }}
      />
    </Container>
  );
};

export default ImportsPage;
