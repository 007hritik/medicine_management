const express = require("express");
const app = express();

const {
    pool
} = require('./db/db_config');
const bcrypt = require('bcrypt');


PORT = process.env.PORT || 3009;
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: false
}));
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
    res.render("dashboard", {
        user: "hritik"
    })
});
app.post("/users/register", async (req, res) => {
    let {
        name,
        email,
        password,
        password2
    } = req.body;

    let errors = [];

    console.log({
        name,
        email,
        password,
        password2
    });

    if (!name || !email || !password || !password2) {
        errors.push({
            message: "Please enter all fields"
        });
    }

    if (password.length < 6) {
        errors.push({
            message: "Password must be a least 6 characters long"
        });
    }

    if (password !== password2) {
        errors.push({
            message: "Passwords do not match"
        });
    }

    if (errors.length > 0) {
        res.render("register", {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        let hashedPasssword = await bcrypt.hash(password, 10);
        console.log(hashedPasssword)
        pool.query(`SELECT * FROM users where email = ${email}`, (error, result) => {
            if (error) {
                (`SELECT * FORM users where email = '${email}'`, (error, result) => {
                    if (error) {
                        throw error;
                    } else {
                        console.log(result);
                    }
                });
                throw error;
            } else {
                console.log(result);
            }
        });

    }
});


app.listen(PORT, () => {
    console.log(`Server is running of PORT ${PORT}`);
});