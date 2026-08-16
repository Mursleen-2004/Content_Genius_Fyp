// Vercel serverless entrypoint. All routes are rewritten here by vercel.json
// and handed to the Express app, which Vercel invokes as (req, res).
import app from "../server.js";

export default app;
