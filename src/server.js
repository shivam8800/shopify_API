const Hapi = require('hapi');
import routes from './routes'

const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
//db connection established
const db = require('../database').db;


// validation function
const validate = async function (user, decoded, request) {
    // checks to see if the person is valid
    if (!user['_id']) {
        return { isValid: false };
    }
    else {
        return { isValid: true };
    }
};


const init = async () => {
    //creating a server
    const server = new Hapi.Server({
        port: 8080,
        routes: { cors: true }
    });
    const swaggerOptions = {
        info: {
            title: 'Test API Documentation'
        },
    };

    //register hapi swagger documentation
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        }
    ]);

    // cookie
    await server.register(require('hapi-auth-cookie'));
      server.auth.strategy('restricted', 'cookie',
      {
        ttl: 24 * 60 * 60 * 1000,
        password: 'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy',
        cookie: 'shopify-cookie',
        isSecure: false,
        redirectTo: '/',
        isSameSite: 'Lax'
      });

    //register hapi-auth-jwt2 for authentication
    await server.register(require('hapi-auth-jwt2'));

    server.auth.strategy('jwt', 'jwt',
        {
            key: 'vZiIpmTzqXHp8PpYXTwqc9SRQ1UAyAfC',
            validate: validate,
            verifyOptions: { algorithms: ['HS256'] }
        });

    //registering handlebar
    server.views({
        engines: {
            html: require('handlebars')
        },
        path: 'templates',
        layout: 'layout'
    });


    server.route({
        path: '/{path*}',
        method: ["GET", "POST"],

        handler: {
            directory: {
                path: 'templates',
                listing: true,

            }
        }

    });

    //registering all routes
    server.route(routes);

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();