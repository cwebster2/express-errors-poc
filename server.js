const express = require("express"),
      guid = require("uuid/v4"),
      logger = require("morgan");

const 
    app = express(),
    PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.json());

// Middleware because express doesn't natively do async properly
const asyncRoute = (asyncFn) => {
    return (req, res, next) => {
        asyncFn(req, res, next)
        .then(() => { return; })
        .catch((error) => { next(error); });
    };
};

// A normal route that works
app.get("/normal", (req, res) => res.send("Hello World"));

// A normal "async" route that works
app.get("/async", asyncRoute(async (req, res) => res.send("Hello World")));

// A normal route that throws
app.get("/normalError", (reg, res) => {
    console.debug("throwing now");
    throw Error("test");
})

// an "async" route that throws
app.get("/asyncError", asyncRoute(async (req, res) => {
    console.debug("throwing now");
    throw Error("test");
}));

// Error handlers go here
app.use((error, req, res, next) => {
    console.error(`in error handler middleware for error ${error}`);
    return next(error)
});

// catch-all -- This must be the last handler
app.use((error, req, res, next) => {
    const g = guid();
    console.error(`Error: ${g}`);
    console.error(error);
    console.error(`End error handler error ${g}`);
    res.status(500).send({error: g});
    next();
});

console.log("Try these routes:");
console.log(`http://localhost:${PORT}/normal`);
console.log(`http://localhost:${PORT}/async`);
console.log(`http://localhost:${PORT}/normalError`);
console.log(`http://localhost:${PORT}/asyncError`);

app.listen(PORT, () => { console.log(`App listeniing on port ${PORT}`)});

