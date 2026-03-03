function move(event) {
    event.dataTransfer.setData('text/plain', event.target.outerHTML);
}

function drop(event) {
    event.preventDefault();

    const html = event.dataTransfer.getData('text/plain');
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const newBlock = temp.firstChild;

    newBlock.removeAttribute('draggable');
    newBlock.style.cursor = 'default';

    const target = event.target;
    const slot = target.closest('.slot');

    if (slot) {
        while (slot.firstChild) {
            slot.removeChild(slot.firstChild);
        }
        slot.appendChild(newBlock);
    } else {
        const zone = document.getElementById('block_zone');
        zone.appendChild(newBlock);
    }
}

function runCode() {
    const blockZone = document.getElementById('block_zone');
    const resultDisplay = document.getElementById('result_display');

    resultDisplay.innerHTML = '';

    const blocks = blockZone.children;

    if (blocks.length === 0) {
        resultDisplay.innerHTML = 'Где блоки?';
        return;
    }

    function checkCondition(conditionText) {
        conditionText = conditionText.replace(/\s/g, '');
        const operators = ['>=', '<=', '>', '<', '==', '!='];
        
        for (let op of operators) {
            if (conditionText.includes(op)) {
                const parts = conditionText.split(op);
                if (parts.length === 2) {
                    const first = parts[0];
                    const second = parts[1];

                    const firstNumber = parseFloat(first);
                    const secondNumber = parseFloat(second);
                    
                    if (!isNaN(firstNumber) && !isNaN(secondNumber)) {
                        switch(op) {
                            case '>': return firstNumber > secondNumber;
                            case '<': return firstNumber < secondNumber;
                            case '>=': return firstNumber >= secondNumber;
                            case '<=': return firstNumber <= secondNumber;
                            case '==': return firstNumber === secondNumber;
                            case '!=': return firstNumber !== secondNumber;
                        }
                    } else {
                        switch(op) {
                            case '==': return first === second;
                            case '!=': return first !== second;
                        }
                    }
                }
            }
        }
        
        if (conditionText === 'true') return true;
        if (conditionText === 'false') return false;
        
        const number = parseFloat(conditionText);
        if (!isNaN(number)) return number !== 0;
        
        return false;
    }

    function processBlock(block) {
        const blockType = block.dataset.type;
        if (blockType === 'condition') {
            const firstInput = block.querySelector('.left');
            const comparisonSelect = block.querySelector('.comparison');
            const secondInput = block.querySelector('.right');
            
            if (firstInput && comparisonSelect && secondInput) {
                const firstValue = firstInput.value;
                const secondValue = secondInput.value;
                const operator = comparisonSelect.value;
                
                let opSymbol = '';
                switch(operator) {
                    case 'eq': opSymbol = '=='; break;
                    case 'neq': opSymbol = '!='; break;
                    case 'gt': opSymbol = '>'; break;
                    case 'gte': opSymbol = '>='; break;
                    case 'lt': opSymbol = '<'; break;
                    case 'lte': opSymbol = '<='; break;
                }
                
                const conditionString = `${firstValue}${opSymbol}${secondValue}`;
                const conditionResult = checkCondition(conditionString);
                
                resultDisplay.innerHTML += `Условие "${firstValue} ${opSymbol} ${secondValue}" = ${conditionResult}<br>`;
                
                if (conditionResult) {
                    resultDisplay.innerHTML += `  → ПРАВДА ВЕДЬ<br>`;

                } else {
                    resultDisplay.innerHTML += `  → ДА ЭТО ЛОЖЬ<br>`;
                }
            }
        } 
        else if (blockType === 'operation') {
            const firstInput = block.querySelector('.left');
            const operatorSelect = block.querySelector('.operator');
            const secondInput = block.querySelector('.right');
            
            if (firstInput && operatorSelect && secondInput) {
                const firstValue = parseFloat(firstInput.value);
                const secondValue = parseFloat(secondInput.value);
                const operator = operatorSelect.value;

                if (Number(firstValue) === firstValue && Number(secondValue) === secondValue &&
                    isFinite(firstValue) && isFinite(secondValue)) {

                    let result;
                    switch(operator) {
                        case 'add': result = firstValue + secondValue; break;
                        case 'subtract': result = firstValue - secondValue; break;
                        case 'multiply': result = firstValue * secondValue; break;
                        case 'divide': 
                            if (secondValue !== 0) result = firstValue / secondValue;
                            else result = 'НА НОЛЬ НЕ ДЕЛИМ';
                            break;
                    }
                    resultDisplay.innerHTML += `  → получается: ${result}<br>`;
                } else {
                    resultDisplay.innerHTML += `  → не берем такое<br>`;
                }
            }
        } else {
            const text = block.textContent.trim().replace(/\s+/g, ' ');
            resultDisplay.innerHTML += `Выполняем: ${text}<br>`;
        }
    }

    for (let i = 0; i < blocks.length; i++) {
        processBlock(blocks[i]);
    }
}