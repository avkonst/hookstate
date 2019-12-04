import { Plugin } from './Declarations'
import { DowngradedID } from './internals/SharedImpl'

// tslint:disable-next-line: function-name
export function Downgraded(): Plugin {
    return {
        id: DowngradedID,
        instanceFactory: () => ({})
    }
}
