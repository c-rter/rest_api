const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
require('dotenv').config();
const quoteRouter = require("./api/quotes");

const middlewares = require('./middlewares');

const cCss = {
	customSiteTitle: "Quote Database API",
	customCss: '.swagger-ui .topbar { display: none }'
};

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Quote Database",
			version: "1.0.0",
			description: `<img height="100" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjUwcHgiIGhlaWdodD0iMjUwcHgiIHZpZXdCb3g9IjAgMCAyNTAgMjUwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNTAgMjUwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNMTQ1Ljk2NiwxNjMuOTM2di02LjI5N2M5LjAxMS00LjcxMSwxNS40Ni05LjYyNSwxOS4zNTEtMTQuNzQzYzMuODkyLTUuMTIxLDUuODM2LTEwLjcsNS44MzYtMTYuNzQNCgkJCWMwLTMuNTg0LTAuNTEyLTYuMDQyLTEuNTM3LTcuMzcxYy0wLjkyMS0xLjQzNS0yLjA0Ny0yLjE1LTMuMzc4LTIuMTVjLTEuMzI5LDAtMy4xMjIsMC4zODQtNS4zNzUsMS4xNTINCgkJCWMtMi4yNTEsMC43NjctNC4zLDEuMTUxLTYuMTQ0LDEuMTUxYy00LjE5NiwwLTcuODU1LTEuNTYyLTEwLjk4LTQuNjg0Yy0zLjEyMS0zLjEyMy00LjY4My02LjkzNy00LjY4My0xMS40NA0KCQkJYzAtNC45MTQsMS44OTYtOS4xMzgsNS42ODItMTIuNjdjMy43ODktMy41MzIsOC41LTUuMjk4LDE0LjEyOS01LjI5OGM2Ljg2LDAsMTMuMDU0LDIuOTY5LDE4LjU4Miw4LjkwNg0KCQkJczguMjkzLDEzLjI1OCw4LjI5MywyMS45NjFjMCwxMC4yMzctMy40MDIsMTkuNzg2LTEwLjIxMywyOC42NDJDMTY4LjcyMSwxNTMuMjA4LDE1OC44NjUsMTU5LjczNSwxNDUuOTY2LDE2My45MzZ6DQoJCQkgTTcyLjcxMSwxNjMuNDc0di01LjgzNmMxMC4zNDMtNS45MzgsMTcuMTQ4LTExLjI2NCwyMC40MjYtMTUuOTcxYzMuMjc3LTQuNzExLDQuOTEzLTEwLjIzOSw0LjkxMy0xNi41ODYNCgkJCWMwLTIuODY4LTAuNTYtNS4wMTctMS42ODgtNi40NTFjLTEuMTI2LTEuNDM1LTIuMzA0LTIuMTUtMy41MzEtMi4xNWMtMS4xMjcsMC0yLjgxNSwwLjQwOC01LjA2OCwxLjIyOQ0KCQkJYy0yLjI1MiwwLjgxOS00LjUwNSwxLjIyOC02Ljc1OCwxLjIyOGMtNC4xOTcsMC03Ljg1NS0xLjUxMi0xMC45OC00LjUzYy0zLjEyMy0zLjAyMS00LjY4NC02LjczMy00LjY4NC0xMS4xMzUNCgkJCWMwLTUuMDE3LDEuOTc0LTkuMzY4LDUuOTEyLTEzLjA1M2MzLjk0MS0zLjY4Niw4Ljc4LTUuNTI5LDE0LjUxNC01LjUyOWM2Ljc1NiwwLDEyLjg0OSwyLjkxOCwxOC4yNzQsOC43NTQNCgkJCWM1LjQyOSw1LjgzNiw4LjE0LDEzLjEwNCw4LjE0LDIxLjgwOGMwLDEwLjc1LTMuNDI5LDIwLjU1Mi0xMC4yOSwyOS40MDlDOTUuMDMxLDE1My41MTYsODUuMzA0LDE1OS43ODgsNzIuNzExLDE2My40NzR6Ii8+DQoJPC9nPg0KCTxjaXJjbGUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjkuNTcyMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBjeD0iMTI1LjI3IiBjeT0iMTIxLjA1NyIgcj0iOTIuMTM3Ii8+DQo8L2c+DQo8L3N2Zz4NCg==" alt="Comma 1"><br/><br/>
			This database stores quotes from a wide variety of authors and historical figures.<br/>
			Retrieve existing quotes from the database, or add your own quote using RESTful API requests.<br/>
			Test requests with the [Swagger](http://swagger.io) interface below, or with your own testing tool directed at [https://rest-api-docs.herokuapp.com/](https://rest-api-docs.herokuapp.com/).<br/><br/>
			Sample API and documentation by [Carter Lawson](https://carterlawson.com/) at [SUPERMAPLE.systems](http://SUPERMAPLE.systems). View API and learn more on [Github](https://github.com/c-rter/rest_api).`,
			contact: {
				email: "c@rterlawson.com"
			},
			license: {
				name: "Apache 2.0",
				url: "http://www.apache.org/licenses/LICENSE-2.0.html"
			}
		},
		servers: [
			{
				url: "https://rest-api-docs.herokuapp.com/",
			},
		],
	},
	apis: ["./src/api/quotes.js"]
};

const specs = swaggerJsDoc(options);

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.json({
    message: '📚 QUOTE DATABASE 📚 Documentation at /api-docs/'
  });
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs, cCss));

app.use('/quotes', quoteRouter);


app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
