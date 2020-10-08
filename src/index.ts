import { PORT, ASPECTO, OTEL } from './config';
import logger from '@aspecto/logger';
import Instrument from '@aspecto/opentelemetry';
import { initOtel } from './opentelemetry';
import pidusage from 'pidusage';

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

interface ProcessInfo {
    cpu: number;
    memory: number;
}

const processInfo: ProcessInfo[] = [];
let collect = false;

const toFixedNumber = (num: number) => Math.round(num * 1e2) / 1e2;

const collectStatsWithInterval = async (time: number) => {
    setTimeout(async () => {
        const stats = await pidusage(process.pid);
        const entry = {
            cpu: toFixedNumber(stats.cpu),
            memory: toFixedNumber(stats.memory / (1024 * 1024)),
        };
        processInfo.push(entry);
        collect && collectStatsWithInterval(time);
    }, time);
};

app.get('/start-collecting', async (_req, res) => {
    collect = true;
    collectStatsWithInterval(500);
    res.send({ message: `Stating to collect memory and CPU for process ${process.pid}` });
});

const average = (array: number[]) => (array.length ? (array.reduce((a, b) => a + b) / array.length).toFixed(2) : null);

app.get('/report', async (_req, res) => {
    collect = false;
    const cpus = processInfo.map((info) => info.cpu);
    const cpu = {
        description: 'CPU% Usage',
        initial: cpus[0],
        min: Math.min(...cpus),
        max: Math.max(...cpus),
        avg: average(cpus),
    };
    const memories = processInfo.map((info) => info.memory);
    const memory = {
        description: 'Memory in MB Used',
        initial: memories[0],
        min: Math.min(...memories),
        max: Math.max(...memories),
        avg: average(memories),
    };

    res.send({ cpu, memory });
    processInfo.length = 0;
});

app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
