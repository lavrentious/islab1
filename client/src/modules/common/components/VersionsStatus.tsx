import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Badge } from "react-bootstrap";

const VersionsStatus = () => {
  const clientStatus = {
    version: __APP_VERSION__,
    lastCommitDate: import.meta.env.VITE_LAST_COMMIT_DATE,
  };
  const [serverStatus, setServerStatus] = useState<{
    version: string;
    lastCommitDate: string;
  } | null>(null);

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_BASE_URL).then(({ data }) => {
      if (data.version && data.lastCommitDate) {
        setServerStatus({
          version: data.version,
          lastCommitDate: data.lastCommitDate,
        });
      }
    });
  }, []);

  return (
    <pre>
      client:
      <Badge
        title={dayjs(clientStatus.lastCommitDate).format("LLL")}
        style={{ cursor: "help" }}
      >
        {clientStatus.version}
      </Badge>
      <br />
      {serverStatus && (
        <>
          server:
          <Badge
            title={dayjs(serverStatus?.lastCommitDate).format("LLL")}
            style={{ cursor: "help" }}
          >
            {serverStatus?.version}
          </Badge>
        </>
      )}
    </pre>
  );
};

export default VersionsStatus;
