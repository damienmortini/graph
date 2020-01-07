let slotUID = 0;

/**
 * Graph Node Element
 */
export default class GraphNodeElement extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'close'];
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host {
          display: block;
          width: 300px;
        }
        details, slot {
          padding: 10px;
        }
        summary {
          padding: 5px;
        }
        summary:focus {
          outline: none;
        }
        section.input {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        section.input .input {
          flex: 2;
          min-width: 50%;
          text-align: center;
        }
        section.input label {
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 5px;
          white-space: nowrap;
          flex: 1;
        }
        section.input label:empty {
          display: none;
        }
      </style>
      <slot></slot>
      <details>
        <summary><span></span></summary>
      </details>
    `;

    this._details = this.shadowRoot.querySelector('details');
    this._summary = this.shadowRoot.querySelector('summary');
    this._summaryContent = this.shadowRoot.querySelector('summary span');

    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
          if (!('value' in node)) {
            const section = document.createElement('section');
            section.id = `slot${slotUID}`;
            section.innerHTML = `<slot name="${slotUID}"></slot>`;
            this._details.appendChild(section);
            node.slot = slotUID;
            slotUID++;
          }
          this._addInput(node);
        }
        for (const node of mutation.removedNodes) {
          this.shadowRoot.querySelector(`section#slot${node.slot}`).remove();
        }
      }
    });
    observer.observe(this, { childList: true });

    this._summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (event.target !== event.currentTarget) {
        return;
      }
      this.close = !this.close;
    });

    this._details.addEventListener('toggle', (event) => {
      this.close = !event.target.open;
      this.dispatchEvent(new Event(event.type, event));
    });

    this._summaryContent.addEventListener('dblclick', (event) => {
      this._editElementContent(this._summaryContent);
    });
  }

  connectedCallback() {
    this._details.open = !this.close;
    for (const child of this.children) {
      // console.log('value' in child);
      // if (!('value' in child)) {
      //   continue;
      // }
      this._addInput(child);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'name':
        this._summaryContent.textContent = newValue;
        break;
      case 'close':
        this._details.open = !this.close;
        break;
    }
  }

  _editElementContent(element) {
    element.contentEditable = true;
    element.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        element.addEventListener('keydown', onKeyDown);
        element.blur();
      }
    };
    element.addEventListener('keydown', onKeyDown);
    element.addEventListener('blur', () => {
      element.contentEditable = false;
    }, {
      once: true,
    });
  }

  _addInput(node) {
    if (this.shadowRoot.querySelector(`slot[name="${node.slot}"]`)) {
      return;
    }
    const label = node.getAttribute('label') || node.label || node.getAttribute('name') || node.name || node.id || '';
    const section = document.createElement('section');
    section.id = `slot${slotUID}`;
    section.classList.add('input');
    section.innerHTML = `
      <graph-input-connector></graph-input-connector>
      <label title="${label}">${label}</label>
      <div class="input"><slot name="${slotUID}"></slot></div>
      <graph-input-connector></graph-input-connector>
    `;
    const connectors = section.querySelectorAll('graph-input-connector');
    connectors[0].outputs.add(node);
    connectors[1].inputs.add(node);
    this._details.appendChild(section);
    node.slot = slotUID;
    slotUID++;
  }

  set close(value) {
    if (value) {
      this.setAttribute('close', '');
    } else {
      this.removeAttribute('close');
    }
  }

  get close() {
    return this.hasAttribute('close');
  }

  get name() {
    return this.getAttribute('name');
  }

  set name(value) {
    this.setAttribute('name', value);
  }

  toJSON() {
    const data = {
      name: this.name,
    };
    if (this.children.length) {
      const children = [];
      for (const child of this.children) {
        if (child.toJSON) {
          children.push(child.toJSON());
        } else {
          const childData = {
            tagName: child.localName,
          };
          for (const key of ['name', 'label', 'id', 'value']) {
            if (child[key]) {
              childData[key] = child[key];
            }
          }
          children.push(childData);
        }
      }
      if (children.length) {
        data.children = children;
      }
    }
    return data;
  }
}