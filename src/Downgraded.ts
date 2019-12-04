import { Plugin } from './Declarations'
import { DowngradedID } from './SharedImpl'

// tslint:disable-next-line: function-name
export function Downgraded(): Plugin {
    return {
        id: DowngradedID,
        instanceFactory: () => ({})
    }
}
