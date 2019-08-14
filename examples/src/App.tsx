import React from 'react'

import { CssBaseline, Theme, createStyles, makeStyles, AppBar, Toolbar, IconButton, Typography, Button, Box, Grid, Container } from '@material-ui/core';
import { navigate, useRoutes } from 'hookrouter';

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
        codeString = 'Loading code sample';
    } else if (code.error) {
        codeString = code.error.toString();
    } else {
        codeString = code.value ? code.value.toString() : 'Failure to load code sample';
    }

    return (
        <SyntaxHighlighter language="typescript" customStyle={docco}>
            {codeString}
        </SyntaxHighlighter>
    );
};

const HomePage = () => {
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
                justifyContent="space-evenly"
            >
                <Box>
                    <Button variant="contained" color="secondary">Why @hookstate</Button>
                </Box>
                <Box>
                    <Button variant="contained" color="primary">See documentation</Button>
                </Box>
                <Box>
                    <Button variant="contained" color="primary">Browse plugins</Button>
                </Box>
            </Box>
        </Container>
        <Container maxWidth="md">
            {/* <Box
                display="flex"
                justifyContent="center"
                marginTop={2}
                style={{ border: 'solid', borderWidth: '1px', borderColor: 'mediumblue' }}
            > */}
                <Box paddingTop={4}>
                    <Typography variant="h6" gutterBottom={true} >
                        Getting started example:
                    </Typography>
                    <Box
                        style={{
                            backgroundColor: 'rgba(0, 100, 100, 0.05)',
                            border: 'solid', borderWidth: '1px', borderColor: 'rgba(0, 0, 100, 0.1)'
                        }}
                        padding={1}
                        textAlign="center"
                    >
                        <ExampleComponent />
                    </Box>
                    <Box
                        style={{
                            borderBottom: 'solid',
                            borderWidth: '1px',
                            borderColor: 'rgba(0, 0, 100, 0.1)' }
                        }
                    >
                        <SourceCodeView url="https://raw.githubusercontent.com/avkonst/hookstate/master/examples/src/examples/getting-started.tsx" />
                    </Box>
                </Box>
            {/* </Box> */}
        </Container>
    </Box>
}

const routes = {
    '/': () => <HomePage />,
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
