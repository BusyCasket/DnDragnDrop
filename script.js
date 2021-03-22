// dice to be generated
const dice = [4, 6, 8, 10, 12, 20, 100];

// where to put the dice
const diceArea = document.getElementById("dice");

// specifically where to insert the dice before
const controlPanel = document.getElementById("controlPanel");

// whether dragged dice can be dropped in this area
var droppable = 0;

// checkbox id counter for unique IDs
var checkboxCounter = 0;

// create checkbox for advantage or disadvantage
const createCheckbox = (labelText, checkType) => {

    // create unique checkbox id
    checkboxCounter += 1;
    const boxID = labelText + checkboxCounter.toString();

    // create checkbox with relevant classes and id
    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.classList.add("box");
    checkbox.id = boxID;

    // create label
    const label = document.createElement("label");
    label.classList.add("boxLabel");
    label.setAttribute("for", boxID);
    label.innerHTML = labelText;

    // create wrapper with class, append checkbox and label, returb package
    const checker = document.createElement("div");
    checker.classList.add(checkType);
    checker.appendChild(checkbox);
    checker.appendChild(label);
    return checker;
}

// create html element with attributes and content
const createDice = (eyes) => {

    // creater wrapper with class and attributes
    const d = document.createElement("div");
    d.classList.add("dice");
    d.setAttribute("draggable", "true");
    d.setAttribute("eyes", eyes);

    // create and append area to display the number of eyes
    const Number = document.createElement("p");
    Number.classList.add("number");
    Number.innerHTML = `D${eyes}`;
    d.appendChild(Number);

    // create checkboxes for advantage and disadvantage (returned in div class="advantage/disadvantage")
    const advantage = createCheckbox("A", "advantage");
    const disadvantage = createCheckbox("D", "disadvantage");

    // add checkboxes
    d.appendChild(advantage);
    d.appendChild(disadvantage);

    // get checkboxes within current dice instance as nodelist
    const boxes = d.querySelectorAll(".box");

    // loop through checkboxes
    for (let i = 0; i < boxes.length; i++) {

        // add event listener to checkbox instance
        boxes[i].addEventListener("change", () => {
            if (boxes[i].checked) {
                const change = [...boxes];
                change.splice(i, 1);
                for (let i = 0; i < change.length; i++) {
                    change[i].checked = false;
                }
            }
        })
    }

    // create delete button and function
    const del = document.createElement("div");
    del.classList.add("delete");
    del.setAttribute("title", "delete");
    del.innerHTML = "&times;"
    del.addEventListener("click", () => {
        d.remove();
    })
    d.appendChild(del);

    // add quick roll onclick
    Number.addEventListener("click", () => {
        quickRoll(d, eyes);
    })

    return d;
}

// add event handlers for dice on the diceboard
const insideHandling = (dice) => {

    // procedure for starting dragging
    dice.addEventListener("dragstart", () => {
        dice.classList.add("pending");
    })

    // procedure for ending dragging: insert at position or remove from DOM
    dice.addEventListener("dragend", () => {
        if (droppable) {
            dice.classList.remove("pending");
        } else {
            dice.remove();
        }

        // reset
        droppable = 0;
    })
}

// add event handlers for initial dice
const outsideHandling = (dice) => {

    // procedure for starting dragging: add styles while being dragged
    dice.addEventListener("dragstart", () => {

        // add dragging style
        dice.classList.add("chosen");

        // create copy
        const eyes = dice.getAttribute("eyes");
        const copy = createDice(eyes);

        // customize copy
        copy.classList.add("rolling", "pending");
        copy.style.backgroundColor = dice.style.backgroundColor;
        copy.style.display = "none";

        // add pending dice to diceboard
        diceBoard.appendChild(copy);
    });

    // procedure for ending dragging: remove dragging styles and decide either to add a copy to dice board (if hovered over it) or cancel with no effect
    dice.addEventListener("dragend", () => {

        // remove dragging style
        dice.classList.remove("chosen");

        // find and handle pending dice
        const pending = document.querySelector(".pending");
        if (droppable) {
            pending.classList.remove("chosen", "pending");

            // add event handling
            insideHandling(pending);
        } else {
            pending.remove();
        }

        // reset
        droppable = 0;
    });
}

