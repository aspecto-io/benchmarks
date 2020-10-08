import fs from 'fs';
import path from 'path';
import ab from 'ab-result';
import axios from 'axios';

const generateForCheck = (description: string, name: string, printSettings: boolean = false) => {
    const abLog = fs.readFileSync(path.join(process.cwd(), `scripts/logs/${name}-ab.log`), 'utf8');
    const report = require(`./logs/${name}-report.json`);
    const abReport = ab(abLog);

    let logs = [];
    if (printSettings) {
        logs.push(`• Requests: ${abReport.test.completeRequests}`);
        logs.push(`• Concurrency: ${abReport.test.concurencyLevel}`);
    }

    logs.push(`\n${description}`);
    logs.push(`  Time: ${abReport.test.timeTaken}s`);
    logs.push(`  RPS: ${abReport.test.requestsPerSecond}`);

    const cpu = report.cpu;
    const memory = report.memory;
    logs.push(
        `  ${cpu.description}:\n   • initial: ${cpu.initial}%\n   • min: ${cpu.min}%\n   • max: ${cpu.max}%\n   • avg: ${cpu.avg}%`
    );
    logs.push(
        `  ${memory.description}:\n   • initial: ${memory.initial} MB\n   • min: ${memory.min} MB\n   • max: ${memory.max} MB\n   • avg: ${memory.avg} MB`
    );

    return logs.join('\n');
};

export const generateFullReport = () => {
    const report = [];
    const packageJson = require('../package.json');
    report.push(
        `📝 Instrumentation result for version ${packageJson.dependencies['@aspecto/opentelemetry']} of @aspecto/opentelemetry`
    );

    const baselineDescription = 'Base Line - No Instrumentation';
    const baseline = generateForCheck(baselineDescription, 'baseline', true);

    const aspectoDescription = 'Instrumentation with Aspecto';
    const aspecto = generateForCheck(aspectoDescription, 'aspecto');
    report.push(baseline, aspecto);

    const fullReport = report.join('\n');
    console.log(fullReport);
    fs.writeFileSync(path.join(process.cwd(), `scripts/logs/full-report.log`), fullReport);

    if (process.env.WEBHOOK_URL) {
        const markdownFormat = fullReport
            .replace(baselineDescription, `*${baselineDescription}*`)
            .replace(aspectoDescription, `*${aspectoDescription}*`);
        axios.post(process.env.WEBHOOK_URL, {
            text: markdownFormat,
        });
    }
};

if (process.argv[2] === 'report') generateFullReport();
