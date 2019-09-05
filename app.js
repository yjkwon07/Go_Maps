const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config();
const indexRouter = require('./routes');
const connect = require('./schemas');

const app = express();
connect();

app.set('views', path.join(__dirname, 'viewws'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8015);
app.use(morgan('dev'));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
}));
app.use(flash());

app.use('/', indexRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});


