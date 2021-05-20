const express = require("express");
const monk = require("monk");
const Joi = require("@hapi/joi");
const db = monk(process.env.MONGO_URI);
const faqs = db.get("faqs");

const schema = Joi.object({
  author: Joi.string().trim().required(),
  quote: Joi.string().trim().required(),
  language: Joi.string().trim().required(),
  year: Joi.number().integer().min(1900).max(1996),
  source: Joi.string().trim(),
  tags: Joi.array().items(
    Joi.string().trim()
  )
  
});

const router = express.Router();

// READ ALL
// http://localhost:port/api/v1/faqs?pass=me&another=string
// req.query = {"pass": "me", "another": "string"}

router.get("/", async (req, res, next) => {
  try {
 //   const searchYear = parseInt(req.query.year); year: searchYear || 0
    const items = await faqs.find({});
  //  res.json(req.query.year);
   res.json(items);
  } catch (error) {
    next(error);
  }
});

// READ ONE
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await faqs.findOne({
      _id: id,
    });
    if (!item) return next();
    return res.json(item);
  } catch (error) {
    next(error);
  }
});

// CREATE ONE
router.post("/", async (req, res, next) => {
  try {
    console.log(req.body);
    const value = await schema.validateAsync(req.body);
    const inserted = await faqs.insert(value);
    res.json(inserted);
  } catch (error) {
    next(error);
  }
});

// UPDATE ONE
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const value = await schema.validateAsync(req.body);
    const item = await faqs.findOne({
      _id: id,
    });
    if (!item) return next();
    await faqs.update(
      {
        _id: id,
      },
      {
          $set: value,
      }
    );
    res.json(value);
  } catch (error) {
    next(error);
  }
});

// CREATE ONE
router.delete("/:id", async (req, res, next) => {

try {
    const { id } = req.params;
    await faqs.remove({ _id: id});
    res.status(200).send('Success')
    res.json({
        message: 'Success'
    })
}
catch (error) {
next(error);
}

});

module.exports = router;
