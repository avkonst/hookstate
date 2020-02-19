import React from 'react'

import { CssBaseline, Theme, createStyles, makeStyles, AppBar, Toolbar, Typography, Button, Box, Container, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Paper, Tabs, Tab } from '@material-ui/core';
import { navigate, useRoutes, HookRouter, A } from 'hookrouter';

// import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter/prism-light';
import SyntaxHighlighter from 'react-syntax-highlighter';

import { useAsync } from 'react-use';
import request from 'request';
import { ExamplesRepo, ExampleCodeUrl } from './examples/Index';

import ReactGA from 'react-ga';
import ExampleIds from './examples/ids';

const packageJson = require('../package.json');
const packageDependencies = packageJson.dependencies

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

const VersionInfo = () => {
    const packs = Object.keys(packageDependencies)
        .filter(i => i.startsWith('@hookstate/'));
    const labels = packs.map((p, i) => <span key={p}>
        {p}: {packageDependencies[p]} {i !== packs.length - 1 && ' | '}
    </span>)
    return <p style={{ fontSize: '0.5em' }}>Version info:<br/>{labels}</p>;
}

const ButtonAppBar = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        <A href="/" style={{ color: 'white' }}>Hookstate</A>
                    </Typography>
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={() => {
                            ReactGA.event({
                                category: 'button-click',
                                action: 'fork-me-on-github'
                            });
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

    return (
        <SyntaxHighlighter
            // TODO tsx highlighter is broken
            language="jsx" style={highlightStyle}>
            {codeString}
        </SyntaxHighlighter>
    );
};

const HomePage = (props: { example?: string }) => {
    const [tab, setTab] = React.useState(2);
    const classes = useStyles();
    const exampleId = props.example && ExamplesRepo.has(props.example)
        ? props.example : ExampleIds.GlobalPrimitive;
    const exampleMeta = ExamplesRepo.get(exampleId)!;

    function handleChange(event: React.ChangeEvent<{}>, newValue: number) {
        setTab(newValue);
    }

    return <>
        <Container maxWidth="md">
            <Box paddingTop={4}>
                <Typography variant="h4" gutterBottom={true} align="center">
                    <b>Hookstate</b>: the simple but very powerful and incredibly fast state management for React that is based on hooks.
                </Typography>
            </Box>
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
                            ReactGA.event({
                                category: 'button-click',
                                action: 'why-hookstate'
                            });
                            window.location.href = 'https://github.com/avkonst/hookstate#why-hookstate'
                        }}
                    >Why hookstate
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => {
                            ReactGA.event({
                                category: 'button-click',
                                action: 'api-documentation'
                            });
                            window.location.href = 'https://github.com/avkonst/hookstate#api-documentation'
                        }}
                    >See documentation
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => {
                            ReactGA.event({
                                category: 'button-click',
                                action: 'plugins'
                            });
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
                                onChange={(v) => {
                                    const exampleId = v.target.value as string;
                                    ReactGA.event({
                                        category: 'example-select',
                                        action: exampleId,
                                    });
                                    navigate(exampleId)
                                }}
                                input={<OutlinedInput labelWidth={140} name="example" id="example-simple" />}
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
                            <SourceCodeView url={ExampleCodeUrl(exampleId)} />
                        </Box>
                    }
                    <Box
                        paddingTop={2}
                    />
                </Paper>
            </Box>
            <VersionInfo />
        </Container>
    </>
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
