const UserModel = require('../models/user');

const Shopify = require('shopify-api-node');

const Boom = require('boom');
const Joi = require('joi');
require('dotenv').config();

const shopify = new Shopify({
	shopName: process.env.SHOP_NAME,
	apiKey: process.env.SHOPIFY_API_PUBLIC_KEY,
	password: process.env.SHOPIFY_PASSWORD,
	autoLimit: { calls: 2, interval: 1000, bucketSize: 30 }
});

const routes = [
	{
		method: 'GET',
		path: '/',
		config: {
			description: 'Home page',
			notes: 'Home page',
			tags: ['api'],
		},
		handler: async (request, h) =>{
			return h.view('login', { 'title': 'Login' });
		}
	},
	{
		method: 'POST',
		path: '/post/login',
		config: {
			description: 'login authentication done by JWT',
			notes: 'user can login',
			tags: ['api'],
			validate: {
				payload: {
					email: Joi.string().required(),
					password: Joi.string().required()
				}
			}
		},
		handler: async (request, h) => {
			let pr = async (resolve, reject) => {
				console.log(request.payload)
				UserModel.find({ 'email': request.payload.email },async function (err, data) {
					if (err) {
						return reject({
							'error': err
						});
					} else if (data.length == 0) {
						const newUser = new UserModel({
							"email": request.payload.email,
							"password": request.payload.password
						});
						newUser.save(function async (err, user) {
							if (err) {
								return reject({
									data: err,
									message: "error handled"
								});
							} else {
								const token = UserModel.generateToken(user['_id'])
								return resolve({
									token: token,
									userid: user['_id'],
								});
							}
						})
					} else {
						const validUser = await UserModel.login(request.payload.email, request.payload.password);

						if (validUser) {
							const token = UserModel.generateToken(data[0]['_id'])
							return resolve({
								token: token,
								userid: data[0]['_id'],
							});
						} else {
							return reject({
									status: "error",
									message: "Invalid password"
								});
						}
					}
				});
			}
			return new Promise(pr)

		}
	},
	{
		method: 'GET',
		path: '/shopify/get/inventoryItems',
		config: {
			description: 'Retrieve product information from the inventory',
			notes: 'Retrieve product information from the inventory',
			tags: ['api'],
			auth: 'jwt',
			validate: {
				query: {
					"limit": Joi.number().required()
				}
			}
		},
		handler: async (request, h) => {
			return new Promise((resolve, reject) => {
				//getting product list from which we will get ids of inventoryItem
				shopify.product.list({ limit: request.query.limit })
					.then(function (products) {
						let ids = '';
						products.forEach((product) => {
							product.variants.forEach((variant) => {
								ids += `${variant.inventory_item_id},`
							});
						});
						ids = ids.slice(1, ids.length - 1)
						//returning ids of inventoryItems
						return ids
					})
					.then((inventory_item_ids) => {
						//fetching inventoryItems
						shopify.inventoryItem.list({ ids: inventory_item_ids })
							.then((result) => {
								resolve(result)
							})
					})
					.catch(function (error) {
						console.log(error);
						reject(Boom.badGateway(error))
					})
			})
		}
	},
	{
		method: 'POST',
		path: '/shopify/create/order',
		config: {
			description: 'Create an Order',
			notes: 'Create an Order',
			tags: ['api'],
			auth: 'jwt',
			validate: {
				payload: {
					"line_items": Joi.array().items(Joi.object({
						"title": Joi.string(),
						"price": Joi.string(),
						"quantity": Joi.number()
					})).required()
				}
			}
		},
		handler: async (request, h) => {
			return new Promise((resolve, reject) => {
				//creating order
				shopify.draftOrder.create(request.payload)
					.then(function (result) {
						resolve(result)
					})
					.catch(function (error) {
						console.log(error, "error")
						reject(Boom.badGateway(error))
					})
			})
		}
	}
]

export default routes;

