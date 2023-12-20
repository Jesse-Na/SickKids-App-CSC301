import express from "express";
import serverless from "serverless-http";
import { CreateReadingType, decodeReading } from "../utils/readings";
import getDatabase from "../database/db";
import Reading from "../database/reading.entity";
import Device from "../database/device.entity"
import cors from "cors";
import dotenv from "dotenv";
import PatientReport from "../database/patient-reports.entity";
import { getCurrentPatientReports } from "../utils/selfReporting.utils";
import Patient from "../database/patient.entity";
import moment from "moment";
dotenv.config();
export const app = express();
app.use(cors());
app.use(express.json());

app.get("/users/health", function (req, res) {
  res.send({ status: "ok" });
});

/**
 * Upload multiple readings at a time to the database
 * @param req.body.readings
 */
app.post("/users/readings", async function (req, res) {
  const readings: CreateReadingType[] = req.body.readings;
  const deviceId = req.body.deviceId;
  const db = await getDatabase();

  // check if user has api key
  if (!req.query.apiKey) {
    return res.status(401).send("Api key required");
  }
  const device = await db.getRepository(Device).findOne({
    where: { id: deviceId },
  });

  console.log("device", device);

  if (!device) {
    return res.status(401).send("Device with given deviceId not found");
  }

  if (readings.length == 0) {
    return res.status(400).send();
  }

  //decode all readings and ensure input format is correct
  let decoded: Omit<Reading, "id">[] = [];
  try {
    decoded = readings.map((reading) => decodeReading(reading, device));
  } catch (e) {
    return res.status(400).send();
  }

  //convert to entities and save
  const entities = decoded.map((reading) =>
    db.getRepository(Reading).create(reading)
  );
  await db.getRepository(Reading).save(entities);

  res.send({ interval: device.interval });
});

app.get("/users/interval", async function (req, res) {
  const deviceId = req.body.deviceId;
  const db = await getDatabase();

  // check if user has api key
  if (!req.query.apiKey) {
    return res.status(401).send("Api key required");
  }
  const device = await db.getRepository(Device).findOne({
    where: { id: deviceId },
  });

  if (!device) {
    return res.status(401).send("Device with given deviceId not found");
  }
  return res.send(JSON.stringify(device.interval));
});

app.get("/users/selfReporting", async function (req, res) {
  const deviceId = req.body.deviceId;
  const db = await getDatabase();

  // check if user has api key
  if (!req.query.apiKey) {
    return res.status(401).send("Api key required");
  }

  const device = await db.getRepository(Device).findOne({
    where: { id: deviceId },
  });

  if (!device) {
    return res.status(401).send("Api key is invalid");
  }
  const patientReports = await getCurrentPatientReports(device.id);
  res.send(patientReports);
});

app.post("/users/selfReporting", async function (req, res) {
  const { deviceId, date, minutes } = req.body;
  const db = await getDatabase();

  // check if user has api key
  if (!req.query.apiKey) {
    return res.status(401).send("Api key required");
  }

  const device = await db.getRepository(Device).findOne({
    where: { id: deviceId },
  });

  if (!device) {
    return res.status(401).send("Api key is invalid");
  }

  const formattedDate = moment(date).format("YYYY-MM-DD");

  // find the patient
  const patient = await db
    .getRepository(Patient)
    .createQueryBuilder("patient")
    .leftJoin("patient.deviceUsages", "deviceUsage")
    .leftJoin("deviceUsage.device", "device")
    .where("deviceUsage.removed IS NULL AND device.id = :id", {
      id: device.id,
    })
    .getOne();

  console.log("patient", patient)

  const existing = await db.getRepository(PatientReport).findOne({
    where: { date: formattedDate, patient: { id: patient.id } },
  });

  console.log("existing", existing)

  if (existing) {
    return res.status(400).send("Reading exists");
  }

  const newEntry = db.getRepository(PatientReport).create({
    patient: patient,
    minutesWorn: minutes,
    date: formattedDate,
  });

  console.log("newEntry", newEntry)

  await db.getRepository(PatientReport).save(newEntry);

  const patientReports = await getCurrentPatientReports(device.id);

  console.log("patientReports", patientReports)

  res.send(patientReports);
});

app.use((req, res) => {
  console.log("404", req);
  return res.set("Access-Control-Allow-Origin", "*").status(404).send({
    reqPath: req.path,
    error: "Not Found",
  });
});

let devServer;
if (process.env.NODE_ENV === "development")
  devServer = app.listen(4000, async () => {
    console.log("started user endpoints on 4000");
  });
export const server = devServer;
export const handler = serverless(app);
