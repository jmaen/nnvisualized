class Neuron {
    activation;

    inputWeights = [];
    outputWeights = [];
    bias = 0.1;

    output;
    derivative;
    error;

    constructor(activation) {
        this.activation = activation;
    }

    updateOutput() {
        let input = this.bias;
        for(let weight of this.inputWeights) {
            input += weight.value * weight.source.output;
        }
        this.output = this.activation.output(input);
        this.derivative = this.activation.derivative(input);
    }

    updateError() {
        let sum = 0;
        for(let weight of this.outputWeights) {
            sum += weight.destination.error * weight.value;
        }
        this.error = this.derivative * sum;
    }

    updateWeights(learningRate) {
        for(let weightIdx = 0; weightIdx < this.outputWeights.length; weightIdx++) {
            let nextNeuron = this.outputWeights[weightIdx].destination;
            let delta = -learningRate * nextNeuron.error * this.output;
            this.outputWeights[weightIdx].value += delta;
            nextNeuron.inputWeights[weightIdx].value += delta;
            nextNeuron.bias += -learningRate * nextNeuron.error;
        }
    }
}

class Weight {
    source;
    destination;

    value = Math.random() - 0.5;

    constructor(source, destination) {
        this.source = source;
        this.destination = destination;
    }
}

class Linear {
    output(x) {
        return x;
    }
    derivative(x) {
        return 1;
    }
    toString() {
        return "Linear";
    }
}

class Sigmoid {
    output(x) {
        return 1 / (1 + Math.exp(-x));
    }
    derivative(x) {
        let output = this.output(x);
        return output * (1 - output);
    }
    toString() {
        return "Sigmoid";
    }
}

class TanH {
    output(x) {
        let sinH = Math.exp(x);
        let cosH = Math.exp(-x);
        return (sinH - cosH) / (sinH + cosH);
    }
    derivative(x) {
        let output = this.output(x);
        return 1 - output * output;
    }
    toString() {
        return "TanH";
    }
}

class ReLU {
    output(x) {
        return x > 0 ? x : 0;
    }
    derivative(x) {
        return x > 0 ? 1 : 0;
    }
    toString() {
        return "ReLU";
    }
}

class Network {
    neurons = [[], [], []];

    constructor(shape, hiddenActivation, outputActivation) {
        for(let layerIdx = 0; layerIdx < 3; layerIdx++) {
            for(let neuronIdx = 0; neuronIdx < shape[layerIdx]; neuronIdx++) {
                let activation;
                if(layerIdx == 0) {
                    activation = null;
                } else {
                    activation = layerIdx == 1 ? hiddenActivation : outputActivation;
                }
                let currentNeuron = new Neuron(activation);

                if(layerIdx > 0) {
                    for(let prevNeuron of this.neurons[layerIdx - 1]) {
                        let currentWeight = new Weight(prevNeuron, currentNeuron);
                        currentNeuron.inputWeights.push(currentWeight);
                        prevNeuron.outputWeights.push(currentWeight);
                    }
                }

                this.neurons[layerIdx].push(currentNeuron);
            }
        }
    }

    forwardProp(input) {
        for(let neuronIdx = 0; neuronIdx < this.neurons[0].length; neuronIdx++) {
            this.neurons[0][neuronIdx].output = input[neuronIdx];
        }
        for(let layerIdx = 1; layerIdx < 3; layerIdx++) {
            for(let neuronIdx = 0; neuronIdx < this.neurons[layerIdx].length; neuronIdx++) {
                this.neurons[layerIdx][neuronIdx].updateOutput();
            }
        }
    }

    backProp(target) {
        for(let neuronIdx = 0; neuronIdx < this.neurons[2].length; neuronIdx++) {
            let neuron = this.neurons[2][neuronIdx];
            neuron.error = neuron.derivative * (neuron.output - target[neuronIdx]);
        }
        for(let neuronIdx = 0; neuronIdx < this.neurons[1].length; neuronIdx++) {
            this.neurons[1][neuronIdx].updateError();
        }
    }

    updateWeights(learningRate) {
        for(let layerIdx = 0; layerIdx < 2; layerIdx++) {
            for(let neuronIdx = 0; neuronIdx < this.neurons[layerIdx].length; neuronIdx++) {
                this.neurons[layerIdx][neuronIdx].updateWeights(learningRate);
            }
        }
    }

    train(inputs, targets, learningRate) {
        for(let i = 0; i < inputs.length; i++) {
            this.forwardProp(inputs[i]);
            this.backProp(targets[i]);
            this.updateWeights(learningRate);
        }
    }

    getOutputs() {
        let outputs = [[], [], []];
        for(let layerIdx = 0; layerIdx < 3; layerIdx++) {
            for(let neuronIdx = 0; neuronIdx < this.neurons[layerIdx].length; neuronIdx++) {
                outputs[layerIdx].push(this.neurons[layerIdx][neuronIdx].output);
            }
        }
        return outputs;
    }

    getWeights() {
        let weights = [[], []];
        for(let layerIdx = 1; layerIdx < 3; layerIdx++) {
            for(let neuronIdx = 0; neuronIdx < this.neurons[layerIdx].length; neuronIdx++) {
                let currentNeuron = this.neurons[layerIdx][neuronIdx];
                let currentWeights = [];
                for(let weightIdx = 0; weightIdx < currentNeuron.inputWeights.length; weightIdx++) {
                    currentWeights.push(currentNeuron.inputWeights[weightIdx].value);
                }
                currentWeights.push(currentNeuron.bias);
                weights[layerIdx - 1].push(currentWeights);
            }
        }
        return weights;
    }
}