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

}