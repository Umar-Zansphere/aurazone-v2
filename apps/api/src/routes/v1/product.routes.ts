import type { FastifyPluginAsync } from "fastify";
import { parsePagination } from "@aurazone/utils";
import { sendSuccess, sendError, sendPaginated } from "../../middleware/response.js";
import * as productService from "../../services/product.service.js";

const productRoutes: FastifyPluginAsync = async (fastify) => {
  // ─── GET / — List products (public) ───────────────────────────
  fastify.get("/", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const { skip, take } = parsePagination(query.skip, query.take);

    const { products, total } = await productService.listProducts({
      storeId: query.storeId,
      categoryId: query.categoryId,
      search: query.search,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      isActive: true,
      sortBy: query.sortBy,
      skip,
      take,
    });

    return sendPaginated(reply, products, total, Math.floor(skip / take) + 1, take);
  });

  // ─── GET /:slug — Get product by slug (public) ────────────────
  fastify.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };

    try {
      const product = await productService.getProductBySlug(slug);
      return sendSuccess(reply, product);
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });
};

export default productRoutes;