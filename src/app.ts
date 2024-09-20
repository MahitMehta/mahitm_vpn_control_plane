import { join } from 'node:path';
import AutoLoad from '@fastify/autoload';
import FastifyWebSocket from "@fastify/websocket";
import type { FastifyPluginAsync } from "fastify";
import FastifyFirebase from './plugins/firestore';

const app: FastifyPluginAsync = async (
    fastify,
    opts
): Promise<void> => {
  fastify.register(FastifyFirebase)
  fastify.register(FastifyWebSocket, {
    options: { 
      maxPayload: 1048576, 
    },
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
};

export default app;
