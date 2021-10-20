module.exports = {
	_id: "MIFARE-2_bc4be965-15bf-4921-828d-8ff1618da4c6",
	sequential: 221, // system-wide session sequential
	timestamp: Date.now(), // should be validated - must be fresh (2 minutes)

	atr: "90fabbc54c6f6d57",
	uuid: "045B05F2164F80",
	organizationId: "830b9d85-1cad-490a-b376-eb6c6c2c56c2",
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
		id: "MIFARE-2",
		mediumId: "045B05F2164F80",
		endUserId: "4a2516f9-558d-429f-8aaa-5cb7a248b45a",
		"state" : "EMITTED",
		"stateTimestamp" : 1634748833956,
		"pockets" : {
			"REGULAR" : {
				"type" : "REGULAR",
				"balance" : 0,
				"balanceBk" : 0,
				"timestamp" : 1634748833956
			}
		},
		blocked: false,
		expirationTimestamp: 1792428833956,
		expired: false,
		mods: [
			{
				id: '111111',
				ts: Date.now(),
				type: 'BALANCE_RECHARGE',
				payload: {
					pocket: 'REGULAR',
					value: '2000'
				},
				applied: false,
				appliedTs: undefined,
				event: {
					et: 'SampleEvent',
					at: 'SampleAggregate',
					aid: '111111',
					av: '1',
				}
			},
			{
				id: '22222',
				ts: Date.now(),
				type: 'BLOCK',
				payload: {},
				applied: false,
				appliedTs: undefined,
				event: {
					et: 'SampleEvent',
					at: 'SampleAggregate',
					aid: '22222',
					av: '2',
				}
			},
			{
				id: '333333',
				ts: Date.now(),
				type: 'UNBLOCK',
				payload: {},
				applied: false,
				appliedTs: undefined,
				event: {
					et: 'SampleEvent',
					at: 'SampleAggregate',
					aid: '333333',
					av: '3',
				}
			},
			{
				id: '4444444',
				ts: Date.now(),
				type: 'BALANCE_DEBIT',
				payload: {
					pocket: 'REGULAR',
					value: '2000'
				},
				applied: false,
				appliedTs: undefined,
				event: {
					et: 'SampleEvent',
					at: 'SampleAggregate',
					aid: '44444444',
					av: '4',
				}
			},
		],
	},

};