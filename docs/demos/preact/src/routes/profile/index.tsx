import { Component, h } from "preact";
import * as style from "./style.css";

interface Props {
    user: string;
}

interface State {
    time: number;
    count: number;
}
export default class Profile extends Component<Props, State> {
    public state = {
        time: Date.now(),
        count: 10
    };

    public timer?: number;

    // gets called when this route is navigated to
    public componentDidMount() {
        // start a timer for the clock:
        this.timer = window.setInterval(this.updateTime, 1000);
    }

    // gets called just before navigating away from the route
    public componentWillUnmount() {
        clearInterval(this.timer);
    }

    // update the current time
    public updateTime = () => {
        this.setState({ time: Date.now() });
    };

    public increment = () => {
        this.setState({ count: this.state.count + 1 });
    };
    public render({ user }: Props, { time, count }: State) {
        return (
            <div class={style.profile}>
                <h1>Profile: {user}</h1>
                <p>This is the user profile for a user named {user}.</p>

                <div>Current time: {new Date(time).toLocaleString()}</div>

                <p>
                    <button onClick={this.increment}>Click Me</button> Clicked{" "}
                    {count} times.
                </p>
            </div>
        );
    }
}
