import { Executor } from './Executor';
import { spawn } from 'child_process';
import { promises as fsPromises } from 'fs';
import { randomBytes } from 'crypto';
import os from 'os';
import path from 'path';

export class PythonExecutor implements Executor {
  private pythonCommand: string | undefined;

  constructor() {
    // Note: this is a simplification; you might need to handle async initialization differently
    this.determinePythonCommand().catch((error) => {
      console.error('Failed to determine Python command:', error);
    });
  }

  private async determinePythonCommand(): Promise<void> {
    const commands = ['python3','python'];
    for (const command of commands) {
      try {
        await this.checkCommandAvailability(command);
        this.pythonCommand = command;
        // console.log(`Using "${command}" command for Python scripts.`);
        break; // Command found, break the loop
      } catch {
        // This command failed, try the next one
      }
    }

    if (!this.pythonCommand) {
      throw new Error('No suitable Python command found. Ensure Python is installed and accessible.');
    }
  }
    // Method to check if a command is available on the system
  private checkCommandAvailability(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, ['--version']);
      process.on('error', reject);
      process.on('exit', (code) => (code === 0 ? resolve() : reject()));
    });
  }

  async executeScript(scriptPath: string, functionName?: string, args: string[] = []): Promise<string> {
    const tempDir = os.tmpdir();
    const randomString = this.generateRandomString(8); // Generate a unique identifier for the temp file
    const tempWrapperScriptPath = path.join(tempDir, `temp_wrapper_script_${randomString}.py`);

    const wrapperScriptContent = this.generateWrapperScript(scriptPath, functionName, args);
    await fsPromises.writeFile(tempWrapperScriptPath, wrapperScriptContent);

    try {
      return await this.runPythonScript(tempWrapperScriptPath);
    } finally {
      await fsPromises.unlink(tempWrapperScriptPath); // Delete the temp file regardless of execution outcome
    }
  }

  private async runPythonScript(tempWrapperScriptPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('python', [tempWrapperScriptPath]);

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        reject(data.toString());
      });

      process.on('close', (code) => {
        if (code === 0) {
          const lines = output.trim().split('\n');
          resolve(lines.pop() || "");
        } else {
          reject(`Script exited with code ${code}`);
        }
      });
    });
  }

private generateWrapperScript(scriptPath: string, functionName?: string, args: any[] = []): string {
  const path = require('path');

  // Get the absolute directory path and the script's module name
  const scriptDirectory = path.dirname(scriptPath);
  const moduleName = path.basename(scriptPath, '.py');

  // Serialize the entire arguments array as a JSON string
  const argsJson = JSON.stringify(args).replace(/"/g, '\\"');

  if (functionName) {
    // Generate the wrapper script with deserialization and correct unpacking of arguments
    return `
import sys, json
sys.path.insert(0, "${scriptDirectory.replace(/\\/g, '\\\\')}")
from ${moduleName} import ${functionName}

# Deserialize the JSON string to a Python list
args = json.loads("${argsJson}")

# Unpack the list to pass each item as a separate argument
result = ${functionName}(*args)
print(result)
    `.trim();
  } else {
    // Fallback for running the script directly without a specific function
    return `import runpy\nrunpy.run_path("${scriptPath.replace(/\\/g, '\\\\')}")`;
  }
}



  private generateRandomString(length: number): string {
    return randomBytes(length).toString('hex');
  }
}
