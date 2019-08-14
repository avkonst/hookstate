import React from 'react'

import { CssBaseline, Theme, createStyles, makeStyles, AppBar, Toolbar, IconButton, Typography, Button, Box, Grid, Container, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Paper, Tabs, Tab, ButtonGroup } from '@material-ui/core';
import { navigate, useRoutes, HookRouter, A } from 'hookrouter';

// import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter/prism-light';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { useAsync } from 'react-use';
import request from 'request';
import { ExampleComponent as Example1 } from './examples/getting-started';
import { ExampleComponent as Example2 } from './examples/getting-started-local';

// import { prismStyle } from './highlightStyles';
const highlightStyle = undefined;
// declare var highlightStyle: any;
// const highlightStyle = require('react-syntax-highlighter/dist/esm/styles/prism/tomorrow').default;
// import { default as highlightStyle } from require('react-syntax-highlighter/dist/esm/styles/prism/duotone-light');

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
        button: {
            margin: theme.spacing(1),
        },
    }),
);

const ButtonAppBar = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        @hookstate
                    </Typography>
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={() => {
                            window.open('https://github.com/avkonst/hookstate', '_blank')
                        }}
                    >
                        Fork me on Github
                    </Button>
                </Toolbar>
            </AppBar>
        </div>
    );
}

const SourceCodeView = (props: { url: string }) => {
    const code = useAsync(() => new Promise<string>((resolve, reject) => {
        request.get(
            props.url,
            (err, resp, body) => err ? reject(err) : resolve(body));
        }
    ))

    let codeString = ''
    if (code.loading) {
        codeString = `Loading code sample from: ${props.url}`;
    } else if (code.error) {
        codeString = `Failure to load code sample from: ${props.url} (${code.error.toString()})`;
    } else {
        codeString = code.value ? code.value.toString() : `Failure to load code sample from: ${props.url}`;
    }

    console.log(highlightStyle);

    return (
        <SyntaxHighlighter

            language="typescript" style={highlightStyle}>
            {codeString}
        </SyntaxHighlighter>
    );
};

interface ExampleMeta {
    name: string,
    description: JSX.Element,
    code: string,
    demo: JSX.Element;
}

const ExampleIds = {
    GettingStartedGlobal: 'getting-started',
    GettingStartedLocal: 'getting-started-local'
}

const ExamplesRepo: Map<string, ExampleMeta> = new Map();
ExamplesRepo.set(ExampleIds.GettingStartedGlobal, {
    name: '1. Getting Started: Global Application State',
    description: <>Basic example shows how to create a global data store and
        access it within and outside of a React component.
        Only few lines of code: create state and use it. That is it.
        In contrast with Redux and Mobx, it is so much less boilerplate code (if any), isn't it?</>,
    code: 'https://raw.githubusercontent.com/avkonst/hookstate/master/examples/src/examples/getting-started.tsx',
    demo: <Example1 />
});
ExamplesRepo.set(ExampleIds.GettingStartedLocal, {
    name: '2. Getting Started: Local Component State, eg. Form State',
    description: <>Local component state can be managed in the same way as the global state.
        The difference with the <A href={ExampleIds.GettingStartedGlobal}>global state example</A> is
        that the state is automatically created by <code>useStateLink</code> and
        saved per component but not globaly.
        The local state is not preserved when a component is unmounted.
        It is very similar to the original <code>React.useState</code> functionaly,
        but has got more features. One of the features is the <code>nested</code> property,
        which allows to traverse the data in the consistent way and mutate nested properties easier.
        </>,
    code: 'https://raw.githubusercontent.com/avkonst/hookstate/master/examples/src/examples/getting-started-local.tsx',
    demo: <Example2 />
});

const HomePage = (props: { example?: string }) => {
    const [tab, setTab] = React.useState(2);
    const classes = useStyles();
    const exampleId = props.example && ExamplesRepo.has(props.example)
        ? props.example : ExampleIds.GettingStartedGlobal;
    const exampleMeta = ExamplesRepo.get(exampleId)!;

    function handleChange(event: React.ChangeEvent<{}>, newValue: number) {
        setTab(newValue);
    }

    return <Box padding={4}>
        <Typography variant="h2" gutterBottom={true} align="center">
            @hookstate
        </Typography>
        <Typography variant="h5" gutterBottom={true} align="center">
            Modern and high-performance state management for React done in type-safe and plugin extendable way.
        </Typography>
        <Container maxWidth="md">
            <Box
                paddingTop={2}
                display="flex"
                justifyContent="center"
            >
                    <Button
                        variant="contained"
                        color="secondary"
                        className={classes.button}
                        onClick={() => {
                            window.location.href = 'https://github.com/avkonst/hookstate#why-hookstate'
                        }}
                    >Why hookstate
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => {
                            window.location.href = 'https://github.com/avkonst/hookstate#api-documentation'
                        }}
                    >See documentation
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => {
                            window.location.href = 'https://github.com/avkonst/hookstate#plugins'
                        }}
                    >Browse plugins
                    </Button>
            </Box>
        </Container>
        <Container maxWidth="md" key={exampleId}>
            <Box paddingTop={2}>
                <Paper square>
                    <Box padding={2} paddingTop={4}>
                        <FormControl fullWidth={true} variant="outlined">
                            <InputLabel htmlFor="example-simple">Selected example:</InputLabel>
                            <Select
                                value={exampleId}
                                onChange={(v) => navigate(v.target.value as string)}
                                input={<OutlinedInput labelWidth={160} name="example" id="example-simple" />}
                                inputProps={{
                                    name: 'example',
                                    id: 'example-simple',
                                }}
                            >
                                {
                                    Array.from(ExamplesRepo.entries())
                                        .map(([k, v]) => <MenuItem key={k} value={k}>{v.name}</MenuItem>)
                                }
                            </Select>
                        </FormControl>
                    </Box>
                    <Tabs
                        centered={true}
                        value={tab}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={handleChange}
                        aria-label="disabled tabs example"
                    >
                        <Tab label="View code" />
                        <Tab label="View demo" />
                        <Tab label="View both" />
                    </Tabs>
                    {exampleMeta.description &&
                        <Box
                            margin={2}
                            padding={2}
                            style={{
                                backgroundColor: 'rgba(0, 0, 200, 0.05)',
                            }}
                        >
                            <Typography variant="body1" align="left" >
                                {exampleMeta.description}
                            </Typography>
                        </Box>
                    }
                    {(tab === 1 || tab === 2) &&
                        <Box
                            margin={2}
                            padding={2}
                            style={{
                                backgroundColor: 'rgba(0, 200, 0, 0.05)',
                            }}
                        >
                            {exampleMeta.demo}
                        </Box>
                    }
                    {(tab === 0 || tab === 2) &&
                        <Box margin={2}>
                            <SourceCodeView url={exampleMeta.code} />
                        </Box>
                    }
                    <Box
                        paddingTop={2}
                    />
                </Paper>
            </Box>
        </Container>
    </Box>
}

const routes: HookRouter.RouteObject = {
    '/:example': ({ example }: HookRouter.QueryParams) => <HomePage example={example} />,
};

export const App = () => {
    const routeResult = useRoutes(routes);

    return <>
        <CssBaseline />
        <ButtonAppBar />
        {routeResult || <HomePage />}
    </>;
}

export default App;
