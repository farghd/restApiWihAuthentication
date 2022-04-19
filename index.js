const express = require("express");
const auth = require('./routes/auth');
const post = require('./routes/post');
const User = require('./models/user');

const app = express();

app.use(express.json());

app.use('/auth', auth);
app.use('/posts', post);


app.get("/", (req, res) => {
    res.send("Hi I am working");
});

User.sync().then(() => {
    app.listen(5000, () => {
        console.log("Now running on port 5000!")
    });
})


