import React from 'react'

import { ExamplesRepo, ExampleCodeUrl } from './examples/Index';

import Highlight, { PrismTheme, defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/palenight';

import { useState, self } from '@hookstate/core';

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

const PreviewWithAsyncSource = (props: React.PropsWithChildren<{ url: string, sampleFirst?: boolean }>) => {
    const [sampleVisible, toogleVisible] = React.useState(true);
    const code = useState(() => fetch(props.url).then(r => r.text()))

    let codeString = ''
    const [loading, error, value] = code[self].map()
    if (loading) {
        codeString = `Loading code sample from: ${props.url}`;
    } else if (error) {
        codeString = `Failure to load code sample from: ${props.url} (${error.toString()})`;
    } else {
        codeString = value.toString()
    }

    const sample = <>
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
        {props.sampleFirst && <br />}
    </>
    
    return <>
        <Highlight {...defaultProps} code={codeString} language="jsx" theme={theme as PrismTheme}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={style}>
                {props.sampleFirst && sample}
                
                {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                </div>
                ))}

                {!props.sampleFirst && sample}
            </pre>
            )}
        </Highlight>
    </>
};

export const PreviewSample = (props: { example?: string, sampleFirst?: boolean }) => {
    const exampleId = props.example && ExamplesRepo.has(props.example)
        ? props.example : 'global-getting-started';
    const exampleMeta = ExamplesRepo.get(exampleId)!;

    if (typeof window === 'undefined') {
        return <>SSR</>;
    }
    return <>
        <PreviewWithAsyncSource url={ExampleCodeUrl(exampleId)} sampleFirst={props.sampleFirst}>
            {exampleMeta}
        </PreviewWithAsyncSource>
    </>
}
