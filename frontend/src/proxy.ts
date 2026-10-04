import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export const proxyMiddleware = createMiddleware(routing);

export default proxyMiddleware;
