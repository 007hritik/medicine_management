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


PORT = process.env.PORT || 3028;
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: false
}));
app.get('/', checkIsnotAuthenticated, (req, res) => {
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
app.get('/users/inventory', checkIsnotAuthenticated, (req, res) => {
    res.render('inventory', {
        user: req.user.user_name
    });
});
//add supplier
app.get('/users/inventory/addsupplier', checkIsnotAuthenticated, (req, res) => {
    res.render('addsupplier', {
        user: req.user.user_name,

    });
});


app.get('/users/inventory/addproducts', checkIsnotAuthenticated, async (req, res) => {
    pool.query('SELECT * FROM PRODUCT', (error, result) => {
        if (error) {
            throw error;
        } else {
            res.render('addproducts', {
                user: req.user.user_name,
                supplier_list: result.rows
            });
        }
    });
});
app.get('/users/inventory/listsupplier', checkIsnotAuthenticated, async (req, res) => {
    pool.query('SELECT * FROM supplier', (error, result) => {
        if (error) {
            throw error;
        } else {
            console.log(result.rows);
            res.render('listsupplier', {
                user: req.user.user_name,
                supplier_list: result.rows

            });
        }
    })

});
app.get('/users/inventory/listproducts', checkIsnotAuthenticated, async (req, res) => {
    pool.query('SELECT * FROM product', (error, result) => {
        if (error) {
            throw error;
        } else {
            console.log(result.rows);
            res.render('listproducts', {
                user: req.user.user_name,
                product_list: result.rows

            });
        }
    });
});
app.post('/users/inventory/listsupplier/:id', checkIsnotAuthenticated, async (req, res) => {
    pool.query('DELETE FROM supplier where supplier_id = $1', [req.params.id], (error, result) => {
        if (error) {
            throw error;
        } else {
            res.redirect('/users/inventory/listsupplier');
        }
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
app.post('/users/inventory/addsupplier', async (req, res) => {
    let {
        first_name,
        email,
        address,
        prodcuts,
        contact_no
    } = req.body;

    pool.query('INSERT INTO supplier(supplier_name , supplier_email , supplier_phone_no , supplier_address_line_1 , product_array ) values($1,$2,$3,$4,$5)', [first_name,
        email,
        address,
        contact_no,
        prodcuts.split(','),
    ], (error, result) => {
        if (error) {
            if (error.code === '23505') {
                req.flash('addsupplier_error', error.detail);
                res.redirect('/users/inventory/addsupplier');
            } else {
                throw error;
            }

        } else {
            req.flash('success_msg_addsupplier', "Supplier details have been saved");
            res.redirect('addsupplier');
        }

    });


});
app.post('/users/inventory/addproducts', checkIsnotAuthenticated, (req, res) => {
    console.log(req.body);
    let {
        product_name,
        supplier_price,
        retail_price,
        supplier_id,
        quantity,
        description
    } = req.body;

    pool.query('INSERT INTO product(product_name , supplier_id ,supplier_price , retail_price ,quantity,description) values($1,$2,$3,$4,$5,$6)', [
        product_name,
        parseInt(supplier_id),
        supplier_price,
        retail_price,
        quantity,
        description
    ], (error, result) => {
        if (error) {
            if (error.code === '23503') {

                req.flash('addproduct_error', error.detail);
                res.redirect('/users/inventory/addproducts');
            } else {
                throw error;
            }

        } else {
            req.flash('success_msg_addproduct', "Product  details have been saved");
            res.redirect('/users/inventory/addproducts');
        }

    });


});
app.listen(PORT, () => {
    console.log(`Server is running of PORT ${PORT}`);
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/users/index');
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