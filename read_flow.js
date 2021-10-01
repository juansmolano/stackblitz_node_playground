const paymentMediumType = require('./entities/PaymentMediumType');

const specsVersion = paymentMediumType.mappings.filter(m => m.active).sort((m1, m2) => m1.version - m2.version).pop();
const specs = specsVersion.mapping;
if (!specs) return buildErrorResponse(paymentMedium, `Mapping activo no encontrado en el tipo de medio de pago ${paymentMediumType.code}`);


const blocksToRead = specs.EMISSION_VARS.APPS
    .map(app => specs[app])
    .reduce((acc, val, index, array) => {
        const { access, data: fields } = val;
        acc.access = { ...acc.access, ...access };
        for (const fieldName in fields) {
            const field = fields[fieldName];
            const len = parseInt(field.start) + (
                field.type.startsWith('STRING')
                    ? parseInt(field.type.replace('STRING', ''))
                    : field.type.startsWith('UINT') || field.type.startsWith('INT')
                        ? parseInt(field.type.replace('UINT', '').replace('INT', '')) / 8
                        : 16
            );
            const blocks = new Array(Math.ceil(len / 16)).fill(parseInt(field.block)).map((bl, i) => bl + i);
            acc.blocksToRead = acc.blocksToRead.concat(blocks);
        }
        const isLastElement = index === array.length - 1;
        if (isLastElement) {
            acc.blocksToRead.sort((a, b) => a - b);
            return [...new Set(acc.blocksToRead)]
                .map(bl => {
                    return {
                        block: bl,
                        keys: {
                            read: Object.entries(acc.access[bl].readKeys).map(([key, val]) => ({ productionKeyName: key, type: val })),
                            write: Object.entries(acc.access[bl].writeKeys).map(([key, val]) => ({ productionKeyName: key, type: val })),
                        }
                    };
                });
        } else {
            return acc;
        }
    }, { access: {}, blocksToRead: [] });
console.log('>>>>>>>> blocksToRead', JSON.stringify(blocksToRead, null, 2));
const { steps } = blocksToRead.reduce((acc, val, index, array) => {
    const buildReadStep = () => ({
        type: 'READ',
        state: 'PENDING',
        block: val.block,
        numberOfBlocksToRead: 1,
        key: val.keys.read[0],
    });
    const buildAuthStep = () => ({
        type: 'AUTH',
        state: 'PENDING',
        block: val.block,
        key: val.keys.read[0],
    });
    const areBlocksConesecutive = ({ block: prevBlock }, { block: nextBlock }) => {
        const consecutive =
            (prevBlock + 1 === nextBlock)
            || ((prevBlock + 2) % 4 === 0) && (prevBlock + 2 === nextBlock);
        return consecutive;
    };
    const canReadWithCurrentKey = (currentKey, nextBlockKeys) => {
        return nextBlockKeys.find(({ productionKeyName, type }) => currentKey.type === type && currentKey.productionKeyName === productionKeyName);
    };

    if (!acc.stepUnderConstruction) {
        acc.steps.push(buildAuthStep());
        acc.stepUnderConstruction = buildReadStep();
    } else if (acc.prevData.block !== val.block) {
        if (areBlocksConesecutive(acc.prevData, val) && canReadWithCurrentKey(acc.stepUnderConstruction.key, val.keys.read)) {
            acc.stepUnderConstruction.numberOfBlocksToRead++;
        } else {
            acc.steps.push(acc.stepUnderConstruction);
            acc.steps.push(buildAuthStep());
            acc.stepUnderConstruction = buildReadStep();
        }
    }
    if (index === array.length - 1) {
        acc.steps.push(acc.stepUnderConstruction);
    }
    acc.prevData = val;
    return acc;
}, { prevData: null, stepUnderConstruction: null, steps: [] });
console.log('>>>>>>>> Steps', JSON.stringify(steps, null, 2));