// @ts-check
const td = require('typedoc');

/** @param {td.Application} app */
exports.load = function(app) {
  app.converter.on(td.Converter.EVENT_CREATE_DECLARATION, (_context, reflection) => {
    if (reflection.kind === td.ReflectionKind.Module) {
      const idx = reflection.name.indexOf('/');
      if (idx !== -1) {
        reflection.name = reflection.name.substring(idx + 1);
      }
    }
  });
};
