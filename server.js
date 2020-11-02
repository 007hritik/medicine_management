const express = require("express");
const app = express();

PORT  = process.env.PORT || 4004;
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render("index");
});

app.get('/users/register', (req, res) => {
    res.render("register");
});

app.get('/users/login', (req, res) => {
    res.render('login');
});


app.get('/users/dashboard', (req, res) => {
    res.render("dashboard", {user: "hritik"})
});

app.listen(PORT, () => {
    console.log(`Server is running of PORT ${PORT}`);
})