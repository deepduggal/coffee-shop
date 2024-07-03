import joi from 'joi';

const validateProduct = (req, res, next) => {
  console.log(req.body);
  const schema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().required(),
    category: joi.string().required(),
    stock: joi.number().required(),
  });

  const { error } = schema.validate(req.body);
  const { error: fileValidationError } = joi.string().uri().validate();

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  else if (fileValidationError) {
    return res.status(400).json({ error: fileValidationError.details[0].message });
  }
  next();
};

export default validateProduct;