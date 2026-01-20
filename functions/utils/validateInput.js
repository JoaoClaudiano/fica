module.exports = function validateInput(data, fields) {
  fields.forEach(field => {
    if (data[field] === undefined) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  });
};