// creating dice from initial dice array
for (i = 0; i < dice.length; i++) {
    const eyes = dice[i];
    const d = createDice(eyes);

    // set a different background-color
    var hue = i * 77;
    hue = hue < 360 ? hue : hue % 360;
    d.style.backgroundColor = `hsl(${hue}, 50%, 80%)`;

    // add event handling for available dice
    outsideHandling(d);

    // insert created dice to dice area before the input
    diceArea.insertBefore(d, controlPanel);
}

// find where to insert dragged dice
const findAfterElement = (x, y) => {

    // get active dice + coordinates
    const moveable = [...diceBoard.querySelectorAll(".rolling:not(.pending)")];

    return moveable.reduce((closest, element) => {

        const box = element.getBoundingClientRect();
        const offsetX = x - box.left - box.width / 2;
        const offsetY = y - box.top - box.height / 2;

        if ((offsetX < 0 && offsetX > closest.offsetX) && (offsetY < 0 && offsetY > closest.offsetY)) {
            return { offsetX: offsetX, offsetY: offsetY, element: element };
        } else {
            return closest;

        }
    }, { offsetX: Number.NEGATIVE_INFINITY, offsetY: Number.NEGATIVE_INFINITY }).element
}

// set up dice board
const diceBoard = document.getElementById("diceBoard");

// while being dragged over the diceboard, dice can be dropped and not deleted
diceBoard.addEventListener("dragover", (e) => {
    e.preventDefault();
    droppable = 1;

    // activate pending dice
    const pending = diceBoard.querySelector(".pending");
    pending.style.display = "grid";

    // get mouse coordinates and closest active dice
    const x = e.clientX;
    const y = e.clientY;
    const next = findAfterElement(x, y);

    if (next == null) {
        diceBoard.appendChild(pending)
    } else {
        diceBoard.insertBefore(pending, next);
    }
});

diceBoard.addEventListener("dragleave", () => {
    const pending = diceBoard.querySelector(".pending");
    pending.style.display = "none";
    droppable = 0;
})

// create new dice via input
const addDice = () => {
    const eyes = document.getElementById("newDiceInput").value;
    if (eyes !== "") {
        const newDice = createDice(eyes);
        outsideHandling(newDice);
        diceArea.insertBefore(newDice, controlPanel);

        // set color
        const x = diceArea.querySelectorAll(".dice").length;
        let hue = x * 77;
        hue = hue < 360 ? hue : hue % 360;
        newDice.style.backgroundColor = `hsl(${hue}, 50%, 80%)`;
    }
}

/*
Protocol
========================================
*/

// where to display results
const protocol = document.getElementById("protocol");

// get modifier
const modifier = document.getElementById("modifier");

// rolling the dice
const rolling = (amount) => {
    return Math.floor(Math.random() * amount + 1);
}

// roll twice and min max
const minMax = (eyes) => {
    let first = rolling(eyes);
    let second = rolling(eyes);
    const max = Math.max(first, second);
    const min = Math.min(first, second);
    return { min: min, max: max };
}

//style roll
const styleRoll = (roll, max) => {
    let spanClass = "";
    if (roll == max) {
        spanClass += "green";
    } else if (roll == 1) {
        spanClass += "red";
    }
    return spanClass;
}

// determine top roll or not
const isTopRoll = (result, maxRoll, minRoll) => {
    let is = "";
    if (result == maxRoll) {
        is = "top";
    } else if (result == minRoll) {
        is = "low";
    }
    return is;
}

// handle modifier
const handleMod = (modValue) => {
    let m = modValue.toString();
    let modSpan = ` + (M) <span class="bold">${m}</span>`;
    return modSpan;
}

// add calcualation and result to Protocol
const addResult = (calculation, result, topRoll) => {
    // create result element for the protocol
    const note = document.createElement("div");
    note.classList.add("result");

    // add calculation path
    note.innerHTML = calculation;

    // add hr
    note.appendChild(document.createElement("hr"));

    // add result
    const conclusion = document.createElement("p");
    conclusion.classList.add("bold");
    conclusion.innerHTML = result.toString();
    if (topRoll == "top") {
        conclusion.classList.add("green");
    } else if (topRoll == "low") {
        conclusion.classList.add("red");
    }
    note.appendChild(conclusion);

    // post the new result element on top of the protocol
    protocol.insertBefore(note, protocol.firstChild);
}

