import "../core/document";
import "../core/ns";
import "selection";

d3_selectionPrototype.append = function(name) {
  var classes;
  if (typeof name == 'string' && name.indexOf('.')) {
    classes = name.split('.');
    name = classes[0];
    classes = classes.slice(1).join(' ');
  }
  name = d3_selection_creator(name);
  var s = this.select(function() {
    return this.appendChild(name.apply(this, arguments));
  });
  return (classes ? s.attr('class', classes) : s);
};

function d3_selection_creator(name) {
  return typeof name === "function" ? name
      : (name = d3.ns.qualify(name)).local ? function() { return this.ownerDocument.createElementNS(name.space, name.local); }
      : function() { return this.ownerDocument.createElementNS(this.namespaceURI, name); };
}
