class Configuration {
    activations = [new Linear(), new Sigmoid(), new TanH(), new ReLU()];
    shape = [3, 2, 2];
    hiddenActivationIdx = 2;
    outputActivationIdx = 1;
    learningRate = 0.1;
    epochCount = 0;

    numberInputs = [];
    epochLabel = document.getElementById("epoch-label");

    disabled = false;

    constructor() {
        for(let layerIdx = 0; layerIdx < 3; layerIdx++) {
            this.numberInputs.push(document.getElementById(`number-input-${layerIdx}`));
            this.numberInputs[layerIdx].innerHTML = this.shape[layerIdx];
        }

        let epochString = this.epochCount.toString();
        epochString = epochString.padStart(6, "0");
        epochString = epochString.substr(0, 3) + " " + epochString.substr(3, 6);
        this.epochLabel.innerHTML = epochString;
    }
    disable() {
        this.disabled = true;

        let numberInputBoxes = document.getElementsByClassName("number-input");
        for(let i = 0 ; i < numberInputBoxes.length; i++) {
            numberInputBoxes[i].classList.add("number-input-disabled");
            let icons = numberInputBoxes[i].querySelectorAll(".item-icon");
            for(let j = 0; j < icons.length; j++) {
                icons[j].classList.add("number-input-icon-disabled");
            }
        }

        let activationSelects = document.getElementsByClassName("activation-select");
        for(let i = 0 ; i < activationSelects.length; i++) {
            activationSelects[i].disabled = true;
            let icon = activationSelects[i].parentNode.querySelector(".item-icon");
            icon.classList.add("select-icon-disabled");
        }
    }
    enable() {
        this.disabled = false;
        
        let numberInputBoxes = document.getElementsByClassName("number-input");
        for(let i = 0 ; i < numberInputBoxes.length; i++) {
            numberInputBoxes[i].classList.remove("number-input-disabled");
            let icons = numberInputBoxes[i].querySelectorAll(".item-icon");
            for(let j = 0; j < icons.length; j++) {
                icons[j].classList.remove("number-input-icon-disabled");
            }
        }

        let activationSelects = document.getElementsByClassName("activation-select");
        for(let i = 0 ; i < activationSelects.length; i++) {
            activationSelects[i].disabled = false;
            let icon = activationSelects[i].parentNode.querySelector(".item-icon");
            icon.classList.remove("select-icon-disabled");
        }
    }
    changeShape(layerIdx, amount) {
        if(!this.disabled) {
            let newValue = this.shape[layerIdx] + amount;
            if(newValue > 0 && !(newValue > 5 || (layerIdx == 2 && newValue > 3))) {
                this.shape[layerIdx] = newValue;
                this.numberInputs[layerIdx].innerHTML = this.shape[layerIdx];
                init();
            }
        }
    }
    getShape() {
        return this.shape;
    }
    changeActivation(layer, activationIdx) {
        if(layer == "hidden") {
            this.hiddenActivationIdx = parseInt(activationIdx);
        } else {
            this.outputActivationIdx = parseInt(activationIdx);
        }
        init();
    }
    getHiddenActivation() {
        return this.activations[this.hiddenActivationIdx];
    }
    getOutputActivation() {
        return this.activations[this.outputActivationIdx];
    }
    changeLearningRate(value) {
        this.learningRate = parseFloat(value);
    }
    getLearningRate() {
        return this.learningRate;
    }
    increaseEpochCount() {
        this.epochCount += 1;

        let epochString = this.epochCount.toString();
        epochString = epochString.padStart(6, "0");
        epochString = epochString.substr(0, 3) + " " + epochString.substr(3, 6);
        this.epochLabel.innerHTML = epochString;
    }
    resetEpochCount() {
        this.epochCount = 0;

        let epochString = this.epochCount.toString();
        epochString = epochString.padStart(6, "0");
        epochString = epochString.substr(0, 3) + " " + epochString.substr(3, 6);
        this.epochLabel.innerHTML = epochString;
    }
}

class DataTable {
    table = document.getElementById("data-table");
    rows = [];
    radios = [];

