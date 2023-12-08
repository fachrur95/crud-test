import { postRouter } from "@/server/api/routers/post";
import { divisionRouter } from "@/server/api/routers/division";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  division: divisionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
