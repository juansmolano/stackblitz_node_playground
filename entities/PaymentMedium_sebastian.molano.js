module.exports = {
	_id: "MIFARE-6",
	id: "MIFARE-6",
	organizationId: "3ae750a0-609c-483f-96c2-e27c8018daec",
	typeId: "22ff57ab-7e18-4b93-9321-dbe806269895",
	mediumId: "046C08F2164F80",
	ephemeral: false,
	endUserId: "2a66d8f9-f5ff-42e4-8e93-b161fbb2261c",
	profileId: "bc4be965-15bf-4921-828d-8ff1618da4c6",
	state: "BLOCKED",
	stateTimestamp: 1632340438803,
	stateResponsibleUserId: null,
	stateResponsibleUserName: "Sebastian Molano",
	stateHistory: [
		{
			timestamp: 1632340279049,
			state: "ACQUIRED",
			responsibleUserId: "",
			responsibleUserFullname: "JUAN GARCES"
		},
		{
			timestamp: 1632340438803,
			state: "EMITTING",
			responsibleUserId: null,
			responsibleUserFullname: "Sebastian Molano"
		},
		{
			timestamp: 1632340449143,
			state: "EMITTED",
			responsibleUserFullname: "Sebastian Molano"
		},
		{
			timestamp: 1632515112175,
			state: "BLOCKED",
			responsibleUserFullname: "SYSTEM"
		}
	],
	pockets: {
		REGULAR: {
			type: "REGULAR",
			balance: 0,
			balanceBk: 0,
			timestamp: 1632340438803
		}
	},
	blocked: false,
	metadata: {
		data: null,
		timestamp: 1632340438803,
		mappingVersion: 3,
		transactionSeq: 0,
		atr: "3B878001C10521300077C165"
	},
	expirationTimestamp: 1790020438803,
	expired: false,
	mods: [
	],
	emissionProcess: {
		initTimeStamp: 1632340438962,
		steps: {
			"0": {
				stepName: "Cliente inicia comunicación",
				createTimestamp: 1632340438962,
				responseApdus: {
					logType: "responseApdus",
					data: [
					],
					timestamp: 1632340438962,
					error: null
				}
			},
			"1": {
				stepName: "Solicitando UUID",
				createTimestamp: 1632340438962,
				requestApdus: {
					logType: "requestApdus",
					data: [
						"FFCA000000"
					],
					timestamp: 1632340438962,
					error: null
				},
				responseApdus: {
					logType: "responseApdus",
					data: [
						{
							requestApdu: "ffca000000",
							responseApdu: "046c08f2164f809000",
							isValid: true
						}
					],
					timestamp: 1632340439144,
					error: null
				}
			},
			"2": {
				stepName: "Autenticación Fase I",
				createTimestamp: 1632340439144,
				requestApdus: {
					logType: "requestApdus",
					data: [
						"70034000"
					],
					timestamp: 1632340439144,
					error: null
				},
				responseApdus: {
					logType: "responseApdus",
					data: [
						{
							requestApdu: "70034000",
							responseApdu: "90a86559aab22c6b3aa350437ee26b80b2",
							isValid: true
						}
					],
					timestamp: 1632340439320,
					error: null
				}
			},
			"3": {
				stepName: "Autenticación Fase II",
				createTimestamp: 1632340439322,
				requestApdus: {
					logType: "requestApdus",
					data: [
						"72ad80e1e66b1e1037cccf563ad004d915a4fff47133d8bc5cdeab50b35c024af0"
					],
					timestamp: 1632340439322,
					error: null
				},
				responseApdus: {
					logType: "responseApdus",
					data: [
						{
							requestApdu: "72ad80e1e66b1e1037cccf563ad004d915a4fff47133d8bc5cdeab50b35c024af0",
							responseApdu: "90fa73486dc9e7352fb3713da36539ed4731d3511943971d65802a873124034400",
							isValid: true
						}
					],
					timestamp: 1632340439490,
					error: null
				}
			},
			"4": {
				stepName: "Leer Tarjeta en Blanco",
				createTimestamp: 1632340439492,
				requestApdus: {
					logType: "requestApdus",
					data: [
						"310400159786b0e15bbea620"
					],
					timestamp: 1632340439492,
					error: null
				},
				responseApdus: {
					logType: "responseApdus",
					data: [
						{
							requestApdu: "310400159786b0e15bbea620",
							responseApdu: "90cd20acba51a0285a021af4cb749c176a261105d2b9757246f419cd95e839de91c7e26cbec30614c54382c240e84985446321c3e1335d56cbbe23919dc84bd592aa351ec9de7493308e4d3b9c5f5463184cf7af43b72d09b8417452e323ca391c9510ae8d5fdc87f2f82662d3137b8ff7e8622d7cd03ea1c4118c542cffe0f69533770bf663af37b7aaf1225e7cad903fb41c33b2e00e4680ad0c9ab4854c4529891463f3e9dc3697dffae3eddc52374304f31c5d9d7deb60ea993334b46aa22127cfcd79a8fe624443051841e6f6eddb94fa8b40c71080ab79947a48d752ce12c533807788e8bc4a30323042ca215c0da27d3ded6b32f70f3b57480fd1dc151d7f9e1c3540437e50256fd5402232caa2efc9bd7bff0041c489903956655c86c03d7fd31dd9cab0887b6b51a2cf4f493759ec89e51954ac9ddeca2f6624166b1f12047c856211dd3d45b0d596271f609ed25f8c16b73abba1",
							isValid: true
						}
					],
					timestamp: 1632340439703,
					error: null
				},
				blankReadData: {
					logType: "blankReadData",
					data: {
						"4": "00000100000001000000010000000000",
						"5": "00000000000000000000000000000000",
						"6": "00000000000000000000000000000000",
						"8": "00000000000000000000000000000000",
						"9": "00000000000000000000000000000000",
						"10": "00000000000000000000000000000000",
						"12": "00000000000000000000000000000000",
						"13": "00000000000000000000000000000000",
						"14": "00000000000000000000000000000000",
						"16": "00000000000000000000000000000000",
						"17": "00000000000000000000000000000000",
						"18": "00000000000000000000000000000000",
						"20": "00000000000000000000000000000000",
						"21": "00000000000000000000000000000000",
						"22": "00000000000000000000000000000000",
						"24": "00000000000000000000000000000000",
						"25": "00000000000000000000000000000000",
						"26": "00000000000000000000000000000000",
						"28": "00000000000000000000000000000000",
						"29": "00000000000000000000000000000000",
						"30": "00000000000000000000000000000000"
					},
					timestamp: 1632340439710,
					error: null
				}
			},
			"5": {
				stepName: "Escribir Datos",
				createTimestamp: 1632340439723,
				requestApdus: {
					logType: "requestApdus",
					data: [
						"a10400e58398caf4962b5602c62e8ac36edad741a23a53b9204a06",
						"a10500427dd66c4ac70e43ec7fcd2493d5e273c5582224420fc92b",
						"a1090011fbb62029f536c1afd1dc97ae8045e08a5daf291420431e",
						"a10a00cd5fb509935844d414d1e91640174365063172a852471ee1",
						"a10c00650d91d0dabab1a7c0302517ba22604753aa303456993078",
						"a10d00ae9532f3b12aa1dc4da62bb04caf712555b632fdb07505bc",
						"a10e00ca79f109839ccef0a62cf4d7277269a8cd235348741c7598",
						"a1100057eebfe0d8b9722420c7f983d9d76a54310865de5327448b",
						"a1110077ca0719ce2d9b1812ba43fef9ddb5bffe924910ec97d902",
						"a11200d915deac5b3ebaf3f3860210a672aa2e44d921b902ca8aa1",
						"a11400ea4922a20fac150773cc4ce88b68af6531526bf7edcc859e",
						"a11500a993df4867b052f64f7405bf0dd511f53e64b211dbd2fe47",
						"a11600d032fe118591d72a98b5c0078f5985fde78fb9209098a667",
						"a11800feae9d04e6d0eef6dd695a16ee76e9be4b882c0a0e440dde",
						"a119006e22fe3d1a229a509f138c8cc701820d85d96518c3ac355c",
						"a11a00e6bb3ea75e236114f8eb8e9b1ec90f6958640c62431694d8",
						"a11c00a7aba0f28ec6325df510002afaa079fa6450e090e7fe345b",
						"a11d0081a6e7a5f6734568af7490f17561e1ff18d87f6b60329a3a",
						"a11e00889bb484998cf5cde0b0dd039c867bcd3cc0884dfa78fa26"
					],
					timestamp: 1632340439723,
					error: null
				},
				responseApdus: {
					logType: "responseApdus",
					data: [
						{
							requestApdu: "a10400e58398caf4962b5602c62e8ac36edad741a23a53b9204a06",
							responseApdu: "90625f99efafdc7fad",
							isValid: true
						},
						{
							requestApdu: "a10500427dd66c4ac70e43ec7fcd2493d5e273c5582224420fc92b",
							responseApdu: "90d3577b37b85fb448",
							isValid: true
						},
						{
							requestApdu: "a1090011fbb62029f536c1afd1dc97ae8045e08a5daf291420431e",
							responseApdu: "900dadf1f3c9fc614c",
							isValid: true
						},
						{
							requestApdu: "a10a00cd5fb509935844d414d1e91640174365063172a852471ee1",
							responseApdu: "906cd5936857aae7a0",
							isValid: true
						},
						{
							requestApdu: "a10c00650d91d0dabab1a7c0302517ba22604753aa303456993078",
							responseApdu: "90fd9f94b3abc333c8",
							isValid: true
						},
						{
							requestApdu: "a10d00ae9532f3b12aa1dc4da62bb04caf712555b632fdb07505bc",
							responseApdu: "90653ab57e9c2f633c",
							isValid: true
						},
						{
							requestApdu: "a10e00ca79f109839ccef0a62cf4d7277269a8cd235348741c7598",
							responseApdu: "901f429d3671c03223",
							isValid: true
						},
						{
							requestApdu: "a1100057eebfe0d8b9722420c7f983d9d76a54310865de5327448b",
							responseApdu: "9084d1f12fbe41e5f8",
							isValid: true
						},
						{
							requestApdu: "a1110077ca0719ce2d9b1812ba43fef9ddb5bffe924910ec97d902",
							responseApdu: "90d7bd78febfc46c3c",
							isValid: true
						},
						{
							requestApdu: "a11200d915deac5b3ebaf3f3860210a672aa2e44d921b902ca8aa1",
							responseApdu: "907106b306e5abc871",
							isValid: true
						},
						{
							requestApdu: "a11400ea4922a20fac150773cc4ce88b68af6531526bf7edcc859e",
							responseApdu: "90ca7dba058627092c",
							isValid: true
						},
						{
							requestApdu: "a11500a993df4867b052f64f7405bf0dd511f53e64b211dbd2fe47",
							responseApdu: "90a23d03b0b3cce767",
							isValid: true
						},
						{
							requestApdu: "a11600d032fe118591d72a98b5c0078f5985fde78fb9209098a667",
							responseApdu: "900b5c7515243b98ae",
							isValid: true
						},
						{
							requestApdu: "a11800feae9d04e6d0eef6dd695a16ee76e9be4b882c0a0e440dde",
							responseApdu: "90f014aee53a0396d9",
							isValid: true
						},
						{
							requestApdu: "a119006e22fe3d1a229a509f138c8cc701820d85d96518c3ac355c",
							responseApdu: "901a9840dabf9480cc",
							isValid: true
						},
						{
							requestApdu: "a11a00e6bb3ea75e236114f8eb8e9b1ec90f6958640c62431694d8",
							responseApdu: "90f71873ede5660fef",
							isValid: true
						},
						{
							requestApdu: "a11c00a7aba0f28ec6325df510002afaa079fa6450e090e7fe345b",
							responseApdu: "9092b70e5858e8619a",
							isValid: true
						},
						{
							requestApdu: "a11d0081a6e7a5f6734568af7490f17561e1ff18d87f6b60329a3a",
							responseApdu: "906a2b46395ef6fd51",
							isValid: true
						},
						{
							requestApdu: "a11e00889bb484998cf5cde0b0dd039c867bcd3cc0884dfa78fa26",
							responseApdu: "90de67f8ab96f840c3",
							isValid: true
						}
					],
					timestamp: 1632340440095,
					error: null
				}
			},
			"6": {
				stepName: "Verificar Datos Escritos",
				createTimestamp: 1632340440108,
				requestApdus: {
					logType: "requestApdus",
					data: [
						"310400158e84a9a1cfa3a765"
					],
					timestamp: 1632340440108,
					error: null
				},
				responseApdus: {
					logType: "responseApdus",
					data: [
						{
							requestApdu: "310400158e84a9a1cfa3a765",
							responseApdu: "907d3c5af83e88c15373bd8c7cde4396c72844ea6bce876d54b8290de772508a9f90c5c06f2f819ac7f30588acebb84077c2b0a8d69aba6a9a07dacd73e1d12225baca8c1217d2398645180efdcd9940104e439dcb78e4f0415f03775ce69e4d04341e2a730b5099514d4b5e02f9183a6683f15fc1e5c52144dfc6870792d4282233f995ee1f0787f1643e7b67745775636f79a487720212de714ccb87d0a72ede32877f26371aa7a4b6e0a7d190b47f93f6ea27bfceaad0f262c1adad41156add2ff9973e5ee3b1e5056515cb6b500f94fc6443b6cd38e1601346b403f8fee68b17b0b800073d2645d330a6157f70bf626ddbb3a6b3a673368f9608f6822c5bb06a7cf57207fe590ee8d4f3505ea5bd282c089fe8bdaf24ee133e04de3c514588bee1acf027e12dc7c3e6eba7966d9a7228751e8dff31c9fa5a74dd9569d28557dfa41aa6c6361641d1b1138b686bffb647921019d6872f95",
							isValid: true
						}
					],
					timestamp: 1632340440344,
					error: null
				},
				rawDataAfter: {
					logType: "rawDataAfter",
					data: {
						"4": "5345454153544e414e204a4f4c414e4f",
						"5": "00000000000000000000000000000000",
						"6": "00000000000000000000000000000000",
						"8": "00000000000000000000000000000000",
						"9": "03000000000000000000000000000000",
						"10": "38303331393935000000000000000000",
						"12": "06000000000000000000000000000000",
						"13": "01030000000000000000000000000000",
						"14": "00000000ffffffff00000000ff00ff00",
						"16": "00000000000000000000000000000000",
						"17": "00000000000000000000000000000000",
						"18": "568bb16a000000000000000000000000",
						"20": "00000000ffffffff00000000ff00ff00",
						"21": "00000000ffffffff00000000ff00ff00",
						"22": "00000000ffffffff00000000ff00ff00",
						"24": "00000000000000000000000000000000",
						"25": "00000000000000000000000000000000",
						"26": "00000000000000000000000000000000",
						"28": "00000000000000000000000000000000",
						"29": "00000000000000000000000000000000",
						"30": "00000000000000000000000000000000"
					},
					timestamp: 1632340440353,
					error: null
				},
				decodedCardData: {
					logType: "decodedCardData",
					data: {
						DI: "8031995",
						NU: "SEEASTNAN JOLANO",
						TD: 3,
						AC: 0,
						B: 0,
						"CT$": 0,
						FV: 1790020438,
						HISTR_CK_1: 0,
						HISTR_CK_2: 0,
						HISTR_CT_1: 0,
						HISTR_CT_2: 0,
						HISTR_FT_1: 0,
						HISTR_FT_2: 0,
						HISTR_IDV_1: 0,
						HISTR_IDV_2: 0,
						HISTR_TT_1: 0,
						HISTR_TT_2: 0,
						HISTR_VT_1: 0,
						HISTR_VT_2: 0,
						HISTU_CK_1: 0,
						HISTU_CK_2: 0,
						HISTU_CK_3: 0,
						HISTU_CK_4: 0,
						HISTU_CK_5: 0,
						HISTU_CK_6: 0,
						HISTU_FID_1: 0,
						HISTU_FID_2: 0,
						HISTU_FID_3: 0,
						HISTU_FID_4: 0,
						HISTU_FID_5: 0,
						HISTU_FID_6: 0,
						HISTU_FT_1: 0,
						HISTU_FT_2: 0,
						HISTU_FT_3: 0,
						HISTU_FT_4: 0,
						HISTU_FT_5: 0,
						HISTU_FT_6: 0,
						HISTU_IDV_1: 0,
						HISTU_IDV_2: 0,
						HISTU_IDV_3: 0,
						HISTU_IDV_4: 0,
						HISTU_IDV_5: 0,
						HISTU_IDV_6: 0,
						HISTU_ITI_1: 0,
						HISTU_ITI_2: 0,
						HISTU_ITI_3: 0,
						HISTU_ITI_4: 0,
						HISTU_ITI_5: 0,
						HISTU_ITI_6: 0,
						NT: 6,
						P: 1,
						PMR: 0,
						"ST$": 0,
						"STB$": 0,
						VL: 3
					},
					timestamp: 1632340440353,
					error: null
				}
			},
			"7": {
				stepName: "Escribir bits de acceso y llaves",
				createTimestamp: 1632340440354,
				requestApdus: {
					logType: "requestApdus",
					data: [
						"a11f0049659f94cfd6aa052557f0130b6132581b307ec49c90a267",
						"a10e409ac05ef646bc8fa67a40ad6dbc8f182b6d443e20732d4bd2",
						"a10f40b10040a545f347cb298809b2e086cbd39a50e2b584b5e08b"
					],
					timestamp: 1632340448854,
					error: null
				},
				cardSecurityStates: [
					{
						sector: 1,
						state: "WRITE_VERIFIED",
						acl: {
							block: 7,
							ACL: "00000000000F7F0788FF000000000000",
							KEYA: "DEBITO",
							KEYB: "CREDITO"
						},
						auth: {
							authPhaseIApdu: [
								112,
								3,
								64,
								0
							],
							firstAuthPhase1: [
								163,
								13,
								87,
								182,
								126,
								196,
								194,
								121,
								13,
								8,
								181,
								230,
								24,
								180,
								239,
								50
							],
							authPhaseIIApdu: [
								114,
								64,
								203,
								74,
								184,
								43,
								172,
								214,
								110,
								208,
								140,
								198,
								160,
								190,
								30,
								90,
								0,
								60,
								58,
								217,
								41,
								91,
								59,
								132,
								107,
								228,
								104,
								90,
								16,
								193,
								47,
								101,
								42
							],
							firstAuthPhase2: [
								40,
								38,
								229,
								179,
								154,
								244,
								219,
								47,
								201,
								93,
								14,
								107,
								110,
								64,
								196,
								179,
								231,
								150,
								119,
								106,
								61,
								208,
								95,
								103,
								233,
								106,
								177,
								113,
								2,
								27,
								100,
								157
							],
							ParametersFromFirstAuth: {
								keyEnc: [
									142,
									53,
									104,
									252,
									138,
									191,
									205,
									75,
									249,
									224,
									7,
									81,
									135,
									101,
									247,
									44
								],
								keyMac: [
									45,
									143,
									177,
									210,
									255,
									52,
									172,
									133,
									209,
									124,
									190,
									254,
									191,
									71,
									1,
									207
								],
								ti: [
									22,
									219,
									175,
									100
								],
								readCounter: 0,
								writeCounter: 0,
								writeCounterServer: 1,
								readCounterServer: 1,
								isEV0: true
							}
						},
						ACL: {
							writeApdu: [
								161,
								7,
								0,
								57,
								120,
								168,
								172,
								203,
								178,
								46,
								15,
								202,
								186,
								104,
								180,
								30,
								18,
								118,
								114,
								138,
								134,
								6,
								189,
								171,
								61,
								16,
								234
							],
							responseApdus: [
								{
									requestApdu: "a107003978a8accbb22e0fcaba68b41e1276728a8606bdab3d10ea",
									responseApdu: "90d7458509e3d828bc",
									isValid: true
								},
								{
									requestApdu: "a10240fb1b57c7f835ce6734725da08153cc51cef0780f9de2a5b2",
									responseApdu: "903f696061d3dc44fc",
									isValid: true
								},
								{
									requestApdu: "a1034033a163d34529dbedc2ad7cc9498b2fc5e62cc6fbf0fa6dd5",
									responseApdu: "90aaa52b8cdafd9f09",
									isValid: true
								}
							]
						},
						KEYA: {
							writeApdu: [
								161,
								2,
								64,
								251,
								27,
								87,
								199,
								248,
								53,
								206,
								103,
								52,
								114,
								93,
								160,
								129,
								83,
								204,
								81,
								206,
								240,
								120,
								15,
								157,
								226,
								165,
								178
							],
							key: "615a3f21a49801e46c5e8326b35a0bff",
							responseApdus: [
								{
									requestApdu: "a107003978a8accbb22e0fcaba68b41e1276728a8606bdab3d10ea",
									responseApdu: "90d7458509e3d828bc",
									isValid: true
								},
								{
									requestApdu: "a10240fb1b57c7f835ce6734725da08153cc51cef0780f9de2a5b2",
									responseApdu: "903f696061d3dc44fc",
									isValid: true
								},
								{
									requestApdu: "a1034033a163d34529dbedc2ad7cc9498b2fc5e62cc6fbf0fa6dd5",
									responseApdu: "90aaa52b8cdafd9f09",
									isValid: true
								}
							]
						},
						KEYB: {
							writeApdu: [
								161,
								3,
								64,
								51,
								161,
								99,
								211,
								69,
								41,
								219,
								237,
								194,
								173,
								124,
								201,
								73,
								139,
								47,
								197,
								230,
								44,
								198,
								251,
								240,
								250,
								109,
								213
							],
							key: "e1331fb5d7f7a8e3ab9da3d3d18011bf",
							responseApdus: [
								{
									requestApdu: "a107003978a8accbb22e0fcaba68b41e1276728a8606bdab3d10ea",
									responseApdu: "90d7458509e3d828bc",
									isValid: true
								},
								{
									requestApdu: "a10240fb1b57c7f835ce6734725da08153cc51cef0780f9de2a5b2",
									responseApdu: "903f696061d3dc44fc",
									isValid: true
								},
								{
									requestApdu: "a1034033a163d34529dbedc2ad7cc9498b2fc5e62cc6fbf0fa6dd5",
									responseApdu: "90aaa52b8cdafd9f09",
									isValid: true
								}
							]
						}
					},
					{
						sector: 2,
						state: "WRITE_VERIFIED",
						acl: {
							block: 11,
							ACL: "00000000000F7F0788FF000000000000",
							KEYA: "DEBITO",
							KEYB: "CREDITO"
						},
						auth: {
							authPhaseIApdu: [
								112,
								5,
								64,
								0
							],
							firstAuthPhase1: [
								50,
								4,
								80,
								198,
								19,
								215,
								183,
								75,
								194,
								152,
								188,
								43,
								151,
								32,
								208,
								29
							],
							authPhaseIIApdu: [
								114,
								146,
								175,
								33,
								64,
								187,
								115,
								132,
								236,
								42,
								5,
								88,
								36,
								195,
								234,
								211,
								18,
								194,
								174,
								46,
								84,
								197,
								48,
								56,
								190,
								45,
								195,
								211,
								147,
								227,
								122,
								225,
								6
							],
							firstAuthPhase2: [
								38,
								206,
								32,
								83,
								80,
								31,
								121,
								183,
								241,
								109,
								60,
								23,
								74,
								70,
								77,
								66,
								118,
								99,
								253,
								201,
								224,
								65,
								205,
								189,
								202,
								113,
								119,
								233,
								187,
								124,
								117,
								138
							],
							ParametersFromFirstAuth: {
								keyEnc: [
									217,
									230,
									129,
									180,
									40,
									158,
									169,
									27,
									183,
									230,
									184,
									221,
									145,
									208,
									53,
									22
								],
								keyMac: [
									252,
									134,
									64,
									167,
									66,
									28,
									196,
									97,
									115,
									123,
									36,
									150,
									139,
									46,
									249,
									140
								],
								ti: [
									35,
									1,
									106,
									210
								],
								readCounter: 0,
								writeCounter: 0,
								writeCounterServer: 1,
								readCounterServer: 1,
								isEV0: true
							}
						},
						ACL: {
							writeApdu: [
								161,
								11,
								0,
								16,
								36,
								62,
								205,
								95,
								62,
								1,
								55,
								156,
								114,
								86,
								207,
								150,
								20,
								76,
								164,
								219,
								255,
								63,
								149,
								205,
								154,
								115,
								91
							],
							responseApdus: [
								{
									requestApdu: "a10b0010243ecd5f3e01379c7256cf96144ca4dbff3f95cd9a735b",
									responseApdu: "90404a4595ca1dfb00",
									isValid: true
								},
								{
									requestApdu: "a1044059118f615b698fc1805e82ae582827601ce0042d97fde9af",
									responseApdu: "90cdb812607d251edb",
									isValid: true
								},
								{
									requestApdu: "a10540fc1d22c335c14c63e3408c10126436c82a3f14de73944cbd",
									responseApdu: "90ab9a013ef5872883",
									isValid: true
								}
							]
						},
						KEYA: {
							writeApdu: [
								161,
								4,
								64,
								89,
								17,
								143,
								97,
								91,
								105,
								143,
								193,
								128,
								94,
								130,
								174,
								88,
								40,
								39,
								96,
								28,
								224,
								4,
								45,
								151,
								253,
								233,
								175
							],
							key: "615a3f21a49801e46c5e8326b35a0bff",
							responseApdus: [
								{
									requestApdu: "a10b0010243ecd5f3e01379c7256cf96144ca4dbff3f95cd9a735b",
									responseApdu: "90404a4595ca1dfb00",
									isValid: true
								},
								{
									requestApdu: "a1044059118f615b698fc1805e82ae582827601ce0042d97fde9af",
									responseApdu: "90cdb812607d251edb",
									isValid: true
								},
								{
									requestApdu: "a10540fc1d22c335c14c63e3408c10126436c82a3f14de73944cbd",
									responseApdu: "90ab9a013ef5872883",
									isValid: true
								}
							]
						},
						KEYB: {
							writeApdu: [
								161,
								5,
								64,
								252,
								29,
								34,
								195,
								53,
								193,
								76,
								99,
								227,
								64,
								140,
								16,
								18,
								100,
								54,
								200,
								42,
								63,
								20,
								222,
								115,
								148,
								76,
								189
							],
							key: "e1331fb5d7f7a8e3ab9da3d3d18011bf",
							responseApdus: [
								{
									requestApdu: "a10b0010243ecd5f3e01379c7256cf96144ca4dbff3f95cd9a735b",
									responseApdu: "90404a4595ca1dfb00",
									isValid: true
								},
								{
									requestApdu: "a1044059118f615b698fc1805e82ae582827601ce0042d97fde9af",
									responseApdu: "90cdb812607d251edb",
									isValid: true
								},
								{
									requestApdu: "a10540fc1d22c335c14c63e3408c10126436c82a3f14de73944cbd",
									responseApdu: "90ab9a013ef5872883",
									isValid: true
								}
							]
						}
					},
					{
						sector: 3,
						state: "WRITE_VERIFIED",
						acl: {
							block: 15,
							ACL: "00000000000F7F0788FF000000000000",
							KEYA: "DEBITO",
							KEYB: "CREDITO"
						},
						auth: {
							authPhaseIApdu: [
								112,
								7,
								64,
								0
							],
							firstAuthPhase1: [
								15,
								15,
								105,
								76,
								101,
								124,
								166,
								238,
								116,
								217,
								23,
								38,
								218,
								151,
								232,
								49
							],
							authPhaseIIApdu: [
								114,
								216,
								216,
								129,
								191,
								132,
								163,
								191,
								179,
								109,
								164,
								246,
								77,
								154,
								3,
								70,
								147,
								128,
								122,
								123,
								207,
								169,
								57,
								112,
								54,
								70,
								252,
								191,
								195,
								13,
								214,
								38,
								14
							],
							firstAuthPhase2: [
								159,
								117,
								221,
								239,
								51,
								113,
								101,
								97,
								248,
								97,
								23,
								183,
								139,
								23,
								144,
								84,
								30,
								82,
								40,
								168,
								94,
								215,
								36,
								27,
								119,
								170,
								40,
								78,
								48,
								107,
								85,
								70
							],
							ParametersFromFirstAuth: {
								keyEnc: [
									102,
									221,
									106,
									67,
									99,
									192,
									102,
									95,
									119,
									63,
									227,
									196,
									190,
									179,
									205,
									151
								],
								keyMac: [
									189,
									183,
									37,
									11,
									109,
									55,
									219,
									38,
									156,
									41,
									236,
									55,
									154,
									6,
									80,
									144
								],
								ti: [
									74,
									203,
									90,
									50
								],
								readCounter: 0,
								writeCounter: 0,
								writeCounterServer: 1,
								readCounterServer: 1,
								isEV0: true
							}
						},
						ACL: {
							writeApdu: [
								161,
								15,
								0,
								63,
								186,
								233,
								94,
								36,
								131,
								70,
								77,
								157,
								226,
								31,
								141,
								2,
								197,
								255,
								224,
								12,
								137,
								14,
								81,
								254,
								112,
								33,
								62
							],
							responseApdus: [
								{
									requestApdu: "a10f003fbae95e2483464d9de21f8d02c5ffe00c890e51fe70213e",
									responseApdu: "907ed60d7af73193ae",
									isValid: true
								},
								{
									requestApdu: "a10640af4afe650a464b99165d29f9291b40270c89f341060461a7",
									responseApdu: "90adafb62f7c42730a",
									isValid: true
								},
								{
									requestApdu: "a1074026708ebd49c7c576756c2f2fa1d8ce10c88b1c90621c5173",
									responseApdu: "90d17466699aef96f2",
									isValid: true
								}
							]
						},
						KEYA: {
							writeApdu: [
								161,
								6,
								64,
								175,
								74,
								254,
								101,
								10,
								70,
								75,
								153,
								22,
								93,
								41,
								249,
								41,
								27,
								64,
								39,
								12,
								137,
								243,
								65,
								6,
								4,
								97,
								167
							],
							key: "615a3f21a49801e46c5e8326b35a0bff",
							responseApdus: [
								{
									requestApdu: "a10f003fbae95e2483464d9de21f8d02c5ffe00c890e51fe70213e",
									responseApdu: "907ed60d7af73193ae",
									isValid: true
								},
								{
									requestApdu: "a10640af4afe650a464b99165d29f9291b40270c89f341060461a7",
									responseApdu: "90adafb62f7c42730a",
									isValid: true
								},
								{
									requestApdu: "a1074026708ebd49c7c576756c2f2fa1d8ce10c88b1c90621c5173",
									responseApdu: "90d17466699aef96f2",
									isValid: true
								}
							]
						},
						KEYB: {
							writeApdu: [
								161,
								7,
								64,
								38,
								112,
								142,
								189,
								73,
								199,
								197,
								118,
								117,
								108,
								47,
								47,
								161,
								216,
								206,
								16,
								200,
								139,
								28,
								144,
								98,
								28,
								81,
								115
							],
							key: "e1331fb5d7f7a8e3ab9da3d3d18011bf",
							responseApdus: [
								{
									requestApdu: "a10f003fbae95e2483464d9de21f8d02c5ffe00c890e51fe70213e",
									responseApdu: "907ed60d7af73193ae",
									isValid: true
								},
								{
									requestApdu: "a10640af4afe650a464b99165d29f9291b40270c89f341060461a7",
									responseApdu: "90adafb62f7c42730a",
									isValid: true
								},
								{
									requestApdu: "a1074026708ebd49c7c576756c2f2fa1d8ce10c88b1c90621c5173",
									responseApdu: "90d17466699aef96f2",
									isValid: true
								}
							]
						}
					},
					{
						sector: 4,
						state: "WRITE_VERIFIED",
						acl: {
							block: 19,
							ACL: "00000000000F7F0788FF000000000000",
							KEYA: "DEBITO",
							KEYB: "CREDITO"
						},
						auth: {
							authPhaseIApdu: [
								112,
								9,
								64,
								0
							],
							firstAuthPhase1: [
								146,
								51,
								172,
								48,
								121,
								217,
								24,
								88,
								190,
								111,
								203,
								93,
								162,
								7,
								0,
								138
							],
							authPhaseIIApdu: [
								114,
								170,
								69,
								170,
								32,
								111,
								33,
								243,
								39,
								235,
								136,
								241,
								148,
								237,
								29,
								162,
								234,
								54,
								56,
								236,
								138,
								164,
								58,
								19,
								53,
								185,
								66,
								53,
								84,
								44,
								120,
								95,
								41
							],
							firstAuthPhase2: [
								136,
								226,
								229,
								110,
								213,
								60,
								171,
								43,
								88,
								10,
								210,
								230,
								41,
								126,
								224,
								155,
								108,
								151,
								173,
								29,
								215,
								109,
								123,
								156,
								137,
								132,
								18,
								220,
								168,
								64,
								49,
								222
							],
							ParametersFromFirstAuth: {
								keyEnc: [
									142,
									192,
									230,
									118,
									4,
									106,
									239,
									214,
									162,
									38,
									233,
									165,
									134,
									12,
									68,
									245
								],
								keyMac: [
									13,
									180,
									217,
									32,
									152,
									200,
									106,
									151,
									234,
									85,
									190,
									8,
									70,
									243,
									182,
									135
								],
								ti: [
									113,
									244,
									78,
									200
								],
								readCounter: 0,
								writeCounter: 0,
								writeCounterServer: 1,
								readCounterServer: 1,
								isEV0: true
							}
						},
						ACL: {
							writeApdu: [
								161,
								19,
								0,
								157,
								107,
								45,
								153,
								128,
								199,
								31,
								125,
								158,
								59,
								129,
								39,
								44,
								74,
								92,
								120,
								221,
								217,
								161,
								69,
								205,
								234,
								132,
								60
							],
							responseApdus: [
								{
									requestApdu: "a113009d6b2d9980c71f7d9e3b81272c4a5c78ddd9a145cdea843c",
									responseApdu: "905a78d2f992437785",
									isValid: true
								},
								{
									requestApdu: "a10840fab786bf3b0280eb0e46b07e5065fbf7ed76f8f3c434c0b4",
									responseApdu: "903fef1757cc213a12",
									isValid: true
								},
								{
									requestApdu: "a109401faf0c049cdf1047d294ae7a62193ee097f071eaedab32b4",
									responseApdu: "90d37cb0a0c8406a71",
									isValid: true
								}
							]
						},
						KEYA: {
							writeApdu: [
								161,
								8,
								64,
								250,
								183,
								134,
								191,
								59,
								2,
								128,
								235,
								14,
								70,
								176,
								126,
								80,
								101,
								251,
								247,
								237,
								118,
								248,
								243,
								196,
								52,
								192,
								180
							],
							key: "615a3f21a49801e46c5e8326b35a0bff",
							responseApdus: [
								{
									requestApdu: "a113009d6b2d9980c71f7d9e3b81272c4a5c78ddd9a145cdea843c",
									responseApdu: "905a78d2f992437785",
									isValid: true
								},
								{
									requestApdu: "a10840fab786bf3b0280eb0e46b07e5065fbf7ed76f8f3c434c0b4",
									responseApdu: "903fef1757cc213a12",
									isValid: true
								},
								{
									requestApdu: "a109401faf0c049cdf1047d294ae7a62193ee097f071eaedab32b4",
									responseApdu: "90d37cb0a0c8406a71",
									isValid: true
								}
							]
						},
						KEYB: {
							writeApdu: [
								161,
								9,
								64,
								31,
								175,
								12,
								4,
								156,
								223,
								16,
								71,
								210,
								148,
								174,
								122,
								98,
								25,
								62,
								224,
								151,
								240,
								113,
								234,
								237,
								171,
								50,
								180
							],
							key: "e1331fb5d7f7a8e3ab9da3d3d18011bf",
							responseApdus: [
								{
									requestApdu: "a113009d6b2d9980c71f7d9e3b81272c4a5c78ddd9a145cdea843c",
									responseApdu: "905a78d2f992437785",
									isValid: true
								},
								{
									requestApdu: "a10840fab786bf3b0280eb0e46b07e5065fbf7ed76f8f3c434c0b4",
									responseApdu: "903fef1757cc213a12",
									isValid: true
								},
								{
									requestApdu: "a109401faf0c049cdf1047d294ae7a62193ee097f071eaedab32b4",
									responseApdu: "90d37cb0a0c8406a71",
									isValid: true
								}
							]
						}
					},
					{
						sector: 5,
						state: "WRITE_VERIFIED",
						acl: {
							block: 23,
							ACL: "00000000000F7F0788FF000000000000",
							KEYA: "DEBITO",
							KEYB: "CREDITO"
						},
						auth: {
							authPhaseIApdu: [
								112,
								11,
								64,
								0
							],
							firstAuthPhase1: [
								83,
								92,
								161,
								93,
								232,
								12,
								140,
								156,
								19,
								221,
								91,
								116,
								73,
								123,
								232,
								175
							],
							authPhaseIIApdu: [
								114,
								215,
								152,
								82,
								52,
								102,
								11,
								106,
								15,
								198,
								31,
								186,
								25,
								130,
								241,
								220,
								25,
								98,
								169,
								197,
								175,
								3,
								62,
								188,
								232,
								137,
								41,
								211,
								36,
								237,
								117,
								103,
								148
							],
							firstAuthPhase2: [
								19,
								11,
								205,
								244,
								1,
								162,
								191,
								173,
								46,
								114,
								158,
								59,
								113,
								114,
								15,
								36,
								222,
								36,
								4,
								234,
								144,
								60,
								100,
								105,
								93,
								91,
								15,
								10,
								134,
								44,
								118,
								64
							],
							ParametersFromFirstAuth: {
								keyEnc: [
									129,
									4,
									50,
									40,
									183,
									246,
									179,
									240,
									149,
									242,
									50,
									190,
									253,
									75,
									63,
									144
								],
								keyMac: [
									213,
									43,
									120,
									224,
									246,
									44,
									228,
									248,
									220,
									179,
									250,
									228,
									17,
									26,
									252,
									212
								],
								ti: [
									64,
									232,
									236,
									103
								],
								readCounter: 0,
								writeCounter: 0,
								writeCounterServer: 1,
								readCounterServer: 1,
								isEV0: true
							}
						},
						ACL: {
							writeApdu: [
								161,
								23,
								0,
								53,
								36,
								253,
								134,
								152,
								62,
								86,
								208,
								28,
								215,
								57,
								46,
								218,
								234,
								184,
								153,
								102,
								17,
								3,
								172,
								131,
								235,
								55,
								239
							],
							responseApdus: [
								{
									requestApdu: "a117003524fd86983e56d01cd7392edaeab899661103ac83eb37ef",
									responseApdu: "904f1094e8041d9983",
									isValid: true
								},
								{
									requestApdu: "a10a409a00c471d96fb096a829c142d3dfd842b4227c7616284492",
									responseApdu: "90736b7f039e7cb3b3",
									isValid: true
								},
								{
									requestApdu: "a10b403e4fbdcb6ff0f532ad117c46f975b5e0dd4c7784001bf651",
									responseApdu: "90238e74067656405c",
									isValid: true
								}
							]
						},
						KEYA: {
							writeApdu: [
								161,
								10,
								64,
								154,
								0,
								196,
								113,
								217,
								111,
								176,
								150,
								168,
								41,
								193,
								66,
								211,
								223,
								216,
								66,
								180,
								34,
								124,
								118,
								22,
								40,
								68,
								146
							],
							key: "615a3f21a49801e46c5e8326b35a0bff",
							responseApdus: [
								{
									requestApdu: "a117003524fd86983e56d01cd7392edaeab899661103ac83eb37ef",
									responseApdu: "904f1094e8041d9983",
									isValid: true
								},
								{
									requestApdu: "a10a409a00c471d96fb096a829c142d3dfd842b4227c7616284492",
									responseApdu: "90736b7f039e7cb3b3",
									isValid: true
								},
								{
									requestApdu: "a10b403e4fbdcb6ff0f532ad117c46f975b5e0dd4c7784001bf651",
									responseApdu: "90238e74067656405c",
									isValid: true
								}
							]
						},
						KEYB: {
							writeApdu: [
								161,
								11,
								64,
								62,
								79,
								189,
								203,
								111,
								240,
								245,
								50,
								173,
								17,
								124,
								70,
								249,
								117,
								181,
								224,
								221,
								76,
								119,
								132,
								0,
								27,
								246,
								81
							],
							key: "e1331fb5d7f7a8e3ab9da3d3d18011bf",
							responseApdus: [
								{
									requestApdu: "a117003524fd86983e56d01cd7392edaeab899661103ac83eb37ef",
									responseApdu: "904f1094e8041d9983",
									isValid: true
								},
								{
									requestApdu: "a10a409a00c471d96fb096a829c142d3dfd842b4227c7616284492",
									responseApdu: "90736b7f039e7cb3b3",
									isValid: true
								},
								{
									requestApdu: "a10b403e4fbdcb6ff0f532ad117c46f975b5e0dd4c7784001bf651",
									responseApdu: "90238e74067656405c",
									isValid: true
								}
							]
						}
					},
					{
						sector: 6,
						state: "WRITE_VERIFIED",
						acl: {
							block: 27,
							ACL: "00000000000F7F0788FF000000000000",
							KEYA: "DEBITO",
							KEYB: "CREDITO"
						},
						auth: {
							authPhaseIApdu: [
								112,
								13,
								64,
								0
							],
							firstAuthPhase1: [
								202,
								201,
								233,
								188,
								19,
								120,
								93,
								69,
								184,
								182,
								157,
								186,
								216,
								58,
								81,
								40
							],
							authPhaseIIApdu: [
								114,
								217,
								147,
								76,
								199,
								19,
								78,
								157,
								17,
								148,
								252,
								80,
								153,
								232,
								25,
								217,
								141,
								155,
								190,
								154,
								93,
								86,
								144,
								60,
								80,
								17,
								18,
								70,
								160,
								203,
								155,
								71,
								244
							],
							firstAuthPhase2: [
								34,
								224,
								108,
								82,
								117,
								206,
								203,
								119,
								215,
								54,
								97,
								237,
								152,
								89,
								103,
								108,
								29,
								107,
								217,
								15,
								63,
								218,
								151,
								85,
								232,
								90,
								99,
								67,
								21,
								22,
								58,
								94
							],
							ParametersFromFirstAuth: {
								keyEnc: [
									49,
									177,
									251,
									121,
									15,
									162,
									74,
									53,
									43,
									6,
									222,
									195,
									50,
									43,
									88,
									99
								],
								keyMac: [
									175,
									129,
									195,
									76,
									111,
									156,
									116,
									215,
									143,
									50,
									41,
									241,
									233,
									185,
									2,
									115
								],
								ti: [
									246,
									119,
									221,
									179
								],
								readCounter: 0,
								writeCounter: 0,
								writeCounterServer: 1,
								readCounterServer: 1,
								isEV0: true
							}
						},
						ACL: {
							writeApdu: [
								161,
								27,
								0,
								27,
								219,
								230,
								40,
								225,
								58,
								12,
								69,
								178,
								105,
								144,
								28,
								194,
								252,
								238,
								39,
								63,
								237,
								106,
								0,
								66,
								58,
								136,
								181
							],
							responseApdus: [
								{
									requestApdu: "a11b001bdbe628e13a0c45b269901cc2fcee273fed6a00423a88b5",
									responseApdu: "905ef10fee57c5c6e6",
									isValid: true
								},
								{
									requestApdu: "a10c406d777cc9cc5df3cea16ae8cfdb9f622f759343944d6421a3",
									responseApdu: "90d426480c2e5ac974",
									isValid: true
								},
								{
									requestApdu: "a10d4085cb702c28e06e23d3b14c7ad478c5c90c096ff7f68f5a7d",
									responseApdu: "9063c7f55df4c9c106",
									isValid: true
								}
							]
						},
						KEYA: {
							writeApdu: [
								161,
								12,
								64,
								109,
								119,
								124,
								201,
								204,
								93,
								243,
								206,
								161,
								106,
								232,
								207,
								219,
								159,
								98,
								47,
								117,
								147,
								67,
								148,
								77,
								100,
								33,
								163
							],
							key: "615a3f21a49801e46c5e8326b35a0bff",
							responseApdus: [
								{
									requestApdu: "a11b001bdbe628e13a0c45b269901cc2fcee273fed6a00423a88b5",
									responseApdu: "905ef10fee57c5c6e6",
									isValid: true
								},
								{
									requestApdu: "a10c406d777cc9cc5df3cea16ae8cfdb9f622f759343944d6421a3",
									responseApdu: "90d426480c2e5ac974",
									isValid: true
								},
								{
									requestApdu: "a10d4085cb702c28e06e23d3b14c7ad478c5c90c096ff7f68f5a7d",
									responseApdu: "9063c7f55df4c9c106",
									isValid: true
								}
							]
						},
						KEYB: {
							writeApdu: [
								161,
								13,
								64,
								133,
								203,
								112,
								44,
								40,
								224,
								110,
								35,
								211,
								177,
								76,
								122,
								212,
								120,
								197,
								201,
								12,
								9,
								111,
								247,
								246,
								143,
								90,
								125
							],
							key: "e1331fb5d7f7a8e3ab9da3d3d18011bf",
							responseApdus: [
								{
									requestApdu: "a11b001bdbe628e13a0c45b269901cc2fcee273fed6a00423a88b5",
									responseApdu: "905ef10fee57c5c6e6",
									isValid: true
								},
								{
									requestApdu: "a10c406d777cc9cc5df3cea16ae8cfdb9f622f759343944d6421a3",
									responseApdu: "90d426480c2e5ac974",
									isValid: true
								},
								{
									requestApdu: "a10d4085cb702c28e06e23d3b14c7ad478c5c90c096ff7f68f5a7d",
									responseApdu: "9063c7f55df4c9c106",
									isValid: true
								}
							]
						}
					},
					{
						sector: 7,
						state: "WRITE_VERIFIED",
						acl: {
							block: 31,
							ACL: "00000000000F7F0788FF000000000000",
							KEYA: "DEBITO",
							KEYB: "CREDITO"
						},
						auth: {
							authPhaseIApdu: [
								112,
								15,
								64,
								0
							],
							firstAuthPhase1: [
								1,
								20,
								181,
								54,
								45,
								51,
								154,
								176,
								106,
								198,
								222,
								212,
								238,
								206,
								49,
								28
							],
							authPhaseIIApdu: [
								114,
								212,
								205,
								41,
								15,
								77,
								34,
								138,
								117,
								189,
								100,
								56,
								36,
								46,
								113,
								206,
								119,
								102,
								90,
								70,
								172,
								110,
								164,
								70,
								168,
								142,
								243,
								204,
								102,
								177,
								252,
								55,
								50
							],
							firstAuthPhase2: [
								140,
								181,
								66,
								150,
								127,
								209,
								157,
								70,
								231,
								46,
								115,
								102,
								126,
								10,
								216,
								38,
								108,
								246,
								37,
								53,
								224,
								1,
								80,
								227,
								122,
								68,
								42,
								228,
								29,
								116,
								148,
								51
							],
							ParametersFromFirstAuth: {
								keyEnc: [
									141,
									111,
									35,
									19,
									130,
									151,
									56,
									249,
									99,
									162,
									78,
									117,
									137,
									144,
									22,
									46
								],
								keyMac: [
									154,
									167,
									15,
									200,
									247,
									134,
									1,
									9,
									77,
									30,
									101,
									153,
									49,
									74,
									6,
									220
								],
								ti: [
									30,
									218,
									212,
									49
								],
								readCounter: 0,
								writeCounter: 0,
								writeCounterServer: 1,
								readCounterServer: 1,
								isEV0: true
							}
						},
						ACL: {
							writeApdu: [
								161,
								31,
								0,
								73,
								101,
								159,
								148,
								207,
								214,
								170,
								5,
								37,
								87,
								240,
								19,
								11,
								97,
								50,
								88,
								27,
								48,
								126,
								196,
								156,
								144,
								162,
								103
							],
							responseApdus: [
								{
									requestApdu: "a11f0049659f94cfd6aa052557f0130b6132581b307ec49c90a267",
									responseApdu: "90e9b6fdbd675f9b22",
									isValid: true
								},
								{
									requestApdu: "a10e409ac05ef646bc8fa67a40ad6dbc8f182b6d443e20732d4bd2",
									responseApdu: "908c1343fb14af83ee",
									isValid: true
								},
								{
									requestApdu: "a10f40b10040a545f347cb298809b2e086cbd39a50e2b584b5e08b",
									responseApdu: "9038991837b0c9640d",
									isValid: true
								}
							]
						},
						KEYA: {
							writeApdu: [
								161,
								14,
								64,
								154,
								192,
								94,
								246,
								70,
								188,
								143,
								166,
								122,
								64,
								173,
								109,
								188,
								143,
								24,
								43,
								109,
								68,
								62,
								32,
								115,
								45,
								75,
								210
							],
							key: "615a3f21a49801e46c5e8326b35a0bff",
							responseApdus: [
								{
									requestApdu: "a11f0049659f94cfd6aa052557f0130b6132581b307ec49c90a267",
									responseApdu: "90e9b6fdbd675f9b22",
									isValid: true
								},
								{
									requestApdu: "a10e409ac05ef646bc8fa67a40ad6dbc8f182b6d443e20732d4bd2",
									responseApdu: "908c1343fb14af83ee",
									isValid: true
								},
								{
									requestApdu: "a10f40b10040a545f347cb298809b2e086cbd39a50e2b584b5e08b",
									responseApdu: "9038991837b0c9640d",
									isValid: true
								}
							]
						},
						KEYB: {
							writeApdu: [
								161,
								15,
								64,
								177,
								0,
								64,
								165,
								69,
								243,
								71,
								203,
								41,
								136,
								9,
								178,
								224,
								134,
								203,
								211,
								154,
								80,
								226,
								181,
								132,
								181,
								224,
								139
							],
							key: "e1331fb5d7f7a8e3ab9da3d3d18011bf",
							responseApdus: [
								{
									requestApdu: "a11f0049659f94cfd6aa052557f0130b6132581b307ec49c90a267",
									responseApdu: "90e9b6fdbd675f9b22",
									isValid: true
								},
								{
									requestApdu: "a10e409ac05ef646bc8fa67a40ad6dbc8f182b6d443e20732d4bd2",
									responseApdu: "908c1343fb14af83ee",
									isValid: true
								},
								{
									requestApdu: "a10f40b10040a545f347cb298809b2e086cbd39a50e2b584b5e08b",
									responseApdu: "9038991837b0c9640d",
									isValid: true
								}
							]
						}
					}
				],
				responseApdus: {
					logType: "responseApdus",
					data: [
						{
							requestApdu: "a11f0049659f94cfd6aa052557f0130b6132581b307ec49c90a267",
							responseApdu: "90e9b6fdbd675f9b22",
							isValid: true
						},
						{
							requestApdu: "a10e409ac05ef646bc8fa67a40ad6dbc8f182b6d443e20732d4bd2",
							responseApdu: "908c1343fb14af83ee",
							isValid: true
						},
						{
							requestApdu: "a10f40b10040a545f347cb298809b2e086cbd39a50e2b584b5e08b",
							responseApdu: "9038991837b0c9640d",
							isValid: true
						}
					],
					timestamp: 1632340449142,
					error: null
				}
			},
			null: {
				stepName: "Escribir bits de acceso y llaves",
				createTimestamp: 1632340449143,
				requestApdus: {
					logType: "requestApdus",
					data: [
						"FFCA000000"
					],
					timestamp: 1632340449143,
					error: null
				}
			}
		},
		prevProcesses: [
		],
		processVars: {
			step: 7,
			block: 28,
			ext: 1,
			bNr: 28,
			rndBc: [
				1,
				20,
				181,
				54,
				45,
				51,
				154,
				176,
				106,
				198,
				222,
				212,
				238,
				206,
				49,
				28
			],
			key: [
				255,
				255,
				255,
				255,
				255,
				255,
				255,
				255,
				255,
				255,
				255,
				255,
				255,
				255,
				255,
				255
			],
			iv: [
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			],
			rndB: [
				191,
				101,
				166,
				226,
				52,
				49,
				14,
				115,
				122,
				229,
				244,
				99,
				137,
				175,
				67,
				65
			],
			rndBr: [
				101,
				166,
				226,
				52,
				49,
				14,
				115,
				122,
				229,
				244,
				99,
				137,
				175,
				67,
				65,
				191
			],
			rndA: [
				17,
				25,
				173,
				150,
				194,
				69,
				203,
				223,
				126,
				202,
				240,
				23,
				183,
				172,
				77,
				14
			],
			rndD: [
				17,
				25,
				173,
				150,
				194,
				69,
				203,
				223,
				126,
				202,
				240,
				23,
				183,
				172,
				77,
				14,
				101,
				166,
				226,
				52,
				49,
				14,
				115,
				122,
				229,
				244,
				99,
				137,
				175,
				67,
				65,
				191
			],
			rndDc: [
				212,
				205,
				41,
				15,
				77,
				34,
				138,
				117,
				189,
				100,
				56,
				36,
				46,
				113,
				206,
				119,
				102,
				90,
				70,
				172,
				110,
				164,
				70,
				168,
				142,
				243,
				204,
				102,
				177,
				252,
				55,
				50
			],
			keyEnc: [
				141,
				111,
				35,
				19,
				130,
				151,
				56,
				249,
				99,
				162,
				78,
				117,
				137,
				144,
				22,
				46
			],
			keyMac: [
				154,
				167,
				15,
				200,
				247,
				134,
				1,
				9,
				77,
				30,
				101,
				153,
				49,
				74,
				6,
				220
			],
			ti: [
				30,
				218,
				212,
				49
			],
			readCounter: 0,
			writeCounter: 3,
			writeCounterServer: 4,
			readCounterServer: 1,
			isEV0: true,
			data: [
				225,
				51,
				31,
				181,
				215,
				247,
				168,
				227,
				171,
				157,
				163,
				211,
				209,
				128,
				17,
				191
			]
		}
	}
};