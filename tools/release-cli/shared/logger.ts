export function logStart(name: string): void {
  console.log(`START: ${name}`);
}

export function logStep(name: string): void {
  console.log(`STEP: ${name}`);
}

export function logOk(message: string): void {
  console.log(`OK: ${message}`);
}

export function logWarn(message: string): void {
  console.log(`WARN: ${message}`);
}

export function logResult(message: string): void {
  console.log(`RESULT: ${message}`);
}

export function logInfo(message: string): void {
  console.log(`INFO: ${message}`);
}
