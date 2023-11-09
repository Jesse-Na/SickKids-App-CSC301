import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import cors from "cors";
import express from "express";
import serverless from "serverless-http";
import * as Formatting from "../utils/formatting";
import getDatabase from "../database/db";
import Device from "../database/device.entity";
import Reading from "../database/reading.entity";
import APIKey from "../database/api-key.entity";
import { getDeviceFromApiKey } from "../utils/device.utils";
import dotenv from "dotenv";
import PatientDeviceHistory from "../database/patient-device-history.entity";
import Patient from "../database/patient.entity";
import moment from "moment";
import {
  getOrCreateAPIKey,
  getOrCreateDevice,
  getOrRegisterPatient,
} from "../utils/admin.utils";
dotenv.config();

const cognito = new CognitoIdentityProvider({ apiVersion: "2016-04-18" });

export const app = express();
app.use(cors());
app.use(express.json());

app.post("/admin-cognito/admins", async function (req, res) {
  const { email } = req.body;

  //create a new user in cognito user pool with the provided email and a random password and a random username autogenerated by cogntio
  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    DesiredDeliveryMediums: ["EMAIL"],
    ForceAliasCreation: false,
    Username: email,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
  };

  try {
    cognito.adminCreateUser(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        res.status(500).send({ error: "Could not create admin", err });
      } else {
        res.send(Formatting.formatAdminUser(data.User));
      }
    });
  } catch (e) {
    res.status(500).send({ error: "Could not create admin", e });
  }
});

app.delete("/admin-cognito/admins/:username", async function (req, res) {
  const { username } = req.params;

  //delete the user from cognito user pool
  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: username,
  };
  cognito.adminDeleteUser(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      res.status(500).send({ error: "Could not delete admin", err });
    } else {
      res.send(data);
    }
  });
});

app.get("/admin-cognito/admins", function (req, res) {
  //get all users in cognito user pool

  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
  };
  console.log("getting admins with", params);
  try {
    cognito.listUsers(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        res.status(500).send({ error: "Could not retreive admins", err });
      } else {
        const admins = data.Users.map(Formatting.formatAdminUser);
        res.send(admins);
      }
    });
  } catch (e) {
    res.status(500).send({ error: "Could not retreive admins", e });
  }
});

export const handler = serverless(app);
