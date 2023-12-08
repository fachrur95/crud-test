import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import {
  FormContainer,
  TextFieldElement,
  TextareaAutosizeElement,
  useForm,
} from "react-hook-form-mui";
import Close from "@mui/icons-material/Close";
import Edit from "@mui/icons-material/Edit";
import Save from "@mui/icons-material/Save";
import { api } from "@/utils/api";
import Link from "next/link";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import type { FormSlugType } from "@/types/global";
import type { IDivisionMutation } from "@/types/division";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { useRouter } from "next/router";
import useNotification from "@/components/hooks/useNotification";
import AutoCompleteDivision from "@/components/controls/AutoCompletes/AutoCompleteDivision";
import type { IDataOption } from "@/types/options";

interface IDivisionForm {
  slug: FormSlugType;
  showIn: "popup" | "page";
}

const basePath = "/";

const defaultValues: IDivisionMutation = {
  division_id: null,
  name: "",
  deskripsi: "",
  divisionParent: null,
};

const DivisionForm = (props: IDivisionForm) => {
  const { slug, showIn } = props;

  const router = useRouter();
  const [mode, setMode] = useState<"create" | "update" | "view">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const formContext = useForm<IDivisionMutation>({ defaultValues });
  const { setOpenNotification } = useNotification();

  const {
    setValue,
    formState: { isSubmitting },
    handleSubmit,
    setError,
  } = formContext;

  const { data: dataSelected, isFetching: isFetchingSelected } =
    api.division.findOne.useQuery(
      { id: selectedId ?? "" },
      {
        enabled: !!selectedId,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    );

  const mutationCreate = api.division.create.useMutation({
    onSuccess: () => void router.push(basePath),
    onError: (error) => {
      if (error.message) {
        setOpenNotification(error.message, { variant: "error" });
      }
      const errors = error.data?.zodError?.fieldErrors;
      if (errors) {
        for (const field in errors) {
          void setError(field as keyof IDivisionMutation, {
            type: "custom",
            message: errors[field]?.join(", "),
          });
        }
      }
    },
  });

  const mutationUpdate = api.division.update.useMutation({
    onSuccess: (data) => {
      setOpenNotification(data.message, { variant: "success" });
      void router.push(basePath);
    },
    onError: (error) => {
      if (error.message) {
        setOpenNotification(error.message, { variant: "error" });
      }
      const errors = error.data?.zodError?.fieldErrors;
      if (errors) {
        for (const field in errors) {
          void setError(field as keyof IDivisionMutation, {
            type: "custom",
            message: errors[field]?.join(", "),
          });
        }
      }
    },
  });

  const onSubmit = (data: IDivisionMutation) => {
    if (selectedId) {
      return void mutationUpdate.mutate({
        ...data,
        id: selectedId,
        division_id: data.divisionParent?.id ?? null,
      });
    }
    return void mutationCreate.mutate({
      ...data,
      division_id: data.divisionParent?.id ?? null,
    });
  };

  useEffect(() => {
    const [path, id] = slug;
    if ((path === "f" || path === "v") && typeof id === "string") {
      setSelectedId(id);
    }
    if (path === "f" && typeof id === "string") {
      setMode("update");
    }
    if (path === "v" && typeof id === "string") {
      setMode("view");
    }
    if (path !== "f" && path !== "v") {
      setMode("create");
    }
  }, [slug]);

  useEffect(() => {
    if (dataSelected) {
      for (const key in dataSelected) {
        if (Object.prototype.hasOwnProperty.call(dataSelected, key)) {
          if (key === "divisionParent") {
            const dataParent = dataSelected[key];
            if (dataParent) {
              const selectedParent: IDataOption = {
                id: dataParent.id,
                label: dataParent.name,
              };
              setValue(key, selectedParent);
            }
            continue;
          }
          if (key === "name" || key === "deskripsi" || key === "division_id") {
            setValue(key, dataSelected[key]);
          }
        }
      }
    }
  }, [dataSelected, setValue]);

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isFetchingSelected}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* component={showIn === "page" ? Paper : undefined} */}
      <DialogTitle>
        <Box
          component={showIn === "page" ? Paper : undefined}
          className={`flex items-center justify-between ${
            showIn === "page" ? "px-4 py-2" : ""
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <Link href={basePath}>
              <IconButton color="error">
                <Close />
              </IconButton>
            </Link>
            <Typography variant="h6">Division Form</Typography>
          </div>
          <div>
            {mode === "view" && selectedId ? (
              <Button
                variant="contained"
                type="button"
                size="large"
                fullWidth
                startIcon={<Edit />}
                onClick={() => router.push(`${basePath}/f/${selectedId}`)}
              >
                Edit
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                size="large"
                disabled={isSubmitting}
                fullWidth
                startIcon={<Save />}
                onClick={() => handleSubmit(onSubmit)()}
              >
                Save
              </Button>
            )}
          </div>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FormContainer formContext={formContext} onSuccess={onSubmit}>
          <div className="grid gap-4">
            <Box component={Paper} className="grid grid-cols-1 gap-4 p-4">
              <AutoCompleteDivision
                name="divisionParent"
                label="Division Parent (Optional)"
                autocompleteProps={{
                  disabled: mode === "view",
                }}
              />
              <TextFieldElement
                name="name"
                label="Name"
                InputProps={{
                  disabled: mode === "view",
                }}
                autoFocus
              />
              <TextareaAutosizeElement
                name="deskripsi"
                label="Description"
                rows={3}
                className="col-start-1"
                disabled={mode === "view"}
              />
            </Box>
            <Button type="submit" disabled={isSubmitting} className="hidden">
              Save
            </Button>
          </div>
        </FormContainer>
      </DialogContent>
    </>
  );
};

export default DivisionForm;
