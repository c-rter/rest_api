const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
require('dotenv').config();
const quoteRouter = require("./api/quotes");

const middlewares = require('./middlewares');

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Motivation Quote API",
			version: "1.0.0",
			description: "A simple motivational quote API",
		},
		servers: [
			{
				url: "http://localhost:5000",
			},
		],
	},
	apis: ["./src/api/quotes.js"],
};

const specs = swaggerJsDoc(options);

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋 SURVEY HERE 🌎🌍🌏✨🌈🦄'
  });
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use('/quotes', quoteRouter);


app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
