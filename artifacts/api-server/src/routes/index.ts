import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import chatRouter from "./chat.js";
import documentsRouter from "./documents.js";
import complianceRouter from "./compliance.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/chat", chatRouter);
router.use("/documents", documentsRouter);
router.use("/compliance", complianceRouter);

export default router;
