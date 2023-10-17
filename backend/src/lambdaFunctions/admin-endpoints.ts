import cors from "cors";
import express from "express";
import serverless from "serverless-http";
import getDatabase from "../database/db";
import Device from "../database/device.entity";
import Reading from "../database/reading.entity";
import { getDeviceFromApiKey } from "../utils/device.utils";
import dotenv from "dotenv";
import UserDeviceUsage from "../database/user-device.entity";
import Patient from "../database/patient.entity";
import moment from "moment";
import {
  getOrCreateAPIKey,
  getOrCreateDevice,
  getOrRegisterPatient,
} from "../utils/admin.utils";
import PatientReport from "../database/patient-reports.entity";
dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/admin/health", function (req, res) {
  res.send({ status: "ok" });
});

app.get("/admin/devices", async function (req, res) {
  console.log("getting devices");
  try {
    const db = await getDatabase();
    console.log("got db");
    const latestReadingQuery = await db
      .getRepository(Device)
      .createQueryBuilder("device")
      .leftJoinAndSelect(
        "device.readings",
        "reading",
        "reading.id = (SELECT id FROM reading WHERE reading.deviceId = device.id ORDER BY reading.deviceSynced DESC LIMIT 1)"
      )
      .leftJoinAndSelect("device.apiKey", "apiKey")
      .leftJoinAndSelect("device.users", "user", "user.removed IS NULL")
      .leftJoinAndSelect("user.patient", "patient")
      .getMany();
    console.log("got devices", JSON.stringify(latestReadingQuery));
    res.send(
      latestReadingQuery.map((device) => ({
        id: device.id,
        interval: device.interval,
        name: device.name,
        lastSynced:
          device.readings.length > 0 ? device.readings[0].deviceSynced : null,
        lastReset: device.createdAt,
        user: device.users.length > 0 ? device.users[0].patient.id : null,
      }))
    );
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "Could not retreive devices", e });
  }
});
app.get("/admin/device/:deviceId", async function (req, res) {
  console.log("getting device");
  const db = await getDatabase();
  const id = req.params.deviceId;
  console.log("got device", JSON.stringify({ id }));
  try {
    const device = await db
      .getRepository(Device)
      .createQueryBuilder("device")
      .where("device.id = :id", { id })
      .leftJoinAndSelect(
        "device.readings",
        "reading",
        "reading.id = (SELECT id FROM reading WHERE reading.deviceId = device.id ORDER BY reading.deviceSynced DESC LIMIT 1)"
      )
      .leftJoinAndSelect("device.apiKey", "apiKey")
      .leftJoinAndSelect("device.users", "user", "user.removed IS NULL")
      .leftJoinAndSelect("user.patient", "patient")
      .getOne();

    if (!device) return res.status(400).send("Device does not exist");
    const formattedDevice = {
      id: device.id,
      interval: device.interval,
      name: device.name,
      lastSynced:
        device.readings.length > 0 ? device.readings[0].deviceSynced : null,
      lastReset: device.createdAt,
      user: device.users.length > 0 ? device.users[0].patient.id : null,
    };

    res.send(formattedDevice);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "Could not retreive device", e });
  }
});

app.get("/admin/readings/:deviceId", async function (req, res) {
  const db = await getDatabase();
  const readings = await db.getRepository(Reading).find({
    where: { device: { id: req.params.deviceId } },
    order: {
      timestamp: "DESC",
    },
  });
  res.send(readings);
});

app.delete("/admin/readings", async function (req, res) {
  const db = await getDatabase();
  const { readings } = req.body;
  await db.getRepository(Reading).delete(readings.map((id) => ({ id })));
  res.send(null);
});

app.put("/admin/device/:deviceId", async function (req, res) {
  const db = await getDatabase();
  const device = await db.getRepository(Device).findOne({
    where: { id: req.params.deviceId },
  });
  const { interval, name } = req.body;
  console.log({ device, interval, name });
  if (!device || !interval || !name) return res.status(400).send();
  device.interval = interval;
  device.name = name;
  db.getRepository(Device).save(device);
  res.send(device);
});

