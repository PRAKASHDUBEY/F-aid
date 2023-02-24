const express = require("express");
const app = express();
const main = require('./main')
const cors = require('cors');
app.use(cors({
    origin: '*'
}));
app.use(express.json({}));
app.use(express.json({
    extented: true
}));

app.use("/", main);
app.listen(8080, 
    console.log(`Server running on  Port :8080`));