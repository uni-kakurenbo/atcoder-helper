"use strict";

class BaseResolver {
  constructor(holds, host) {
    this.holds = holds;

    if (host) this.host = host;
  }
  resolveByPropertyName(propertyName, source) {
    if (source instanceof this.holds) return source[propertyName];
    if (typeof source === "string") return source;
    return null;
  }

  resolve(idOrInstance) {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance === "number") return this.host?.cache.find(({ id }) => id == idOrInstance) ?? null;
    if (typeof idOrInstance === "string") return this.host?.cache.get(idOrInstance) ?? null;
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
