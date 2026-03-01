function move(event) {
    event.dataTransfer.setData('text/plain', event.target.outerHTML);
}

function drop(event) {
    event.preventDefault();

    let html = event.dataTransfer.getData('text/plain');
    let temp = document.createElement('div');
    temp.innerHTML = html;
    let new_block = temp.firstChild;

    new_block.removeAttribute('draggable');
    new_block.style.cursor = 'default';

    let target = event.target;

    if (target.id == 'block_zone') {
        target.appendChild(new_block);
    } else {
        let box = document.createElement('div');
        box.style.marginLeft = '20px';
        box.appendChild(new_block);
        target.appendChild(box);
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

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockType = block.dataset.type || 'noname';
        const text = block.textContent.trim().replace(/\s+/g, ' ');
        resultDisplay.innerHTML += `Блок ${i + 1}: ${text} (${blockType})<br>`;

        if (['add', 'subtract', 'multiply', 'divide'].includes(blockType)) {
            const firstFragment = block.querySelector('.left');
            const secondFragment = block.querySelector('.right');
            if (firstFragment && secondFragment) {
                const firstValue = parseFloat(firstFragment.value);
                const secondValue = parseFloat(secondFragment.value);

                if (Number(firstValue) === firstValue && Number(secondValue) === secondValue &&
                    isFinite(firstValue) && isFinite(secondValue)) {

                    let result;
                    if (blockType === 'add') result = firstValue + secondValue;
                    else if (blockType === 'subtract') result = firstValue - secondValue;
                    else if (blockType === 'multiply') result = firstValue * secondValue;
                    else if (blockType === 'divide') {
                        if (secondValue !== 0) result = firstValue / secondValue;
                        else result = 'НА НОЛЬ НЕ ДЕЛИМ';
                    }
                    resultDisplay.innerHTML += `получается: ${result}<br>`;
                } else {
                    resultDisplay.innerHTML += `не берем такое <br>`;
                }
            }
        }
    }
}