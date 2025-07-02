// Polyfills mínimos para SSR e compatibilidade com Supabase
if (typeof global !== 'undefined') {
  // Polyfill para 'self' no ambiente Node.js
  if (typeof global.self === 'undefined') {
    global.self = global;
  }

  // Polyfill para 'window' no ambiente Node.js
  if (typeof global.window === 'undefined') {
    global.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
      location: {
        href: '',
        origin: '',
        protocol: 'https:',
        host: '',
        hostname: '',
        port: '',
        pathname: '/',
        search: '',
        hash: ''
      },
      navigator: {
        userAgent: 'Node.js'
      },
      document: {
        addEventListener: () => {},
        removeEventListener: () => {},
        createElement: () => ({}),
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => []
      },
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
      },
      sessionStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
      },
      ...(global.fetch && { fetch: global.fetch }),
      WebSocket: global.WebSocket || class WebSocket {
        constructor() {}
        close() {}
        send() {}
        addEventListener() {}
        removeEventListener() {}
      },
      URL: global.URL || class URL {
        constructor(url) {
          this.href = url;
        }
      },
      URLSearchParams: global.URLSearchParams || class URLSearchParams {
        constructor() {}
        get() { return null; }
        set() {}
        append() {}
        delete() {}
      }
    };
  }

  // Polyfill para 'document' no ambiente Node.js
  if (typeof global.document === 'undefined') {
    global.document = global.window.document;
  }

  // Polyfill para 'navigator' no ambiente Node.js
  if (typeof global.navigator === 'undefined') {
    global.navigator = global.window.navigator;
  }

  // Polyfill para 'location' no ambiente Node.js
  if (typeof global.location === 'undefined') {
    global.location = global.window.location;
  }

  // Polyfill para 'localStorage' no ambiente Node.js
  if (typeof global.localStorage === 'undefined') {
    global.localStorage = global.window.localStorage;
  }

  // Polyfill para 'sessionStorage' no ambiente Node.js
  if (typeof global.sessionStorage === 'undefined') {
    global.sessionStorage = global.window.sessionStorage;
  }

  // Polyfill para 'crypto' se não estiver disponível
  if (typeof global.crypto === 'undefined') {
    global.crypto = {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
      randomUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    };
  }

  // Polyfill para eventos customizados
  if (typeof global.CustomEvent === 'undefined') {
    global.CustomEvent = class CustomEvent {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
        this.bubbles = options.bubbles || false;
        this.cancelable = options.cancelable || false;
      }
    };
  }

  // Polyfill para EventTarget
  if (typeof global.EventTarget === 'undefined') {
    global.EventTarget = class EventTarget {
      constructor() {
        this.listeners = {};
      }
      
      addEventListener(type, listener) {
        if (!this.listeners[type]) {
          this.listeners[type] = [];
        }
        this.listeners[type].push(listener);
      }
      
      removeEventListener(type, listener) {
        if (this.listeners[type]) {
          const index = this.listeners[type].indexOf(listener);
          if (index > -1) {
            this.listeners[type].splice(index, 1);
          }
        }
      }
      
      dispatchEvent(event) {
        if (this.listeners[event.type]) {
          this.listeners[event.type].forEach(listener => {
            try {
              listener(event);
            } catch (e) {
              console.error('Error in event listener:', e);
            }
          });
        }
        return true;
      }
    };
  }
}

// Exportar para uso em módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
} 