app.delete("/admin/device/:deviceId", async function (req, res) {
  const db = await getDatabase();
  const device = await db.getRepository(Device).findOne({
    where: { id: req.params.deviceId },
    relations: { users: { patient: true } },
  });

  if (!device) return res.status(400).send("No device found");
  const activeUser = device.users?.find((user) => user.removed === null);
  if (activeUser) {
    await db.getRepository(UserDeviceUsage).delete({
      id: activeUser.id,
    });
  }
  try {
    await db.getRepository(Device).delete({ id: device.id });
    res.send(null);
  } catch (e) {
    res.send(device);
  }
});

app.get("/admin/linked-device", async function (req, res) {
  const apiKey = req.query.apiKey as string;
  console.log("checking ", req.query);
  if (!req.query.apiKey) {
    return res.status(400).send("Api key required");
  }
  const device = await getDeviceFromApiKey(apiKey);

  if (!device) {
    return res.status(400).send("Api key is invalid");
  }
  return res.send(device);
});

app.post("/admin/register-device", async function (req, res) {
  const db = await getDatabase();
  const { deviceId, interval, userId } = req.body;
  const device = await getOrCreateDevice(deviceId);

  if (interval) {
    device.interval = interval;
  }
  await db.getRepository(Device).save(device);
  //get the singular api key stored in the db
  const apiKey = await getOrCreateAPIKey();
  //link to user and disable any old user
  const activeUser = device.users?.find((u) => u.removed === null);
  //create patient if not exists
  const patient = await getOrRegisterPatient(userId);

  //remove active user if exists and is not the same
  if (
    (!patient && activeUser) ||
    (patient && activeUser && activeUser.patient.id !== userId)
  ) {
    console.log("removing active user");
    activeUser.removed = new Date();
    await db.getRepository(UserDeviceUsage).save(activeUser);
  }

  //add new patient if exists and is not already active
  if (!activeUser || patient.id != activeUser.patient.id) {
    console.log("adding new user");
    const newUser = db.getRepository(UserDeviceUsage).create({
      patient,
      device,
    });
    await db.getRepository(UserDeviceUsage).save(newUser);
  }

  console.log("sending user the api key", apiKey);
  return res.send(apiKey);
});

app.get("/admin/patient/:patientId", async function (req, res) {
  const db = await getDatabase();
  const patient = await db
    .getRepository(Patient)
    .createQueryBuilder("patient")
    .where("patient.id = :id", { id: req.params.patientId })
    .leftJoinAndSelect("patient.deviceUsages", "deviceUsages")
    .leftJoinAndSelect("deviceUsages.device", "device")
    .getOne();

  const activeDevice =
    patient.deviceUsages.find((d) => d.removed === null)?.device ?? null;
  const endTimes = patient.deviceUsages.map((d) => d.removed?.getTime() ?? 0);
  const removedAt = activeDevice ? null : new Date(Math.max(...endTimes));

  const formattedPatient = {
    id: patient.id,
    createdAt: patient.createdAt,
    removedAt,
    deviceUsages: patient.deviceUsages.map((d) => ({
      id: d.id,
      device: {
        id: d.device.id,
        name: d.device.name,
        interval: d.device.interval,
      },
      createdAt: d.created,
      removedAt: d.removed,
    })),
  };

  res.send(formattedPatient);
});

app.get("/admin/patient/:patientId/reports", async function (req, res) {
  const db = await getDatabase();
  console.log("getting reports");
  const reports = await db
    .getRepository(PatientReport)
    .find({ where: { patient: { id: req.params.patientId } } });
  const earliestDate = reports.reduce((p, report) => {
    return moment(p).isAfter(moment(report.date)) ? report.date : p;
  }, moment().format("YYYY-MM-DD"));
  console.log(reports, "earliest", earliestDate);
  let currDate = moment(earliestDate);
  const formattedReports = [];
  while (currDate.isBefore(moment())) {
    const currDay = currDate.format("YYYY-MM-DD");
    const report = reports.find((r) => r.date === currDay);
    formattedReports.push({
      date: currDay,
      minutes: report ? report.minutesWorn : null,
    });
    currDate = currDate.add(1, "day");
  }
  console.log(formattedReports);
  return res.send(formattedReports);
});

