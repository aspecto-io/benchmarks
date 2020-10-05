import fs from 'fs';
import path from 'path';

export const cleanStatsLogFile = (file: string, container: string) => {
    const stats = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    const lines = stats.split('\n');
    const filtered = [lines[0]].concat(lines.filter((line) => line.includes(container)));
    fs.writeFileSync(path.join(process.cwd(), file), filtered.join('\n'));
};
