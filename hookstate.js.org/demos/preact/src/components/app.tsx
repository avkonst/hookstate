import { Component, h } from "preact";

import { ExampleComponent } from "./LargeTable";

if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require("preact/debug");
}

export default class App extends Component {
    public render() {
        return (
            <div id="app">
                <ExampleComponent />
            </div>
        );
    }
}
