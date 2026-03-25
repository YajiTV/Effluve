import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const expected = process.env.PRISMA_API_TOKEN;
  if (!expected) return next();
  if (req.headers.authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
  return next();
});

const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  passwordHash: z.string().min(20),
  role: z.enum(["customer", "admin"]).default("customer")
});

const updateUserSchema = createUserSchema.partial();

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "prisma-bridge" });
});

app.get("/users", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.get("/users/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        wishlist: { include: { product: true } }
      }
    });
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

app.get("/users/:id/orders", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const orders = await prisma.order.findMany({
      where: { userId: id },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

app.post("/users", async (req, res, next) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        fullName: payload.fullName,
        passwordHash: payload.passwordHash,
        role: payload.role
      }
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

app.patch("/users/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const payload = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.fullName ? { fullName: payload.fullName } : {}),
        ...(payload.passwordHash ? { passwordHash: payload.passwordHash } : {}),
        ...(payload.role ? { role: payload.role } : {})
      }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

app.delete("/users/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: "VALIDATION_ERROR", details: error.flatten() });
  }
  console.error(error);
  return res.status(500).json({ error: "INTERNAL_ERROR" });
});

const port = Number(process.env.PRISMA_API_PORT ?? 4010);
app.listen(port, () => {
  console.log(`Prisma bridge listening on :${port}`);
});
