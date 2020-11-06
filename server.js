const express = require("express");
const app = express();
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const initilizePassport = require('./passportConfig');
initilizePassport(passport);

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,

}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


const {
    pool
} = require('./db/db_config');
const bcrypt = require('bcrypt');
const {
    Passport,
    authenticate
} = require("passport");


PORT = process.env.PORT || 3026;
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: false
}));
app.get('/', (req, res) => {
    res.render("index");
});

app.get('/users/register', checkAuthenticated, (req, res) => {
    res.render("register");
});

app.get('/users/login', checkAuthenticated, (req, res) => {
    res.render('login');
});
app.get('/users/logout', checkIsnotAuthenticated, (req, res) => {
    req.logout();
    req.flash("success_msg", "You hava been loged out");
    res.redirect('/users/login');
})

app.get('/users/dashboard', checkIsnotAuthenticated, (req, res) => {
    res.render("dashboard", {
        user: req.user.user_name
    });
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
        pool.query(`SELECT * FROM users where email = $1`, [email], (error, result) => {

            if (error) {
                throw error;
            } else {
                if (result.rows.length > 0) {
                    errors.push({
                        message: "User already exist with this email"
                    });
                    res.render('register', {
                        errors
                    });
                    J8
                } else {
                    pool.query(`INSERT INTO users (user_name, email, password,registered_on)
                    VALUES ($1, $2, $3, (SELECT now()))
                    RETURNING  user_id, password`, [name, email, hashedPasssword], (error, result) => {
                        if (error) {
                            throw error;
                        } else {
                            console.log(result.rows);
                            req.flash('success_msg', "You have been successfuly Registered please Login");
                            res.redirect('/users/login');
                        }
                    })
                }
            }

        });
    }
});
app.post(
    "/users/login",
    passport.authenticate("local", {
        successRedirect: "/users/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })
);

app.listen(PORT, () => {
    console.log(`Server is running of PORT ${PORT}`);
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/users/dashboard');
    } else {
        next();
    }

}

function checkIsnotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/users/login');
    }
}