export function criticalError(message) {
    console.error(`Critical Error: ${message}`);
    process.exit(1);
}

export function warning(message) {
    console.warn(`Warning: ${message}`);
}

export function info(message) {
    console.log(`Info: ${message}`);
}
