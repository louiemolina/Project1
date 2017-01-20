var Yelp = require('yelp'),
	express = require('express'),
	app = express(),
	cons = require('consolidate'),
	bodyParser = require('body-parser'),
	pug = require('pug');
	path = require('path')

app.set('view engine', 'pug');
app.set('views','./views');
app.locals.pretty =true //indent produces html for clarity
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));

//Handle for internal server errors
function errorHandler(err, req,res, next)
{
console.error(err.message);
console.error(err.stack);
res.status(500);
res.render('error',{message:err});
}

app.use(errorHandler);

/* GET search page. */
app.get('/', function (req, res, next) {
    res.render('home', { title: "Find the restaurant", ojbJason:[]});
});

/* GET error page. */
app.get('/error', function (req, res, next) {
    res.render('error', {message:"Invalid Location (Near) criteria!!!"});
});

/* GET home page*/
app.get('/home', function (req, res, next) {
    res.render('home', { title: "Find the restaurant", ojbJason: [] });
});

/* POST home page*/
app.post('/home', function (req, res, next) {
    res.redirect('home');
});

/*POST search page*/
app.post('/search', function (req, res, next) {
    var search = req.body.search;
    var nearby = req.body.nearby;
    var dt = new Date();
    console.log('DateandTime: ' + dt + ' Search: '+search+ " Nearby: "+ nearby)
    //console.log('Criteria:'+ nearby.toUpperCase().trim());
        if (nearby.toUpperCase().trim() == 'SINGAPORE' || nearby.toUpperCase().trim() == 'TOKYO' || nearby.toUpperCase().trim() == 'JAPAN' || nearby.toUpperCase().trim() == 'JAKARTA' || nearby.toUpperCase().trim() == 'RAFFLES PLACE, SINGAPORE'){
            // Connect to MongoDB
            require('./models/business');
            var mongoose = require('mongoose');
            mongoose.Promise = global.Promise;
            //mongoose.connect('mongodb://localhost/yelp'); // yelp as collection name
            mongoose.connect('mongodb://welcome123:welcome123@ds157278.mlab.com:57278/gothere'); // gothere as collection name 
            var Business = mongoose.model('Business');

            var yelp = new Yelp({
                consumer_key: 'MdiDh9Bo2AhGtG6W84MfRw',
                consumer_secret: 'ysnbUIpkRKrb_zmSAHjD3X779Hk',
                token: 'T_QC8boQZNOd3O_RhHdcT0pI60i8suhj',
                token_secret: 'OOHzJCKDGOTxja4SqHGy1sg_f4w',
            });

            yelp.search({ term: search, location: nearby})
            .then(function (data) {
                //console.log(data); // print the data returned from the API call
                var jsonString = JSON.stringify(data); // convert data to JSON string
                var restoname = [];
                jsonBussObj = JSON.parse(jsonString).businesses; // Parse JSON string to JSON Object         
                //console.log(jsonBussObj); // Print each business JSON object
                var l = jsonBussObj.length; // Print length
                for (var i = 0; i < l; i++) {
                    var bussiObj = jsonBussObj[i];
                    var newBusiness = new Business();

                    newBusiness.is_claimed = bussiObj.is_claimed;
                    //console.log('bussiObj.is_claimed: ' + bussiObj.is_claimed)
                    newBusiness.rating = bussiObj.rating;
                    //console.log('bussiObj.rating: ' + bussiObj.rating)
                    newBusiness.mobile_url = bussiObj.mobile_url;
                    //console.log('bussiObj.mobile_url: ' + bussiObj.mobile_url)
                    newBusiness.rating_img_url = bussiObj.rating_img_url;
                    //console.log('bussiObj.rating_img_url: ' + bussiObj.rating_img_url)
                    newBusiness.review_count = bussiObj.review_count;
                    //console.log('bussiObj.review_count: ' + bussiObj.review_count)     
                    newBusiness.name = bussiObj.name;
                    //console.log('bussiObj.name: ' + bussiObj.name)
                    newBusiness.rating_img_url_small = bussiObj.rating_img_url_small;
                    //console.log('bussiObj.rating_img_url_small: ' + bussiObj.rating_img_url_small)
                    newBusiness.url = bussiObj.url;
                    //console.log('bussiObj.url: ' + bussiObj.url)
                    newBusiness.categories = bussiObj.categories;
                    //console.log('bussiObj.categories: ' + bussiObj.categories)
                    newBusiness.phone = bussiObj.phone;
                    //console.log('bussiObj.phone: ' + bussiObj.phone)
                    newBusiness.snippet_text = bussiObj.snippet_text;
                    //console.log('bussiObj.snippet_text: ' + bussiObj.snippet_text)
                    newBusiness.image_url = bussiObj.image_url;
                    //console.log('bussiObj.image_url: ' + bussiObj.image_url)
                    newBusiness.snippet_image_url = bussiObj.snippet_image_url;
                    //console.log('bussiObj.snippet_image_url: ' + bussiObj.snippet_image_url)
                    newBusiness.display_phone = bussiObj.display_phone;
                    //console.log('bussiObj.display_phone: ' + bussiObj.display_phone)
                    newBusiness.rating_img_url_large = bussiObj.rating_img_url_large;
                    //console.log('bussiObj.rating_img_url_large: ' + bussiObj.rating_img_url_large)
                    newBusiness.id = bussiObj.id;
                    //console.log('bussiObj.id: ' + bussiObj.id)
                    newBusiness.is_closed = bussiObj.is_closed;
                    //console.log('bussiObj.is_closed: ' + bussiObj.is_closed)
                    newBusiness.location = bussiObj.location;
                    //console.log('bussiObj.location: ' + bussiObj.location)
                    restoname.push(newBusiness);
                    //save the business document to mongodb
                    newBusiness.save(function (err) {
                       if (err) {
                            console.log('DateandTime: ' + dt + ' Error in Saving user: ' + err);
                            throw err;
                        }
                    mongoose.connection.close();
                    });
                }
                console.log('DateandTime: ' + dt + ' Records successfully saved in DB.');
                //console.log(restoname);
                res.render('home', { title: "Find the restaurant", ojbJason: restoname.sort()});


            })
            .catch(function (err) {
                console.error(err);
            });
        }
        else { res.redirect('error'); }
});

app.listen(process.env.PORT);
console.log('Place finder is up in port 3000');


