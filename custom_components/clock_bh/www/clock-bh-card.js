/**
 * Clock.bh Custom Lovelace Card
 * Animated world clock matching clock.bh design
 * Colors: Bahrain flag - Red (#CE1126) and Gold (#C9A66B)
 */

class ClockBhCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._animationFrame = null;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialize();
    }
  }

  setConfig(config) {
    if (!config.timezone) {
      throw new Error('Please define a timezone');
    }
    this._config = {
      timezone: config.timezone || 'Asia/Bahrain',
      title: config.title || this._formatTimezoneTitle(config.timezone),
      show_date: config.show_date !== false,
      show_seconds: config.show_seconds !== false,
      theme: config.theme || 'light', // 'light', 'dark', or 'auto'
      size: config.size || 'medium', // 'small', 'medium', 'large'
    };
  }

  _formatTimezoneTitle(tz) {
    if (!tz) return 'World Clock';
    return tz.split('/').pop().replace(/_/g, ' ');
  }

  _initialize() {
    this._initialized = true;
    this._render();
    this._startAnimation();
  }

  _getSizeValues() {
    const sizes = {
      small: { clock: 120, font: 14, dateFont: 10 },
      medium: { clock: 180, font: 18, dateFont: 12 },
      large: { clock: 250, font: 24, dateFont: 16 },
    };
    return sizes[this._config.size] || sizes.medium;
  }

  _render() {
    const size = this._getSizeValues();
    const isDark = this._config.theme === 'dark' ||
      (this._config.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .clock-card {
          background: ${isDark ? 'var(--card-background-color, #1c1c1c)' : 'var(--card-background-color, #fff)'};
          border-radius: 16px;
          padding: 16px;
          text-align: center;
          box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0,0,0,0.15));
          transition: transform 0.3s ease;
        }
        .clock-card:hover {
          transform: scale(1.02);
        }
        .title {
          font-size: ${size.font}px;
          font-weight: 600;
          color: ${isDark ? '#fff' : '#333'};
          margin-bottom: 12px;
          font-family: var(--paper-font-headline_-_font-family, 'Roboto', sans-serif);
        }
        .clock-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 16px 0;
        }
        .clock-svg {
          width: ${size.clock}px;
          height: ${size.clock}px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }
        .clock-face {
          fill: ${isDark ? '#2a2a2a' : '#ffffff'};
          stroke: #CE1126;
          stroke-width: 4;
        }
        .clock-center {
          fill: #C9A66B;
        }
        .hour-marks {
          stroke: #CE1126;
          stroke-width: 2;
          stroke-linecap: round;
        }
        .minute-marks {
          stroke: ${isDark ? '#666' : '#ccc'};
          stroke-width: 1;
          stroke-linecap: round;
        }
        .hour-hand {
          fill: #CE1126;
          filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
        }
        .minute-hand {
          fill: #333;
          filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.2));
        }
        .second-hand {
          fill: #C9A66B;
          filter: drop-shadow(0 0 2px rgba(0,0,0,0.3));
        }
        .digital-time {
          font-size: ${size.font * 1.5}px;
          font-weight: 700;
          color: #CE1126;
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          margin-top: 8px;
          letter-spacing: 2px;
        }
        .date-display {
          font-size: ${size.dateFont}px;
          color: ${isDark ? '#aaa' : '#666'};
          margin-top: 4px;
        }
        .timezone-badge {
          display: inline-block;
          background: linear-gradient(135deg, #CE1126 0%, #a00d1e 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: ${size.dateFont}px;
          margin-top: 8px;
          font-weight: 500;
        }
        .powered-by {
          font-size: 10px;
          color: ${isDark ? '#666' : '#999'};
          margin-top: 12px;
        }
        .powered-by a {
          color: #C9A66B;
          text-decoration: none;
        }
        .powered-by a:hover {
          text-decoration: underline;
        }

        /* Day/Night indicator */
        .day-night-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          margin-left: 8px;
          vertical-align: middle;
        }
        .day-night-indicator.day {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }
        .day-night-indicator.night {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          box-shadow: 0 0 8px rgba(100, 100, 180, 0.4);
        }
      </style>

      <div class="clock-card">
        <div class="title">
          ${this._config.title}
          <span class="day-night-indicator" id="dayNight"></span>
        </div>

        <div class="clock-container">
          <svg class="clock-svg" viewBox="0 0 200 200">
            <!-- Clock face -->
            <circle class="clock-face" cx="100" cy="100" r="95" />

            <!-- Hour marks -->
            ${this._renderHourMarks()}

            <!-- Minute marks -->
            ${this._renderMinuteMarks()}

            <!-- Clock hands -->
            <g id="hourHand" style="transform-origin: 100px 100px;">
              <polygon class="hour-hand" points="100,45 94,100 100,110 106,100" />
            </g>

            <g id="minuteHand" style="transform-origin: 100px 100px;">
              <polygon class="minute-hand" points="100,25 96,100 100,115 104,100" />
            </g>

            ${this._config.show_seconds ? `
            <g id="secondHand" style="transform-origin: 100px 100px;">
              <line class="second-hand" x1="100" y1="30" x2="100" y2="120"
                    stroke="#C9A66B" stroke-width="2" stroke-linecap="round" />
              <circle cx="100" cy="120" r="4" fill="#C9A66B" />
            </g>
            ` : ''}

            <!-- Center cap -->
            <circle class="clock-center" cx="100" cy="100" r="8" />
            <circle cx="100" cy="100" r="4" fill="#CE1126" />
          </svg>
        </div>

        <div class="digital-time" id="digitalTime">--:--:--</div>

        ${this._config.show_date ? '<div class="date-display" id="dateDisplay">---</div>' : ''}

        <div class="timezone-badge" id="tzBadge">UTC+00:00</div>

        <div class="powered-by">
          Powered by <a href="https://clock.bh" target="_blank">clock.bh</a>
        </div>
      </div>
    `;
  }

  _renderHourMarks() {
    let marks = '';
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * Math.PI / 180;
      const x1 = 100 + 80 * Math.sin(angle);
      const y1 = 100 - 80 * Math.cos(angle);
      const x2 = 100 + 88 * Math.sin(angle);
      const y2 = 100 - 88 * Math.cos(angle);
      marks += `<line class="hour-marks" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    }
    return marks;
  }

  _renderMinuteMarks() {
    let marks = '';
    for (let i = 0; i < 60; i++) {
      if (i % 5 !== 0) {
        const angle = (i * 6) * Math.PI / 180;
        const x1 = 100 + 85 * Math.sin(angle);
        const y1 = 100 - 85 * Math.cos(angle);
        const x2 = 100 + 88 * Math.sin(angle);
        const y2 = 100 - 88 * Math.cos(angle);
        marks += `<line class="minute-marks" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
      }
    }
    return marks;
  }

  _startAnimation() {
    const animate = () => {
      this._updateClock();
      this._animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  _updateClock() {
    try {
      const now = new Date();
      const options = { timeZone: this._config.timezone };

      // Get time components in the target timezone
      const timeStr = now.toLocaleTimeString('en-US', {
        ...options,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      const milliseconds = now.getMilliseconds();

      // Calculate smooth angles (matching clock.bh formula)
      const hourAngle = (hours % 12) * 30 + minutes * 0.5 + seconds * (0.5/60);
      const minuteAngle = minutes * 6 + seconds * 0.1;
      const secondAngle = seconds * 6 + milliseconds * 0.006;

      // Update hand rotations
      const hourHand = this.shadowRoot.getElementById('hourHand');
      const minuteHand = this.shadowRoot.getElementById('minuteHand');
      const secondHand = this.shadowRoot.getElementById('secondHand');

      if (hourHand) hourHand.style.transform = `rotate(${hourAngle}deg)`;
      if (minuteHand) minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
      if (secondHand) secondHand.style.transform = `rotate(${secondAngle}deg)`;

      // Update digital time
      const digitalTime = this.shadowRoot.getElementById('digitalTime');
      if (digitalTime) {
        const displayTime = this._config.show_seconds
          ? timeStr
          : timeStr.split(':').slice(0, 2).join(':');
        digitalTime.textContent = displayTime;
      }

      // Update date
      if (this._config.show_date) {
        const dateDisplay = this.shadowRoot.getElementById('dateDisplay');
        if (dateDisplay) {
          const dateStr = now.toLocaleDateString('en-US', {
            ...options,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          dateDisplay.textContent = dateStr;
        }
      }

      // Update timezone badge
      const tzBadge = this.shadowRoot.getElementById('tzBadge');
      if (tzBadge) {
        const offset = this._getTimezoneOffset(now);
        tzBadge.textContent = offset;
      }

      // Update day/night indicator
      const dayNight = this.shadowRoot.getElementById('dayNight');
      if (dayNight) {
        const isDaytime = hours >= 6 && hours < 18;
        dayNight.className = `day-night-indicator ${isDaytime ? 'day' : 'night'}`;
      }

    } catch (e) {
      console.error('Clock update error:', e);
    }
  }

  _getTimezoneOffset(date) {
    try {
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: this._config.timezone }));
      const offsetMinutes = (tzDate - utcDate) / 60000;
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const offsetMins = Math.abs(offsetMinutes) % 60;
      const sign = offsetMinutes >= 0 ? '+' : '-';
      return `UTC${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;
    } catch (e) {
      return 'UTC';
    }
  }

  disconnectedCallback() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
  }

  getCardSize() {
    return 4;
  }

  static getConfigElement() {
    return document.createElement('clock-bh-card-editor');
  }

  static getStubConfig() {
    return {
      timezone: 'Asia/Bahrain',
      title: 'Bahrain',
      show_date: true,
      show_seconds: true,
      theme: 'auto',
      size: 'medium'
    };
  }
}

