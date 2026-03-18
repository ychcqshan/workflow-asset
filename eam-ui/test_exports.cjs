const panel = require('bpmn-js-properties-panel');
console.log(Object.keys(panel));
try {
    const camunda = require('camunda-bpmn-moddle/resources/camunda');
    console.log("Camunda Moddle loaded");
} catch(e) {
    console.log("Camunda load fail", e.message);
}
