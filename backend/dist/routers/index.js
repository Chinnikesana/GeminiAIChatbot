import { Router } from 'express';
import userRoutes from './user-routes.js';
import chatRouters from './chat-routes.js';
// import mongoose from 'mongoose';
const appRouter = Router();
appRouter.use("/user", userRoutes);
appRouter.use("/chat", chatRouters);
export default appRouter;
//# sourceMappingURL=index.js.map