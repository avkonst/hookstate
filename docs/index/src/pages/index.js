import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ExtensionIcon from '@material-ui/icons/Extension';
import SpeedIcon from '@material-ui/icons/Speed';
import BuildIcon from '@material-ui/icons/Build';

const features = [
  {
    title: <>Easy to Use</>,
    imageUrl: <ThumbUpIcon style={{ width: 100, height: 100 }} />,
    description: (
      <>
        Concise, pragmatic but flexible API. Very easy to learn.
        See <Link to={'docs/getting-started'}>Getting Started</Link> and other code samples to learn it in minutes.
      </>
    ),
  },
  {
    title: <>Incredibly Fast</>,
    imageUrl: <SpeedIcon style={{ width: 100, height: 100 }} />,
    description: (
      <>
        Incredible performance based on unique method for tracking of used/rendered and updated state segments.
        Ideal solution for huge states and very frequent updates. <Link to={'docs/performance-intro'}>Learn more...</Link>.
      </>
    ),
  },
  {
    title: <>Feature Rich</>,
    imageUrl: <code style={{ height: 100, fontSize: 70, color: '#606876' }}>f()</code>,
    description: (
      <>
        Small core library packed with features: global states, local states,
        asynchronously loaded states, partial state updates, deeply nested state updates,
        and <Link to={'docs/getting-started'}>a lot more...</Link>
      </>
    ),
  },
  {
    title: <>First-class Typescript</>,
    imageUrl: <code style={{ height: 100, fontSize: 70, color: '#606876' }}>TS</code>,
    description: (
      <>
        Complete type inferrence for any complexity
        of structures of managed state data. Full intellisense support tested in VS Code.
      </>
    ),
  },
  {
    title: <>Plugins System</>,
    imageUrl: <ExtensionIcon style={{ width: 100, height: 100 }} />,
    description: (
      <>
        Extend or customize your state hooks. There are several standard plugins available:
        initial state value, touched fields tracking, modified fields tracking,
        state validation, persistence, and <Link to={'docs/extensions-overview'}>a lot more...</Link>
      </>
    ),
  },
  {
    title: <>Development Tools</>,
    imageUrl: <BuildIcon style={{ width: 100, height: 100 }} />,
    description: (
      <>
        Develop like a pro. Browser's extension
        to trace and set state values,
        to set breakpoints on state changes,
        to identify components using a segment of a state,
        and <Link to={'docs/devtools'}>a lot more...</Link>
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  // const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
      <div style={{ textAlign: 'left', width: '100%', color: '#606876' }}>{imageUrl}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}: supercharged React.useState hook`}
      description="The simple but incredibly fast and flexible state management that is based on React state hook">
      <header className={classnames('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={classnames(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/getting-started')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
