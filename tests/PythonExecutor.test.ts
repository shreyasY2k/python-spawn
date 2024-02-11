// PythonExecutor.test.ts

import { PythonExecutor } from '../src/PythonExecutor';
import { spawn } from 'child_process';

// Mock the 'spawn' function from 'child_process'
jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

describe('PythonExecutor', () => {
    let executor: PythonExecutor;

  beforeEach(() => {
    executor = new PythonExecutor();
    // Directly set the pythonCommand property, bypassing the private method
    (executor as any).pythonCommand = 'python'; // Use 'as any' to bypass TypeScript checks
  });
  
  it('should execute a Python script and return the result', async () => {
    const mockSpawn = spawn as jest.Mock; // Type assertion for TypeScript
    const mockStdout = {
      on: jest.fn((event, handler) => {
        if (event === 'data') {
          handler('10\n'); // Simulate script output
        }
      }),
    };
    const mockStderr = { on: jest.fn() };
    const mockOn = jest.fn((event, handler) => {
      if (event === 'close') {
        handler(0); // Simulate successful script execution
      }
    });

    mockSpawn.mockReturnValue({
      stdout: mockStdout,
      stderr: mockStderr,
      on: mockOn,
    });

    const executor = new PythonExecutor();
    const result = await executor.executeScript('dummy/path/to/script.py', 'dummyFunction', ['arg1', 'arg2']);

    expect(result).toBe('10'); // Expect the mocked output to be returned
    expect(mockSpawn).toHaveBeenCalledWith(
    'python',
    [expect.stringContaining('temp_wrapper_script_')] // This matches any temp script path
);
    expect(mockStdout.on).toHaveBeenCalledWith('data', expect.any(Function));
    expect(mockStderr.on).toHaveBeenCalledWith('data', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('close', expect.any(Function));
  });
});