app.get("/admin/patientReadings/:patientId", async function (req, res) {
  const db = await getDatabase();
  console.log("getting readings");
  const readings = await db
    .getRepository(Reading)
    .createQueryBuilder("reading")
    .leftJoinAndSelect("reading.device", "device")
    .leftJoin("device.users", "user")
    .leftJoin("user.patient", "patient")
    .where(
      "patient.id = :id AND reading.deviceSynced > user.created AND (user.removed IS NULL OR reading.deviceSynced < user.removed)",
      { id: req.params.patientId }
    )
    .orderBy("reading.timestamp", "DESC")
    .getMany();
  console.log("got readings", readings.length);
  res.send(readings);
});

app.get("/admin/patients", async function (req, res) {
  const db = await getDatabase();
  const patients = await db
    .getRepository(Patient)
    .createQueryBuilder("patient")
    .leftJoinAndSelect("patient.deviceUsages", "deviceUsages")
    .leftJoinAndSelect("deviceUsages.device", "device")
    .getMany();
  const formattedPatients = patients.map((p) => {
    const activeDevice =
      p.deviceUsages.find((d) => d.removed === null)?.device ?? null;
    const endTimes = p.deviceUsages.map((d) => d.removed?.getTime() ?? 0);
    const removedAt = activeDevice ? null : new Date(Math.max(...endTimes));
    return {
      id: p.id,
      createdAt: p.createdAt,
      activeDevice,
      removedAt,
    };
  });
  res.send(formattedPatients);
});

app.get("/admin/patient/:patientId/battery", async function (req, res) {
  const db = await getDatabase();
  const numDays = req.query.numDays
    ? parseInt(req.query.numDays as string)
    : 14;

  const readings = await db
    .getRepository(Reading)
    .createQueryBuilder("reading")
    .select(["reading.battery", "reading.timestamp"])
    .leftJoin("reading.device", "device")
    .leftJoin("device.users", "user")
    .leftJoin("user.patient", "patient")
    .where(
      "patient.id = :id AND reading.deviceSynced > user.created AND (user.removed IS NULL OR reading.deviceSynced < user.removed)",
      { id: req.params.patientId }
    )
    .andWhere("reading.timestamp > :numDays", {
      numDays: moment().subtract(numDays, "days").toDate(),
    })
    .orderBy("reading.timestamp", "DESC")
    .getMany();
  res.send(readings);
});

app.get("/admin/patient/:patientId/dailyUsage", async function (req, res) {
  const db = await getDatabase();
  const numDays = req.query.numDays
    ? parseInt(req.query.numDays as string)
    : 14;

  const readingCount = await db
    .getRepository(Reading)
    .createQueryBuilder("reading")
    .select("COUNT(reading.id), DATE(reading.timestamp)")
    .leftJoin("reading.device", "device")
    .leftJoin("device.users", "user")
    .leftJoin("user.patient", "patient")
    .where(
      "patient.id = :id AND reading.deviceSynced > user.created AND (user.removed IS NULL OR reading.deviceSynced < user.removed)",
      { id: req.params.patientId }
    )
    .andWhere("reading.timestamp >= :numDays", {
      numDays: moment().subtract(numDays, "days").toDate(),
    })
    .groupBy("DATE(reading.timestamp)")
    .getRawMany();

  const formattedReadingCount = [...new Array(numDays)]
    .map((r, i) => {
      const date = moment().subtract(i, "days").toDate();
      const reading = readingCount.find((r) => {
        return moment(r.date).isSame(date, "day");
      });
      console.log(date, reading);
      return {
        count: reading ? reading.count : 0,
        date: moment(date).format("YYYY-MM-DD"),
      };
    })
    .reverse();

  res.send(formattedReadingCount);
});
let devServer;
if (process.env.NODE_ENV === "development")
  devServer = app.listen(4100, async () => {
    console.log("started admin endpoints on 4100");
  });
export const server = devServer;
export const handler = serverless(app);