    constructor(inputSize, outputSize, restrictOutputValues) {
        this.inputSize = inputSize;
        this.outputSize = outputSize;
        this.restrictOutputValues = restrictOutputValues;

        this.table.innerHTML = "";

        let row = this.table.insertRow();

        for(let i = 0; i < 2; i++) {
            let header = document.createElement("th");
            header.colSpan = this.inputSize;
            if(i == 0) {
                header.innerHTML = "Input";
            } else {
                header.innerHTML = "Target";
                header.setAttribute("class", "padding-left");
            }
            row.appendChild(header);
        }
    }
    addRow(input, output) {
        if(!input) {
            input = [];
            for(let i = 0; i < this.inputSize; i++) {
                input.push("0");
            }
        }
        if(!output) {
            output = [];
            for(let i = 0; i < this.outputSize; i++) {
                output.push("0");
            }
        }

        let index = this.rows.length;
        let row = this.table.insertRow();
        this.rows.push([]);
        
        let n = this.inputSize + this.outputSize;
        let width = this.calculateWidth(n);

        for(let i = 0; i < this.inputSize; i++) {
            let inputField = document.createElement("input");
            inputField.className = "table-input";
            inputField.type = "text";
            inputField.value = input[i];
            inputField.oninput = function() {validateInput(inputField, false)};
            inputField.onblur = function() {validateValue(inputField, false)};
            inputField.style.width = width;
            let cell = row.insertCell();
            cell.appendChild(inputField);
            this.rows[index].push(inputField);
        }
    
        for(let i = 0; i < this.outputSize; i++) {
            let inputField = document.createElement("input");
            inputField.className = "table-input";
            inputField.type = "text";
            inputField.value = output[i];
            inputField.oninput = function() {validateInput(inputField, true)};
            inputField.onblur = function() {validateValue(inputField, true)};
            inputField.style.width = width;
            let cell = row.insertCell();
            if(i == 0) {
                cell.setAttribute("class", "padding-left");
            }
            cell.appendChild(inputField);
            this.rows[index].push(inputField);
        }
    
        let radio = document.createElement("input");
        radio.setAttribute("type", "radio");
        radio.setAttribute("name", "currentRow");
        radio.setAttribute("onclick", "sketch.update(" + index + ")");
        radio.setAttribute("disabled", true);
        let checkmark = document.createElement("span");
        checkmark.setAttribute("class", "checkmark");
        let container = document.createElement("div");
        container.setAttribute("class", "radio");
        container.appendChild(radio);
        container.appendChild(checkmark);
        let cell = row.insertCell();
        cell.appendChild(container);
        this.radios.push(radio);

        if(this.rows.length > 2) {
            let removeButton = document.getElementById("remove-button");
            removeButton.disabled = false;
        }
        if(this.rows.length > 9) {
            let addButton = document.getElementById("add-button");
            addButton.disabled = true;
        }

        if(this.getCurrentRow() == -1) {
            this.radios[0].checked = true;
        }
    }
    removeRow() {
        let row = this.rows[this.rows.length - 1][0].parentNode.parentNode;
        row.parentNode.removeChild(row);
        this.rows.pop();
        this.radios.pop();

        if(this.rows.length <= 2) {
            let removeButton = document.getElementById("remove-button");
            removeButton.disabled = true;
        }
        if(this.rows.length <= 9) {
            let addButton = document.getElementById("add-button");
            addButton.disabled = false;
        }  

        if(this.getCurrentRow() == -1) {
            this.radios[0].checked = true;
        }
    }
    randomizeValues() {
        for(let i = 0; i < this.rows.length; i++) {
            for(let j = 0; j < this.inputSize + this.outputSize; j++) {
                let value = Math.round(Math.random() * 100) / 100;
                if(!(j >= this.inputSize && this.restrictOutputValues)) {
                    value *= Math.round(Math.random()) ? 1 : -1;
                }
                this.rows[i][j].value = value;
            }
        }
    }
    updateWidths() {
        let n = this.inputSize + this.outputSize;
        for(let i = 0; i < this.rows.length; i++) {
            for(let j = 0; j < n; j++) {
                this.rows[i][j].style.width = this.calculateWidth(n);
            }
        }
    }
    calculateWidth(n) {
        let width = 0;
        let padding = pixelsToViewportWidth(remToPixels(0.25));
        let gap = pixelsToViewportWidth(remToPixels(1));
        let radio = pixelsToViewportWidth(remToPixels(1.5));
        let border = pixelsToViewportWidth(1);
        let tolerance = pixelsToViewportWidth(4);

        let mediaQuery = window.matchMedia("(max-width: 800px)");
        if(mediaQuery.matches) {
            width = (50 - 2 * n * border - (n - 1) * padding - gap - radio - tolerance) / n;
        } else {
            width = (25 - 2 * n * border - (n - 1) * padding - gap - radio - tolerance) / n;
        }

        return width + "vw";
    }
    disable() {
        for(let i = 0; i < this.rows.length; i++) {
            for(let j = 0; j < this.inputSize + this.outputSize; j++) {
                this.rows[i][j].disabled = true;
            }
        }
        for(let i = 0; i < this.radios.length; i++) {
            this.radios[i].disabled = false;
        }
        let addButton = document.getElementById("add-button");
        addButton.disabled = true;
        let removeButton = document.getElementById("remove-button");
        removeButton.disabled = true;
        let randomizeButton = document.getElementById("randomize-button");
        randomizeButton.disabled = true;
        let info = document.getElementById("info");
        info.classList.remove("hidden");
    }
    enable() {
        for(let i = 0; i < this.rows.length; i++) {
            for(let j = 0; j < this.inputSize + this.outputSize; j++) {
                this.rows[i][j].disabled = false;
            }
        }
        for(let i = 0; i < this.radios.length; i++) {
            this.radios[i].disabled = true;
        }
        if(this.rows.length <= 9) {
            let addButton = document.getElementById("add-button");
            addButton.disabled = false;
        }
        if(this.rows.length > 2) {
            let removeButton = document.getElementById("remove-button");
            removeButton.disabled = false;
        }
        let randomizeButton = document.getElementById("randomize-button");
        randomizeButton.disabled = false;
        let info = document.getElementById("info");
        info.classList.add("hidden");
    }
    getInputs() {
        let inputs = [];
        for(let row = 0; row < this.rows.length; row++) {
            let input = [];
            for(let i = 0; i < this.inputSize; i++) {
                input.push(parseFloat(this.rows[row][i].value));
            }
            inputs.push(input);
        }
        return inputs;
    }
    getOutputs() {
        let outputs = [];
        for(let row = 0; row < this.rows.length; row++) {
            let output = [];
            for(let i = this.inputSize; i < this.inputSize + this.outputSize; i++) {
                output.push(parseFloat(this.rows[row][i].value));
            }
            outputs.push(output);
        }
        return outputs;
    }
    getCurrentRow() {
        for(let i = 0; i < this.radios.length; i++) {
            if(this.radios[i].checked) {
                return i;
            }
        }
        return -1;
    }
}

