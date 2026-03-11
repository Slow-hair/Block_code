function move(event) {
  const block = event.target.closest(".block");
  if (block) {
    const isFromLeftPanel = block.closest(".blocks-palette") !== null;
    if (isFromLeftPanel) {
      event.dataTransfer.setData("text/plain", block.outerHTML);
      event.dataTransfer.effectAllowed = "copy";
    } else {
      if (!block.id) {
        block.id = "block_" + Date.now() + "_" + Math.random();
      }
      event.dataTransfer.setData("text/plain", block.id);
      event.dataTransfer.effectAllowed = "move";
    }
  }
}

function drop(event) {
  event.preventDefault();

  const someInfo = event.dataTransfer.getData("text/plain");
  const whatIsObject = event.target;

  if (whatIsObject.closest(".blocks-palette")) {
    return;
  }

  const targetSlot = whatIsObject.closest(".slot");
  const targetZone = whatIsObject.closest("#block_zone");

  let draggedBlock = document.getElementById(someInfo);

  if (!draggedBlock) {
    const temp = document.createElement("div");
    temp.innerHTML = someInfo;
    const newBlock = temp.firstChild;

    newBlock.removeAttribute("draggable");
    newBlock.style.cursor = "default";
    newBlock.setAttribute("draggable", "true");
    newBlock.ondragstart = move;

    newBlock.id = "block_" + Date.now() + "_" + Math.random();

    if (targetSlot) {
      while (targetSlot.firstChild) {
        targetSlot.removeChild(targetSlot.firstChild);
      }
      targetSlot.appendChild(newBlock);
    } else if (targetZone) {
      targetZone.appendChild(newBlock);
    }
  } else {
    if (targetSlot && targetSlot.contains(draggedBlock)) {
      return;
    }

    draggedBlock.remove();

    if (targetSlot) {
      while (targetSlot.firstChild) {
        targetSlot.removeChild(targetSlot.firstChild);
      }
      targetSlot.appendChild(draggedBlock);
    } else if (targetZone) {
      targetZone.appendChild(draggedBlock);
    } else {
      document.getElementById("block_zone").appendChild(draggedBlock);
    }
  }
}

function clearBlockZone() {
    const blockZone = document.getElementById("block_zone");
    const resultDisplay = document.getElementById("result_display");
    blockZone.innerHTML = '';
    resultDisplay.innerHTML = '';
    clearErrors();
    console.log("Очистка прошла");
}

function dropOnLeftZone(event) {
  event.preventDefault();
  const blockId = event.dataTransfer.getData("text/plain");
  const draggedBlock = document.getElementById(blockId);
  if (draggedBlock) {
    draggedBlock.remove();
  }
}

function clearErrors() {
  document.querySelectorAll(".block.error").forEach((block) => {
    block.classList.remove("error");
  });
}

function getBlockInSlot(slot) {
  return slot.querySelector(".block");
}

function getBlocksInSlot(slot) {
  return slot.querySelectorAll(".block");
}

function mismatchOperations() {
    const blockZone = document.getElementById("block_zone");
    let hasError = false;
    let errorMessages = [];

    const operationBlocks = blockZone.querySelectorAll(".block-operation");
    operationBlocks.forEach((block) => {
        const firstSlot = block.querySelector(".left-slot");
        const secondSlot = block.querySelector(".right-slot");
        const firstBlock = getBlockInSlot(firstSlot);
        const secondBlock = getBlockInSlot(secondSlot);

        if (!firstBlock || !secondBlock) {
            block.classList.add("error");
            hasError = true;
            errorMessages.push("Не хватает операндов");
        }
    });

    const whileBlocks = blockZone.querySelectorAll(".block-while");
    whileBlocks.forEach((block) => {
        const conditionSlot = block.querySelector(".condition-slot");
        const conditionBlock = getBlockInSlot(conditionSlot);

        if (!conditionBlock) {
            block.classList.add("error");
            hasError = true;
            errorMessages.push("В цикле нет условия");
        }
    });

    const conditionBlocks = blockZone.querySelectorAll(".block-condition-expr");
    conditionBlocks.forEach((block) => {
        const leftSlot = block.querySelector(".left-slot");
        const rightSlot = block.querySelector(".right-slot");
        const leftBlock = getBlockInSlot(leftSlot);
        const rightBlock = getBlockInSlot(rightSlot);

        if (!leftBlock || !rightBlock) {
            block.classList.add("error");
            hasError = true;
            errorMessages.push("В блоке условия не хватает частей");
        }
    });

    return { hasError, messages: errorMessages };
}
const ITERATIONS = 10000;

