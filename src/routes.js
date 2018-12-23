var UserModel = require('../models/user');

var Joi = require('joi');
var async = require('async');
const JWT = require('jsonwebtoken');  // used to sign our content

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
						var newUser = new UserModel({
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
	}
]

export default routes;
