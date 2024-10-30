import { IconButton, TextField, Tooltip } from "@mui/material";
import { FormEvent, useRef, useState } from "react";
import { AlertInfo } from "../../custom-alert";
import { blobToString, getTrimmed, resizeImage } from "../../../utils";
import { useGlobalState } from "../../../global-state-context";
import Button from "../../button/button";
import {
  editData,
  generateDocId,
  insertData,
  uploadFile,
} from "../../../apis/firebase";
import { Product } from "../../../types";
import { CancelOutlined, FileUploadOutlined } from "@mui/icons-material";

type Props = {
  isWaitingAsync: boolean;
  setIsWaitingAsync: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertInfo: React.Dispatch<React.SetStateAction<AlertInfo | undefined>>;
  close: () => void;
  editingData?: Product;
};

type RegisterProductType = {
  name: string;
  price: string;
  photoSrc?: string;
};

function getInitialData(editingData?: Product): RegisterProductType {
  const data: RegisterProductType = {
    name: editingData?.name || "",
    price: editingData?.price.toFixed(2).replace(".", ",") || "",
  };
  if (!!editingData?.photoSrc) data.photoSrc = editingData.photoSrc;

  return data;
}

export default function ProductForm({
  isWaitingAsync,
  setIsWaitingAsync,
  setAlertInfo,
  close,
  editingData,
}: Props) {
  const globalState = useGlobalState();
  const isEditing = !!editingData;

  const [data, setData] = useState(getInitialData(editingData));

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isWaitingAsync) return;

    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];
      setIsWaitingAsync(true);
      try {
        const resizedImage = await resizeImage(image, 300, 300);
        setData({ ...data, photoSrc: await blobToString(resizedImage) });
      } catch (e) {
        console.log(e);
        setAlertInfo({
          severity: "error",
          message: "Falha ao tentar carregar imagem",
        });
      } finally {
        setIsWaitingAsync(false);
        e.target.value = "";
      }
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWaitingAsync || !globalState) return;

    try {
      setIsWaitingAsync(true);
      const trimmedData = getTrimmed(data);
      setData({ ...trimmedData });

      let id: string | undefined = undefined;
      const finalData: any = { ...trimmedData };
      finalData.price = Number(finalData.price.replace(",", "."));

      if (isNaN(finalData.price) || finalData.price <= 0)
        return setAlertInfo({
          severity: "error",
          message: `Preço inválido`,
        });

      finalData.photoSrc = finalData.photoSrc || "";
      if (isEditing) {
        if (editingData.photoSrc === finalData.photoSrc) {
          delete finalData.photoSrc;
        } else if (!!finalData.photoSrc) {
          const response = await fetch(finalData.photoSrc);
          const blob = await response.blob();
          finalData.photoSrc = await uploadFile(
            editingData.id,
            "photo.png",
            blob
          );
        }
      } else if (!!finalData.photoSrc) {
        id = generateDocId("products");
        const response = await fetch(finalData.photoSrc);
        const blob = await response.blob();
        finalData.photoSrc = await uploadFile(id, "photo.png", blob);
      }

      let err = "";
      if (isEditing) {
        err = await editData("products", editingData.id, finalData);
      } else {
        err = await insertData("products", finalData);
      }

      if (!err) {
        setAlertInfo({
          severity: "success",
          message: `Produto ${isEditing ? "editado" : "cadastrado"}`,
        });
        close();
      } else {
        setAlertInfo({
          severity: "error",
          message: err,
        });
      }
    } catch (e) {
      console.log(e);
      setAlertInfo({
        severity: "error",
        message: `Falha ao tentar ${
          isEditing ? "editar" : "cadastrar"
        } produto`,
      });
    } finally {
      setIsWaitingAsync(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={fileInputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
        type="file"
        accept="image/*"
      />

      <div className="two-fields-container">
        <TextField
          label="Nome"
          variant="outlined"
          type="text"
          required
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <TextField
          label="Preço"
          variant="outlined"
          type="text"
          inputProps={{
            pattern: "^[0-9]+(,[0-9]{1,2})?$",
            title: "O CEP deve possuir 8 dígitos",
          }}
          required
          value={data.price}
          onChange={(e) => {
            const value = e.target.value.trim().replace(".", ",");
            const priceRegex = /^\d+(,\d{0,2})?$/;
            if (value === "" || priceRegex.test(value))
              setData({ ...data, price: value });
          }}
        />
      </div>  
      <label className="label-file-input">Faça o upload de uma foto</label>
      <div className="file-input-container">
        <IconButton
          className="clear-btn"
          color="error"
          disabled={isWaitingAsync || !data.photoSrc}
          onClick={() => {
            delete data.photoSrc;
            setData({ ...data });
          }}
        >
          <CancelOutlined />
        </IconButton>
        {!!data.photoSrc ? (
          <img src={data.photoSrc} draggable={false} alt="Foto do produto" />
        ) : (
          <Tooltip title="Fazer upload de foto">
            <button
              className="button-file-input"
              onClick={() => fileInputRef.current?.click()}
              disabled={isWaitingAsync}
            >
              <FileUploadOutlined />
            </button>
          </Tooltip>
        )}
      </div>

      <Button type="submit" disabled={isWaitingAsync}>
        {isEditing ? "Editar" : "Cadastrar"}
      </Button>
    </form>
  );
}