function runCode() {
  const blockZone = document.getElementById("block_zone");
  const resultDisplay = document.getElementById("result_display");
  resultDisplay.innerHTML = "";
  clearErrors();

  const OperationErr = mismatchOperations();
if (OperationErr.hasError) {
    resultDisplay.innerHTML = OperationErr.messages.join("<br>");
    return;
}

  const variable = {};

  function calculations(block) {
    if (!block) throw { message: "Где блоки?", block: null };

    const type = block.dataset.type;
    if (type === "number") {
      const text = block.querySelector(".number-value").textContent.trim();
      const number = parseInt(text, 10);
      if (isNaN(number)) throw { message: "Это даже не число", block };
      return number;
    }
    if (type === "string") {
      const text = block.querySelector(".string-value").textContent.trim();
      return text;
    }
    if (type === "variable") {
      const name = block.querySelector(".var-name").textContent.trim();
      if (!(name in variable))
        throw { message: `Переменная "${name}" не объявлена`, block };
      return variable[name];
    }
    if (type === "condition") {
      const firstSlot = block.querySelector(".left-slot");
      const secondSlot = block.querySelector(".right-slot");
      const firstBlock = getBlockInSlot(firstSlot);
      const secondBlock = getBlockInSlot(secondSlot);

      if (!firstBlock || !secondBlock) {
        throw { message: "Нужны все части для сравнения", block };
      }

      const firstVal = calculations(firstBlock);
      const secondVal = calculations(secondBlock);
      const comparison = block.querySelector(".comparison").value;

      switch (comparison) {
        case "eq":
          return firstVal === secondVal;
        case "neq":
          return firstVal !== secondVal;
        case "gt":
          return firstVal > secondVal;
        case "lt":
          return firstVal < secondVal;
        case "gte":
          return firstVal >= secondVal;
        case "lte":
          return firstVal <= secondVal;
        default:
          throw { message: `Неизвестный оператор ${comparison}`, block };
      }
    }
    if (type === "operation") {
      const firstSlot = block.querySelector(".left-slot");
      const secondSlot = block.querySelector(".right-slot");
      const firstBlock = getBlockInSlot(firstSlot);
      const secondBlock = getBlockInSlot(secondSlot);
      if (!firstBlock || !secondBlock)
        throw { message: "Задайте-ка все операнды", block };

      const firstValue = calculations(firstBlock);
      const secondValue = calculations(secondBlock);
      const op = block.querySelector(".operator").value;

      switch (op) {
        case "add":
          if (
            typeof firstValue === "string" ||
            typeof secondValue === "string"
          ) {
            return String(firstValue) + String(secondValue);
          }
          return firstValue + secondValue;
        case "subtract":
          return firstValue - secondValue;
        case "multiply":
          return firstValue * secondValue;
        case "divide":
          if (secondValue === 0)
            throw { message: "Деление на ноль так-то", block };
          return Math.trunc(firstValue / secondValue);
        case "mod":
          if (secondValue === 0)
            throw { message: "Что осталось от деления", block };
          return firstValue % secondValue;
        default:
          throw { message: `Не знаем такую операцию ${op}`, block };
      }
    }
    throw { message: `Блок не выражение: ${type}`, block };
  }

  function startBlock(block) {
    if (!block) return;
    const type = block.dataset.type;

    try {
      if (type === "declaration") {
        const text = block.querySelector(".var-list").textContent.trim();
        const names = text.split(",").map((s) => s.trim());
        names.forEach((name) => {
          if (!name) return;
          if (name in variable)
            throw { message: `Переменная "${name}" уже объявлена`, block };
          variable[name] = 0;
        });
      } else if (type === "assign") {
        const varibleName = block.querySelector(".var-name").textContent.trim();
        if (!(varibleName in variable))
          throw { message: `Переменная "${varibleName}" не объявлена`, block };

        const expressionSlot = block.querySelector(".expr-slot");
        const exprBlock = getBlockInSlot(expressionSlot);
        if (!exprBlock)
          throw { message: "Выражение для присваивания где?", block };

        const value = calculations(exprBlock);
        variable[varibleName] = value;
      } else if (type === "output") {
        const expressionSlot = block.querySelector(".expr-slot");
        const expressionBlock = getBlockInSlot(expressionSlot);
        if (!expressionBlock)
          throw { message: "Выражение для вывода где?", block };

        const value = calculations(expressionBlock);
        resultDisplay.innerHTML += `Вывод: ${value}<br>`;
      } else if (type === "if") {
        const firstSlot = block.querySelector(".left-slot");
        const secondSlot = block.querySelector(".right-slot");
        const firstBlock = getBlockInSlot(firstSlot);
        const secondBlock = getBlockInSlot(secondSlot);
        if (!firstBlock || !secondBlock)
          throw { message: "Где выражения для условия?", block };

        const firstVal = calculations(firstBlock);
        const secondVal = calculations(secondBlock);
        const comparsions = block.querySelector(".comparison").value;

        let condition;
        switch (comparsions) {
          case "eq":
            condition = firstVal === secondVal;
            break;
          case "neq":
            condition = firstVal !== secondVal;
            break;
          case "gt":
            condition = firstVal > secondVal;
            break;
          case "lt":
            condition = firstVal < secondVal;
            break;
          case "gte":
            condition = firstVal >= secondVal;
            break;
          case "lte":
            condition = firstVal <= secondVal;
            break;
          default:
            throw {
              message: `Не знаем такой оператор сравнения: ${comparsions}`,
              block,
            };
        }

        const thenSlot = block.querySelector(".then-slot");
        const elseSlot = block.querySelector(".else-slot");
        const targetSlot = condition ? thenSlot : elseSlot;

        const inBlocks = getBlocksInSlot(targetSlot);
        for (let innerBlock of inBlocks) {
          startBlock(innerBlock);
        }
      } else if (type === "while") {
        const conditionSlot = block.querySelector(".condition-slot");
        const bodySlot = block.querySelector(".body-slot");

        const conditionBlock = getBlockInSlot(conditionSlot);
        if (!conditionBlock)
          throw { message: "Отсутствует условие цикла while", block };

        const bodyBlocks = getBlocksInSlot(bodySlot);

        let iterations = 0;
        while (true) {
          if (iterations++ >= ITERATIONS) {
            throw { message: "БЕСКОНЕЧНОСТЬ НЕ ПРЕДЕЕЕЕЕЛ!!!", block };
          }

          const conditionValue = calculations(conditionBlock);
          if (!conditionValue) break;

          for (let innerBlock of bodyBlocks) {
            startBlock(innerBlock);
          }
        }
      } 
    } catch (e) {
      if (e.block) e.block.classList.add("error");
      throw e;
    }
  }
  const basicBlocks = blockZone.children;
  for (let block of basicBlocks) {
    if (block.classList.contains("block")) {
      try {
        startBlock(block);
      } catch (e) {
        resultDisplay.innerHTML += `Ошибка: ${e.message}<br>`;
        if (e.block) e.block.classList.add("error");
        break;
      }
    }
  }

  if (resultDisplay.innerHTML === "") {
    resultDisplay.innerHTML = "Все хорошо, даже подозрительно...";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".block-zone .block").forEach((block) => {
    block.setAttribute("draggable", "true");
    block.ondragstart = move;
  });
});