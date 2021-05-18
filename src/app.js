const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "TEST 1",
			version: "1.0.0",
			description: "TEST 3",
		},
		servers: [
			{
				url: "https://rest-api-docs.herokuapp.com/",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);


app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋 SURVEY HERE 🌎🌍🌏✨🌈🦄'
  });
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
