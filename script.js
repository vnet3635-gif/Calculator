const expressionDisplay = document.querySelector("#expression");
const resultDisplay = document.querySelector("#result");
const keys = document.querySelector(".calculator__keys");

let expression = "";
let justCalculated = false;

const operators = ["+", "-", "*", "/"];

function isOperator(value) {
    return operators.includes(value);
}

function formatResult(value) {
    if (!Number.isFinite(value)) {
        return "Error";
    }

    const rounded = Number.parseFloat(value.toPrecision(12));
    return String(rounded);
}

function evaluateExpression(value) {
    const normalized = value.replace(/%/g, "/100");

    if (!/^[\d+\-*/.()\s]+$/.test(normalized) || !/\d/.test(normalized)) {
        throw new Error("Invalid expression");
    }

    const result = Function(`"use strict"; return (${normalized})`)();
    if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("Invalid result");
    }

    return formatResult(result);
}

function updateDisplay() {
    expressionDisplay.textContent = expression || "Ready";
    resultDisplay.textContent = expression ? expression : "0";
}

function addValue(value) {
    if (justCalculated && !isOperator(value)) {
        expression = "";
    }
    justCalculated = false;

    if (value === ".") {
        const currentNumber = expression.split(/[+\-*/]/).pop();
        if (currentNumber.includes(".")) {
            return;
        }
        if (!currentNumber || isOperator(expression.at(-1))) {
            expression += "0";
        }
    }

    if (isOperator(value)) {
        if (!expression && value !== "-") {
            return;
        }
        if (isOperator(expression.at(-1))) {
            expression = expression.slice(0, -1);
        }
    }

    expression += value;
    updateDisplay();
}

function calculate() {
    if (!expression) {
        return;
    }

    try {
        const result = evaluateExpression(expression);
        expressionDisplay.textContent = `${expression} =`;
        resultDisplay.textContent = result;
        expression = result === "Error" ? "" : result;
        justCalculated = true;
    } catch {
        expressionDisplay.textContent = "Invalid expression";
        resultDisplay.textContent = "Error";
        expression = "";
        justCalculated = true;
    }
}

function clearCalculator() {
    expression = "";
    justCalculated = false;
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

keys.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) {
        return;
    }

    const { action } = button.dataset;
    if (action === "clear") {
        clearCalculator();
    } else if (action === "delete") {
        deleteLast();
    } else if (action === "calculate") {
        calculate();
    } else {
        addValue(button.dataset.value);
    }
});

document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^\d$/.test(key) || [".", "+", "-", "*", "/", "%"].includes(key)) {
        event.preventDefault();
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        event.preventDefault();
        deleteLast();
    } else if (key === "Escape") {
        clearCalculator();
    }
});
