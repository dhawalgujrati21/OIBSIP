const inputBox = document.getElementById("inputBox");
const buttons = document.querySelectorAll(".btn, .btnf");

let expression = "";
let justCalculated = false;
let hasError = false;

const operators = ["+", "-", "*", "/"];

function updateDisplay() {
    inputBox.value = expression || "0";
}

function clearCalculator() {
    expression = "";
    justCalculated = false;
    hasError = false;
    updateDisplay();
}

function deleteLast() {
    if (hasError) {
        clearCalculator();
        return;
    }

    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

function showError(message) {
    inputBox.value = message;
    expression = "";
    hasError = true;
    justCalculated = false;
}

function addNumber(value) {
    if (hasError) {
        clearCalculator();
    }

    if (justCalculated) {
        expression = "";
        justCalculated = false;
    }

    if (value === ".") {
        const currentNumber = expression.split(/[+\-*/]/).pop();

        if (currentNumber.includes(".")) {
            return;
        }

        if (currentNumber === "") {
            expression += "0";
        }
    }

    expression += value;
    updateDisplay();
}

function addOperator(operator) {
    if (hasError) {
        clearCalculator();
    }

    if (justCalculated) {
        justCalculated = false;
    }

    if (expression === "") {
        if (operator === "-") {
            expression = "-";
            updateDisplay();
        }
        return;
    }

    const lastChar = expression.slice(-1);

    if (lastChar === ".") {
        expression = expression.slice(0, -1);
    }

    const updatedLastChar = expression.slice(-1);

    if (operators.includes(updatedLastChar)) {
        if (operator === "-" && updatedLastChar !== "-") {
            expression += operator;
        } else {
            expression = expression.slice(0, -1) + operator;
        }
    } else {
        expression += operator;
    }

    updateDisplay();
}

function toggleSign() {
    if (hasError) {
        clearCalculator();
    }

    justCalculated = false;

    if (
        expression === "" ||
        operators.includes(expression.slice(-1))
    ) {
        if (expression.slice(-1) === "-") {
            const previous = expression.slice(-2, -1);

            if (expression.length === 1 || operators.includes(previous)) {
                expression = expression.slice(0, -1);
            } else {
                expression += "-";
            }
        } else {
            expression += "-";
        }

        updateDisplay();
        return;
    }

    const match = expression.match(/(\d*\.?\d+)$/);

    if (!match) return;

    const numberStart = match.index;
    const previousChar = expression[numberStart - 1];

    if (
        previousChar === "-" &&
        (
            numberStart - 1 === 0 ||
            operators.includes(expression[numberStart - 2])
        )
    ) {
        expression =
            expression.slice(0, numberStart - 1) +
            expression.slice(numberStart);
    } else if (previousChar === "-" || operators.includes(previousChar)) {
        expression =
            expression.slice(0, numberStart) +
            "-" +
            expression.slice(numberStart);
    } else {
        expression =
            expression.slice(0, numberStart) +
            "-" +
            expression.slice(numberStart);
    }

    updateDisplay();
}

function calculate(input) {
    const tokens = [];
    let i = 0;
    let expectingNumber = true;

    while (i < input.length) {
        const remaining = input.slice(i);

        if (expectingNumber) {
            const numberMatch = remaining.match(
                /^-?(?:\d+\.?\d*|\.\d+)/
            );

            if (!numberMatch) {
                throw new Error("Invalid expression");
            }

            const number = Number(numberMatch[0]);

            if (!Number.isFinite(number)) {
                throw new Error("Invalid number");
            }

            tokens.push(number);
            i += numberMatch[0].length;
            expectingNumber = false;
        } else {
            const operator = input[i];

            if (!operators.includes(operator)) {
                throw new Error("Invalid expression");
            }

            tokens.push(operator);
            i++;
            expectingNumber = true;
        }
    }

    if (expectingNumber || tokens.length === 0) {
        throw new Error("Incomplete expression");
    }

    for (let j = 1; j < tokens.length; ) {
        const operator = tokens[j];

        if (operator === "*" || operator === "/") {
            const left = tokens[j - 1];
            const right = tokens[j + 1];
            let result;

            if (operator === "/") {
                if (right === 0) {
                    throw new Error("Cannot divide by zero");
                }

                result = left / right;
            } else {
                result = left * right;
            }

            if (!Number.isFinite(result)) {
                throw new Error("Result out of range");
            }

            tokens.splice(j - 1, 3, result);
            j = 1;
        } else {
            j += 2;
        }
    }

    let result = tokens[0];

    for (let j = 1; j < tokens.length; j += 2) {
        const operator = tokens[j];
        const number = tokens[j + 1];

        switch (operator) {
            case "+":
                result += number;
                break;

            case "-":
                result -= number;
                break;
        }

        if (!Number.isFinite(result)) {
            throw new Error("Result out of range");
        }
    }

    return result;
}

function handleEquals() {
    if (hasError || expression === "") return;

    try {
        const result = calculate(expression);

        const formattedResult = Number(result.toPrecision(12)).toString();

        expression = formattedResult;
        inputBox.value = formattedResult;
        justCalculated = true;
    } catch (error) {
        if (error.message === "Cannot divide by zero") {
            showError("Cannot divide by zero");
        } else {
            showError("Error");
        }
    }
}

buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        const value = button.textContent.trim();

        switch (value) {
            case "C":
                clearCalculator();
                break;

            case "⌫":
                deleteLast();
                break;

            case "+/-":
                toggleSign();
                break;

            case "=":
                handleEquals();
                break;

            case "+":
            case "-":
            case "*":
            case "/":
                addOperator(value);
                break;

            default:
                if (/^\d+$/.test(value) || value === ".") {
                    addNumber(value);
                }
        }
    });
});

document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^\d$/.test(key)) {
        addNumber(key);
    } else if (key === ".") {
        addNumber(".");
    } else if (operators.includes(key)) {
        addOperator(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        handleEquals();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape") {
        clearCalculator();
    }
});

updateDisplay();