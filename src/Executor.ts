interface Executor {
  executeScript(scriptPath: string, functionName?: string, args?: string[]): Promise<string>;
}


export { Executor };