class Sketch {
    svg = document.getElementById("sketch");
    paths = [];
    titles = [];
    circles = [];
    texts = [];
    values = [];
    weights = [];

    constructor(shape) {
        this.shape = shape;

        this.svg.innerHTML = "";
    }
    draw() {
        let namespace = "http://www.w3.org/2000/svg";

        let size = 910;
        let radius = 50;
        let max = Math.max(...this.shape);
        let paddingX = 5;
        let minPaddingY = 5;
        let biasY = size - minPaddingY - radius;
        let spacingX = 300;
        let spacingY;
        switch(max) {
            case 1:
                spacingY = 600;
                break;
            case 2:
                spacingY = 250;
                break;
            case 3:
                spacingY = 133.33;
                break;
            case 4:
                spacingY = 75;
                break;
            case 5:
                spacingY = 40;
                break;
        }

        for(let layerIdx = 0; layerIdx < 2; layerIdx++) {
            this.paths.push([]);
            this.titles.push([]);

            let x1 = paddingX + (2 * radius + spacingX) * layerIdx + 2 * radius;
            let x2 = paddingX + (2 * radius + spacingX) * (layerIdx + 1);

            let n1 = this.shape[layerIdx];
            let height1 = (n1 + 2) * (2 * radius) + n1 * spacingY;
            let paddingY1 = (size - height1) / 2;

            let n2 = this.shape[layerIdx + 1];
            let height2 = (n2 + 2) * (2 * radius) + n2 * spacingY;
            let paddingY2 = (size - height2) / 2;
            for(let nextNeuronIdx = 0; nextNeuronIdx < this.shape[layerIdx + 1]; nextNeuronIdx++) {
                this.paths[layerIdx].push([]);
                this.titles[layerIdx].push([]);

                let y2 = paddingY2 + (2 * radius + spacingY) * nextNeuronIdx + radius;
                for(let neuronIdx = 0; neuronIdx < this.shape[layerIdx]; neuronIdx++) {
                    let y1 = paddingY1 + (2 * radius + spacingY) * neuronIdx + radius;

                    let path = document.createElementNS(namespace, "path");
                    path.setAttribute("d", `M ${x1} ${y1} Q ${(x2 - x1) / 4 + x1} ${y1} ${(x2 - x1) / 2 + x1} ${(y2 - y1) / 2 + y1} T ${x2} ${y2}`);
                    let title = document.createElementNS(namespace, "title");
                    path.appendChild(title);
                    this.svg.appendChild(path);
                    this.paths[layerIdx][nextNeuronIdx].push(path);
                    this.titles[layerIdx][nextNeuronIdx].push(title);
                }
                let y1 = biasY;

                let path = document.createElementNS(namespace, "path");
                path.setAttribute("d", `M ${x1} ${y1} Q ${(x2 - x1) / 4 + x1} ${y1} ${(x2 - x1) / 2 + x1} ${(y2 - y1) / 2 + y1} T ${x2} ${y2}`);                  
                let title = document.createElementNS(namespace, "title");
                path.appendChild(title);
                this.svg.appendChild(path);
                this.paths[layerIdx][nextNeuronIdx].push(path);
                this.titles[layerIdx][nextNeuronIdx].push(title);
            }
        }

        for(let layerIdx = 0; layerIdx < 3; layerIdx++) {
            this.circles.push([]);
            this.texts.push([]);

            let x = paddingX + (2 * radius + spacingX) * layerIdx + radius;

            let n = this.shape[layerIdx];
            let height = (n + 2) * (2 * radius) + n * spacingY;
            let paddingY = (size - height) / 2;
            for(let neuronIdx = 0; neuronIdx < this.shape[layerIdx]; neuronIdx++) {
                let y = paddingY + (2 * radius + spacingY) * neuronIdx + radius;

                let circle = document.createElementNS(namespace, "circle");
                circle.setAttribute("cx", x);
                circle.setAttribute("cy", y);
                circle.setAttribute("r", radius);
                this.svg.appendChild(circle);
                this.circles[layerIdx].push(circle);

                let text = document.createElementNS(namespace, "text");
                text.setAttribute("x", x);
                text.setAttribute("y", y);
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("text-anchor", "middle");
                this.svg.appendChild(text);
                this.texts[layerIdx].push(text);
            }
            if(layerIdx != 2) {
                let circle = document.createElementNS(namespace, "circle");
                circle.setAttribute("cx", x);
                circle.setAttribute("cy", biasY);
                circle.setAttribute("r", radius);
                this.svg.appendChild(circle);
                this.circles[layerIdx].push(circle);
            }      
        }
    }
    update(currentRow) {
        let currentValues = this.values[currentRow];
        
        for(let layerIdx = 0; layerIdx < 2; layerIdx++) {
            for(let nextNeuronIdx = 0; nextNeuronIdx < this.shape[layerIdx + 1]; nextNeuronIdx++) {
                for(let neuronIdx = 0; neuronIdx < this.shape[layerIdx] + 1; neuronIdx++) {
                    let weight = this.weights[layerIdx][nextNeuronIdx][neuronIdx];
                    let path = this.paths[layerIdx][nextNeuronIdx][neuronIdx];
                    path.setAttribute("class", weight > 0 ? "path-blue" : "path-red");
                    path.setAttribute("stroke-width", 2 * Math.abs(weight));
                    this.titles[layerIdx][nextNeuronIdx][neuronIdx].innerHTML = weight;
                }
            }
        }

        for(let layerIdx = 0; layerIdx < 3; layerIdx++) {
            for(let nextNeuronIdx = 0; nextNeuronIdx < this.shape[layerIdx]; nextNeuronIdx++) {
                this.texts[layerIdx][nextNeuronIdx].innerHTML = Math.round((currentValues[layerIdx][nextNeuronIdx] + Number.EPSILON) * 1000) / 1000;
            }
        }
    }
    disable() {
        for(let layerIdx = 0; layerIdx < 2; layerIdx++) {
            for(let nextNeuronIdx = 0; nextNeuronIdx < this.shape[layerIdx + 1]; nextNeuronIdx++) {
                for(let neuronIdx = 0; neuronIdx < this.shape[layerIdx] + 1; neuronIdx++) {
                    let path = this.paths[layerIdx][nextNeuronIdx][neuronIdx];
                    path.setAttribute("class", "path-neutral");
                    this.titles[layerIdx][nextNeuronIdx][neuronIdx].innerHTML = "";
                }
            }
        }

        for(let layerIdx = 0; layerIdx < 3; layerIdx++) {
            for(let nextNeuronIdx = 0; nextNeuronIdx < this.shape[layerIdx]; nextNeuronIdx++) {
                this.texts[layerIdx][nextNeuronIdx].innerHTML = "";
            }
        }
    }
    setValues(values) {
        this.values = values;
    }
    setWeights(weights) {
        this.weights = weights;
    }
}

