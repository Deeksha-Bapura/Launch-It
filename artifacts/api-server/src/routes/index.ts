import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import chatRouter from "./chat.js";
import documentsRouter from "./documents.js";
import complianceRouter from "./compliance.js";
import authRouter from "./auth.js";
import transactionsRouter from "./transactions.js";
import conversationsRouter from "./conversations.js";
import marketingRouter from "./marketing.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/chat", isAuthenticated, chatRouter);
router.use("/documents", isAuthenticated, documentsRouter);
router.use("/compliance", isAuthenticated, complianceRouter);
router.use("/transactions", isAuthenticated, transactionsRouter);
router.use("/conversations", isAuthenticated, conversationsRouter);
router.use("/marketing", isAuthenticated, marketingRouter);

export default router;
