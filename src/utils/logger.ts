class Logger {
    private logs: string[] = [];
    private maxLogs = 100;

    init() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            this.addLog('LOG', args);
            originalLog.apply(console, args);
        };
        console.error = (...args) => {
            this.addLog('ERROR', args);
            originalError.apply(console, args);
        };
        console.warn = (...args) => {
            this.addLog('WARN', args);
            originalWarn.apply(console, args);
        };
    }

    private addLog(level: string, args: any[]) {
        try {
            const message = args.map(arg => {
                if (arg instanceof Error) {
                    return arg.toString() + "\n" + arg.stack;
                }
                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            }).join(' ');
            
            const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
            this.logs.push(`[${timestamp}] [${level}] ${message}`);
            
            if (this.logs.length > this.maxLogs) {
                this.logs.shift();
            }
        } catch (e) {
            // Ignore stringify errors
        }
    }

    getLogs() {
        return this.logs.join('\n');
    }
}

export const appLogger = new Logger();