// calculating results
const roll = () => {

    // get all dice currently within the dice board
    const activeDice = document.querySelectorAll(".rolling");

    if (activeDice.length !== 0) {
        // the sum
        var result = 0;

        // every step to arrive at this sum
        var calculation = "";

        // roll all dice, keep track of calculation, consider advantage/disadvantage, account for modifier and collect result
        for (i = 0; i < activeDice.length; i++) {

            // get dice element and eyes of dice
            const d = activeDice[i];
            const eyes = d.getAttribute("eyes");

            // get checkbox values for advantage/disadvantage
            const advantage = d.querySelector(".advantage").querySelector(".box").checked;
            const disadvantage = d.querySelector(".disadvantage").querySelector(".box").checked;

            // check if loop has ended
            const calcDone = () => {

                // if loop is still going add " + "
                if (i + 1 != activeDice.length) {
                    calculation += " + ";
                }
            }

            // procedures for dice result
            if (advantage == false && disadvantage == false) {
                let roll = rolling(eyes);
                let spanClass = styleRoll(roll, eyes);
                calculation += `(D${eyes}) <span class="bold ${spanClass}">${roll}</span>`;
                calcDone();
                result += roll;
            } else if (advantage == true) {
                const adv = minMax(eyes);
                const min = adv.min;
                const max = adv.max;
                let styleMin = styleRoll(min, eyes);
                let styleMax = styleRoll(max, eyes);
                calculation += `(D${eyes}) <span>[ <span class="orange ${styleMin}">${min}</span> | <span class="bold blue ${styleMax}">${max}</span> ]</span>`;
                calcDone();
                result += max;
            } else {
                const dis = minMax(eyes);
                const min = dis.min;
                const max = dis.max;
                let styleMin = styleRoll(min, eyes);
                let styleMax = styleRoll(max, eyes);
                calculation += `(D${eyes}) <span>[ <span class="orange ${styleMax}">${max}</span> | <span class="bold blue ${styleMin}">${min}</span> ]</span>`;
                calcDone();
                result += min;
            }
        }


        // determine whether it's maxRoll/lowRoll or not for styling in result
        let maxRoll = 0;
        for (let i = 0; i < activeDice.length; i++) {
            maxRoll += parseInt(activeDice[i].getAttribute("eyes"));
        }
        const topRoll = isTopRoll(result, maxRoll, activeDice.length)

        // get and handle modifier
        const modValue = parseInt(modifier.value);
        if (modValue !== 0 && modifier.value.length !== 0) {
            calculation += handleMod(modValue);
            result += modValue;
        }

        // add to protocol
        addResult(calculation, result, topRoll)
    };
}

// remove all dice currently within the dice board at once
const clearBoard = () => {
    const activeDice = document.querySelectorAll(".rolling");
    for (i = 0; i < activeDice.length; i++) {
        activeDice[i].remove();
    }
};

// quick roll

const quickRoll = (d, eyes) => {

    var result = 0;

    var calculation = "";

    // get checkbox values for advantage/disadvantage
    const advantage = d.querySelector(".advantage").querySelector(".box").checked;
    const disadvantage = d.querySelector(".disadvantage").querySelector(".box").checked;

    // procedures for dice result
    if (advantage == false && disadvantage == false) {
        let roll = rolling(eyes);
        let spanClass = styleRoll(roll, eyes);
        calculation += `(D${eyes}) <span class="bold ${spanClass}">${roll}</span>`;
        result += roll;
    } else if (advantage == true) {
        const adv = minMax(eyes);
        const min = adv.min;
        const max = adv.max;
        let styleMin = styleRoll(min, eyes);
        let styleMax = styleRoll(max, eyes);
        calculation += `(D${eyes}) <span>[ <span class="orange ${styleMin}">${min}</span> | <span class="bold blue ${styleMax}">${max}</span> ]</span>`;
        result += max;
    } else {
        const dis = minMax(eyes);
        const min = dis.min;
        const max = dis.max;
        let styleMin = styleRoll(min, eyes);
        let styleMax = styleRoll(max, eyes);
        calculation += `(D${eyes}) <span>[ <span class="orange ${styleMax}">${max}</span> | <span class="bold blue ${styleMin}">${min}</span> ]</span>`;
        result += min;
    }

    // determine whether it's maxRoll/lowRoll or not for styling in result
    const topRoll = isTopRoll(result, eyes, 1)

    // get and handle modifier
    const modValue = parseInt(modifier.value);
    if (modValue !== 0 && modifier.value.length !== 0) {
        calculation += handleMod(modValue);
        result += modValue;
    }

    // add to protocol
    addResult(calculation, result, topRoll);
}

// clear modified roll
const clearModifier = () => {
    modifier.value = 0;
}