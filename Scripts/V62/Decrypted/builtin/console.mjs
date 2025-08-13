
; (function () {
    const originConsole = globalThis.console || {};
    const console = globalThis.console = globalThis.console || {};
    const titanDebugger = loadCppType('Debugger');
    function toString(args) {
        return Array.prototype.map.call(args, x => {
            try {
                return x instanceof Error ? x.stack : x + '';
            }
            catch (err) {
                return err;
            }
        }).join(' ');
    }
    function getStack(error) {
        let stack = error.stack; // get js stack
        stack = stack.substring(stack.indexOf("\n") + 1); // remove first line ("Error")
        stack = stack.replace(/^ {4}/gm, ""); // remove indentation
        return stack;
    }
    const originConsoleLog = originConsole.log;
    console.log = function () {
        if (originConsoleLog)
            originConsoleLog.apply(null, Array.prototype.slice.call(arguments));
        titanDebugger.print(toString(arguments), 0);
    };
    const originConsoleInfo = originConsole.info;
    console.info = function () {
        if (originConsoleInfo)
            originConsoleInfo.apply(null, Array.prototype.slice.call(arguments));
        titanDebugger.hudPrint(toString(arguments));
    };
    const originConsoleWarn = originConsole.warn;
    console.warn = function () {
        if (originConsoleWarn)
            originConsoleWarn.apply(null, Array.prototype.slice.call(arguments));
        titanDebugger.warning(toString(arguments));
    };
    const originConsoleError = originConsole.error;
    console.error = function () {
        if (originConsoleError)
            originConsoleError.apply(null, Array.prototype.slice.call(arguments));
        titanDebugger.warning(toString(arguments));
    };
    const originConsoleTrace = originConsole.trace;
    console.trace = function () {
        if (originConsoleTrace)
            originConsoleTrace.apply(null, Array.prototype.slice.call(arguments));
        titanDebugger.print(toString(arguments) + "\n" + getStack(new Error()) + "\n");
    };
    const timeRecorder = new Map();
    console.time = function (name) {
        timeRecorder.set(name, +new Date);
    };
    console.timeEnd = function (name) {
        const startTime = timeRecorder.get(name);
        if (startTime) {
            titanDebugger.print(String(name) + ": " + (+new Date - startTime) + " ms");
            timeRecorder.delete(name);
        }
        else {
            titanDebugger.warning("Timer '" + String(name) + "' does not exist");
        }
        ;
    };
})();