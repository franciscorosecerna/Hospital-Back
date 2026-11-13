import 'dotenv/config';
import { Hono } from 'hono';
import { errorMiddleware } from './middleware/errorHandleMiddleware';
import { userRouter } from './modules/users/userRouter';
import { patientRouter } from './modules/users/patient/patientRouter';
import { doctorRouter } from './modules/users/doctor/doctorRouter';
import { nurseRouter } from './modules/users/nurse/nurseRouter';
import { procedureRouter } from './modules/procedure/procedureRouter';
import { prescriptionRouter } from './modules/prescription/prescriptionRouter';
import { medicationRouter } from './modules/medication/medicationRouter';
import { infrastructureRouter } from './modules/infrastructure/infrastructureRouter';
import { doctorPatientRouter } from './modules/doctorPatient/doctorPatientRouter';
import { diagnosisRouter } from './modules/diagnosis/diagnosisRouter';
import { certificateAuthorityRouter } from './modules/certificateAuthority/certificateAuthorityRouter';
import { authorizationRouter } from './modules/authorization/authorizationRouter';
import { authRouter } from './modules/auth/authRouter';
import { appointmentRouter } from './modules/appointment/appointmentRouter';
import { auditLogRouter } from './modules/auditLogs/auditLogRouter';
import { allergyRouter } from './modules/allergy/allergyRouter';

const app = new Hono();
app.use('*', errorMiddleware);

app.route('/users', userRouter);
app.route('/patients', patientRouter);
app.route('/doctors', doctorRouter);
app.route('/nurses', nurseRouter);
app.route('/procedures', procedureRouter);
app.route('/prescriptions', prescriptionRouter);
app.route('/medications', medicationRouter);
app.route('/infrastructure', infrastructureRouter);
app.route('/doctor-patients', doctorPatientRouter);
app.route('/diagnoses', diagnosisRouter);
app.route('/certificates', certificateAuthorityRouter);
app.route('/authorizations', authorizationRouter);
app.route('/auth', authRouter);
app.route('/logs', auditLogRouter);
app.route('/appointments', appointmentRouter);
app.route('/allergies', allergyRouter);

app.get("/health", (c) => {
    return c.json({
        status: "ok",
        instance: process.env.INSTANCE_NAME
    });
});

export default {
    port: Number(process.env.PORT!),
    hostname: "0.0.0.0",
    fetch: app.fetch
};