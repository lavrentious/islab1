import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { formatApiError } from "src/modules/common/api/utils";
import { useUploadImportFileMutation } from "../api";

const ImportUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadImportFile, { isLoading }] = useUploadImportFileMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    await uploadImportFile(file)
      .unwrap()
      .then(() => {
        toast.success("file uploaded");
        setFile(null);
      })
      .catch((e) => {
        toast.error(formatApiError(e));
      });
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-3">
      <Form.Group controlId="importFile">
        <Form.Label>Choose import file</Form.Label>
        <Form.Control
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFile(e.target.files ? e.target.files[0] : null)
          }
        />
      </Form.Group>

      <Button
        type="submit"
        className="mt-3"
        disabled={!file || isLoading}
        variant="primary"
      >
        {isLoading ? "Uploading..." : "Upload"}
      </Button>
    </Form>
  );
};

export default ImportUploadForm;
