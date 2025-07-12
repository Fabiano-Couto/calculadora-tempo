class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentInput = ''; 
        this.previousInput = '';
        this.operation = undefined;
        this.isScalarMode = false;
        this.updateDisplay();
    }

    delete() {
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.slice(0, -1);
        }
        this.updateDisplay();
    }
    
    appendNumber(number) {
        if (number === '.' && this.currentInput.includes('.')) return;
        if (number === '.') {
            this.isScalarMode = true;
        }

        if (this.currentInput.length < 6 || this.isScalarMode) {
            this.currentInput += number;
        }
        
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentInput === '' && this.previousInput === '') return;
        
        if (this.currentInput === '' && this.previousInput !== '') {
            this.operation = operation;
            this.updateDisplay();
            return;
        }

        if (this.previousInput !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousInput = this.currentInput;
        this.currentInput = '';
        
        if (operation === '×' || operation === '÷') {
            this.isScalarMode = true;
        } else {
            this.isScalarMode = false;
        }
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prevSeconds = this.parseInputToSeconds(this.previousInput);
        
        let currentVal;
        if (this.operation === '+' || this.operation === '-') {
            currentVal = this.parseShorthandInputToSeconds(this.currentInput);
        } else {
            currentVal = parseFloat(this.currentInput);
        }

        if (isNaN(prevSeconds) || isNaN(currentVal) || this.currentInput === '') return;

        switch (this.operation) {
            case '+':
                computation = prevSeconds + currentVal;
                break;
            case '-':
                computation = prevSeconds - currentVal;
                break;
            case '×':
                computation = prevSeconds * currentVal;
                break;
            case '÷':
                if (currentVal === 0) {
                    alert("Erro: Divisão por zero!");
                    this.clear();
                    return;
                }
                computation = prevSeconds / currentVal;
                break;
            default:
                return;
        }
        this.currentInput = this.formatSecondsToHHMMSS(computation);
        this.operation = undefined;
        this.previousInput = '';
        this.isScalarMode = false;
        this.updateDisplay(true);
    }

    updateDisplay(isResult = false) {
        this.currentOperandTextElement.innerHTML = '';
        
        let displayString;

        if (this.isScalarMode) {
            displayString = this.currentInput || '0';
        } else if (isResult) {
            displayString = this.currentInput;
        } else {
            displayString = this.formatDisplayString(this.currentInput, true);
        }

        // AQUI ESTÁ A CORREÇÃO: Usamos um índice de dígito separado.
        const inputLength = this.isScalarMode || isResult ? displayString.length : this.currentInput.length;
        let digitIndex = 0; 

        for (let i = 0; i < displayString.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.innerText = displayString[i];
            charSpan.classList.add('output-char');

            if (displayString[i] !== ':') {
                // Compara o índice do dígito (e não do caractere) com o total inserido.
                if (!this.isScalarMode && !isResult && digitIndex >= inputLength) {
                    charSpan.classList.add('placeholder');
                }
                digitIndex++; // Incrementa o contador apenas se for um dígito.
            }
            this.currentOperandTextElement.appendChild(charSpan);
        }

        if (this.operation != null && this.previousInput !== '') {
            this.previousOperandTextElement.innerText = `${this.formatDisplayString(this.previousInput)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
    
    formatDisplayString(inputStr, returnPadded = false) {
        if (!inputStr && !returnPadded) return "00:00:00";
        if (!inputStr && returnPadded) inputStr = '';

        const padded = inputStr.padEnd(6, '0');
        const hh = padded.slice(0, 2);
        const mm = padded.slice(2, 4);
        const ss = padded.slice(4, 6);
        const formatted = `${hh}:${mm}:${ss}`;

        return returnPadded ? formatted : inputStr;
    }

    parseInputToSeconds(timeString) {
        if (!timeString) return 0;
        const paddedString = timeString.padEnd(6, '0');
        const hh = parseInt(paddedString.substring(0, 2), 10);
        const mm = parseInt(paddedString.substring(2, 4), 10);
        const ss = parseInt(paddedString.substring(4, 6), 10);
        if (isNaN(hh) || isNaN(mm) || isNaN(ss) || mm > 59 || ss > 59) return 0;
        return (hh * 3600) + (mm * 60) + ss;
    }

    parseShorthandInputToSeconds(shorthandString) {
        if (!shorthandString) return 0;
        const len = shorthandString.length;

        if (len <= 2) {
            const mm = parseInt(shorthandString, 10);
            return isNaN(mm) ? 0 : mm * 60;
        }
        if (len <= 4) {
            const padded = shorthandString.padStart(4, '0');
            const hh = parseInt(padded.slice(0, 2), 10);
            const mm = parseInt(padded.slice(2, 4), 10);
            if (isNaN(hh) || isNaN(mm) || mm > 59) return 0;
            return (hh * 3600) + (mm * 60);
        }
        return this.parseInputToSeconds(shorthandString);
    }
    
    formatSecondsToHHMMSS(totalSeconds) {
        if (isNaN(totalSeconds) || !isFinite(totalSeconds)) return "Erro";
        const sign = totalSeconds < 0 ? '-' : '';
        totalSeconds = Math.abs(totalSeconds);
        const hh = Math.floor(totalSeconds / 3600);
        const mm = Math.floor((totalSeconds % 3600) / 60);
        const ss = Math.round(totalSeconds % 60);
        const pad = (num) => num.toString().padStart(2, '0');
        return `${sign}${pad(hh)}:${pad(mm)}:${pad(ss)}`;
    }
}

// --- Conexão com os elementos do HTML (sem alterações aqui) ---
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
    });
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
    });
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
});

allClearButton.addEventListener('click', button => {
    calculator.clear();
});

deleteButton.addEventListener('click', button => {
    calculator.delete();
});


// --- SUPORTE AO TECLADO (sem alterações aqui) ---
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        calculator.appendNumber(key);
    } else if (key === '.' || key === ',') {
        calculator.appendNumber('.');
    } else if (key === '+') {
        calculator.chooseOperation('+');
    } else if (key === '-') {
        calculator.chooseOperation('-');
    } else if (key === '*') {
        calculator.chooseOperation('×');
    } else if (key === '/') {
        event.preventDefault();
        calculator.chooseOperation('÷');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculator.compute();
    } else if (key === 'Backspace') {
        calculator.delete();
    } else if (key === 'Escape') {
        calculator.clear();
    }
});

// --- NOVO: LÓGICA DO SELETOR DE TEMA ---

// Seleciona todos os botões que têm o atributo 'data-theme'
const themeButtons = document.querySelectorAll('[data-theme]');

// Função para aplicar o tema
function setTheme(theme) {
    document.body.dataset.theme = theme;
    // Salva a escolha do usuário no armazenamento local do navegador
    localStorage.setItem('calculator_theme', theme);
}

// Adiciona um 'escutador' de clique para cada botão
themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        setTheme(button.dataset.theme);
    });
});

// Verifica se há um tema salvo quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('calculator_theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }
    // Opcional: Define um tema padrão se nenhum for salvo
    // else {
    //     setTheme('light'); 
    // }
});