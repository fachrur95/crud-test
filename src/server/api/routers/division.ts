import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import axios from "axios";
import { env } from "@/env";
import { z } from "zod";
import type { ApiCatchError, ApiResponse, PaginationResponse } from "@/types/api-response";
import type { IDivision } from "@/types/division";

export const defaultUndefinedResult: PaginationResponse<IDivision> = {
  data: [],
  code: 200,
  message: "Empty Data",
  success: true,
  meta: {
    next_page_url: null,
    prev_page_url: null,
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
}

const GLOBAL_URL = `${env.BACKEND_URL}/api/v1/division`;

const getDetailDivision = async (token: string, id: string): Promise<IDivision | null> => {
  return axios.get<ApiResponse<IDivision>>(
    `${GLOBAL_URL}/${id}`,
    {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` },
    }
  ).then((response) => {
    const dataResult = response.data.data;
    return dataResult;
  }).catch((err) => {
    console.log(err)
    return null;
  });
}

export const divisionRouter = createTRPCRouter({
  findAll: protectedProcedure.input(
    z.object({
      cursor: z.union([z.string(), z.number()]).nullish(),
      search: z.string().nullish(),
    }),
  ).query(async ({ ctx, input }) => {
    const { cursor, search } = input;

    let url = `${GLOBAL_URL}?page=${cursor ?? 1}`;

    if (search && search !== "") {
      url += `&search=${search}`;
    }

    const result = await axios.get<PaginationResponse<IDivision>>(
      url,
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${ctx.session.accessToken}` },
      }
    ).then((response) => {
      return response.data;
    }).catch((err) => {
      console.log(err)
      return defaultUndefinedResult;
    });

    return result;
  }),
  findOne: protectedProcedure.input(
    z.object({
      id: z.string(),
    }),
  ).query(async ({ ctx, input }) => {
    const dataSelected = await getDetailDivision(ctx.session.accessToken, input.id);
    if (!dataSelected) {
      return null;
    }
    const idParent = dataSelected.division_id;

    let dataParent: IDivision | null = null;
    if (idParent) {
      dataParent = await getDetailDivision(ctx.session.accessToken, String(idParent));
    }

    return { ...dataSelected, divisionParent: dataParent } as IDivision
  }),
  create: protectedProcedure.input(
    z.object({
      name: z.string(),
      division_id: z.number().nullish(),
      deskripsi: z.string().nullish(),
    }),
  ).mutation(async ({ ctx, input }) => {
    try {
      const result = await axios.post<ApiResponse<IDivision>>(
        `${GLOBAL_URL}`,
        input,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${ctx.session.accessToken}` },
        }
      ).then((response) => {
        return response.data;
      });

      return result;
    } catch (error) {
      throw new Error((error as ApiCatchError).response?.data?.message ?? (error as ApiCatchError).message ?? "An error occurred");
    }
  }),
  update: protectedProcedure.input(
    z.object({
      id: z.string(),
      name: z.string(),
      division_id: z.number().nullish(),
      deskripsi: z.string().nullish(),
    }),
  ).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input
    try {
      const result = await axios.put<ApiResponse<boolean>>(
        `${GLOBAL_URL}/${id}`,
        data,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${ctx.session.accessToken}` },
        }
      ).then((response) => {
        return response.data;
      });

      return result;
    } catch (error) {
      throw new Error((error as ApiCatchError).response?.data?.message ?? (error as ApiCatchError).message ?? "An error occurred");
    }
  }),
  destroy: protectedProcedure.input(
    z.object({
      id: z.string(),
    }),
  ).mutation(async ({ ctx, input }) => {
    try {
      const result = await axios.delete<ApiResponse<boolean>>(
        `${GLOBAL_URL}/${input.id}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${ctx.session.accessToken}` },
        }
      ).then((response) => {
        return response.data;
      });

      return result;
    } catch (error) {
      throw new Error((error as ApiCatchError).response?.data?.message ?? (error as ApiCatchError).message ?? "An error occurred");
    }
  }),
});
