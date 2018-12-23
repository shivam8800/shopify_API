const UserModel = require('../models/user');

const Shopify = require('shopify-api-node');

const Boom = require('boom');
const Joi = require('joi');
const JWT = require('jsonwebtoken');  // used to sign our content
require('dotenv').config();

const shopify = new Shopify({
	shopName: process.env.SHOP_NAME,
	apiKey: process.env.SHOPIFY_API_PUBLIC_KEY,
	password: process.env.SHOPIFY_PASSWORD,
	autoLimit: { calls: 2, interval: 1000, bucketSize: 30 }
});

const routes = [
	{
		method: 'POST',
		path: '/post/signup',
		config: {
			description: 'signup',
			notes: 'user can register yourself',
			tags: ['api'],
			// we joi plugin to validate request
			validate: {
				payload: {
					name: Joi.string().required(),
					email: Joi.string().required(),
					password: Joi.string().required()
				}
			}
		},
		handler: async (request, h) => {

			let pr = async (resolve, reject) => {
				UserModel.find({ 'email': request.payload.email }, function (err, data) {

					if (err) {
						return reject({
							statusCode: 500,
							message: "error handled",
							data: err
						});
					} else if (data.length != 0) {
						return resolve({
							statusCode: 201,
							message: 'This user is already exist'
						});
					} else {
						const newUser = new UserModel({
							"name": request.payload.name,
							"email": request.payload.email,
							"password": request.payload.password
						});
						newUser.save(function (err, user) {
							if (err) {
								return reject({
									data: err,
									message: "error handled"
								});
							} else {
								return resolve({
									statusCode: 200,
									message: "you have Successfully created use",
									data: user
								});
							}
						})
					}

				});
			}
			return new Promise(pr)
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
					email: Joi.string(),
					password: Joi.string()
				}
			}
		},
		handler: async (request, h) => {
			let pr = async (resolve, reject) => {
				UserModel.find({ 'email': request.payload.email }, function (err, data) {
					if (err) {
						return reject({
							'error': err
						});
					} else if (data.length == 0) {
						return resolve({
							'data': "user does not exist!"
						});
					} else {
						if (request.payload.password == data[0]['password']) {
							const token = JWT.sign(data[0].toJSON(), "vZiIpmTzqXHp8PpYXTwqc9SRQ1UAyAfC"); // synchronous

							return resolve({
								token,
								userid: data[0]['_id'],
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
			auth: 'jwt'
		},
		handler: async (request, h) => {
			return new Promise((resolve, reject) => {
				shopify.product.list({ limit: 2 })
					.then(function (products) {
						let ids = '';
						products.forEach((product) => {
							product.variants.forEach((variant) => {
								ids += `${variant.inventory_item_id},`
							});
						});
						ids = ids.slice(1, ids.length - 1)
						return ids
					})
					.then((inventory_item_ids) => {
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
			// auth: 'jwt',
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

