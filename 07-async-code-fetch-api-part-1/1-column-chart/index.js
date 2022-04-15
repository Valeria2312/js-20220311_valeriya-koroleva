import fetchJson from './utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

    element;
    subElements = {};
    chartHeight = 50;
  
    constructor({
      data = [],
      label = '',
      link = '',
      range = {
        from: new Date(),
        to: new Date(),
      },
      url = '',
      value = 0,
      formatHeading = data => data } = {}) {
      this.url = new URL(url, BACKEND_URL);
      this.data = data;
      this.label = label;
      this.link = link;
      this.range = range;
      this.value = formatHeading(value);
  
      this.render();
      this.update(this.range.from, this.range.to);
    }
  
    get template() {
      return `
          <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
              Total ${this.label}
              ${this.getLink()}
            </div>
            <div class="column-chart__container">
              <div data-element="header" class="column-chart__header"></div>
              <div data-element="body" class="column-chart__chart"></div>
            </div>
          </div>
        `;
    }
  
    getHeaderValue(data) {
      return Object.values(data).reduce((accum, item) => (accum + item), 0);
    }
  
    getColumnBody(data) {
      const maxValue = Math.max(...Object.values(data));
  
      return Object.entries(data).map(([key, value]) => {
        const scale = this.chartHeight / maxValue;
        const percent = (value / maxValue * 100).toFixed(0);
        const tooltip = `<span>
            <small>${key.toLocaleString('default', { dateStyle: 'medium' })}</small>
            <br>
            <strong>${percent}%</strong>
          </span>`;
  
        return `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${tooltip}"></div>`;
      }).join('');
    }
  
  
    getLink() {
      return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : "";
    }
  
    async loadData(from, to) {
      this.url.searchParams.set('from', from.toISOString());
      this.url.searchParams.set('to', to.toISOString());
  
      return await fetchJson(this.url);
    }
  
    setNewRange(from, to) {
      this.range.from = from;
      this.range.to = to;
    }
  
    render() {
      const element = document.createElement('div');
      element.innerHTML = this.template;
  
      this.element = element.firstElementChild;
  
      this.subElements = this.getSubElements(this.element);
    }
  
    getSubElements(element) {
      const result = {};
      const elements = element.querySelectorAll('[data-element]');
  
      for (const subElement of elements) {
        const name = subElement.dataset.element;
  
        result[name] = subElement;
      }
  
      return result;
    }
  
  
    remove() {
      if (this.element) {
        this.element.remove();
      }
    }
  
  
    async update(from, to) {
      this.element.classList.add('column-chart_loading');
  
      const data = await this.loadData(from, to);
  
      this.setNewRange(from, to);
  
      if (data && Object.values(data).length) {
        this.subElements.header.textContent = this.getHeaderValue(data);
        this.subElements.body.innerHTML = this.getColumnBody(data);
  
        this.element.classList.remove('column-chart_loading');
      }
  
      this.data = data;
      return this.data;
    }

    destroy() {
      this.remove();
      this.element = null;
      this.subElements = {};
    }
  
}