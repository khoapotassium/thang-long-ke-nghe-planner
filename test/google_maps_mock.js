(() => {
  const listeners = new WeakMap();
  const getListeners = (target) => {
    let entries = listeners.get(target);
    if (!entries) {
      entries = {};
      listeners.set(target, entries);
    }
    return entries;
  };
  const trigger = (target, name) => {
    const callbacks = (getListeners(target)[name] || []).slice();
    callbacks.forEach((callback) => callback());
  };

  class Map {
    constructor(container, options) {
      this.container = container;
      this.center = options.center;
      this.zoom = options.zoom;
      this.root = document.createElement("div");
      this.root.className = "gm-style";
      this.root.style.cssText = "width:100%;height:100%;position:relative";
      container.replaceChildren(this.root);
    }
    getZoom() { return this.zoom; }
    getCenter() { return { lat: () => this.center.lat, lng: () => this.center.lng }; }
    setZoom(zoom) {
      this.zoom = zoom;
      setTimeout(() => trigger(this, "idle"), 0);
    }
    panTo(position) {
      this.center = position;
      setTimeout(() => trigger(this, "idle"), 0);
    }
    fitBounds(bounds) {
      this.center = bounds.center();
      this.zoom = 15;
      setTimeout(() => trigger(this, "idle"), 0);
    }
  }

  class Marker {
    constructor(options) {
      this.position = options.position;
      this.callbacks = {};
      this.element = document.createElement("button");
      this.element.type = "button";
      this.element.className = "google-map-marker";
      this.element.setAttribute("aria-label", options.title || "Map marker");
      this.element.addEventListener("click", () => this.trigger("click"));
      this.setMap(options.map);
    }
    setMap(map) {
      this.element.remove();
      this.map = map;
      if (map) map.root.appendChild(this.element);
    }
    addListener(name, callback) {
      (this.callbacks[name] || (this.callbacks[name] = [])).push(callback);
    }
    trigger(name) { (this.callbacks[name] || []).forEach((callback) => callback()); }
    getPosition() { return { lat: () => this.position.lat, lng: () => this.position.lng }; }
  }

  class InfoWindow {
    setContent(content) { this.content = content; }
    open(options) {
      this.close();
      this.element = document.createElement("div");
      this.element.className = "gm-style-iw";
      this.element.innerHTML = this.content;
      options.map.root.appendChild(this.element);
    }
    close() {
      if (this.element) this.element.remove();
      this.element = null;
    }
  }

  class LatLngBounds {
    constructor() { this.points = []; }
    extend(point) { this.points.push(point); }
    center() {
      const count = this.points.length;
      return {
        lat: this.points.reduce((sum, point) => sum + point.lat, 0) / count,
        lng: this.points.reduce((sum, point) => sum + point.lng, 0) / count
      };
    }
  }

  window.google = {
    maps: {
      Map,
      Marker,
      InfoWindow,
      LatLngBounds,
      SymbolPath: { CIRCLE: "CIRCLE" },
      event: {
        trigger,
        addListenerOnce(target, name, callback) {
          const entries = getListeners(target);
          const once = () => {
            entries[name] = (entries[name] || []).filter((entry) => entry !== once);
            callback();
          };
          (entries[name] || (entries[name] = [])).push(once);
        }
      }
    }
  };
})();
