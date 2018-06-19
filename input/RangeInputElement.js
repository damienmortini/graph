export default class RangeInputElement extends HTMLElement {
  constructor() {
    super();

    this.type = "range";

    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: inline-flex;
        }

        input[type="range"] {
          flex: 1;
        }
      </style>
      <input type="range"><input type="number">
    `;

    this._rangeInput = this.shadowRoot.querySelector("input[type=\"range\"]");
    this._numberInput = this.shadowRoot.querySelector("input[type=\"number\"]");

    if (this.getAttribute("value")) {
      this.value = this.getAttribute("value");
    }
  }

  connectedCallback() {
    this._onInputBinded = this._onInputBinded || this._onInput.bind(this);
    this.shadowRoot.addEventListener("input", this._onInputBinded);
    this.shadowRoot.addEventListener("change", this._onInputBinded);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("input", this._onInputBinded);
    this.shadowRoot.removeEventListener("change", this._onInputBinded);
  }

  set defaultValue(value) {
    this._defaultValue = value;
    const results = this._defaultValue.toString().replace("-", "").split(".");
    this.step = !isNaN(this.step) ? this.step : results[1] ? 1 / Math.pow(10, results[1].length + 2) : Math.pow(10, results[0].length - 3);
    this.max = !isNaN(this.max) ? this.max : this.step * 1000;
    this.min = !isNaN(this.min) ? this.min : (this._defaultValue >= 0 ? 0 : -this.step * 1000);
  }

  get defaultValue() {
    return this._defaultValue;
  }

  _onInput(event) {
    this.dispatchEvent(new event.constructor(event.type, event));
    this._numberInput.valueAsNumber = event.target.valueAsNumber;
    this._rangeInput.valueAsNumber = event.target.valueAsNumber;
  }

  set value(value) {
    if (this.defaultValue === undefined) {
      this.defaultValue = value;
    }

    this._numberInput.valueAsNumber = value;
    this._rangeInput.valueAsNumber = value;
  }

  get value() {
    return this._numberInput.valueAsNumber;
  }

  set step(value) {
    this._numberInput.step = value;
    this._rangeInput.step = value;
  }

  get step() {
    return parseFloat(this._numberInput.step);
  }

  set min(value) {
    this._numberInput.min = value;
    this._rangeInput.min = value;
  }

  get min() {
    return parseFloat(this._numberInput.min);
  }

  set max(value) {
    this._numberInput.max = value;
    this._rangeInput.max = value;
  }

  get max() {
    return parseFloat(this._numberInput.max);
  }
}

window.customElements.define("input-range", RangeInputElement);