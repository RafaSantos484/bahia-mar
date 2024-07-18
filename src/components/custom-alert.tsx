import { Alert } from "@mui/material";
import { useEffect, useState } from "react";

import { sleep } from "../utils";

export type AlertInfo = {
  severity: "success" | "info" | "warning" | "error";
  message: string;
};
type _AlertInfo = {
  severity: "success" | "info" | "warning" | "error";
  message: string;
  createdAt: number;
};

type Props = {
  alertInfo: AlertInfo | undefined;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  timeout?: number;
};

let lastCreatedAt: number;
const animationTime = 500;

export default function CustomAlert({
  alertInfo,
  setAlertInfo,
  timeout,
}: Props) {
  if (!timeout || timeout < 0) timeout = 3000;

  const [top, setTop] = useState("-10vh");
  const [_alertInfo, set_alertInfo] = useState<_AlertInfo | undefined>(
    undefined
  );

  async function close() {
    setTop("-10vh");
    await sleep(animationTime + 50);

    // if (!!_alertInfo?.onClose) _alertInfo.onClose();
    setAlertInfo(undefined);
    set_alertInfo(undefined);
  }

  useEffect(() => {
    if (!alertInfo) return;

    lastCreatedAt = new Date().valueOf();
    if (!_alertInfo) {
      set_alertInfo({ ...alertInfo, createdAt: lastCreatedAt });
      setTop("2vh");
    } else {
      close().then(() => {
        set_alertInfo({ ...alertInfo, createdAt: lastCreatedAt });
        setTop("2vh");
      });
    }
    // eslint-disable-next-line
  }, [alertInfo]);

  useEffect(() => {
    if (!_alertInfo) return;

    setTimeout(() => {
      if (_alertInfo.createdAt === lastCreatedAt) close();
    }, timeout);
    // eslint-disable-next-line
  }, [_alertInfo]);

  return (
    <div
      style={{
        display: "flex",
        zIndex: 1000,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        justifyContent: "center",
      }}
    >
      <Alert
        style={{
          position: "absolute",
          top,
          transition: `${animationTime}ms`,
        }}
        severity={_alertInfo?.severity}
        onClose={close}
      >
        {_alertInfo?.message}
      </Alert>
    </div>
  );
}
