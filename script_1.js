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

function clearErrors() {
    document.querySelectorAll('.block.error').forEach(block => {
        block.classList.remove('error');
    });
}

function getBlockInSlot(slot) {
    return slot.querySelector('.block');
}

function getBlocksInSlot(slot) {
    return slot.querySelectorAll('.block');
}

function runCode() {
    const blockZone = document.getElementById('block_zone');
    const resultDisplay = document.getElementById('result_display');
    resultDisplay.innerHTML = '';
    clearErrors();

    const variable = {};

    function calculations(block) {
        if (!block) throw { message: 'Где блоки?', block: null };

        const type = block.dataset.type;
        if (type === 'number') {
            const text = block.querySelector('.number-value').textContent.trim();
            const number = parseInt(text, 10);
            if (isNaN(number)) throw { message: 'Это даже не число', block };
            return number;
        }
        if (type === 'variable') {
            const name = block.querySelector('.var-name').textContent.trim();
            if (!(name in variable)) throw { message: `Переменная "${name}" не объявлена`, block };
            return variable[name];
        }
        if (type === 'operation') {
            const firstSlot = block.querySelector('.left-slot');
            const secondSlot = block.querySelector('.right-slot');
            const firstBlock = getBlockInSlot(firstSlot);
            const secondBlock = getBlockInSlot(secondSlot);
            if (!firstBlock || !secondBlock) throw { message: 'Задайте-ка все операнды', block };

            const firstValue = calculations(firstBlock);
            const secondValue = calculations(secondBlock);
            const op = block.querySelector('.operator').value;

            switch (op) {
                case 'add': return firstValue + secondValue;
                case 'subtract': return firstValue - secondValue;
                case 'multiply': return firstValue * secondValue;
                case 'divide':
                    if (secondValue === 0) throw { message: 'Деление на ноль так-то', block };
                    return Math.trunc(firstValue / secondValue);
                case 'mod':
                    if (secondValue === 0) throw { message: 'Что осталось от деления', block };
                    return firstValue % secondValue;
                default: throw { message: `Не знаем такую операцию ${op}`, block };
            }
        }
        throw { message: `Блок не выражение: ${type}`, block };
    }

    function startBlock(block) {
        if (!block) return;
        const type = block.dataset.type;

        try {
            if (type === 'declaration') {
                const text = block.querySelector('.var-list').textContent.trim();
                const names = text.split(',').map(s => s.trim());
                names.forEach(name => {
                    if (!name) return;
                    if (name in variable) throw { message: `Переменная "${name}" уже объявлена`, block };
                    variable[name] = 0;
                });
            }
            else if (type === 'assign') {
                const varibleName = block.querySelector('.var-name').textContent.trim();
                if (!(varibleName in variable)) throw { message: `Переменная "${varibleName}" не объявлена`, block };

                const expressionSlot = block.querySelector('.expr-slot');
                const exprBlock = getBlockInSlot(expressionSlot);
                if (!exprBlock) throw { message: 'Выражение для присваивания где?', block };

                const value = calculations(exprBlock);
                variable[varibleName] = value;
            }
            else if (type === 'output') {
                const expressionSlot = block.querySelector('.expr-slot');
                const expressionBlock  = getBlockInSlot(expressionSlot );
                if (!expressionBlock ) throw { message: 'Выражение для вывода где?', block };

                const value = calculations(expressionBlock );
                resultDisplay.innerHTML += `Вывод: ${value}<br>`;
            }
            else if (type === 'if') {
                const firstSlot = block.querySelector('.left-slot');
                const secondSlot = block.querySelector('.right-slot');
                const firstBlock = getBlockInSlot(firstSlot);
                const secondBlock = getBlockInSlot(secondSlot);
                if (!firstBlock || !secondBlock) throw { message: 'Где выражения для условия?', block };

                const firstVal = calculations(firstBlock);
                const secondVal = calculations(secondBlock);
                const comparsions = block.querySelector('.comparison').value;

                let condition;
                switch (comparsions) {
                    case 'eq': condition = firstVal === secondVal; break;
                    case 'neq': condition = firstVal !== secondVal; break;
                    case 'gt': condition = firstVal > secondVal; break;
                    case 'lt': condition = firstVal < secondVal; break;
                    case 'gte': condition = firstVal >= secondVal; break;
                    case 'lte': condition = firstVal <= secondVal; break;
                    default: throw { message: `Не знаем такой оператор сравнения: ${comparsions}`, block };
                }

                const thenSlot = block.querySelector('.then-slot');
                const elseSlot = block.querySelector('.else-slot');
                const targetSlot = condition ? thenSlot : elseSlot;

                const inBlocks = getBlocksInSlot(targetSlot);
                for (let innerBlock of inBlocks) {
                    startBlock(innerBlock);
                }
            }
        } catch (e) {
            if (e.block) e.block.classList.add('error');
            throw e;
        }
    }
    const basicBlocks = blockZone.children;
    for (let block of basicBlocks) {
        if (block.classList.contains('block')) {
            try {
                startBlock(block);
            } catch (e) {
                resultDisplay.innerHTML += `Ошибка: ${e.message}<br>`;
                if (e.block) e.block.classList.add('error');
                break;
            }
        }
    }

    if (resultDisplay.innerHTML === '') {
        resultDisplay.innerHTML = 'ВСЕ УСПЕШНО!';
    }
}