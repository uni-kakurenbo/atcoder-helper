"use strict";

class BaseResolver {
  constructor(holds) {
    this.holds = holds;
  }
  resolveByPropertyName(propertyName, source) {
    if (source instanceof this.holds) return source[propertyName];
    if (typeof source === "string") return source;
    return null;
  }

  resolve(idOrInstance) {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance === "string") return this?.cache.get(idOrInstance) ?? null;
    return null;
  }
  resolveId(idOrInstance) {
    if (typeof idOrInstance === "number") return String(idOrInstance);
    return this.resolveByPropertyName("id", idOrInstance);
  }
  resolveName(nameOrInstance) {
    return this.resolveByPropertyName("name", nameOrInstance);
  }
}

module.exports = { BaseResolver };
