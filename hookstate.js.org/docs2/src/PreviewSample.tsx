import React from 'react'

import { ExamplesRepo, ExampleCodeUrl } from './examples/Index';

import ExampleIds from './examples/ids';

import Highlight, { PrismTheme, defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/palenight';

import { useStateLink } from '@hookstate/core';

const packageJson = require('../package.json');
const packageDependencies = packageJson.dependencies

export const VersionInfo = () => {
    const packs = Object.keys(packageDependencies)
        .filter(i => i.startsWith('@hookstate/'));
    const labels = packs.map((p, i) => <code key={p}>
        {p}: {packageDependencies[p]}<br />
    </code>)
    return <div style={{ paddingLeft: 20 }}>{labels}</div>;
}

const PreviewWithAsyncSource = (props: React.PropsWithChildren<{ url: string }>) => {
    const [sampleVisible, toogleVisible] = React.useState(true);
    const code = useStateLink(() => fetch(props.url).then(r => r.text()))

    let codeString = ''
    if (code.promised) {
        codeString = `Loading code sample from: ${props.url}`;
    } else if (code.error) {
        codeString = `Failure to load code sample from: ${props.url} (${code.error.toString()})`;
    } else {
        codeString = code.value.toString()
    }

    return <>
        <Highlight {...defaultProps} code={codeString} language="jsx" theme={theme as PrismTheme}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={style}>
                {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                </div>
                ))}

                <div style={{ paddingBottom: 0, textAlign: 'right' }}>
                    <button
                        style={{ background: 'none', border: 'none', color: 'inherit', fontFamily: 'inherit' }}
                        onClick={() => toogleVisible(p => !p)}
                    >{sampleVisible ? '// hide live example' : '// show live example'}
                    </button>
                </div>
                {sampleVisible &&
                <div style={{ backgroundColor: 'white', color: 'black', padding: 10 }}>
                    {props.children}
                </div>
                }
            </pre>
            )}
        </Highlight>
    </>
};

export const PreviewSample = (props: { example?: string }) => {
    const exampleId = props.example && ExamplesRepo.has(props.example)
        ? props.example : ExampleIds.GlobalPrimitive;
    const exampleMeta = ExamplesRepo.get(exampleId)!;

    if (typeof window === 'undefined') {
        return <>SSR</>;
    }
    return <>
        <PreviewWithAsyncSource url={ExampleCodeUrl(exampleId)}>
            {exampleMeta.demo}
        </PreviewWithAsyncSource>
    </>
}
