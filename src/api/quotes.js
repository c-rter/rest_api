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
 *           description: Unique hex ID for the quote object. Automatically generated on submittal (do not POST with _id). This value can be used to retrieve specific quotes with a GET request 
 *         author:
 *           type: string
 *           description: The author of the quote ("unknown" if author unknown)
 *         quote:
 *           type: string
 *           description: A string containing the entire quote
 *         language:
 *           type: string
 *           description: Primary language of the quote
 *         year: 
 *           type: object
 *           description: An object value representing the year the quote originated
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
 *           description: array of keywords
 *           items:
 *              type: string
 *       example:
 *         _id: "d5fE_asz"
 *         author: Alexander G. Wilson
 *         quote: The finest of all quotes come from the heart 
 *         language: English
 *         year: 
 *           yearNum: 1927
 *           yearType: CE
 *         source: Anthologies on Poetry vol 7
 *         tags:
 *           - entrepreneur
 *           - funny
 *
 * 
 */

/**
 * @swagger
 * tags:
 *   name: Quotes
 *   description: Routes for connecting with quote API
 */

/**
 * @swagger
 * /quotes:
 *   get:
 *     summary: Returns the list of all the quotes
 *     tags: [Quotes]
 *     produces:
 *     - "application/xml"
 *     - "application/json"
 *     parameters:
 *        -  in: query
 *           name: author
 *           schema: 
 *             type: string
 *           description: author's name
 *        -  in: query
 *           name: language
 *           schema: 
 *             type: string
 *           description: language of quote
 *     responses:
 *       200:
 *         description: The list of the quotes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quote'
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

    res.json(items);

    //  res.json(req.query.year);

  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /quotes/{id}:
 *   get:
 *     summary: Get a quote by id
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
 *         description: The quote description by id
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       404:
 *         description: The quote was not found
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
 *     summary: Add a new quote to the archive.
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
 *         description: The quote was successfully addeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       500:
 *         description: Some server error
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
 *    summary: Update a quote by id
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
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Quote'
 *    responses:
 *      200:
 *        description: The quote was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Quote'
 *      404:
 *        description: The quote was not found
 *      500:
 *        description: Some error happened
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
 *     summary: Remove a quote by id
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
 *         description: The quote was deleted
 *       404:
 *         description: The quote was not found
 */




router.delete("/:id", async (req, res, next) => {

  try {
    const { id } = req.params;
    await quotes.remove({ _id: id });
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
