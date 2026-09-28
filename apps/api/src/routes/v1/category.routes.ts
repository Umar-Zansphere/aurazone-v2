import type { FastifyPluginAsync } from "fastify";
import { parsePagination } from "@aurazone/utils";
import { sendSuccess, sendError, sendPaginated } from "../../middleware/response.js";
import * as categoryService from "../../services/category.service.js";

const categoryRoutes: FastifyPluginAsync = async (fastify) => {
  // ─── GET / — List categories (public, filter by store) ────────
  fastify.get("/", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const { skip, take } = parsePagination(query.skip, query.take);

    const { categories, total } = await categoryService.listCategories({
      storeId: query.storeId,
      activeOnly: true,
      parentId: query.rootOnly === "true" ? null : undefined,
      search: query.search,
      skip,
      take,
    });

    return sendPaginated(reply, categories, total, Math.floor(skip / take) + 1, take);
  });

  // ─── GET /:storeSlug/:categorySlug — Get category by slug ────
  fastify.get("/:storeSlug/:categorySlug", async (request, reply) => {
    const { storeSlug, categorySlug } = request.params as {
      storeSlug: string;
      categorySlug: string;
    };

    try {
      const category = await categoryService.getCategoryBySlug(storeSlug, categorySlug);
      return sendSuccess(reply, category);
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });
};

export default categoryRoutes;