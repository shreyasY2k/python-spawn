# python-spawn

`python-spawn` is an npm package designed to bridge the gap between Node.js and Python, allowing Node.js applications to execute Python scripts seamlessly. This package simplifies the integration process by providing an easy-to-use interface for running Python code, functions, and scripts directly from Node.js.

## Features

- **Automatic Python Command Detection**: Determines the available Python command (`python` or `python3`) on the system.
- **Script Execution**: Enables the execution of entire Python scripts or specific functions within scripts, with argument passing capability.
- **Asynchronous Support**: Executes Python scripts asynchronously, returning results via Promises for better integration with modern JavaScript code.
- **Error Handling**: Provides comprehensive error messages to aid in debugging.
- **Temporary Script Wrapping**: Generates a temporary wrapper script for executing specific Python functions, ensuring clean execution and removal post-execution.

## Installation

Install `python-spawn` using npm:

```bash
npm install python-spawn
```

## Usage

### Basic Usage

```javascript
const { PythonExecutor } = require("python-spawn");

// Creating an Instance
const executor = new PythonExecutor();

// Executing a Python Script
executor
  .executeScript("/path/to/your/script.py")
  .then((result) => console.log(result))
  .catch((error) => console.error(error));

// Executing a Python Function withing a Script
executor
  .executeScript("/path/to/your/script.py", "function_name", ["arg1", "arg2"])
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

## Contributing

Contributions are welcome! Please refer to the [Contributing Guidelines](CONTRIBUTING.md) for detailed information.

## License

This project is licensed under the [MIT License](LICENSE).