let config = new Configuration();
let dataTable;
let sketch;
let network;

let isTraining = false;
let isTrained = false;

function init() {
    let shape = config.getShape();
    let outputActivation = config.getOutputActivation().toString();
    let restrictOutputValues = false;
    if(outputActivation == "Sigmoid" || outputActivation == "ReLU") {
        restrictOutputValues = true;
    }
    dataTable = new DataTable(shape[0], shape[2], restrictOutputValues);
    for(let i = 0; i < 2; i++) {
        let input = [];
        for(let j = 0; j < shape[0]; j++) {
            input.push(Math.random() > 0.5 ? 1 : 0);
        }
        let output = [];
        for(let j = 0; j < shape[2]; j++) {
            output.push(Math.random() > 0.5 ? 1 : 0);
        }
        dataTable.addRow(input, output);
    }
    var tmpFunction = dataTable.updateWidths;
    var boundFunction = tmpFunction.bind(dataTable);
    window.addEventListener("resize", boundFunction);

    sketch = new Sketch(shape);
    sketch.draw();
    sketch.disable();

    network = new Network(shape, config.getHiddenActivation(), config.getOutputActivation());
}

function toggle() {
    let iconPath = document.getElementById("center-icon-path");

    if(!isTraining) {
        iconPath.setAttribute("d", "M6 19h4V5H6v14zm8-14v14h4V5h-4z");

        isTraining = true;

        train();
    } else {
        iconPath.setAttribute("d", "M8 5v14l11-7z");

        isTraining = false;
    }
}

