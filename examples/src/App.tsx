import React from 'react'

import { CssBaseline, Theme, createStyles, makeStyles, AppBar, Toolbar, IconButton, Typography, Button, Box, Grid, Container, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Paper, Tabs, Tab, ButtonGroup } from '@material-ui/core';
import { navigate, useRoutes, HookRouter } from 'hookrouter';

import SyntaxHighlighter from 'react-syntax-highlighter';

import { useAsync } from 'react-use';
import request from 'request';
import { ExampleComponent } from './examples/getting-started';

const docco = require('react-syntax-highlighter/dist/esm/styles/hljs');

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

    return (
        <SyntaxHighlighter language="typescript" customStyle={docco}>
            {codeString}
        </SyntaxHighlighter>
    );
};

interface ExampleMeta {
    name: string,
    description: string,
    code: string,
    demo: JSX.Element;
}

const examples: Map<string, ExampleMeta> = new Map();
examples.set('getting-started', {
    name: 'Getting Started: Global Application State',
    description: 'Basic example shows how to create global store and access it in a mounted component and outside of React.',
    code: 'https://raw.githubusercontent.com/avkonst/hookstate/master/examples/src/examples/getting-started.tsx',
    demo: <ExampleComponent />
});
examples.set('getting-started-local', {
    name: 'Getting Started: Local Form State',
    description: '',
    code: 'https://raw.githubusercontent.com/avkonst/hookstate/master/examples/src/examples/getting-started.tsx',
    demo: <ExampleComponent />
});

const HomePage = (props: { example?: string }) => {
    const [tab, setTab] = React.useState(2);
    const classes = useStyles();
    const exampleId = props.example && examples.has(props.example) ? props.example : 'getting-started';
    const exampleMeta = examples.get(exampleId)!;

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
                    <Button variant="contained" color="secondary" className={classes.button}>Why hookstate</Button>
                    <Button variant="contained" color="primary" className={classes.button}>See documentation</Button>
                    <Button variant="contained" color="primary" className={classes.button}>Browse plugins</Button>
            </Box>
        </Container>
        <Container maxWidth="md">
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
                                    Array.from(examples.entries())
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
                            padding={2}
                        >
                            <Typography variant="body1" align="left" >
                                {exampleMeta.description}
                            </Typography>
                        </Box>
                    }
                    {(tab === 1 || tab === 2) &&
                        <Box
                            margin={2}
                            style={{
                                backgroundColor: 'rgba(0, 100, 100, 0.05)',
                                border: 'solid',
                                borderWidth: '1px',
                                borderColor: 'rgba(0, 0, 100, 0.1)'
                            }}
                            // padding={1}
                            textAlign="center"
                        >
                            {exampleMeta.demo}
                        </Box>
                    }
                    {(tab === 0 || tab === 2) &&
                        <Box margin={2} paddingBottom={2}>
                            <SourceCodeView url={exampleMeta.code} />
                        </Box>
                    }
                    <p/>
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
