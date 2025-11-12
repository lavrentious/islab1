import React, { useState } from "react";
import { Card, CloseButton, Form } from "react-bootstrap";
import toast from "react-hot-toast";
import { IconBaseProps } from "react-icons";
import { BsFileEarmark, BsFiletypeJson, BsFiletypeYml } from "react-icons/bs";
import { formatApiError } from "src/modules/common/api/utils";
import LoadingButton from "src/modules/common/components/LoadingButton";
import { useUploadImportFileMutation } from "../api";

const MAX_FILES = 13;
const ALLOWED_FILE_EXTENSIONS = ["yaml", "yml", "json"];

const FileIcon: React.FC<{ filename: string } & IconBaseProps> = ({
  filename,
  ...props
}) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "yaml":
    case "yml":
      return <BsFiletypeYml {...props} />;
    case "json":
      return <BsFiletypeJson {...props} />;
    default:
      return <BsFileEarmark {...props} />;
  }
};

const ImportUploadForm = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadImportFile, { isLoading }] = useUploadImportFileMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    let merged: File[] = [];
    if (!selected.length) return;
    for (const f of selected) {
      if (
        !ALLOWED_FILE_EXTENSIONS.includes(
          f.name.split(".").pop()?.toLowerCase() || "",
        )
      ) {
        toast.error(`${f.name} is not a supported file format`);
        continue;
      }
      merged.push(f);
    }

    merged = Array.from(
      new Map([...files, ...merged].map((f) => [f.name, f])).values(),
    ).slice(0, MAX_FILES);

    setFiles(merged);
    e.target.value = "";
  };

  const handleRemove = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) return;

    for (const file of files) {
      uploadImportFile(file)
        .unwrap()
        .catch((e) => {
          toast.error(`${file.name}: ${formatApiError(e)}`);
        });
    }

    setFiles([]);
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-3">
      <Form.Group controlId="importFile">
        <Form.Label>Choose import files (up to {MAX_FILES})</Form.Label>
        <Form.Control
          type="file"
          disabled={isLoading || files.length >= MAX_FILES}
          multiple
          accept={`.${ALLOWED_FILE_EXTENSIONS.join(",.")}`}
          onChange={handleFileChange}
        />
      </Form.Group>

      {files.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {files.map((f) => (
            <Card
              key={f.name}
              className="p-2 position-relative"
              style={{ width: "8rem" }}
            >
              <FileIcon
                filename={f.name}
                className="text-primary mb-2"
                style={{ fontSize: "2rem" }}
              />
              <div className="text-truncate small">{f.name}</div>
              <CloseButton
                onClick={() => handleRemove(f.name)}
                className="position-absolute top-0 end-0 m-1"
              />
            </Card>
          ))}
        </div>
      )}

      <LoadingButton
        type="submit"
        className="mt-3"
        isLoading={isLoading}
        disabled={!files.length}
        variant="primary"
      >
        {isLoading ? "Uploading..." : `Upload ${files.length} file(s)`}
      </LoadingButton>
    </Form>
  );
};

export default ImportUploadForm;
