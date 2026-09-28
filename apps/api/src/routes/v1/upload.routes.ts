import { FastifyPluginAsync } from 'fastify';
import { UploadService } from '../../services/upload.service';
import { authenticate } from '../../middleware/auth.js';
import { z } from 'zod';
import { sendSuccess, sendError } from '../../middleware/response.js';

const uploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});

const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate);

  fastify.post('/presigned-url', async (request, reply) => {
    try {
      // Only admins/managers can upload
      if (!['SUPER_ADMIN', 'STORE_MANAGER'].includes(request.user!.role)) {
        return sendError(reply, 'Forbidden', 403);
      }

      const { fileName, contentType } = uploadSchema.parse(request.body);
      const data = await UploadService.getPresignedUrl(fileName, contentType);
      return sendSuccess(reply, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(reply, error.errors[0].message, 400);
      }
      return sendError(reply, 'Failed to generate upload URL');
    }
  });
};

export default uploadRoutes;