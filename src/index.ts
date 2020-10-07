import { PORT, ASPECTO, OTEL } from './config';
import logger from '@aspecto/logger';
import Instrument from '@aspecto/opentelemetry';
import { initOtel } from './opentelemetry';

if (ASPECTO) {
    logger.info(`Instrumenting using Aspecto process at port ${PORT}`);
    Instrument({ logger, excludeJaeger: true });
} else if (OTEL) {
    logger.info(`Instrumenting using OpenTelemetry process at port ${PORT}`);
    initOtel();
}

import express from 'express';

const app = express()
    .use(express.json())
    .use(express.urlencoded({ extended: true }));

app.get('/test', async (_req, res) => {
    await new Promise((r) => setTimeout(r, 30));
    res.status(200).send({ randomBytes: 'hello world!' });
});

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
