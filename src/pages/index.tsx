import ShowDivisionParent from "@/components/controls/ShowDivisionParent";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import ModalTransition from "@/components/dialogs/ModalTransition";
import DeleteMultiple from "@/components/displays/DeleteMultiple";
import CustomMenu from "@/components/displays/StyledMenu";
import DivisionForm from "@/components/forms/DivisionForm";
import type { MyPage } from "@/components/layouts/layoutTypes";
import { getServerAuthSession } from "@/server/auth";
import type { PaginationResponse } from "@/types/api-response";
import type { IDivision } from "@/types/division";
import type { FormSlugType } from "@/types/global";
import type { WorkerPathType } from "@/types/worker";
import { useAppStore } from "@/utils/store";
import Add from "@mui/icons-material/Add";
import DeleteForever from "@mui/icons-material/DeleteForever";
import Edit from "@mui/icons-material/Edit";
import Refresh from "@mui/icons-material/Refresh";
import Visibility from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  type GridColDef,
  type GridInputRowSelectionModel,
  type GridRenderCellParams,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { api } from "@/utils/api";

const title = "Division";
const path: WorkerPathType = "division";
const pathname = "";

const Home: MyPage = () => {
  const router = useRouter();

  const [rows, setRows] = useState<IDivision[]>([]);
  const [countAll, setCountAll] = useState<number>(0);
  const [selectionModel, setSelectionModel] =
    useState<GridInputRowSelectionModel>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { search } = useAppStore();

  const { data, refetch, isFetching } = api.division.findAll.useQuery(
    {
      cursor: paginationModel.page + 1,
      search,
    },
    {
      getNextPageParam: (lastPage: PaginationResponse<IDivision>) =>
        typeof lastPage.meta.current_page === "number" && rows.length < countAll
          ? (lastPage.meta.current_page ?? 1) + 1
          : undefined,
    },
  );

  const handleSelectionChange = (params: GridRowSelectionModel) => {
    setSelectionModel(params);
  };

  const mutationDelete = api.division.destroy.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleDelete = (): void => {
    if (!selectedId) return;

    mutationDelete.mutate({ id: String(selectedId) });
    setSelectedId(null);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 150,
      // editable: true,
    },
    {
      field: "divisionParent",
      headerName: "Division Parent",
      // description: "This column has a value getter and is not sortable.",
      // sortable: false,
      width: 160,
      renderCell: (params: GridRenderCellParams<IDivision>) => (
        <ShowDivisionParent id={params.row.division_id} />
      ),
    },
    {
      field: "deskripsi",
      headerName: "Description",
      width: 150,
      // editable: true,
    },
    {
      field: "actions",
      type: "actions",
      width: 80,
      renderCell: (params: GridRenderCellParams<IDivision>) => {
        const id = params.row.id;
        return (
          <CustomMenu
            id={id}
            menus={[
              {
                icon: <Visibility />,
                label: "Lihat",
                onClick: (params) => {
                  if (params) {
                    void router.push(
                      {
                        pathname,
                        query: {
                          slug: ["v", String(params)],
                        },
                      },
                      `${pathname}/v/${String(params)}`,
                    );
                  }
                },
              },
              {
                icon: <Edit />,
                label: "Sunting",
                onClick: (params) => {
                  if (params) {
                    void router.push(
                      {
                        pathname,
                        query: {
                          slug: ["f", String(params)],
                        },
                      },
                      `${pathname}/f/${String(params)}`,
                    );
                  }
                },
              },
              {
                icon: <DeleteForever />,
                label: "Hapus",
                onClick: (params) => params && setSelectedId(params),
              },
            ]}
          />
        );
      },
    },
  ];

  useEffect(() => {
    if (data) {
      const dataRows: IDivision[] = data.data;
      const dataCountAll: number = data.meta.total ?? 0;
      setRows(dataRows);
      setCountAll(dataCountAll);
    }
  }, [data]);

  useEffect(() => {
    void refetch();
  }, [router.query.slug, refetch]);

  useEffect(() => {
    if (
      typeof router.query.page === "string" &&
      !isNaN(Number(router.query.page))
    ) {
      setPaginationModel((prev) => ({
        ...prev,
        page: Number(router.query.page) - 1,
      }));
    }
  }, [router.query.page]);

  return (
    <>
      <Head>
        <title>CRUD Test - Division</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col gap-2">
        <Box
          component={Paper}
          elevation={4}
          className="flex flex-col gap-2 p-4"
        >
          <Box className="mb-2 flex flex-col items-center md:flex-row md:justify-between">
            <Typography variant="h5" gutterBottom>
              {title}
            </Typography>
            <div className="flex flex-col items-center justify-center gap-2 md:flex-row">
              <DeleteMultiple
                path={path}
                ids={selectionModel as string[]}
                handleRefresh={() => void refetch()}
              />
              <IconButton onClick={() => void refetch()}>
                <Refresh />
              </IconButton>
              <Link
                href={{
                  pathname,
                  query: { slug: ["f"] },
                }}
                as={`${pathname}/f`}
              >
                <Button variant="contained" endIcon={<Add />}>
                  Add New
                </Button>
              </Link>
            </div>
          </Box>
          <Box sx={{ height: 650, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={isFetching}
              checkboxSelection
              disableRowSelectionOnClick
              rowCount={countAll}
              paginationModel={paginationModel}
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={handleSelectionChange}
              paginationMode="server"
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10]}
            />
          </Box>
        </Box>
        {router.query.slug && (
          <ModalTransition
            open
            handleClose={router.back}
            maxWidth="md"
            fullWidth
            scroll="paper"
          >
            <DivisionForm
              slug={router.query.slug as FormSlugType}
              showIn="popup"
            />
          </ModalTransition>
        )}
        {typeof selectedId === "number" && (
          <ConfirmationDialog
            open={typeof selectedId === "number"}
            title="Delete Confirmation"
            message="Are you sure to delete this item?"
            onClose={() => setSelectedId(null)}
            onSubmit={handleDelete}
            confirmColor="error"
          />
        )}
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default Home;
Home.Layout = "Dashboard";
