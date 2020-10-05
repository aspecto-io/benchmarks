import { PORT, INSTRUMENT } from './config';
import logger from '@aspecto/logger';
import Instrument from '@aspecto/opentelemetry';
import crypto from 'crypto';

if (INSTRUMENT) {
    logger.info(`Instrumenting using Aspecto process at port ${PORT}`);
    Instrument({ logger });
}

import express from 'express';
import os from 'os';

const app = express()
    .use(express.json())
    .use(express.urlencoded({ extended: true }));

app.get('/test', (req, res) => {
    res.status(200).send(crypto.randomBytes(Math.random() * 10000).toString('hex'));
});

app.get('/report', async (req, res) => {
    res.send({
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),

        memoryUsage: 100 - (os.freemem() / os.totalmem()) * 100 + '%',
    });
});

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
