const express = require("express");
const cors = require("cors");
const path = require("path");

const processRoute = require("./routes/process");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
extended: true
}));

// Public Folder
app.use(
express.static(
path.join(__dirname, "public")
)
);

// Reports Folder
app.use(
"/reports",
express.static(
path.join(__dirname, "reports")
)
);

// Process Route
app.use("/", processRoute);

const PORT = 3000;

app.listen(PORT, () => {


console.log(`
=========================================
 Flipkart Settlement Intelligence V3
=========================================
 Server Running :
 http://localhost:${PORT}
=========================================
`);
});