function train() {
    if(isTraining) {
        step();
        setTimeout(train, 25);
    }
}

function step() {
    if(!isTrained) {
        config.disable();
        dataTable.disable();

        isTrained = true;
    }

    let inputs = dataTable.getInputs();
    let targets = dataTable.getOutputs();
    network.train(inputs, targets, config.getLearningRate());
    
    let outputs = [];
    for(let i = 0; i < inputs.length; i++) {
        network.forwardProp(inputs[i]);
        outputs.push(network.getOutputs());
    }
    let weights = network.getWeights();

    sketch.setValues(outputs);
    sketch.setWeights(weights);
    sketch.update(dataTable.getCurrentRow());

    config.increaseEpochCount();
}

function showResetModal() {
    modal = document.getElementById("modal");
    modal.style.display = "flex";
}

function hideResetModal() {
    modal = document.getElementById("modal");
    modal.style.display = "none";
}

function reset() {
    if(isTraining) {
        let iconPath = document.getElementById("center-icon-path");
        iconPath.setAttribute("d", "M8 5v14l11-7z");

        isTraining = false;
    }
    config.enable();
    dataTable.enable();
    sketch.disable();
    config.resetEpochCount();
    network = new Network(config.getShape(), config.getHiddenActivation(), config.getOutputActivation());

    isTrained = false;
}

function validateInput(inputField, isOutput) {
    let warning = document.getElementById("warning");
    if(isValid(inputField.value, isOutput)) {
        inputField.classList.remove("error");
        warning.classList.add("hidden");
    } else {
        inputField.classList.add("error");
        warning.classList.remove("hidden");   
    }
}

function validateValue(inputField, isOutput) {
    if(isValid(inputField.value, isOutput)) {
        inputField.value = Math.floor(parseFloat(inputField.value) * 100) / 100;
    } else {
        inputField.value = 0;
    }
    inputField.classList.remove("error");
    let warning = document.getElementById("warning");
    warning.classList.add("hidden");
}

function isValid(value, isOutput) {
    if(!/^\-?[0-9]+(?:\.[0-9]+)?$/.test(value)) {
        return false;
    } 
    value = parseFloat(value);
    if(isNaN(value) || value > 1 || value < -1) {
        return false
    }
    let outputActivation = config.getOutputActivation().toString();
    return !(isOutput && (outputActivation == "Sigmoid" || outputActivation == "ReLU") && value < 0);
}