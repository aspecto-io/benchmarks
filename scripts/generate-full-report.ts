import fs from 'fs';
import path from 'path';
import ab from 'ab-result';
import colors from 'colors/safe';

const average = (array: number[]) => (array.reduce((a, b) => a + b) / array.length).toFixed(2);

const generateForContainer = (description: string, container: string) => {
    const abReport = fs.readFileSync(path.join(process.cwd(), `scripts/logs/${container}-ab.log`), 'utf8');
    const dockerStats = fs.readFileSync(path.join(process.cwd(), `scripts/logs/${container}-dockerstats.log`), 'utf8');
    const cpus: number[] = [];
    const memory: number[] = [];
    const lines = dockerStats.split('\n');
    lines.shift();

    lines.forEach((line) => {
        const segments = line.split(/\s+/);
        cpus.push(parseFloat(segments[0].replace('%', '')));
        memory.push(parseFloat(segments[1].replace('%', '')));
    });
    console.log(colors.bold(colors.blue(`\n${description}:`)));
    console.log(`  Time: ${ab(abReport).test.timeTaken}s`);
    console.log(
        `  CPU:\n   - min: ${Math.min.apply(Math, cpus)}%\n   - max: ${Math.max.apply(Math, cpus)}%\n   - avg: ${average(cpus)}%`
    );
    console.log(
        `  Memory:\n   - min: ${Math.min.apply(Math, memory)}%\n   - max: ${Math.max.apply(Math, memory)}%\n   - avg: ${average(
            memory
        )}%`
    );
};

export const generateFullReport = () => {
    generateForContainer('Base Line - No Instrumentation', 'benchmarks_plain');
    generateForContainer('Instrumentation with Basic Opentelemetry', 'benchmarks_otel');
    generateForContainer('Instrumentation with Aspecto', 'benchmarks_aspecto');
};
