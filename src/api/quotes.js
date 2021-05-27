const express = require("express");
const monk = require("monk");
const Joi = require("@hapi/joi");
const db = monk(process.env.MONGO_URI);
const quotes = db.get("quotes");

const schema = Joi.object({
  _id: Joi.string().trim().required(),
  author: Joi.string().trim().required(),
  quote: Joi.string().trim().required(),
  language: Joi.string().trim().required(),
  year: Joi.object({
    yearNum: Joi.number().integer().min(0).max(2020),
    yearType: Joi.string().trim().required()
  }),
  source: Joi.string().trim(),
  tags: Joi.array().items(
    Joi.string().trim()
  )

});

const schemaNID = Joi.object({
  author: Joi.string().trim().required(),
  quote: Joi.string().trim().required(),
  language: Joi.string().trim().required(),
  year: Joi.object({
    yearNum: Joi.number().integer().min(0).max(2020),
    yearType: Joi.string().trim().required()
  }),
  source: Joi.string().trim(),
  tags: Joi.array().items(
    Joi.string().trim()
  )

});

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Quote:
 *       type: object
 *       required:
 *         - quote
 *         - author
 *         - language
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique hex ID for the quote object. Automatically generated by database on POST submittal (do not include _id in POST body). This value can be used to retrieve specific quotes with a GET request 
 *         author:
 *           type: string
 *           description: The author of the quote ("unknown" if author is not known)
 *         quote:
 *           type: string
 *           description: The text for the entire quote
 *         language:
 *           type: string
 *           description: Primary language of the quote
 *         year: 
 *           type: object
 *           description: An object representing the year of quote origination
 *           properties:          
 *             yearNum:
 *               type: integer
 *               description: The numerical value of the quote origin year
 *             yearType:
 *               type: integer
 *               description: A string containing either "BCE" or "CE" to denote the calendar era
 *         source:
 *           type: string
 *           description: A string containing the source text of quote
 *         tags: 
 *           type: array
 *           description: An array of keywords related to the quote
 *           items:
 *              type: string
 *       example:
 *         _id: "60a6d98c5eddcd1ca84e9c9b"
 *         author: Marcus Aurelius
 *         quote: You have power over your mind, not outside events. Realize this, and you will find strength. 
 *         language: English
 *         year: 
 *           yearNum: 180
 *           yearType: CE
 *         source: Meditations
 *         tags:
 *           - strength
 *           - mindset
 *           - power
 *
 * 
 */

/**
 * @swagger
 * tags:
 *   name: Quotes
 *   description: Routes for connecting with the Quote Database API
 */

/**
 * @swagger
 * /quotes:
 *   get:
 *     summary: Retrieve an array containing quote objects, refinable with query parameters.
 *     tags: [Quotes]
 *     produces:
 *     - "application/xml"
 *     - "application/json"
 *     parameters:
 *       -  in: query
 *          name: author
 *          schema: 
 *            type: string
 *          description: author's name, case sensitive
 *       -  in: query
 *          name: language
 *          schema: 
 *            type: string
 *          description: language of quote, case sensitive
 *     responses:
 *       200:
 *         description: Client request successful. A request without query parameters will return an array of all quote objects currently in the database. A request with query parameters will return an array of quote objects that match the parameter, or a string message indicating no matches. 
 *      
 */


router.get("/", async (req, res, next) => {
  try {
    let items = null;
    //   const searchYear = parseInt(req.query.year); year: searchYear || 0

    if (Object.keys(req.query).length === 0) {
      items = await quotes.find({});
    }
    else if (req.query.author !== undefined && req.query.language !== undefined) {
      items = await quotes.find({
        author: req.query.author,
        language: req.query.language
      });
    }
    else if (req.query.author !== undefined) {
      items = await quotes.find({
        author: req.query.author
      });
    }
    else if (req.query.language !== undefined) {
      items = await quotes.find({
        language: req.query.language
      });
    }

    if (Object.keys(items).length === 0) {
      throw "Successfully queried, but no quote objects were found with your parameters."
    }
    else {
      res.json(items);
    }
    //  res.json(req.query.year);

  } catch (error) {
    return res.send(error);
  }
});

/**
 * @swagger
 * /quotes/{id}:
 *   get:
 *     summary: Retrieve a single quote object from the database.
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The quote id
 *     responses:
 *       200:
 *         description: Client request successful. Response will contain requested single quote object. 
 *       404:
 *         description: The quote object was not found at the submitted _id parameter.
 *       500:
 *         description: Invalid format for submitted _id parameter or server error. If format invalid, response will contain an object with error message.
 */

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await quotes.findOne({
      _id: id,
    });
    if (!item) return next();
    return res.json(item);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /quotes:
 *   post:
 *     summary: Add a custom quote object to the database.
 *     tags: [Quotes]
 *     requestBody:
 *       required: true
 *       description: Remove _id from sample object when POSTing
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Quote'
 *     responses:
 *       200:
 *         description: Your quote object was successfully added to the database. The response will contain the quote object as it now appears in the database, with its newly generated _id value. This _id value can be used to target the specific quote object in future API requests.
 *       500:
 *         description: Submitted quote object has failed validation, or server error. If validation failed, response will contain object with validation error details.
 */

router.post("/", async (req, res, next) => {
  try {
    console.log(req.body);
    const value = await schemaNID.validateAsync(req.body);
    const inserted = await quotes.insert(value);
    res.json(inserted);
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /quotes/{id}:
 *  put:
 *    summary: Update a quote object in the database.
 *    tags: [Quotes]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The quote id
 *    requestBody:
 *      required: true
 *      description: Remove _id from sample object when POSTing
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Quote'
 *    responses:
 *      200:
 *        description: Client request successful. Response will contain updated quote object. 
 *      404:
 *        description: The quote object was not found at the submitted _id parameter.
 *      500:
 *        description: Invalid format for submitted quote object, _id parameter, or server error. If invalid format or _id, response will contain an object with error message.
 */


router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const value = await schema.validateAsync(req.body);
    const item = await quotes.findOne({
      _id: id,
    });
    if (!item) return next();
    await quotes.update(
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

/**
 * @swagger
 * /quotes/{id}:
 *   delete:
 *     summary: Remove a quote object from the database.
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The quote id
 * 
 *     responses:
 *       200:
 *         description: The quote object was deleted successfully from the database. 
 *       404:
 *         description: The quote object was not found at the submitted _id parameter.
 *       500:
 *         description: Invalid format for submitted _id parameter or server error. If format invalid, response will contain an object with error message.
 */




router.delete("/:id", async (req, res, next) => {

  try {
/*
    const item = await quotes.findOne({
      _id: id,
    });
    if (!item) {
      res.status(404);
    } */

    const { id } = req.params;

    const item = await quotes.findOne({
      _id: id,
    });
    if (!item) return next();

    await quotes.remove({ _id: id });
    res.status(200).send('Quote object succesfully deleted from the database.')

  }
  catch (error) {
    next(error);
  }

});

module.exports = router;