// Card Editor
class ClockBhCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        .editor {
          padding: 16px;
        }
        .row {
          margin-bottom: 16px;
        }
        label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }
        input, select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .checkbox-row input {
          width: auto;
        }
      </style>
      <div class="editor">
        <div class="row">
          <label>Timezone</label>
          <input type="text" id="timezone" value="${this._config.timezone || 'Asia/Bahrain'}"
                 placeholder="e.g., America/New_York">
        </div>
        <div class="row">
          <label>Title</label>
          <input type="text" id="title" value="${this._config.title || ''}"
                 placeholder="Leave empty for auto">
        </div>
        <div class="row">
          <label>Size</label>
          <select id="size">
            <option value="small" ${this._config.size === 'small' ? 'selected' : ''}>Small</option>
            <option value="medium" ${this._config.size === 'medium' || !this._config.size ? 'selected' : ''}>Medium</option>
            <option value="large" ${this._config.size === 'large' ? 'selected' : ''}>Large</option>
          </select>
        </div>
        <div class="row">
          <label>Theme</label>
          <select id="theme">
            <option value="auto" ${this._config.theme === 'auto' || !this._config.theme ? 'selected' : ''}>Auto</option>
            <option value="light" ${this._config.theme === 'light' ? 'selected' : ''}>Light</option>
            <option value="dark" ${this._config.theme === 'dark' ? 'selected' : ''}>Dark</option>
          </select>
        </div>
        <div class="row checkbox-row">
          <input type="checkbox" id="show_date" ${this._config.show_date !== false ? 'checked' : ''}>
          <label for="show_date">Show Date</label>
        </div>
        <div class="row checkbox-row">
          <input type="checkbox" id="show_seconds" ${this._config.show_seconds !== false ? 'checked' : ''}>
          <label for="show_seconds">Show Seconds</label>
        </div>
      </div>
    `;

    // Add event listeners
    ['timezone', 'title', 'size', 'theme', 'show_date', 'show_seconds'].forEach(id => {
      const el = this.shadowRoot.getElementById(id);
      el.addEventListener('change', () => this._valueChanged());
    });
  }

  _valueChanged() {
    const config = {
      ...this._config,
      timezone: this.shadowRoot.getElementById('timezone').value,
      title: this.shadowRoot.getElementById('title').value || undefined,
      size: this.shadowRoot.getElementById('size').value,
      theme: this.shadowRoot.getElementById('theme').value,
      show_date: this.shadowRoot.getElementById('show_date').checked,
      show_seconds: this.shadowRoot.getElementById('show_seconds').checked,
    };

    const event = new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

// Register the cards
customElements.define('clock-bh-card', ClockBhCard);
customElements.define('clock-bh-card-editor', ClockBhCardEditor);

// Register with HACS/Lovelace
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'clock-bh-card',
  name: 'Clock.bh World Clock',
  description: 'Animated world clock powered by clock.bh - Bahrain NTP Time Server',
  preview: true,
  documentationURL: 'https://github.com/iret33/ha-clock-bh'
});

console.info(
  '%c CLOCK-BH-CARD %c v1.1.0 ',
  'color: white; background: #CE1126; font-weight: bold;',
  'color: #CE1126; background: white; font-weight: bold;'
);
