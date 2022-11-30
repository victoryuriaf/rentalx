import 'reflect-metadata';

import express, { NextFunction, Request, response, Response } from "express";
import "express-async-errors";

import swaggerUi from "swagger-ui-express";

import swaggerFile from "../../../swagger.json";

import "../typeorm";

import createConnection from "@shared/infra/typeorm";

import "@shared/container";

import { router } from "./routes";
import { AppError } from '@shared/errors/AppError';

createConnection();
const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(router);

app.use((err: Error, request: Request, respose: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return response.status(err.statusCode).json({
            message: err.message
        })
    }

    return response.status(500).json({
        status: "error",
        message: `Internal Server Error - ${err.message}`,
    });
});

export { app };