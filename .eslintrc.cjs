/** @type {import('eslint').Linter.Config} */
const config = {
	root: true,
	extends: [
		'eslint:recommended',
		'@typescript-eslint/recommended',
		'plugin:svelte/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	]
};

module.exports = config; 