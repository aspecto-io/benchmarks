import { PORT, ASPECTO, OTEL } from './config';
import logger from '@aspecto/logger';
import Instrument from '@aspecto/opentelemetry';
import { initOtel } from './opentelemetry';
import crypto from 'crypto';

if (ASPECTO) {
    logger.info(`Instrumenting using Aspecto process at port ${PORT}`);
    Instrument({ logger });
} else if (OTEL) {
    logger.info(`Instrumenting using OpenTelemetry process at port ${PORT}`);
    initOtel();
}

import express from 'express';

const app = express()
    .use(express.json())
    .use(express.urlencoded({ extended: true }));

app.get('/test', async (req, res) => {
    await new Promise((r) => setTimeout(r, Math.random() * 80));
    res.status(200).send(crypto.randomBytes(Math.random() * 10000).toString('hex'));
});

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
