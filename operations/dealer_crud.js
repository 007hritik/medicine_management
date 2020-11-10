const {
    pool
} = require('../db/db_config');


const add_dealer = (req, res) => {
    const dealer = {
        'supplier_name': req.dealer.name,
        'supplier_email': req.dealer.email,
        'supplier_ph_no': req.dealer.ph_no,
        'dealer_address_1': req.dealer.address_1,
        'dealer_address_2': req.dealer.address_2,
        'dealer_products': req.dealer.products
    }
    pool.query('INSERT INTO supplier(supplier_name , supplier_email , supplier_phone_no , supplier_address_line_1 , supplier_address_line_2 , product_array) values($1, $2, $3, $4, $5, $6)',
        [req.dealer.name,

            req.dealer.email,
            req.dealer.ph_no,
            req.dealer.address_1,
            req.dealer.address_2,
            req.dealer.products
        ], (error, result) => {

        });

}