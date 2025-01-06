import { Response, Request, NextFunction } from "express";

export function isValidUUID(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Regular expression to match UUID v4 format
  const id = req.params.id;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    res.status(400).json({ error: "Invalid UUID format" });
    return;
  }

  next();
}

export function validateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const clientApiKey = req.header("x-api-key");
  const serverApiKey = process.env.API_KEY;

  if (!clientApiKey || clientApiKey !== serverApiKey) {
    res.status(403).json({ error: "Forbidden: Invalid API Key" });
    return;
  }

  next();
}
