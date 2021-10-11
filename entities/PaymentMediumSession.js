module.exports = {
	_id: "MIFARE-10_bc4be965-15bf-4921-828d-8ff1618da4c6",

	timestamp: Date.now(), // should be validated - must be fresh (2 minutes)

	atr: "90fabbc54c6f6d57",
	uuid: "a0b1c2d3e4f507",
	organizationId: "3ae750a0-609c-483f-96c2-e27c8018daec",
	pointOfSaleId: "2c559ebd-2cee-4c1a-903e-ab848eaf409e",
	terminalKey: "abc-123",

	step: 0,
	nextStep: nextStep = {
		step: 0,
		requestApdus: [],
		desc: '',
		error: null,
		resetReaderSession: true,
	},
	steps: {
	},
	processVars: {
	},


	paymentMedium: {
		id: "MIFARE-10",
		mediumId: "044E0CF2164F80",
		endUserId: "1c77117d-2f00-4479-9050-dc86934bbd25",
		state: "EMITTED",
		stateTimestamp: 1632346160790,
		pockets: {
			REGULAR: {
				type: "REGULAR",
				balance: 0,
				balanceBk: 0,
				timestamp: 1632346160790
			}
		},
		blocked: false,
		expirationTimestamp: 1790026160790,
		expired: false,
		mods: [
		],
	},

};