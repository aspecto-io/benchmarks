import cp from 'child_process';
import fs from 'fs';
import ab from 'ab-result';
import { cleanStatsLogFile } from './docker-stats';
import { generateFullReport } from './generate-full-report-local-mode';

const requests = process.argv[2] ?? 1000;
const concurrency = process.argv[3] ?? 10;

const isPortFree = (port: number) =>
    new Promise((resolve) => {
        const server = require('http')
            .createServer()
            .listen(port, () => {
                server.close();
                resolve(true);
            })
            .on('error', () => {
                resolve(false);
            });
    });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const writeDockerStats = (fileName: string) => {
    const child = cp.spawn('docker', ['stats', '--format', 'table {{.CPUPerc}}\t{{.MemPerc}}\t{{.MemUsage}}\t{{.Name}}'], {
        detached: true,
    });
    child.unref();

    child.stdout.setEncoding('utf8');
    child.stdout.pipe(fs.createWriteStream(fileName));
    return child;
};

const runApacheBench = (port: number, fileName: string) => {
    const result = cp.execSync(`ab -n ${requests} -c ${concurrency} -l http://localhost:${port}/test`);
    fs.writeFileSync(fileName, result.toString('utf8'));
    return ab(result.toString());
};

const benchmarkContainer = async (port: number, containerName: string) => {
    const folder = `scripts/logs`;
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    const dockerStatsPath = `${folder}/${containerName}-dockerstats.log`;
    const dockerStats = writeDockerStats(dockerStatsPath);
    await sleep(2000);

    console.log(`\n🏁 Starting benchmark check for ${containerName}`);
    const report = runApacheBench(port, `${folder}/${containerName}-ab.log`);
    dockerStats.kill();

    // Sleep 1 second
    await sleep(1000);
    cleanStatsLogFile(dockerStatsPath, containerName);
    console.log(`🥂 Completed check for ${containerName} (${report.test.timeTaken}s)`);
};

const containers = [
    {
        name: 'benchmarks_plain',
        port: 4040,
    },
    {
        name: 'benchmarks_aspecto',
        port: 4041,
    },
    {
        name: 'benchmarks_otel',
        port: 4042,
    },
];

const measure = async () => {
    console.log('Checking all services are running');
    const servicesNotUp = (await Promise.all(containers.map((c) => isPortFree(c.port)))).some((free) => free);
    if (servicesNotUp)
        throw new Error(
            `Required processes aren't set up, please run 'docker-compose build', followed by 'docker-compose up' from root.\n`
        );

    console.log('✅ Everything is up. Good to go!');
    console.log(`\nBenchmark Settings:\n • Requests: ${requests}\n • Concurrency: ${concurrency}`);
    for (let container of containers) {
        await benchmarkContainer(container.port, container.name);
    }
    generateFullReport();
};

measure()
    .then(() => console.log('\n📐 Done measure!'))
    .catch((err) => {
        console.log(`ERR: ${err.message}`);
        process.exit(1);
    });
