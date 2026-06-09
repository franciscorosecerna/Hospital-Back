import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  registerUser,
  findUserById,
  findUserByDocumento,
  listUsers,
  editUser,
  changePassword,
  removeUser,
  registerDoctor,
  findDoctorByUserId,
  getDoctorByMatricula,
  getAllDoctors,
  editDoctor,
  removeDoctor,
  registerPatient,
  findPatientByUserId,
  getPatientByHistoriaClinica,
  getAllPatients,
  editPatient,
  removePatient,
  registerNurse,
  findNurseByUserId,
  getNursesByDepartment,
  getNursesByTurno,
  getAllNurses,
  editNurse,
  removeNurse,
} from "./userService";
import {
  baseUserSchema,
  changePasswordSchema,
  createDoctorSchema,
  createNurseSchema,
  createPatientSchema,
  idParamSchema, 
  updateDoctorSchema,
  updateNurseSchema,
  updatePatientSchema,
  updateUserSchema 
} from "./userSchema";

export const userRouter = new Hono();

userRouter.post("/", zValidator("json", baseUserSchema), async (c) => {
  const input = c.req.valid("json");
  const user = await registerUser(input);
  return c.json(user, 201);
});

userRouter.get("/", async (c) => {
  const limit = Number(c.req.query("limit") ?? 50);
  const offset = Number(c.req.query("offset") ?? 0);
  const users = await listUsers(limit, offset);
  return c.json(users);
});

userRouter.get(
  "/by-documento/:tipoDocumento/:documento",
  zValidator(
    "param",
    z.object({ tipoDocumento: z.string(), documento: z.string() })
  ),
  async (c) => {
    const { tipoDocumento, documento } = c.req.valid("param");
    const user = await findUserByDocumento(tipoDocumento, documento);
    return c.json(user);
  }
);

userRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = await findUserById(id);
  return c.json(user);
});

userRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateUserSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const user = await editUser(id, input);
    return c.json(user);
  }
);

userRouter.patch(
  "/:id/password",
  zValidator("param", idParamSchema),
  zValidator("json", changePasswordSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { currentPassword, newPassword } = c.req.valid("json");
    await changePassword(id, currentPassword, newPassword);
    return c.json({ message: "Contraseña actualizada correctamente." });
  }
);

userRouter.delete("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = await removeUser(id);
  return c.json(user);
});

export const doctorRouter = new Hono();

doctorRouter.post("/", zValidator("json", createDoctorSchema), async (c) => {
  const input = c.req.valid("json");
  const result = await registerDoctor(input);
  return c.json(result, 201);
});

doctorRouter.get("/", async (c) => {
  const limit = Number(c.req.query("limit") ?? 50);
  const offset = Number(c.req.query("offset") ?? 0);
  const doctors = await getAllDoctors(limit, offset);
  return c.json(doctors);
});

doctorRouter.get(
  "/by-matricula/:matricula",
  zValidator("param", z.object({ matricula: z.string() })),
  async (c) => {
    const { matricula } = c.req.valid("param");
    const doctor = await getDoctorByMatricula(matricula);
    return c.json(doctor);
  }
);

doctorRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const result = await findDoctorByUserId(id);
  return c.json(result);
});

doctorRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateDoctorSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const doctor = await editDoctor(id, input);
    return c.json(doctor);
  }
);

doctorRouter.delete("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  await removeDoctor(id);
  return c.json({ message: "Doctor eliminado correctamente." });
});

export const patientRouter = new Hono();

patientRouter.post("/", zValidator("json", createPatientSchema), async (c) => {
  const input = c.req.valid("json");
  const result = await registerPatient(input);
  return c.json(result, 201);
});

patientRouter.get("/", async (c) => {
  const limit = Number(c.req.query("limit") ?? 50);
  const offset = Number(c.req.query("offset") ?? 0);
  const patients = await getAllPatients(limit, offset);
  return c.json(patients);
});

patientRouter.get(
  "/by-historia/:numeroHistoriaClinica",
  zValidator("param", z.object({ numeroHistoriaClinica: z.string() })),
  async (c) => {
    const { numeroHistoriaClinica } = c.req.valid("param");
    const patient = await getPatientByHistoriaClinica(numeroHistoriaClinica);
    return c.json(patient);
  }
);

patientRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const result = await findPatientByUserId(id);
  return c.json(result);
});

patientRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updatePatientSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const patient = await editPatient(id, input);
    return c.json(patient);
  }
);

patientRouter.delete("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  await removePatient(id);
  return c.json({ message: "Paciente eliminado correctamente." });
});

export const nurseRouter = new Hono();

nurseRouter.post("/", zValidator("json", createNurseSchema), async (c) => {
  const input = c.req.valid("json");
  const result = await registerNurse(input);
  return c.json(result, 201);
});

nurseRouter.get("/", async (c) => {
  const limit = Number(c.req.query("limit") ?? 50);
  const offset = Number(c.req.query("offset") ?? 0);
  const nurses = await getAllNurses(limit, offset);
  return c.json(nurses);
});

nurseRouter.get(
  "/by-department/:departmentId",
  zValidator("param", z.object({ departmentId: z.string().uuid() })),
  async (c) => {
    const { departmentId } = c.req.valid("param");
    const nurses = await getNursesByDepartment(departmentId);
    return c.json(nurses);
  }
);

nurseRouter.get(
  "/by-turno/:turno",
  zValidator(
    "param",
    z.object({ turno: z.string().min(1).max(64) })
  ),
  async (c) => {
    const { turno } = c.req.valid("param");
    const nurses = await getNursesByTurno(turno);
    return c.json(nurses);
  }
);

nurseRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const result = await findNurseByUserId(id);
  return c.json(result);
});

nurseRouter.patch(
  "/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateNurseSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const nurse = await editNurse(id, input);
    return c.json(nurse);
  }
);

nurseRouter.delete("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  await removeNurse(id);
  return c.json({ message: "Enfermero/a eliminado/a correctamente." });
});